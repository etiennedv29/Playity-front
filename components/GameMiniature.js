import styles from "../styles/GameMiniature.module.css";
import Image from "next/image";
import { useRouter } from 'next/router';

function GameMiniature(props) {

    const router = useRouter();

    function handleNormalGame(gameName) {
        gameName.toLowerCase().replace(" ", "");
        router.push(`http://localhost:3001/${gameName}`);
    }

    return (
        <div className={styles.gameContainer}>
            <div className={styles.imageContainer} style={{position: "relative"}} onClick={() => handleNormalGame(props.name)}>
                <div className={styles.gameTitle}>{props.name}</div>
                <Image className={styles.image} src={props.image} alt={props.name} width={300} height={200} />
                <p className={styles.description}>{props.description}</p>
            </div>

        </div>
    )
}

export default GameMiniature;