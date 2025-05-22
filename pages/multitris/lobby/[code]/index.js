// src/pages/LobbyPage.jsx
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../../../client/socketClient";
import PlayerLobby from "../../../../components/multitris/PlayerLobby";
import WaitingPlayerLobby from "../../../../components/multitris/WaitingPlayerLobby";
import YoutubeVideo from "../../../../components/YoutubeVideo";
import styles from "../../../../styles/Lobby.module.css";
import { getGameNameFromUrl } from "../../../../utils/url";

export default function Lobby() {
  const router = useRouter();
  const { code } = router.query;
  const [players, setPlayers] = useState([]);
  const [game, setGame] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [copied, setCopied] = useState(false);
  const gameName = getGameNameFromUrl();
  const userId = useSelector((state) => state.users.value["_id"]);
  let isAdmin = false;
  let playersWaiting;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/games?name=" + gameName
        );
        console.log(res.data[0]);
        setGame(res.data[0]);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (!router.isReady || !code || !userId) return;

    socket.connect();

    socket.emit("register", userId);

    // Quand un autre joueur rejoint
    socket.on("userJoined", ({ lobby }) => {
      setPlayers(lobby.players);
      setLobby(lobby);
    });

    // Quand un joueur quitte
    socket.on("userLeft", ({ lobby }) => {
      console.log("userLeft", lobby);
      setPlayers(lobby.players);
      setLobby(lobby);
    });

    // Rejoindre automatiquement le lobby à l’arrivée sur la page
    socket.emit("joinLobby", { code, userId }, (res) => {
      if (res?.success === false) {
        console.log("Erreur de lobby:", res.error);
      }
    });

    return () => {
      // window.removeEventListener("beforeunload", handleUnload);
      socket.emit("leaveLobby", { code, userId }, (res) => {});
      socket.disconnect();
    };
  }, [router.isReady, code, userId]);

  const playerElements = players.map((player, index) => (
    <PlayerLobby key={index} {...player} />
  ));

  const buildPlayerWaiting = () => {
    let elements = [];
    for (let i = 0; i < lobby.nbPlayers - players.length; i++) {
      elements.push(<WaitingPlayerLobby key={i} />);
    }

    return elements;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href + "/lobby/" + code
      );
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

  return (
    <div className={styles.lobbyContainer}>
      <h1 className="gameTitle">Multitris</h1>
      <div className={styles.mainContainer}>
        <div className={styles.leftContainer}>
          {game && <YoutubeVideo videoId={game.demo} />}
          {lobby && isAdmin && (
            <button className={`btnPlay ${styles.btnPlay}`}>
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
      </div>
    </div>
  );
}
