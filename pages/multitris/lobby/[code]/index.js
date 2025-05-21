// src/pages/LobbyPage.jsx
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { socket } from "../../../../client/socketClient";
import PlayerLobby from "../../../../components/multitris/PlayerLobby";
import WaitingPlayerLobby from "../../../../components/multitris/WaitingPlayerLobby";
import YoutubeVideo from "../../../../components/YoutubeVideo";
import styles from "../../../../styles/Lobby.module.css";
import { getGameNameFromUrl } from "../../../../utils/url";

export default function Lobby() {
  const router = useRouter();
  const { code } = router.query;
  const userId = "682ca849937b360a352516b5"; // remplace par ton user réel
  const [players, setPlayers] = useState([]);
  const [game, setGame] = useState(null);
  const [lobby, setLobby] = useState(null);
  const gameName = getGameNameFromUrl();

  useEffect(() => {
    (async () => {
      const res = await axios.get(
        "http://localhost:3000/games?name=" + gameName
      );
      console.log(res.data[0]);
      setGame(res.data[0]);
    })();
  }, []);

  useEffect(() => {
    socket.connect();

    // Rejoindre automatiquement le lobby à l’arrivée sur la page
    socket.emit("joinLobby", { code, userId }, (res) => {
      if (res?.success === false) {
        console.log("Erreur de lobby:", res.error);
      } else {
        setPlayers(res.lobby.players);
        setLobby(res.lobby);
      }
    });

    // Quand un autre joueur rejoint
    socket.on("userJoined", ({ lobby }) => {
      setPlayers(lobby.players);
      setLobby(res.lobby);
    });

    // Quand un joueur quitte
    socket.on("userLeft", ({ lobby }) => {
      setPlayers(lobby.players);
      setLobby(res.lobby);
    });

    return () => {
      // Déconnexion propre (optionnel)
      socket.emit("leaveLobby", { code, userId }, (res) => {});

      socket.disconnect();
    };
  }, [code, userId]);

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

  let playersWaiting;

  if (lobby) {
    playersWaiting = buildPlayerWaiting();
  }

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.demoContainer}>
        {game && <YoutubeVideo videoId={game.demo} />}
      </div>
      <div className={styles.playersContainer}>
        <h1>Players</h1>
        {playerElements}
        {playersWaiting}
        <button>Share Code {code}</button>
      </div>
    </div>
  );
}
