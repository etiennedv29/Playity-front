import Image from "next/image";
import styles from "../../styles/PlayerLobby.module.css";

function PlayerLobby(props) {
  return (
    <div className={styles.playerLobbyContainer}>
      <Image
        style={styles.image}
        src={props.avatar}
        alt={props.username}
        width={30}
        height={30}
      />
      <div style={styles.gameTitle}>{props.username}</div>
    </div>
  );
}

export default PlayerLobby;
