// src/pages/LobbyPage.jsx
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../styles/Lobby.module.css";
import YoutubeVideo from "../YoutubeVideo";
import PlayerLobby from "./PlayerLobby";
import WaitingPlayerLobby from "./WaitingPlayerLobby";

export default function Lobby({ lobby, game, code, startGame }) {
  const [copied, setCopied] = useState(false);
  const userId = useSelector((state) => state.users.value["_id"]);
  let isAdmin = false;
  let playersWaiting;

  const playerElements = lobby.players.map((player, index) => (
    <PlayerLobby key={index} {...player} />
  ));

  const buildPlayerWaiting = () => {
    let elements = [];
    for (let i = 0; i < lobby.nbPlayers - lobby.players.length; i++) {
      elements.push(<WaitingPlayerLobby key={i} />);
    }

    return elements;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie", err);
    }
  };

  if (lobby) {
    playersWaiting = buildPlayerWaiting();
    isAdmin = lobby.admin === userId;
  }

  const disableBtnPlay = lobby.players.length < 2;

  return (
    <>
      <div className={styles.leftContainer}>
        {game && <YoutubeVideo videoId={game.demo} />}
        {lobby && isAdmin && (
          <button
            onClick={() => startGame()}
            className={`btnPlay ${styles.btnPlay}`}
            disabled={disableBtnPlay}
          >
            Lancer la partie
          </button>
        )}
      </div>
      <div className={styles.rightContainer}>
        <h1>Lobby: #{code}</h1>
        {playerElements}
        {playersWaiting}
        <button
          onClick={handleCopy}
          className={`btnSecondary ${styles.btnSecondary}`}
        >
          Share Code
        </button>
        {copied && (
          <span style={{ marginLeft: "10px", color: "green" }}>Copié ✅</span>
        )}
      </div>
    </>
  );
}
