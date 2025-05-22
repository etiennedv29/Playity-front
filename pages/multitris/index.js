import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import YoutubeVideo from "../../components/YoutubeVideo";
import styles from "../../styles/Multitris.module.css";
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
      const res = await axios.get(
        "http://localhost:3000/games?name=" + gameName
      );
      console.log(res.data[0]);
      setGame(res.data[0]);
    })();
  }, []);

  const handleCreateLobby = async () => {
    try {
      //Je crée le lobby dans mongo
      console.log("creer lobby", playerNumber, game["_id"]);
      const res = await axios.post(
        "http://localhost:3000/lobbies",
        { nbPlayers: playerNumber, gameId: game["_id"] },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      const code = res.data.code;
      router.push(`/multitris/lobby/${code}`);
    } catch (err) {
      console.error("Erreur lors de la création du lobby :", err);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCode.trim().length === 5) {
      router.push(`/lobby/${joinCode.toUpperCase()}`);
    } else {
      alert("Code invalide");
    }
  };

  return (
    <div>
      <div className={styles.lobbyContainer}>
        <div className={styles.mainContainer}>
          <div className={styles.leftContainer}>
            {game && <YoutubeVideo videoId={game.demo} />}
          </div>
          <div className={styles.rightContainer}>
            <h1>Multitris</h1>
            <div>
              <label htmlFor="mySelect">Choisis une option :</label>
              <select
                id="mySelect"
                value={playerNumber}
                onChange={setPlayerNumber}
                required={true}
              >
                <option value="">-- Choisir --</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <button
              className={`btnPlay ${styles.btnPlay}`}
              onClick={handleCreateLobby}
            >
              Créer un lobby
            </button>

            <form onSubmit={handleJoinSubmit} style={{ marginTop: "20px" }}>
              <label>Code du lobby :</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={5}
                style={{ textTransform: "uppercase", marginLeft: "10px" }}
              />
              <button
                className={`btnSecondary ${styles.btnSecondary}`}
                type="submit"
                style={{ marginLeft: "10px" }}
              >
                Rejoindre
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
