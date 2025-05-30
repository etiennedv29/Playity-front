// src/pages/LobbyPage.jsx
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../../client/socketClient";
import Lobby from "../../../components/multitris/lobby";
import Head from "next/head";
import styles from "../../../styles/Lobby.module.css";
import { getGameNameFromUrl } from "../../../utils/url";
import Multitris from "../../../components/Multitris";

export default function LobbyPage() {
  const router = useRouter();
  const { code } = router.query;
  const [game, setGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [lobby, setLobby] = useState(null);
  const gameName = getGameNameFromUrl();
  const userId = useSelector((state) => state.users.value["_id"]);
  const user = useSelector((state) => state.users.value);
  const [partId, setPartId] = useState("");
  let isAdmin = false;

  if (lobby) {
    isAdmin = lobby.admin === userId;
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/games?name=` + gameName
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
      setLobby(lobby);
    });

    // Quand un joueur quitte
    socket.on("userLeft", ({ lobby }) => {
      console.log("userLeft", lobby);
      setLobby(lobby);
    });

    // Rejoindre automatiquement le lobby à l’arrivée sur la page
    socket.emit("joinLobby", { code, userId }, (res) => {
      if (res?.success === false) {
        console.log("Erreur de lobby:", res.error);
      }
    });

    //ecoute de début de la partie
    //if (!isAdmin) { // maintenant tous les joueurs, pas uniquement les non admin, écoutent le début de partie
    !gameStarted && // sécurité car le back renvoie 2 fois le lancement de la game (double réception côté socket.on("gameStarted"))
      socket.on("gameStartedNow", (gameStarted) => {
        if (gameStarted.gameStartInfo) {
          console.log("gamestarted via socket.on('gameStartedNow'=>", {
            startedby: gameStarted.startedBy,
          });
          setGameStarted(true);
          setPartId(gameStarted.partId);
        }
      });
    //}

    return () => {
      // window.removeEventListener("beforeunload", handleUnload);
      socket.emit("leaveLobby", { code, userId }, (res) => {});
      socket.disconnect();
    };
  }, [router.isReady, code, userId]);

  const handlePartLaunch = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/parts/start`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game._id, lobbyId: lobby._id }),
      }
    );

    console.log("id du lobby : ", lobby._id);
    // La partie est créée en base, on récupère la réponse qui contient l'id de la partie
    const data = await response.json();
    console.log("partie créée par le back=> ", data);

    // on envoie à tout le monde que la partie commence
    socket.emit("gameStart", {
      code,
      startedBy: user.username,
      partId: data.partId,
    });
    console.log("gameStarted");
    //setGameStarted(true);// avant on settait la partie à setGameStarted(true) directement en tant qu'admin

    // On ajoute cet id dans un état
    // setPartId(data.partId);
  };

  return (
    <>
      <div className={styles.lobbyContainer}>
        <Head>
          <title>{`Playity | ${
            gameName[0].toUpperCase() + gameName.slice(1)
          }`}</title>
        </Head>
        {!gameStarted && <h1 className="gameTitle">Multitris</h1>}
        <div className={styles.mainContainer}>
          {!gameStarted && lobby && (
            <Lobby
              game={game}
              lobby={lobby}
              code={code}
              startGame={handlePartLaunch}
            />
          )}
          {gameStarted && lobby && partId && (
            <Multitris
              game={game}
              lobby={lobby}
              code={code}
              socket={socket}
              part={partId}
            />
          )}
        </div>
      </div>
    </>
  );
}
