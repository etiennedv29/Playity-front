import styles from "../../styles/PlayerLobby.module.css";

function WaitingPlayerLobby() {
  return (
    <div className={styles.playerLobbyContainer}>
      <div style={styles.gameTitle}>waiting...</div>
    </div>
  );
}

export default WaitingPlayerLobby;
