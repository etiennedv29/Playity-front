import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import styles from "../styles/Multitris.module.css";

const COLS_PER_PLAYER = 10; // 10 colonnes par joueur
const ROWS = 20; // 20 lignes fixes = Tetris classique
const TICK_INTERVAL = 2000; // 500 ms par intervalle de descente des pièces

const DOWN_MOVE = "down";

function MultitrisGame(props) {
  const user = useSelector((state) => state.users.value);
  const [grid, setGrid] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [completedLines, setCompletedLines] = useState(0);
  const [teamScore, setTeamScore] = useState(0);
  const [teamLines, setTeamLines] = useState(0);
  const [myMovingPiece, setMyMovingPiece] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const socket = props.socket;
  let socketRef = useRef(socket);
  const myMovingPieceRef = useRef(null);
  let currentPlayerIndex = 1;
  const gridRef = useRef([]); // nécessaire pour compenser le set_interval qui utilise sinon grid ===[]
  let isAdmin = props?.lobby?.admin === user._id;

  //Liste des pieces controlées par les users
  const movingPiecesRef = useRef({});

  // largeur de la grille=f(qté players)
  const numberOfCols = props.lobby.players.length * COLS_PER_PLAYER;

  //useEffect pour permettre à socket de se mettre à jour si besoin et que props.socket est modifié
  useEffect(() => {
    socketRef.current = props.socket;
  }, [props.socket]);

  //fonction pour mettre à jour la grille tout en ayant le tick_intercal fonctionnel
  const updateGrid = (newGrid) => {
    gridRef.current = newGrid;
    setGrid(newGrid);
  };

  const updateMyMovingPiece = (newMyMovingPiece) => {
    myMovingPieceRef.current = newMyMovingPiece;
    setMyMovingPiece(newMyMovingPiece);
  };
  // Initialisation de la grille vide
  const initializeGrid = async () => {
    const newGrid = Array.from({ length: ROWS }, () =>
      Array(numberOfCols).fill(0)
    );
    updateGrid(newGrid);
  };

  // Connexion socket et initialisation
  useEffect(() => {
    (async () => {
      // if (isAdmin) { // avant seul l'admin émittait l'info de gameStart, mais cette info est fired côté index dorénavant
      //   //transmettre à tous les joueurs que la partie a commencé
      //   await socket.emit("gameStart", {
      //     code: props.code,
      //     startedBy: user.username,
      //   });
      // }
      // au mount du composant Multitris, initialisation de la grille vide
      await initializeGrid();
    })();

    // Nettoyage à la destruction
    return () => {
      //s.disconnect();
    };
  }, []);

  // On écoute le tableau des scores transmis depuis le serveur
  useEffect(() => {
    socket.on("part_scores", (data) => {
      const player = data.playersStats.find((p) => p.player === user._id);
      setTeamScore(data.teamScore);
      setTeamLines(data.completedLines);
      player && setCurrentScore(player.score);
      player && setCompletedLines(player.completedLines);
    });
  }, []);

  // HENRI
  // Fonction d'envoie des nouveaux points au serveur
  const emitPlayerScore = (numberOfPiecesSpawned, numberOfCompletedLines) => {
    const playerId = user._id;
    socket.emit("player_scores", {
      code: props.code, // identifiant unique de la partie
      playerId: playerId, // id du joueur
      completedLines: numberOfCompletedLines, // 1 à 4,
      piecesSpawned: numberOfPiecesSpawned, //
    });
  };

  // const endGame = () => {
  //   socket.emit("end_game", {
  //     code: props.code,
  //   })
  // }

  const spawnInitialPiece = async () => {
    // si la grille de base n'est pas initialisée, on ne crée pas de première pièce

    if (gridRef.current.length === 0) {
      return;
    }

    currentPlayerIndex = props.lobby.players.findIndex(
      (player) => player._id === user._id
    );

    //demande de spawn de pièce par le player currentPlayer
    await socketRef.current.emit("spawn_piece", {
      currentPlayerIndex,
      code: props.code,
    });
    await emitPlayerScore(1, 0);
  };

  // au cas où la grille initiale n'est pas générée :
  // socket && spawnInitialPieces();

  const handleReceivedPiece = (oldPiece, newPiece) => {
    if (grid.length === 0) {
      return;
    }

    //décomposition des infos de la pièce reçue
    const { playerIndex, newShape, newRow, newCol } = newPiece;
    const { oldShape, oldRow, oldCol } = oldPiece;

    // Si c'est la pièce du currentPlayer, on la définit comme myMovingPiece
    let currentPlayerIndex = props.lobby.players.findIndex(
      (player) => player._id === user._id
    );

    if (playerIndex === currentPlayerIndex) {
      updateMyMovingPiece({
        playerIndex,
        pieceShape: newShape,
        pieceRow: newRow,
        pieceCol: newCol,
      });
    }

    // copie de la grille pour travailler dessus
    const newGrid = gridRef.current.map((e) => [...e]);

    // on enlève les cases coloriées de l'ancienne position
    if (oldRow !== "") {
      console.log("c'est PAS un spawn");
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
            newGrid[newRow + pieceRowIndex][newCol + pieceColIndex] !== 0
            //un block de la pièce =1 et la grille est occupée au spawn
          ) {
            console.log(
              `spawn by playerIndex= ${playerIndex} et fin de partie théorique`
            );
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
    newShape.forEach((row, pieceRowIndex) => {
      row.forEach((block, pieceColIndex) => {
        if (block === 1) {
          newGrid[newRow + pieceRowIndex][newCol + pieceColIndex] =
            1 + playerIndex; //si =1 alors player 1, si =2 alors player 2...
        }
      });
    });

    updateGrid(newGrid);
  };

  const handleMoveDown = (movingPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;
    let newRow = pieceRow + 1;
    const newMovedPiece = {
      playerIndex,
      pieceShape,
      pieceRow: newRow,
      pieceCol,
    };
    // envoyer nouvelle position : forme, x, y de la nouvelle position.

    if (
      isCollision(
        pieceCol,
        pieceRow,
        pieceCol,
        newRow,
        pieceShape,
        pieceShape,
        DOWN_MOVE
      )
    ) {
      return;
    } else {
      //on exécute seulement s'il n'y a pas de collision
      const newGrid = gridRef.current.map((e) => [...e]);

      //mettre à 0 les cases de l'ancienne position
      pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[pieceRow + rowIndex][pieceCol + colIndex] = 0;
        });
      });

      //déplacer la pièce
      newMovedPiece.pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== 0) {
            newGrid[newMovedPiece.pieceRow + rowIndex][
              newMovedPiece.pieceCol + colIndex
            ] = 1 + playerIndex;
          }
        });
      });
      //mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      //envoi aux autres joueurs

      //mettre la grille aux nouvelles valeurs
      updateGrid(newGrid);

      emitPieceMove(movingPiece, newMovedPiece);
    }
  };

  const handleMoveLeft = (movingPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;
    let newCol = pieceCol - 1;
    const newMovedPiece = {
      playerIndex,
      pieceShape,
      pieceRow,
      pieceCol: newCol,
    };

    // envoyer nouvelle position : forme, x, y de la nouvelle position.
    if (
      isCollision(pieceCol, pieceRow, newCol, pieceRow, pieceShape, pieceShape)
    ) {
      return;
    } else {
      const newGrid = gridRef.current.map((e) => [...e]);

      //mettre à 0 les cases de l'ancienne position
      pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[pieceRow + rowIndex][pieceCol + colIndex] = 0;
        });
      });

      //déplacer la pièce
      newMovedPiece.pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== 0) {
            newGrid[newMovedPiece.pieceRow + rowIndex][
              newMovedPiece.pieceCol + colIndex
            ] = 1 + playerIndex;
          }
        });
      });
      //mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      //envoi aux autres joueurs
      emitPieceMove(movingPiece, newMovedPiece);
      //mettre la grille aux nouvelles valeurs
      updateGrid(newGrid);
    }
  };

  const handleMoveRight = (movingPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;
    let newCol = pieceCol + 1;
    const newMovedPiece = {
      playerIndex,
      pieceShape,
      pieceRow,
      pieceCol: newCol,
    };
    // envoyer nouvelle position : forme, x, y de la nouvelle position.

    if (
      isCollision(pieceCol, pieceRow, newCol, pieceRow, pieceShape, pieceShape)
    ) {
      return;
    } else {
      const newGrid = gridRef.current.map((e) => [...e]);
      //mettre à 0 les cases de l'ancienne position
      pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[pieceRow + rowIndex][pieceCol + colIndex] = 0;
        });
      });

      //déplacer la pièce
      newMovedPiece.pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== 0) {
            newGrid[newMovedPiece.pieceRow + rowIndex][
              newMovedPiece.pieceCol + colIndex
            ] = 1 + playerIndex;
          }
        });
      });
      //mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      //envoi aux autres joueurs
      emitPieceMove(movingPiece, newMovedPiece);
      //mettre la grille aux nouvelles valeurs
      updateGrid(newGrid);
    }
  };

  const handleMoveUp = (movingPiece) => {
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

    if (
      isCollision(
        pieceCol,
        pieceRow,
        pieceCol,
        pieceRow,
        pieceShape,
        rotatedShape
      )
    ) {
      return;
    } else {
      const newGrid = gridRef.current.map((e) => [...e]);

      //mettre à 0 les cases de l'ancienne position
      pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[pieceRow + rowIndex][pieceCol + colIndex] = 0;
        });
      });

      //déplacer la pièce
      newMovedPiece.pieceShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== 0) {
            newGrid[newMovedPiece.pieceRow + rowIndex][
              newMovedPiece.pieceCol + colIndex
            ] = 1 + playerIndex;
          }
        });
      });
      //mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      //envoi aux autres joueurs
      emitPieceMove(movingPiece, newMovedPiece);
      //mettre la grille aux nouvelles valeurs
      updateGrid(newGrid);
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

  //Descente automatique tous les TICK_INTERVAL ms
  useEffect(() => {
    console.log("gameOver", gameOver);
    if (JSON.stringify(myMovingPiece) === "{}") {
      spawnInitialPiece();
    }
    const interval = setInterval(() => {
      if (myMovingPieceRef.current?.pieceShape && !gameOver) {
        const { playerIndex, pieceShape, pieceRow, pieceCol } =
          myMovingPieceRef.current;
        let newRow = pieceRow + 1;
        checkGridAndUpdate();

        if (
          isCollision(
            pieceCol,
            pieceRow,
            pieceCol,
            newRow,
            pieceShape,
            pieceShape
          )
        ) {
          !gameOver && spawnInitialPiece();
        } else {
          !gameOver && handleMoveDown(myMovingPieceRef.current);
        }
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval); // Nettoyage si le composant est démonté
  }, [gameOver]);

  //réception de toutes les pièces (nouvelles, mouvement, descente)
  useEffect(() => {
    if (gridRef.current.length === 0) return;
    //console.log("spawn appelé dans le useEffect rappelé sur gridLength", {isAdmin})
    // au cas où la grille initiale n'est pas générée :
    //gridRef.current.length > 0 && socketRef.current && spawnInitialPiece();

    //reception d'une piece générée (par le currentplayer ou un autre)
    socketRef.current.on("receive_piece", ([oldPiece, newPiece]) => {
      movingPiecesRef.current[newPiece.playerIndex] = { newPiece, oldPiece };

      console.log("handleReceivedPiece=", oldPiece, newPiece);
      handleReceivedPiece(oldPiece, newPiece);
    });

    return () => {
      socketRef.current && socketRef.current.off("receive_piece");
    };
  }, [grid.length]);

  const canMoveDownManualy = (movingPiece) => {
    console.log(movingPiece);
    const { pieceShape, pieceRow, pieceCol } = movingPiece;
    let newRow = pieceRow + 1;

    for (let i = 0; i <= pieceShape.length - 1; i++) {
      for (let j = 0; j <= pieceShape[i].length - 1; j++) {
        if (pieceShape[i][j] === 0) {
          continue;
        }

        const gridPositionX = pieceCol + j;
        const gridPositionY = newRow + i;
        if (isCollisionWithMovingPieces(gridPositionX, gridPositionY)) {
          return false;
        }
      }
    }

    return true;
  };

  const onArrowDown = (myMovingPiece) => {
    if (canMoveDownManualy(myMovingPiece)) {
      handleMoveDown(myMovingPiece);
    }
  };

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
          handleMoveLeft(myMovingPiece);
          break;
        case "ArrowRight":
          e.preventDefault();
          handleMoveRight(myMovingPiece);
          break;
        case "ArrowDown":
          e.preventDefault();
          onArrowDown(myMovingPiece);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleMoveUp(myMovingPiece);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [myMovingPiece, gameOver]);

  const isCollisionWithMovingPieces = (gridPositionX, gridPositionY) => {
    console.log("----------------------------------------------");

    return Object.values(movingPiecesRef.current).some((elm) => {
      const piece = elm.newPiece;

      if (myMovingPieceRef.current === piece) {
        console.log("samePiece");
        return false;
      }
      for (let k = 0; k <= piece.newShape.length - 1; k++) {
        for (let l = 0; l <= piece.newShape[k].length - 1; l++) {
          if (piece.newShape[k][l] === 0) {
            continue;
          }

          const posX = piece.newCol + l;
          const posY = piece.newRow + k;
          console.log(
            ` | gridPositionX ${gridPositionX}  posX ${posX} | gridPositionY ${gridPositionY} posY ${posY} |, result: ${
              posX === gridPositionX && posY === gridPositionY
            }`
          );
          if (posX === gridPositionX && posY === gridPositionY) {
            return true;
          }
        }
      }

      return false;
    });
  };

  //useEffect attendant écoutant le game Over
  useEffect(() => {
    socketRef.current.on("end_game", (code) => {
      if (code === props.code) {
        // si le back a bien envoyé le bon code?
        setGameOver(true);
      }
    });
  }, []);

  const isCollision = (
    oldX,
    oldY,
    pieceX,
    pieceY,
    oldShape,
    newShape,
    direction = ""
  ) => {
    //pieceX et pieceY = position top left de la pièce après mouvement
    let gridPositionX;
    let gridPositionY;

    let tempGrid = JSON.parse(JSON.stringify(gridRef.current));

    //clear oldPiece from grid to avoid collision with himself
    for (let i = 0; i <= oldShape.length - 1; i++) {
      for (let j = 0; j <= oldShape[i].length - 1; j++) {
        gridPositionX = oldX + j;
        gridPositionY = oldY + i;

        if (oldShape[i][j] === 0) {
          continue;
        }
        tempGrid[gridPositionY][gridPositionX] = 0;
      }
    }

    for (let i = 0; i <= newShape.length - 1; i++) {
      for (let j = 0; j <= newShape[i].length - 1; j++) {
        if (newShape[i][j] === 0) {
          continue;
        }
        gridPositionX = pieceX + j;
        gridPositionY = pieceY + i;

        //gestion si ça dépasse la grille en bas
        if (gridPositionY > ROWS - 1) {
          return true;
        }

        //gestion si ça dépasse la grille à droite
        if (gridPositionX > numberOfCols - 1) {
          return true;
        }

        //gestion si ça dépasse la grille à gauche
        if (gridPositionX < 0) {
          return true;
        }

        if (
          tempGrid[gridPositionY][gridPositionX] !== 0 &&
          (direction !== DOWN_MOVE ||
            !isCollisionWithMovingPieces(gridPositionX, gridPositionY))
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const setPieceInGrid = (gridParam, shape, rowParam, colParam, val) => {
    shape.forEach((row, pieceRowIndex) => {
      row.forEach((block, pieceColIndex) => {
        if (block === 1) {
          gridParam[rowParam + pieceRowIndex][colParam + pieceColIndex] = val;
        }
      });
    });
  };

  const clearInGamePlayerPieces = (gridParam) => {
    if (
      movingPiecesRef.current &&
      Object.keys(movingPiecesRef.current).length > 0
    ) {
      for (const key in movingPiecesRef.current) {
        const { newShape, newRow, newCol } =
          movingPiecesRef.current[key].newPiece;
        const { oldShape, oldRow, oldCol } =
          movingPiecesRef.current[key].oldPiece;

        setPieceInGrid(gridParam, newShape, newRow, newCol, 0);
        setPieceInGrid(gridParam, oldShape, oldRow, oldCol, 0);
      }

      return gridParam;
    }

    return false;
  };

  const clearCompletedLines = (gridParam) => {
    //return grid.filter((val) => val.some((val) => val === 0));
    if (gridParam.length > 0) {
      return gridParam.filter((val) => val.some((val) => val === 0));
    }

    return false;
  };

  const rebuildGridAfterClearingLines = (gridParam) => {
    const newGridEmpty = Array.from({ length: ROWS - gridParam.length }, () =>
      Array(numberOfCols).fill(0)
    );

    return [...newGridEmpty, ...gridParam];
  };

  const checkGridAndUpdate = () => {
    const tempGrid = JSON.parse(JSON.stringify(gridRef.current));
    const clearedMovingPieceGrid = clearInGamePlayerPieces(tempGrid);
    const clearedGrid = clearCompletedLines(clearedMovingPieceGrid);

    //S'il y a des lignes validés on les supprime
    if (ROWS - clearedGrid.length > 0) {
      // Lorsqu'une pièce est posée -> quand une ligne est posée
      emitPlayerScore(0, clearedGrid.length);
      const newTab = rebuildGridAfterClearingLines(clearedGrid);
      updateGrid(newTab);
    }

    //sendScoreUpdate
    //updateScoreLocal avec clearGrid
    //checkEndGame
    //emitEndGame
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
                ? `${styles.cell} ${styles[`filled${currentPlayerIndex}`] || styles.filled}`
                : `${styles.cell} ${styles.empty}`
            }
          ></div>
        ))}
      </div>
    );
  };

  // composant endGame
  const endGame = () => {
    // afficher un bouton de retour
    let playersStats = props.lobby.players.map((player) => {
      <>
        <div className={styles.statsPlayerName}>{player.id}</div>
        <div className={styles.statsPlayerDataContainer}>
          <div className={styles.statsPlayerDataField}>
            <p>Nombre de lignes</p>
            <p>Score</p>
          </div>
          <div className={styles.statsPlayerDataName}>
            <p>12</p>
            <p>320</p>
          </div>
        </div>
      </>;
    });
    return (
      <div className={styles.endGameContainer}>
        <div className={styles.endGameSectionContainer}>
          <div className={styles.endGameContainerTitle}>Team Stats</div>
          <div className={styles.statsContainer}>
            <div className={styles.statsNames}>
              <p>Nombre de lignes</p>
              <p>Score d'équipe</p>
            </div>
            <div className={styles.statsValues}>
              <p>12</p>
              <p>830</p>
            </div>
          </div>
        </div>
        <div className={styles.endGameSectionContainer}>
          <div className={styles.endGameContainerTitle}>Players' Stats</div>
          <div className={styles.statsContainer}>{playersStats}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.gameScores}>
        <div className={styles.personalScores}>
          <h2>
            <span>Score perso : {currentScore} </span>{" "}
            <span>Nb lignes perso : {completedLines} </span>
          </h2>
        </div>
        <div className={styles.teamScores}>
          <h2>
            <span>Score équipe : {teamScore} </span>{" "}
            <span>Nb lignes équipe : {teamLines} </span>
          </h2>
        </div>
      </div>
      <h2 className={styles.title}>Multitris</h2>
      {/* {!gameOver & gridToDisplay()}  */}
      {gridToDisplay()}
      {/* {gameOver && endGame()} */}
    </div>
  );
}

export default MultitrisGame;
