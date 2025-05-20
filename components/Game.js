import styles from "../styles/Game.module.css";
import Image from "next/image";

function Game(props) {

    return (
        <div style={styles.gameContainer}>
            <div style={styles.gameTitle} >{props.title}</div>
            <Image style={styles.image} src={props.image} alt={props.title}/>
            <div style={styles.description}>{props.description}</div>
        </div>
    )
}

export default Game;