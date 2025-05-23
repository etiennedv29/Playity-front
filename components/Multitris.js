import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import styles from "../styles/Multitris.module.css";

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
let players = [
  { id: 111111, username: "testeur1" },
  { id: 222222, username: "testeur2" },
];
let currentPlayerIndex = 1;

//function MultitrisGame({ players }) { A CHANGER AVEC UN VRAI APPEL AU COMPOSANT
function MultitrisGame() {
  const [grid, setGrid] = useState([]);
  const [socket, setSocket] = useState(null); // déjà géré par le lobby ?

  // largeur de la grille=f(qté players)
  const numberOfCols = players.length * COLS_PER_PLAYER;

  // Initialisation de la grille vide
  const initializeGrid = () => {
    const newGrid = Array.from({ length: ROWS }, () =>
      Array(numberOfCols).fill(0)
    );
    setGrid(newGrid);
  };

  // Connexion socket et initialisation
  useEffect(() => {
    // const s = io();
    // setSocket(s);

    // au mount du composant Multitris, initialisation de la grille vide
    initializeGrid();

    // Nettoyage à la destruction
    return () => {
      //s.disconnect();
    };
  }, []);

  // --- À coder ici : déclenchement de la première pièce pour chaque joueur ---
  // appeler une fonction comme spawnInitialPieces(s) pour faire tomber une pièce par joueur
  const spawnInitialPieces = () => {
    // si la grille de base n'est pas initialisée, on ne crée pas de première pièce
    if (grid.length === 0) {
      return;
    }

    //demande de spawn de pièce par le player currentPlayer
    socket.emit("spawn_piece",{currentPlayerIndex,lobby})
   

    //reception de la piece (générée puis envoyée puis bientôt reçue)
    socket.on("receive_piece", (newPiece) => {
      const { playerIndex, receivedPiece, pieceRow, pieceCol } = newPiece;

      // copie de la grille pour travailler dessus
      const newGrid = [...grid.map((row) => [...row])];

      //on met les pièces dans la grille (si un bloc de la pièce = 1 alors on donne une valeur à la cellule de la grid)
      newPiece.receivedPiece.forEach((row, pieceRowIndex) => {
        row.forEach((block, pieceColIndex) => {
          if (block === 1) {
            newGrid[pieceRowIndex][newPieceStartCol + pieceColIndex] =
              1 + playerIndex; //si =1 alors player 1, si =2 alors player 2...
            // console.log(
            //   "newGridblock after=",
            //   newGrid[pieceRowIndex][pieceCol + pieceColIndex]
            // );
          }
        });
      });

      setGrid(newGrid);
    });
  };

  useEffect(() => {
    // au cas où la grille initiale n'est pas générée :
    spawnInitialPieces();
  }, [grid.length]);

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
      <h2 className={styles.title}>Multitris</h2>
      {gridToDisplay()}
    </div>
  );
}

export default MultitrisGame;
