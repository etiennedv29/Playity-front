import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import styles from "../styles/Multitris.module.css";

const COLS_PER_PLAYER = 10; // 10 colonnes par joueur
const ROWS = 20; // 20 lignes fixes = Tetris classique
const TICK_INTERVAL = 500; // 500 ms par intervalle de descente des pièces

const FIXED_GRID_NAME = "fixedGrid";
const MOVING_GRID_NAME = "movingGrid";

function MultitrisGame(props) {
  const user = useSelector((state) => state.users.value);
  const [grid, setGrid] = useState([]);
  const gridRef = useRef([]); // nécessaire pour compenser le set_interval qui utilise sinon grid ===[]
  const movingGridRef = useRef([]);
  const fixedGridRef = useRef([]);
  const [partScores, setPartScores] = useState({});
  const [myMovingPiece, setMyMovingPiece] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const socket = props.socket;
  let socketRef = useRef(socket);
  const myMovingPieceRef = useRef(null);
  let isAdmin = props?.lobby?.admin === user._id;
  const currentPlayerIndex = props.lobby.players.findIndex(
    (player) => player._id === user._id
  );
  let currentPlayerScore = {};
  // console.log(currentPlayerIndex);

  // largeur de la grille=f(qté players)
  const numberOfCols = props.lobby.players.length * COLS_PER_PLAYER;

  //useEffect pour permettre à socket de se mettre à jour si besoin et que props.socket est modifié
  useEffect(() => {
    socketRef.current = props.socket;
  }, [props.socket]);

  //fonction pour mettre à jour la grille Fixed tout en ayant le tick_intercal fonctionnel
  const updateGrid = (newGrid) => {
    gridRef.current = newGrid;
    setGrid(newGrid);
  };

  const mergeGrids = (grid1, grid2) => {
    return grid1.map((row, rowIndex) =>
      row.map((cell, colIndex) => Math.max(cell, grid2[rowIndex][colIndex]))
    );
  };

  const updateMyMovingPiece = (newMyMovingPiece) => {
    myMovingPieceRef.current = newMyMovingPiece;
    setMyMovingPiece(newMyMovingPiece);
  };
  // Initialisation des grilles vides
  const initializeGrids = async () => {
    const newGrid = Array.from({ length: ROWS }, () =>
      Array(numberOfCols).fill(0)
    );
    fixedGridRef.current = newGrid;
    movingGridRef.current = newGrid;
    updateGrid(newGrid);
  };

  // Connexion socket et initialisation
  useEffect(() => {
    (async () => {
      await initializeGrids();
    })();

    // Nettoyage à la destruction
    return () => {
      //s.disconnect();
    };
  }, []);

  // On écoute le tableau des scores transmis depuis le serveur
  useEffect(() => {
    socket.on("part_scores", (data) => {
      setPartScores(data);
      console.log('STATS DU JOUEUR : ', currentPlayerScore);
      currentPlayerScore = partScores.playersStats?.find((p) => p.player === user._id);
    });
  }, []);

  // Fonction d'envoi des nouveaux points au serveur
  const emitPlayerScore = (numberOfPiecesSpawned, numberOfCompletedLines) => {
    const playerId = user._id;
    socket.emit("player_scores", {
      code: props.code, // identifiant unique de la partie
      playerId: playerId, // id du joueur
      completedLines: numberOfCompletedLines, // 1 à 4,
      piecesSpawned: numberOfPiecesSpawned, //
    });
  };

  const spawnInitialPiece = async () => {
    // si la grille de base n'est pas initialisée, on ne crée pas de première pièce

    if (gridRef.current.length === 0) {
      return;
    }

    //demande de spawn de pièce par le player currentPlayer
    await socketRef.current.emit("spawn_piece", {
      currentPlayerIndex,
      code: props.code,
    });

    await emitPlayerScore(1, 0);
  };

  const handleReceivedPiece = (oldPiece, newPiece) => {
    if (grid.length === 0) {
      return;
    }

    //décomposition des infos de la pièce reçue
    const { playerIndex, newShape, newRow, newCol } = newPiece;
    const { oldShape, oldRow, oldCol } = oldPiece;

    // Si c'est la pièce du currentPlayer, on la définit comme myMovingPiece

    if (playerIndex === currentPlayerIndex) {
      updateMyMovingPiece({
        playerIndex,
        pieceShape: newShape,
        pieceRow: newRow,
        pieceCol: newCol,
      });
    }

    // copie de la grille pour travailler dessus
    let newGrid = movingGridRef.current.map((e) => [...e]);

    // on enlève les cases coloriées de l'ancienne position
    if (oldRow !== "") {
      //console.log("c'est PAS un spawn");
      // au cas où l'ancienne postion n'existe pas parce que c'est une spawn
      oldShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[oldRow + rowIndex][oldCol + colIndex] = 0;
        });
      });
    } else {
      // si c'est une spawn on vérifie si elle est posable. Si pas possible => fin de partie
      newShape.forEach((row, pieceRowIndex) => {
        row.forEach((block, pieceColIndex) => {
          if (
            block === 1 &&
            fixedGridRef.current[newRow + pieceRowIndex][
              newCol + pieceColIndex
            ] !== 0
            //un block de la pièce =1 et la grille est occupée au spawn
          ) {
            //console.log(`spawn by playerIndex= ${playerIndex} et fin de partie théorique`);
            // alors fin de partie
            socketRef.current.emit("end_game", {
              code: props.code,
              partId: props.part,
            });
          }
        });
      });
    }

    //on met les pièces dans la grille (si un bloc de la pièce = 1 alors on donne une valeur à la cellule de la grid)
    const newGrid2 = setPieceInGrid(
      newGrid,
      newShape,
      newRow,
      newCol,
      1 + playerIndex
    );

    //console.table(newGrid2);
    //console.table(mergeGrids(movingGridRef.current, fixedGridRef.current));
    movingGridRef.current = newGrid2;
    //update du rendu visible par les joueurs
    setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
  };

  const emitCheckCompletedLine = () => {
    // console.log(`check_completed_line ${currentPlayerIndex}`);
    socket.emit("check_completed_line", {
      playerIndex: currentPlayerIndex,
      code: props.code,
    });
  };

  const handleMove = (movingPiece, dx, dy) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;
    const newMovedPiece = {
      playerIndex,
      pieceShape,
      pieceRow: pieceRow + dy,
      pieceCol: pieceCol + dx,
    };
    // envoyer nouvelle position : forme, x, y de la nouvelle position.

    const collisionResult = isCollision(
      pieceCol,
      pieceRow,
      newMovedPiece.pieceCol,
      newMovedPiece.pieceRow,
      pieceShape,
      newMovedPiece.pieceShape
    );

    if (collisionResult.isCollision) {
      //si collision avec fixed_grid_name, emit pour check les completed lines
      if (collisionResult.gridName === FIXED_GRID_NAME) {
        //emitCheckCompletedLine();
      }
      return;
    } else {
      //on exécute seulement s'il n'y a pas de collision
      let newGrid = movingGridRef.current.map((e) => [...e]);

      //mettre à 0 les cases de l'ancienne position
      pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[pieceRow + rowIndex][pieceCol + colIndex] = 0;
        });
      });

      //déplacer la pièce
      newGrid = setPieceInGrid(
        newGrid,
        newMovedPiece.pieceShape,
        newMovedPiece.pieceRow,
        newMovedPiece.pieceCol,
        1 + playerIndex
      );
      //mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      //envoi aux autres joueurs

      //mettre la grille aux nouvelles valeurs
      movingGridRef.current = newGrid;
      //update de la grille visible
      setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));

      emitPieceMove(movingPiece, newMovedPiece);
    }
  };

  const handleRotation = (movingPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;
    // Fonction pour faire pivoter une matrice 2D dans le sens horaire
    const rotateMatrix = (matrix) => {
      return matrix[0].map((_, colIndex) =>
        matrix.map((row) => row[colIndex]).reverse()
      );
    };

    const rotatedShape = rotateMatrix(pieceShape);
    const newMovedPiece = {
      playerIndex,
      pieceShape: rotatedShape,
      pieceRow,
      pieceCol,
    };

    const collisionResult = isCollision(
      pieceCol,
      pieceRow,
      newMovedPiece.pieceCol,
      newMovedPiece.pieceRow,
      pieceShape,
      newMovedPiece.pieceShape
    );

    if (
      collisionResult.isCollision &&
      collisionResult.gridName === FIXED_GRID_NAME
    ) {
      return;
    } else {
      let newGrid = movingGridRef.current.map((e) => [...e]);

      //mettre à 0 les cases de l'ancienne position
      pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[pieceRow + rowIndex][pieceCol + colIndex] = 0;
        });
      });

      //déplacer la pièce
      newGrid = setPieceInGrid(
        newGrid,
        newMovedPiece.pieceShape,
        newMovedPiece.pieceRow,
        newMovedPiece.pieceCol,
        1 + playerIndex
      );
      //mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      //envoi aux autres joueurs
      emitPieceMove(movingPiece, newMovedPiece);
      //mettre la grille aux nouvelles valeurs
      movingGridRef.current = newGrid;
      setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
    }
  };

  const emitPieceMove = (previousPiece, newPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = newPiece;
    socket.emit("move_piece", [
      {
        oldShape: previousPiece.pieceShape,
        oldRow: previousPiece.pieceRow,
        oldCol: previousPiece.pieceCol,
      },
      {
        playerIndex: newPiece.playerIndex,
        newShape: newPiece.pieceShape,
        newRow: newPiece.pieceRow,
        newCol: newPiece.pieceCol,
        code: props.code,
      },
    ]);
  };

  const emitTransferPieceFromMovingToFixed = (playerIndex, code, piece) => {
    // console.log("transfer_piece_from_moving_to_fixed");
    socket.emit("transfer_piece_from_moving_to_fixed", {
      playerIndex,
      code,
      piece,
    });
  };

  const handleTransferMovingToFixedGrid = (playerIndex, piece) => {
    // console.log("handleTransferMovingToFixedGrid");
    //clean la moving grid
    const cleanedMovingGrid = movingGridRef.current.map((row) => {
      return row.map((cell) => {
        if (cell === playerIndex + 1) {
          return 0;
        }
        return cell;
      });
    });
    movingGridRef.current = cleanedMovingGrid;

    //populate la fixed avec la fonction setPieceinGrid
    fixedGridRef.current = setPieceInGrid(
      fixedGridRef.current,
      piece.pieceShape,
      piece.pieceRow,
      piece.pieceCol,
      playerIndex + 1
    );

    //si le jeu n'est pas arrêté et je respawne pour moi
    currentPlayerIndex === playerIndex &&
      !gameOver &&
      console.log("spawn après fixinginto FixedGrid");
    currentPlayerIndex === playerIndex && !gameOver && spawnInitialPiece();
    setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
    emitCheckCompletedLine();
  };

  const handleCheckCompletedLines = (playerId) => {
    const linesNotCompleted = fixedGridRef.current.filter((row) =>
      row.some((col) => col === 0)
    );
    // console.log(
    //   "------------------------ handleCheckCompletedLines ------------------------------------"
    // );
    //  console.table(linesNotCompleted);
    const numberCompletedLines = ROWS - linesNotCompleted.length;
    // console.log(
    //   `numberCompletedLines ${numberCompletedLines} playerId ${playerId} `
    // );

    if (numberCompletedLines > 0) {
      //create missing row empty lines
      const emptyMissingLines = Array.from(
        { length: numberCompletedLines },
        () => Array(numberOfCols).fill(0)
      );

      const newFixedGrid = [...emptyMissingLines, ...linesNotCompleted];
      console.table(newFixedGrid);

      fixedGridRef.current = newFixedGrid;
      setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));

      if (playerId === currentPlayerIndex) {
        //console.log(`emit ${numberCompletedLines}`);
        emitPlayerScore(0, numberCompletedLines);
      }
    }
    // console.log(
    //   "--------------------- handleCheckCompletedLines END ---------------------------------------"
    // );
  };

  //Descente automatique tous les TICK_INTERVAL ms
  useEffect(() => {
    if (
      gridRef.current.length !== 0 &&
      JSON.stringify(myMovingPiece) === "{}"
    ) {
      spawnInitialPiece();
    }
    const interval = setInterval(() => {
      if (myMovingPieceRef.current?.pieceShape && !gameOver) {
        const { playerIndex, pieceShape, pieceRow, pieceCol } =
          myMovingPieceRef.current;
        const newRow = pieceRow + 1;
        const collisionCheck = isCollision(
          pieceCol,
          pieceRow,
          pieceCol,
          newRow,
          pieceShape,
          pieceShape
        );

        if (
          collisionCheck.isCollision &&
          collisionCheck.gridName === FIXED_GRID_NAME
        ) {
          // console.log("IS COLLISION");
          let pieceToTransfer = { pieceShape, pieceRow, pieceCol };
          emitTransferPieceFromMovingToFixed(
            currentPlayerIndex,
            props.code,
            pieceToTransfer
          );
        } else {
          !gameOver && handleMove(myMovingPieceRef.current, 0, 1);
        }
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval); // Nettoyage si le composant est démonté
  }, [gameOver]);

  //réception de toutes les pièces (nouvelles, mouvement, descente)
  useEffect(() => {
    if (gridRef.current.length === 0) return;
    ////console.log("spawn appelé dans le useEffect rappelé sur gridLength", {isAdmin})
    // au cas où la grille initiale n'est pas générée :
    //gridRef.current.length > 0 && socketRef.current && spawnInitialPiece();

    //reception d'une piece générée (par le currentplayer ou un autre)
    socketRef.current.on("receive_piece", ([oldPiece, newPiece]) => {
      //console.log("handleReceivedPiece=", oldPiece, newPiece);
      handleReceivedPiece(oldPiece, newPiece);
    });

    socketRef.current.on(
      "check_completed_line_to_be_done",
      ({ playerIndex }) => {
        handleCheckCompletedLines(playerIndex);
      }
    );

    return () => {
      [];
      socketRef.current && socketRef.current.off("receive_piece");
    };
  }, [grid.length]);

  useEffect(() => {
    socketRef.current.on(
      "transfer_grid_to_grid_to_be_done",
      ({ playerIndex, piece }) => {
        console.log("Appel from playerIndex =>", playerIndex);

        handleTransferMovingToFixedGrid(playerIndex, piece);
      }
    );
  }, []);

  //gestion des touches par le joueur
  useEffect(() => {
    const handleKeyDown = (e) => {
      //sécurité que myMovingPiece existe
      if (gameOver || !myMovingPiece?.pieceShape) {
        return;
      }
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handleMove(myMovingPiece, -1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMove(myMovingPiece, 1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleMove(myMovingPiece, 0, 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleRotation(myMovingPiece);

          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [myMovingPiece, gameOver]);

  //useEffect attendant écoutant le game Over
  useEffect(() => {
    socketRef.current.on("end_game", (code) => {
      if (code === props.code) {
        // si le back a bien envoyé le bon code?
        setGameOver(true);
      }
    });
  }, []);

  const isCollision = (oldX, oldY, pieceX, pieceY, oldShape, newShape) => {
    //pieceX et pieceY = position top left de la pièce après mouvement
    let gridPositionX;
    let gridPositionY;

    let tempMovingGrid = JSON.parse(JSON.stringify(movingGridRef.current));
    let tempFixedGrid = JSON.parse(JSON.stringify(fixedGridRef.current));

    //clear oldPiece from movingGrid to avoid collision with himself
    for (let i = 0; i <= oldShape.length - 1; i++) {
      for (let j = 0; j <= oldShape[i].length - 1; j++) {
        gridPositionX = oldX + j;
        gridPositionY = oldY + i;

        if (oldShape[i][j] === 0) {
          continue;
        }
        tempMovingGrid[gridPositionY][gridPositionX] = 0;
      }
    }
    // phase de check collision
    for (let i = 0; i <= newShape.length - 1; i++) {
      for (let j = 0; j <= newShape[i].length - 1; j++) {
        if (newShape[i][j] === 0) {
          continue;
        }
        gridPositionX = pieceX + j;
        gridPositionY = pieceY + i;

        //gestion si ça dépasse la grille en bas
        if (gridPositionY > ROWS - 1) {
          return { isCollision: true, gridName: FIXED_GRID_NAME };
        }

        //gestion si ça dépasse la grille à droite
        if (gridPositionX > numberOfCols - 1) {
          return { isCollision: true, gridName: MOVING_GRID_NAME };
        }

        //gestion si ça dépasse la grille à gauche
        if (gridPositionX < 0) {
          return { isCollision: true, gridName: MOVING_GRID_NAME };
        }
        //gestion collision avec la grille fixe
        if (tempFixedGrid[gridPositionY][gridPositionX] !== 0) {
          // console.log(
          //   `isCollision tempFixedGrid ${tempFixedGrid[gridPositionY][gridPositionX]}`
          // );
          return { isCollision: true, gridName: FIXED_GRID_NAME };
        }
        //gestion collision avec une autre pièce en mouvement
        if (tempMovingGrid[gridPositionY][gridPositionX] !== 0) {
          //console.table(tempMovingGrid);
          return { isCollision: true, gridName: MOVING_GRID_NAME };
        }
      }
    }
    return { isCollision: false, gridName: null };
  };

  const setPieceInGrid = (gridParam, shape, rowParam, colParam, val) => {
    let tempGridParam = gridParam.map((row) => [...row]);

    shape.forEach((row, pieceRowIndex) => {
      row.forEach((block, pieceColIndex) => {
        if (block === 1) {
          tempGridParam[rowParam + pieceRowIndex][colParam + pieceColIndex] =
            val;
        }
      });
    });

    //console.table(tempGridParam);

    return tempGridParam;
  };

  // composant grille intégré
  const gridToDisplay = () => {
    return (
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${numberOfCols}, 1fr)` }}
      >
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className={
              cell
                ? `${styles.cell} ${styles[`filled${cell}`] || styles.filled}`
                : `${styles.cell} ${styles.empty}`
            }
          ></div>
        ))}
      </div>
    );
  };

  //console.log(props.lobby.players[0]);

  // composant endGame
  const endGame = () => {
    // afficher un bouton de retour

    let playersStatsToDisplay = props.lobby.players.map((i, key) => {
      return (
        <div className={styles.individualPlayerStatContainer}>
          <div className={styles.statsPlayerName}>{i.username}</div>
          <div className={styles.statsContainer}>
            <div className={styles.statsNames}>
              <div className={styles.statLine}>Lignes</div>
              <div className={styles.statLine}>Score</div>
            </div>
            <div className={styles.statsValues}>
              {/* <div className={styles.statLine}>
                {partScores.playersStats &&
                  partScores?.playersStats?.find((e) => e.player === i._id)
                    .completedLines}
              </div>
              <div className={styles.statLine}>
                {partScores.playersStats &&
                  partScores?.playersStats?.find((e) => e.player === i._id)
                    .score}
              </div> */}
            </div>
          </div>
        </div>
      );
    });
    return (
      <div className={styles.endGameWindow}>
        <div className={styles.endGameContainer}>
          <div className={styles.endGameSectionContainerLeft}>
            <h2 className={styles.endGameContainerTitle}>Perf d'équipe</h2>
            <div className={styles.statsContainerLeft}>
              <div className={styles.statsNamesContainer}>
                <div className={styles.statLineTeam}>Nombre de lignes</div>
                <div className={styles.statLineTeam}>Score d'équipe</div>
              </div>
              <div className={styles.statsValues}>
                <div className={styles.statLineTeam}>
                  {partScores.completedLines}
                </div>
                <div className={styles.statLineTeam}>
                  {partScores.teamScore}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.endGameSectionContainerRight}>
            <h2 className={styles.endGameContainerTitle}>
              Stats individuelles
            </h2>
            <div className={styles.statsContainerRight}>
              {playersStatsToDisplay}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {!gameOver && (
        <div className={styles.gameScores}>
          <div className={styles.personalScores}>
            <div className={styles.scoreTitle}>
              <p>Score perso : {partScores.playersStats?.find((p) => p.player === user._id).score} </p>
              <p>Nb lignes perso : {partScores.playersStats?.find((p) => p.player === user._id).completedLines}</p>
            </div>
          </div>
          <div className={styles.teamScores}>
            <div className={styles.scoreTitle}>
              <p>Score équipe : {partScores.teamScore} </p>
              <p>Nb lignes équipe : {partScores.completedLines} </p>
            </div>
          </div>
        </div>
      )}
      {/* {!gameOver && gridToDisplay()} */}
      {/*{gameOver && endGame()} */}
      <div className={styles.gameContainer}>
      {gridToDisplay()}
      {/* {endGame()} */}
      </div>
    </div>
  );
}

export default MultitrisGame;
