import styles from "../styles/TouchControls.module.css"

export default function TouchControls({ onMoveLeft, onMoveRight, onRotate, onDown }) {
  return (
    <div className={styles.touchControls}>
      <div className={styles.upRow}>
        <button onClick={onRotate}>⬆️</button>
      </div>
      <div className={styles.bottomRow}>
        <button onClick={onMoveLeft}>⬅️</button>
        <button onClick={onDown}>⬇️</button>
        <button onClick={onMoveRight}>➡️</button>
      </div>
    </div>
  );
}