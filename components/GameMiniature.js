import styles from "../styles/GameMiniature.module.css";
import Image from "next/image";

function GameMiniature(props) {
    return (
        <div className={styles.gameContainer}>
            <div className={styles.imageContainer} style={{position: "relative"}}>
                <div className={styles.gameTitle}>{props.name}</div>
                <Image className={styles.image} src={props.image} alt={props.name} width={300} height={200} />
                <p className={styles.description}>{props.description}</p>
            </div>

        </div>
    )
}

export default GameMiniature;