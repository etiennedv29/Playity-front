import styles from "../styles/Game.module.css";
import Image from "next/image";

function Game(props) {
    return (
        <div className={styles.gameContainer}>
            <div className={styles.gameTitle}>{props.name}</div>
            <Image className={styles.image} src={props.image} alt={props.name} width={300} height={200} />
            <div className={styles.description}>{props.description}</div>
        </div>
    )
}

export default Game;