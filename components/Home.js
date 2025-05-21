import styles from "../styles/Home.module.css";
import Slider from "./Slider";
import Game from "./Game";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; //récupération de l'url
import Link from "next/link";

function Home() {
  const router = useRouter();

  const [gamesData, setGamesData] = useState([]);

  let gamesMock = [
  {
    "id": "1",
    "name": "Multitris",
    "description": "Un Tetris collaboratif où les joueurs s'entraident pour éviter le Game Over.",
    "image": "https://scienceline.org/wp-content/uploads/2020/01/tetris.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Comment jouer à Multitris",
      "description": "Empilez les blocs avec vos coéquipiers pour survivre le plus longtemps possible.",
      "image": "https://scienceline.org/wp-content/uploads/2020/01/tetris.jpg"
    },
    "demo": "https://example.com/demo/multitris",
    "maxPlayers": 4,
    "tags": ["topGame", "arcade"]
  },
  {
    "id": "2",
    "name": "Code en Chaos",
    "description": "Un jeu où les joueurs doivent déboguer un programme ensemble.",
    "image": "https://scienceline.org/wp-content/uploads/2020/01/tetris.jpg",
    "isPremium": true,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Déboguez en équipe",
      "description": "Trouvez et corrigez les bugs avant que le temps ne s'écoule.",
      "image": "https://scienceline.org/wp-content/uploads/2020/01/tetris.jpg"
    },
    "demo": "https://example.com/demo/code-en-chaos",
    "maxPlayers": 5,
    "tags": ["logique"]
  },
  {
    "id": "3",
    "name": "Puzzle Express",
    "description": "Assemblez des puzzles en temps réel avec vos amis.",
    "image": "https://scienceline.org/wp-content/uploads/2020/01/tetris.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Assembler rapidement",
      "description": "Travaillez ensemble pour compléter le puzzle avant la fin du chrono.",
      "image": "https://cdn.pixabay.com/photo/2016/03/05/19/02/puzzle-1233383_1280.jpg"
    },
    "demo": "https://example.com/demo/puzzle-express",
    "maxPlayers": 6,
    "tags": ["topGame", "puzzle"]
  }
]

  // async function getFacts() {
  //   let response;
  //   let data;
  //   if (router.query.type) {
  //     response = await fetch(
  //       `http://localhost:3000/games`
  //     );
  //     data = await response.json();
  //   } else {
  //     response = await fetch(
  //       `http://localhost:3000/facts/`
  //     );
  //     data = await response.json();
  //   }

  //   let newFactsData = data.map((fact) => {
  //     const newFactFormat = {
  //       factTitle: fact.title,
  //       factDescription: fact.description,
  //       nbVotesPlus: fact.votePlus,
  //       nbVotesMinus: fact.voteMinus,
  //       factComments: fact.comments,
  //       factImage: fact.image,
  //       factId: fact._id,
  //     };
  //     return newFactFormat;
  //   });
  //   setGamesData(newFactsData);
  // }

  // // à transformer pour load tous les jeux
  // useEffect(() => {
  //   getFacts();
  // }, [router.query]);

  // ci-dessous à transformer après avoir créé le composant des miniatures de jeux
  let games = gamesMock.map((data, i) => {
    return (
      <Game
        key={i}
        {...data}
      />
    );
  });

  return (
    <div>
      <Head>
        <title>Playity | Home</title>
      </Head>
      <div className={styles.main}>
        <div className={styles.carrouselContainer}>
          <Slider data={gamesMock} activeSlide={2} className={styles.slider}></Slider>
          {/* {games} */}
        </div>
        <div className={styles.gamesGridTitle}>Plus de jeux</div>
        <div className={styles.gamesGridContainer}>
          
        </div>
        <div className={styles.footer}></div>
      </div>
    </div>
  );
}

export default Home;
