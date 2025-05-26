import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
import styles from "../styles/Multitris.module.css";
import { useSelector } from "react-redux";
import { current } from "@reduxjs/toolkit";

const COLS_PER_PLAYER = 10; // 10 colonnes par joueur
const ROWS = 20; // 20 lignes fixes = Tetris classique
const TICK_INTERVAL = 500; // 500 ms par intervalle de descente des pièces

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
  const socket = props.socket;
  let isAdmin = props?.lobby?.admin === user._id;

  // largeur de la grille=f(qté players)
  const numberOfCols = props.lobby.players.length * COLS_PER_PLAYER;

  // Initialisation de la grille vide
  const initializeGrid = async () => {
    const newGrid = Array.from({ length: ROWS }, () =>
      Array(numberOfCols).fill(0)
    );
    setGrid(newGrid);
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
      completedLines: completedLines
    }
    await socket.emit("playerScore", score);
  }

  const spawnInitialPieces = async () => {
    // si la grille de base n'est pas initialisée, on ne crée pas de première pièce
    if (grid.length === 0) {
      return;
    }
    let currentPlayerIndex = props.lobby.players.findIndex(
      (player) => player._id === user._id
    );

    //demande de spawn de pièce par le player currentPlayer
    await socket.emit("spawn_piece", { currentPlayerIndex, code: props.code });
  };

  useEffect(() => {

    // On récupère les scores de l'équipe
    socket.on("gameScores", (allScores) => {
      setTeamScore(allScores.teamScore);
      setTeamLines(allScores.completedLines);
    })

    // au cas où la grille initiale n'est pas générée :
    socket && spawnInitialPieces();

    //reception d'une piece générée (par le currentplayer ou un autre)
    const handlePiece = (newPiece) => {
      if (grid.length === 0) {
        return;
      }

      const { playerIndex, receivedPiece, pieceRow, pieceCol } = newPiece;

      // copie de la grille pour travailler dessus
      const newGrid = [...grid];

      //on met les pièces dans la grille (si un bloc de la pièce = 1 alors on donne une valeur à la cellule de la grid)
      console.log("avant positionnement de la pièce ", {
        playerIndex,
        newGrid,
      });
      receivedPiece.forEach((row, pieceRowIndex) => {
        row.forEach((block, pieceColIndex) => {
          if (block === 1) {
            newGrid[pieceRowIndex][pieceCol + pieceColIndex] = 1 + playerIndex; //si =1 alors player 1, si =2 alors player 2...
          }
        });
      });

      console.log({ playerIndex, newGrid });
      setGrid(newGrid);
    };
    socket.on("receive_piece", (newPiece) => handlePiece(newPiece));

    return () => {
      socket.off("receive_piece", (newPiece) => handlePiece(newPiece));
    };
  }, [grid.length, socket]);

  // Tu feras la logique socket de réception/émission dans spawnInitialPieces

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
          <h2><span>Score perso : {currentScore} </span> <span>Nb lignes perso : {completedLines} </span></h2>
        </div>
        <div className={styles.teamScores}>
          <h2><span>Score équipe : {teamScore} </span> <span>Nb lignes équipe : {teamLines} </span></h2>
        </div>
      </div>
      <h2 className={styles.title}>Multitris</h2>
      {gridToDisplay()}
    </div>
  );
}

export default MultitrisGame;
