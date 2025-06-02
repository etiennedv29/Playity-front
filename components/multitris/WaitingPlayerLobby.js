import styles from "../../styles/PlayerLobby.module.css";

function WaitingPlayerLobby() {
  return (
    <div className={styles.playerLobbyContainer}>
      <div style={styles.gameTitle}>En attente...</div>
    </div>
  );
}

export default WaitingPlayerLobby;
