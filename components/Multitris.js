import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import styles from "../styles/Multitris.module.css";

const COLS_PER_PLAYER = 10; // 10 colonnes par joueur
const ROWS = 20; // 20 lignes fixes = Tetris classique
const TICK_INTERVAL = 1000; // 500 ms par intervalle de descente des pièces

// Pièces
const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

function MultitrisGame(props) {
  const user = useSelector((state) => state.users.value);
  const [grid, setGrid] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [completedLines, setCompletedLines] = useState(0);
  const [teamScore, setTeamScore] = useState(0);
  const [teamLines, setTeamLines] = useState(0);
  const [myMovingPiece, setMyMovingPiece] = useState({});
  const socket = props.socket;
  let socketRef = useRef(socket);
  const myMovingPieceRef = useRef(null);
  const gridRef = useRef([]); // nécessaire pour compenser le set_interval qui utilise sinon grid ===[]
  let isAdmin = props?.lobby?.admin === user._id;

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
      if (isAdmin) {
        //transmettre à tous les joueurs que la partie a commencé
        await socket.emit("gameStart", {
          code: props.code,
          startedBy: user.username,
        });
      }
      // au mount du composant Multitris, initialisation de la grille vide
      await initializeGrid();
    })();

    // Nettoyage à la destruction
    return () => {
      //s.disconnect();
    };
  }, []);

  // Fonction d'update du score du joueur chez tout le monde
  const updateScore = async () => {
    let score = {
      player: user._id,
      currentScore: currentScore,
      completedLines: completedLines,
    };
    await socket.emit("playerScore", score);
  };

  const spawnInitialPiece = async () => {
    // si la grille de base n'est pas initialisée, on ne crée pas de première pièce
    console.log("ALEX A");

    if (gridRef.current.length === 0) {
      console.log("ALEX A IN");
      return;
    }
    console.log("ALEX B");
    let currentPlayerIndex = props.lobby.players.findIndex(
      (player) => player._id === user._id
    );

    //demande de spawn de pièce par le player currentPlayer
    console.log("EMIT", { currentPlayerIndex, code: props.code });

    await socket.emit("spawn_piece", { currentPlayerIndex, code: props.code });
  };

  // On récupère les scores de l'équipe
  socket.on("gameScores", (allScores) => {
    setTeamScore(allScores.teamScore);
    setTeamLines(allScores.completedLines);
  });

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
    const newGrid = [...grid];

    // on enlève les cases coloriées de l'ancienne position
    if (oldRow !== "") {
      // au cas où l'ancienne postion n'existe pas parce que c'est une spawn
      oldShape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          newGrid[oldRow + rowIndex][oldCol + colIndex] = 0;
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

    console.log("handleMovedown", { newMovedPiece });

    // envoyer nouvelle position : forme, x, y de la nouvelle position.

    if (
      isCollision(pieceCol, pieceRow, pieceCol, newRow, pieceShape, pieceShape)
    ) {
      return;
    } else {
      //on exécute seulement s'il n'y a pas de collision
      const newGrid = [...gridRef.current];

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
      const newGrid = [...grid];

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
      const newGrid = [...grid];
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
      const newGrid = [...grid];

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
    const interval = setInterval(() => {
      if (myMovingPieceRef.current?.pieceShape) {
        const { playerIndex, pieceShape, pieceRow, pieceCol } =
          myMovingPieceRef.current;
        let newRow = pieceRow + 1;

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
          spawnInitialPiece();
        } else {
          console.log("movingpieceRefcurrent=", myMovingPieceRef.current);
          handleMoveDown(myMovingPieceRef.current);
        }
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval); // Nettoyage si le composant est démonté
  }, []);

  //réception de toutes les pièces (nouvelles, mouvement, descente)
  useEffect(() => {
    // au cas où la grille initiale n'est pas générée :
    socketRef.current && spawnInitialPiece();

    //reception d'une piece générée (par le currentplayer ou un autre)
    socketRef.current.on("receive_piece", ([oldPiece, newPiece]) =>
      handleReceivedPiece(oldPiece, newPiece)
    );

    return () => {
      socketRef.current && socketRef.current.off("receive_piece");
    };
  }, [grid.length]);

  //gestion des touches par le joueur
  useEffect(() => {
    const handleKeyDown = (e) => {
      //sécurité que myMovingPiece existe
      if (!myMovingPiece?.pieceShape) {
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
          handleMoveDown(myMovingPiece);
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
  }, [myMovingPiece]);

  //ALEX
  const isCollision = (oldX, oldY, pieceX, pieceY, oldShape, newShape) => {
    //pieceX et pieceY = position top left de la pièce après mouvement
    let gridPositionX;
    let gridPositionY;

    let tempGrid = [...gridRef.current];

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

        if (tempGrid[gridPositionY][gridPositionX] !== 0) {
          return true;
        }
      }
    }

    return false;
  };

  const clearCompletedLines = () => {
    return grid.filter((val) => val.some((val) => val === 0));
  };

  const rebuildGridAfterClearingLines = (gridTemp) => {
    const newGrid = Array.from({ length: ROWS - gridTemp.length }, () =>
      Array(numberOfCols).fill(0)
    );

    setGrid([...newGrid, ...gridTemp]);
  };

  const checkGridAndUpdate = () => {
    const clearGrid = clearCompletedLines();
    rebuildGridAfterClearingLines(clearGrid);

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
            className={`${styles.cell} ${cell ? styles.filled : styles.empty}`}
          ></div>
        ))}
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
      {gridToDisplay()}
    </div>
  );
}

export default MultitrisGame;
