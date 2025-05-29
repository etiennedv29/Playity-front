import styles from "../styles/Carousel.module.css";
import Image from "next/image";
import { useRouter } from "next/router";

function Slide(props) {
  const router = useRouter();

  function handleTopGame(gameName) {
    //console.log('Click détecté')
    gameName.toLowerCase().replace(" ", "");
    router.push(`http://localhost:3001/${gameName}`);
    //console.log('Voici le nom du jeu cliqué : ', gameName);
  }

  return (
    <div className={styles.slide}>
      <div
        style={{ position: "relative" }}
        onClick={() => handleTopGame(props.name)}
      >
        <div className={styles.slideTitle}>{props.name}</div>
        <Image
          className={styles.image}
          src={props.image}
          alt={props.name}
          width={300}
          height={200}
        />
        <p className={styles.description}>{props.description}</p>
      </div>
    </div>
  );
}

export default Slide;
