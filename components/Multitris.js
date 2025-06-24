import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../styles/Multitris.module.css";
import Modal from "antd/lib/modal";

const COLS_PER_PLAYER = 9; // 9 colonnes par joueur
const ROWS = 20; // 20 lignes fixes = Tetris classique
//const TICK_INTERVAL = 500; // 500 ms par intervalle de descente des pièces

const FIXED_GRID_NAME = "fixedGrid";
const MOVING_GRID_NAME = "movingGrid";

function Multitris(props) {
  const user = useSelector((state) => state.users.value);
  const [grid, setGrid] = useState([]);
  const gridRef = useRef([]); // Nécessaire pour compenser le set_interval qui utilise sinon grid ===[]
  const movingGridRef = useRef([]);
  const fixedGridRef = useRef([]);
  const [partScores, setPartScores] = useState({});
  const [myMovingPiece, setMyMovingPiece] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const socket = props.socket;
  const socketRef = useRef(socket);
  const myMovingPieceRef = useRef(null);
  const currentPlayerIndex = props.lobby.players.findIndex(
    (player) => player._id === user._id
  );
  const [explosions, setExplosions] = useState([]);
  const [explodingLines, setExplodingLines] = useState(new Set());
  const [tickInterval, setTickInterval] = useState(500);
  const tickIntervalRef = useRef(tickInterval);

  // Largeur de la grille=f(qté players)
  const numberOfCols = props.lobby.players.length * COLS_PER_PLAYER;

  // UseEffect pour permettre à socket de se mettre à jour si besoin et que props.socket est modifié
  useEffect(() => {
    socketRef.current = props.socket;
  }, [props.socket]);

  /**
   * Fonction pour mettre à jour la grille Fixed tout en ayant le tick_interval fonctionnel
   *
   * @param {*} newGrid
   */
  const updateGrid = (newGrid) => {
    gridRef.current = newGrid;
    setGrid(newGrid);
  };

  /**
   * Fonction fusionnant deux grilles
   *
   * @param {*} grid1
   * @param {*} grid2
   * @returns
   */
  const mergeGrids = (grid1, grid2) => {
    return grid1.map((row, rowIndex) =>
      row.map((cell, colIndex) => Math.max(cell, grid2[rowIndex][colIndex]))
    );
  };

  const updateMyMovingPiece = (newMyMovingPiece) => {
    myMovingPieceRef.current = newMyMovingPiece;
    setMyMovingPiece(newMyMovingPiece);
  };

  /**
   *  Initialisation des grilles vides
   */
  const initializeGrids = () => {
    const newGrid = Array.from({ length: ROWS }, () =>
      Array(numberOfCols).fill(0)
    );
    // On initialise 3 grilles : une movingGrid dans laquelle se déplacent les pièces, une fixedGrid qui ne comporte que les pièces "au sol" et une grid qui est la composante des deux, à afficher
    fixedGridRef.current = newGrid;
    movingGridRef.current = newGrid;
    updateGrid(newGrid);
  };

  /**
   * avant de déplacer une pièce, on clean la movingGrid de tous les blocs du joueur en question. Cela évite les reliquats de mauvaise syncrhonisation
   *
   * @param {*} grid
   * @param {*} playerIndex
   * @returns
   */
  const cleanMovingGridForOnePlayer = (grid, playerIndex) => {
    return grid.map((row) => {
      return row.map((cell) => {
        if (cell === playerIndex + 1) {
          return 0;
        }
        return cell;
      });
    });
  };

  // Connexion socket et initialisation
  useEffect(() => {
    (async () => {
      await initializeGrids();
    })();

    // Nettoyage à la destruction
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // On écoute le tableau des scores transmis depuis le serveur
  useEffect(() => {
    socketRef.current.on("part_scores", (data) => {
      setPartScores(data);
      let currentPlayerScore = partScores.playersStats?.find(
        (p) => p.player === user._id
      );
    });
  }, []);

  /**
   *  Fonction d'envoi des nouveaux scores au serveur
   *
   * @param {*} numberOfPiecesSpawned
   * @param {*} numberOfCompletedLines
   */
  const emitPlayerScore = (numberOfPiecesSpawned, numberOfCompletedLines) => {
    const playerId = user._id;
    socketRef.current.emit("player_scores", {
      code: props.code, // identifiant unique de la partie
      playerId: playerId, // id du joueur
      completedLines: numberOfCompletedLines, // 1 à 4,
      piecesSpawned: numberOfPiecesSpawned, //
    });
  };

  /**
   * Losqu'un joueur a besoin d'une nouvelle pièce, il la demande au backend
   * @returns
   */
  const spawnInitialPiece = async () => {
    // Si la grille de base n'est pas initialisée, on ne crée pas de première pièce

    if (gridRef.current.length === 0) {
      return;
    }

    // Demande de spawn de pièce par le player currentPlayer
    await socketRef.current.emit("spawn_piece", {
      currentPlayerIndex,
      code: props.code,
    });

    await emitPlayerScore(1, 0);
  };

  /**
   * Fonction clé, qui permet de gérer la réception d'une pièce : spawn ou mouvement de picèe d'un autre joueur
   *
   * @param {*} oldPiece
   * @param {*} newPiece
   * @returns
   */
  const handleReceivedPiece = (oldPiece, newPiece) => {
    if (grid.length === 0) {
      return;
    }

    // Décomposition des infos de la pièce reçue
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

    // Copie de la grille pour travailler dessus
    let newGrid = movingGridRef.current.map((e) => [...e]);

    // On enlève les cases coloriées de l'ancienne position
    if (oldRow !== "") {
      // Au cas où l'ancienne postion n'existe pas parce que c'est une spawn
      newGrid = cleanMovingGridForOnePlayer(newGrid, playerIndex);
    } else {
      // Si c'est une spawn on vérifie si elle est posable. Si pas possible => fin de partie
      newShape.forEach((row, pieceRowIndex) => {
        row.forEach((block, pieceColIndex) => {
          if (
            block === 1 &&
            fixedGridRef.current[newRow + pieceRowIndex][
              newCol + pieceColIndex
            ] !== 0
            // Un block de la pièce =1 et la grille est occupée au spawn
          ) {
            // Alors fin de partie
            socketRef.current.emit("end_game", {
              code: props.code,
              partId: props.part,
            });
          }
        });
      });
    }

    // On met les pièces dans la grille (si un bloc de la pièce = 1 alors on donne une valeur à la cellule de la grid)
    const newGrid2 = setPieceInGrid(
      newGrid,
      newShape,
      newRow,
      newCol,
      1 + playerIndex
    );
    movingGridRef.current = newGrid2;

    // Update du rendu visible par les joueurs
    setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
  };

  const emitCheckCompletedLine = () => {
    socketRef.current.emit("check_completed_line", {
      playerIndex: currentPlayerIndex,
      code: props.code,
    });
  };

  /**
   * handleMove permet de modifier la position d'une pièce localement dans la grille de pièces mobiles (movingGrid)
   *
   * @param {*} movingPiece
   * @param {*} dx
   * @param {*} dy
   * @returns
   */
  const handleMove = (movingPiece, dx, dy) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;
    const newMovedPiece = {
      playerIndex,
      pieceShape,
      pieceRow: pieceRow + dy,
      pieceCol: pieceCol + dx,
    };

    // Envoyer nouvelle position : forme, x, y de la nouvelle position.
    const collisionResult = isCollision(
      pieceCol,
      pieceRow,
      newMovedPiece.pieceCol,
      newMovedPiece.pieceRow,
      pieceShape,
      newMovedPiece.pieceShape
    );

    if (collisionResult.isCollision) {
      // Si collision avec fixed_grid_name, emit pour check les completed lines
      if (collisionResult.gridName === FIXED_GRID_NAME) {
      }
      return;
    } else {
      // On exécute seulement s'il n'y a pas de collision
      let newGrid = movingGridRef.current.map((e) => [...e]);

      // Mettre à 0 les cases de l'ancienne grille pour le player (évitant les pixels rémanant)
      newGrid = cleanMovingGridForOnePlayer(newGrid, currentPlayerIndex);

      // Déplacer la pièce
      newGrid = setPieceInGrid(
        newGrid,
        newMovedPiece.pieceShape,
        newMovedPiece.pieceRow,
        newMovedPiece.pieceCol,
        1 + playerIndex
      );

      // Mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      // Mettre la grille aux nouvelles valeurs
      movingGridRef.current = newGrid;
      // Update de la grille visible
      setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
      // Envoi aux autres joueurs
      emitPieceMove(movingPiece, newMovedPiece);
    }
  };

  /**
   * Fonction handleRotation pour faire pivoter une matrice 2D dans le sens horaire
   *
   * @param {*} movingPiece
   * @returns
   */
  const handleRotation = (movingPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = movingPiece;

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

    if (collisionResult.isCollision) {
      return;
    } else {
      let newGrid = movingGridRef.current.map((e) => [...e]);

      // Mettre à 0 les cases de l'ancienne position
      newGrid = cleanMovingGridForOnePlayer(newGrid, currentPlayerIndex);

      // Déplacer la pièce
      newGrid = setPieceInGrid(
        newGrid,
        newMovedPiece.pieceShape,
        newMovedPiece.pieceRow,
        newMovedPiece.pieceCol,
        1 + playerIndex
      );
      // Mise à jour de myMovingPiece
      updateMyMovingPiece(newMovedPiece);
      // Envoi aux autres joueurs
      emitPieceMove(movingPiece, newMovedPiece);
      // Mettre la grille aux nouvelles valeurs
      movingGridRef.current = newGrid;
      setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
    }
  };

  /**
   * Un joueur ayant bougé sa pièce envoie aux autres joueurs l'information de la position avant, puis après mouvement
   *
   * @param {*} previousPiece
   * @param {*} newPiece
   */
  const emitPieceMove = (previousPiece, newPiece) => {
    const { playerIndex, pieceShape, pieceRow, pieceCol } = newPiece;
    socketRef.current.emit("move_piece", [
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

  /**
   * Dans le cas d'une arrivée en bas, le joueur transmet aux autres joueurs l'information de transférer cette pièce dans la fixedGrid
   *
   * @param {*} playerIndex
   * @param {*} code
   * @param {*} piece
   */
  const emitTransferPieceFromMovingToFixed = (playerIndex, code, piece) => {
    socketRef.current.emit("transfer_piece_from_moving_to_fixed", {
      playerIndex,
      code,
      piece,
    });
  };

  /**
   * Transfert de la movingGrid vers la fixedGrid : clean de la movingGrid puis remplissage de la fixedGrid
   *
   * @param {*} playerIndex
   * @param {*} piece
   */
  const handleTransferMovingToFixedGrid = (playerIndex, piece) => {
    // Clean la moving grid
    const cleanedMovingGrid = movingGridRef.current.map((row) => {
      return row.map((cell) => {
        if (cell === playerIndex + 1) {
          return 0;
        }
        return cell;
      });
    });
    movingGridRef.current = cleanedMovingGrid;

    // Populate la fixed avec la fonction setPieceinGrid
    fixedGridRef.current = setPieceInGrid(
      fixedGridRef.current,
      piece.pieceShape,
      piece.pieceRow,
      piece.pieceCol,
      playerIndex + 1
    );

    // Si le jeu n'est pas arrêté et je respawne pour moi
    currentPlayerIndex === playerIndex &&
      !gameOver &&
      currentPlayerIndex === playerIndex &&
      !gameOver &&
      spawnInitialPiece();
    setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));
    currentPlayerIndex === playerIndex && emitCheckCompletedLine();
  };

  /**
   *  // Fonction améliorée pour déclencher une explosion sur une ligne
   *
   * @param {*} lineIndex
   */
  const triggerLineExplosion = (lineIndex) => {
    // Marquer la ligne comme en explosion
    setExplodingLines((prev) => new Set([...prev, lineIndex]));

    // Créer des explosions individuelles pour chaque case de la ligne
    for (let colIndex = 0; colIndex < numberOfCols; colIndex++) {
      const delay = colIndex * 50; // Décalage progressif pour un effet de vague
      setTimeout(() => {
        triggerExplosion(colIndex, lineIndex);
      }, delay);
    }

    // Retirer la ligne de l'état d'explosion après l'animation
    setTimeout(() => {
      setExplodingLines((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lineIndex);
        return newSet;
      });
    }, 700);
  };

  /**
   * Déclenchement de l'explosion pour une case donnée
   *
   * @param {*} col
   * @param {*} row
   */
  const triggerExplosion = (col, row) => {
    const id = Date.now() + Math.random(); // ID unique pour éviter les conflits
    const explosion = {
      id,
      col,
      row,
      timestamp: Date.now(),
    };

    setExplosions((prev) => [...prev, explosion]);

    // Supprimer l'explosion après l'animation
    setTimeout(() => {
      setExplosions((prev) => prev.filter((e) => e.id !== id));
    }, 600);
  };

  /**
   * Vérification qu'une ligne est complète
   *
   * @param {*} playerId
   */
  const handleCheckCompletedLines = (playerId) => {
    const completedLineIndices = [];
    const linesNotCompleted = [];

    // Identifier les lignes complétées et les conserver
    fixedGridRef.current.forEach((row, index) => {
      if (row.every((col) => col !== 0)) {
        completedLineIndices.push(index);
      } else {
        linesNotCompleted.push(row);
      }
    });

    const numberCompletedLines = completedLineIndices.length;

    if (numberCompletedLines > 0) {
      // Déclencher les explosions pour chaque ligne complétée
      completedLineIndices.forEach((lineIndex, i) => {
        setTimeout(() => {
          triggerLineExplosion(lineIndex);
        }, i * 100); // Décaler légèrement chaque ligne
      });

      // Attendre la fin des animations avant de supprimer les lignes
      setTimeout(() => {
        // Créer les nouvelles lignes vides en haut
        const emptyMissingLines = Array.from(
          { length: numberCompletedLines },
          () => Array(numberOfCols).fill(0)
        );

        const newFixedGrid = [...emptyMissingLines, ...linesNotCompleted];
        fixedGridRef.current = newFixedGrid;
        setGrid(mergeGrids(movingGridRef.current, fixedGridRef.current));

        if (playerId === currentPlayerIndex) {
          emitPlayerScore(0, numberCompletedLines);
        }
      }, 900); // Délai pour laisser les explosions se terminer
    }
  };

  //synchronisation du tickIntervalRef
  useEffect(() => {
    tickIntervalRef.current = tickInterval;
  }, [tickInterval]);

  //Détection de toute les 10 lignes pour accélérer le tickinterval
  useEffect(() => {
    if (!partScores?.completedLines) return;
    const linesCompletedForAcceleration = 10;
    const threshold = Math.floor(
      partScores.completedLines / linesCompletedForAcceleration
    );
    const newInterval = Math.max(150, 500 - threshold * 50);
    setTickInterval(newInterval);
  }, [partScores?.completedLines]);

  // Descente automatique tous les TICK_INTERVAL/tickIntervalRef.current ms
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
    }, tickInterval);

    return () => clearInterval(interval); // Nettoyage si le composant est démonté
  }, [tickInterval, gameOver]);

  // Réception de toutes les pièces (nouvelles, mouvement, descente)
  useEffect(() => {
    if (gridRef.current.length === 0) return;

    // Réception d'une piece générée (par le currentplayer ou un autre)
    socketRef.current.on("receive_piece", ([oldPiece, newPiece]) => {
      handleReceivedPiece(oldPiece, newPiece);
    });

    socketRef.current.on(
      "check_completed_line_to_be_done",
      ({ playerIndex }) => {
        setTimeout(() => {
          handleCheckCompletedLines(playerIndex);
        }, 100);
      }
    );

    return () => {
      socketRef.current && socketRef.current.off("receive_piece");
      socketRef.current &&
        socketRef.current.off("check_completed_line_to_be_done");
    };
  }, [grid.length]);

  useEffect(() => {
    socketRef.current.on(
      "transfer_grid_to_grid_to_be_done",
      ({ playerIndex, piece }) => {
        handleTransferMovingToFixedGrid(playerIndex, piece);
      }
    );

    return () => {
      socketRef.current &&
        socketRef.current.off("transfer_grid_to_grid_to_be_done");
    };
  }, []);

  // Gestion des touches par le joueur
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

  // UseEffect attendant écoutant le game Over
  useEffect(() => {
    socketRef.current.on("end_game", (code) => {
      if (code === props.code) {
        // si le back a bien envoyé le bon code?
        setGameOver(true);
        setVisibleModal(true);
      }
    });

    return () => {
      socketRef.current && socketRef.current.off("end_game");
    };
  }, []);

  const isCollision = (oldX, oldY, pieceX, pieceY, oldShape, newShape) => {
    // PieceX et pieceY = position top left de la pièce après mouvement
    let gridPositionX;
    let gridPositionY;

    let tempMovingGrid = JSON.parse(JSON.stringify(movingGridRef.current));
    let tempFixedGrid = JSON.parse(JSON.stringify(fixedGridRef.current));

    // Clear oldPiece from movingGrid to avoid collision with himself
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
    // Phase de check collision
    for (let i = 0; i <= newShape.length - 1; i++) {
      for (let j = 0; j <= newShape[i].length - 1; j++) {
        if (newShape[i][j] === 0) {
          continue;
        }
        gridPositionX = pieceX + j;
        gridPositionY = pieceY + i;

        // Gestion si ça dépasse la grille en bas
        if (gridPositionY > ROWS - 1) {
          return { isCollision: true, gridName: FIXED_GRID_NAME };
        }

        // Gestion si ça dépasse la grille à droite
        if (gridPositionX > numberOfCols - 1) {
          return { isCollision: true, gridName: MOVING_GRID_NAME };
        }

        // Gestion si ça dépasse la grille à gauche
        if (gridPositionX < 0) {
          return { isCollision: true, gridName: MOVING_GRID_NAME };
        }
        // Gestion collision avec la grille fixe
        if (tempFixedGrid[gridPositionY][gridPositionX] !== 0) {
          return { isCollision: true, gridName: FIXED_GRID_NAME };
        }
        // Gestion collision avec une autre pièce en mouvement
        if (tempMovingGrid[gridPositionY][gridPositionX] !== 0) {
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

    return tempGridParam;
  };

  // Fonction pour obtenir la classe CSS d'une cellule
  const getCellClass = (cell, rowIndex, colIndex) => {
    const baseClass = cell
      ? `${styles.cell} ${styles[`filled${cell}`] || styles.filled}`
      : `${styles.cell} ${styles.empty}`;

    // Ajouter une classe spéciale si la ligne est en explosion
    const explosionClass = explodingLines.has(rowIndex)
      ? ` ${styles.exploding}`
      : "";

    return baseClass + explosionClass;
  };

  // Composant grille intégré avec explosions
  const gridToDisplay = () => {
    return (
      <div
        className={styles.grid}
        style={{
          position: "relative",
          display: "inline-block",
          gridTemplateColumns: `repeat(${numberOfCols}, 1fr)`,
        }}
      >
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${numberOfCols}, 1fr)` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell, rowIndex, colIndex)}
              ></div>
            ))
          )}
        </div>

        {/* Conteneur des explosions */}
        <div className={styles.explosionsContainer}>
          {explosions.map((explosion) => (
            <div
              key={explosion.id}
              className={styles.explosion}
              style={{
                left: `${(explosion.col * 100) / numberOfCols}%`,
                top: `${(explosion.row * 100) / ROWS}%`,
                width: `${100 / numberOfCols}%`,
                height: `${100 / ROWS}%`,
              }}
            >
              💥
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Composant endGame
  const endGame = () => {
    let playersStatsToDisplay = props.lobby.players.map((i, key) => {
      return (
        <div key={key} className={styles.individualPlayerStatContainer}>
          <div className={styles.statsPlayerName}>{i.username}</div>
          <div className={styles.statsContainer}>
            <div className={styles.statsNames}>
              <div className={styles.statLine}>Lignes</div>
              <div className={styles.statLine}>Score</div>
            </div>
            <div className={styles.statsValues}>
              <div className={styles.statLine}>
                {partScores.playersStats &&
                  partScores.playersStats?.find((p) => p.player === i._id)
                    ?.completedLines}
              </div>
              <div className={styles.statLine}>
                {partScores.playersStats &&
                  partScores.playersStats?.find((p) => p.player === i._id)
                    ?.score}
              </div>
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
      <Modal
        getContainer="#react-modals"
        closable={false}
        onCancel={() => setVisibleModal(null)}
        open={visibleModal}
        footer={null}
        width={600}
        className="modal"
      >
        {visibleModal && endGame()}
      </Modal>
      {!gameOver && (
        <div className={styles.gameScores}>
          <div className={styles.personalScores}>
            <div className={styles.scoreTitle}>
              <p>
                Score perso :{" "}
                {
                  partScores.playersStats?.find((p) => p.player === user._id)
                    ?.score
                }{" "}
              </p>
              <p>
                Nb lignes perso :{" "}
                {
                  partScores.playersStats?.find((p) => p.player === user._id)
                    ?.completedLines
                }
              </p>
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

      <div className={styles.gameContainer}>{gridToDisplay()}</div>
    </div>
  );
}

export default Multitris;
