import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import YoutubeVideo from "../../components/YoutubeVideo";
import styles from "../../styles/Lobby.module.css";
import { getGameNameFromUrl } from "../../utils/url";

export default function HomePage() {
  const [joinCode, setJoinCode] = useState("");
  const [playerNumber, setPlayerNumber] = useState(3);
  const [game, setGame] = useState(null);

  const token = useSelector((state) => state.users.value.token);
  const router = useRouter();
  const gameName = getGameNameFromUrl();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/games?name=` + gameName
        );
        setGame(res.data[0]);
      } catch (e) {}
    })();
  }, []);

  const handleCreateLobby = async () => {
    if (game) {
      try {
        //Je crée le lobby dans mongo
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/lobbies`,
          { nbPlayers: playerNumber, gameId: game["_id"] },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        const code = res.data.code;
        router.push(`/multitris/${code}`);
      } catch (err) {
        console.error("Erreur lors de la création du lobby :", err);
      }
    }
  };

  const handleJoinClick = (e) => {
    e.preventDefault();
    if (joinCode.trim().length === 5) {
      router.push(`/multitris/${joinCode.toUpperCase()}`);
    } else {
      alert("Code invalide");
    }
  };

  const generateOptionsPlayerNumberElement = () => {
    let elements = [];
    if (game) {
      for (let i = 1; i <= game.maxPlayers; i++) {
        elements.push(<option value={i}>{i}</option>);
      }
    }

    return elements;
  };

  const selectPlayerNumberElements = generateOptionsPlayerNumberElement();

  return (
    <div>
      <Head>
        <title>{`Playity | ${
          gameName[0].toUpperCase() + gameName.slice(1)
        }`}</title>
      </Head>
      <div className={styles.lobbyContainer}>
        <h1 className="gameTitle">Multitris</h1>
        <div className={styles.globalContainer}>
          <div className={styles.leftContainer}>
            {game && <YoutubeVideo videoId={game.demo} />}
          </div>
          <div className={styles.rightContainer}>
            <div className={styles.rightTopContainer}>
              <div className={styles.selectContainer}>
                <label htmlFor="mySelect">Joueurs</label>
                <select
                  id="mySelect"
                  value={String(playerNumber)}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  required={true}
                  className={styles.selectInput}
                >
                  {selectPlayerNumberElements}
                </select>
              </div>

              <button
                className={`btnPlay ${styles.btnCreateGame}`}
                onClick={handleCreateLobby}
              >
                Créer une partie
              </button>
            </div>

            <div className={styles.rightBottomContainer}>
              <div className={styles.lobbyCodeContainer}>
                <label>Code de la partie</label>
                <input
                  className={styles.inputCode}
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  maxLength={5}
                />
              </div>

              <button
                className={`btnSecondary ${styles.btnJoin}`}
                type="submit"
                onClick={handleJoinClick}
              >
                Rejoindre
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
