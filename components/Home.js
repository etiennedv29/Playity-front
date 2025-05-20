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
    "image": "https://cdn.pixabay.com/photo/2017/08/30/07/52/tetris-2693234_1280.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Comment jouer à Multitris",
      "description": "Empilez les blocs avec vos coéquipiers pour survivre le plus longtemps possible.",
      "image": "https://cdn.pixabay.com/photo/2017/08/30/07/52/tetris-2693234_1280.jpg"
    },
    "demo": "https://example.com/demo/multitris",
    "maxPlayers": 4,
    "tags": ["topGame", "arcade"]
  },
  {
    "id": "2",
    "name": "Code en Chaos",
    "description": "Un jeu où les joueurs doivent déboguer un programme ensemble.",
    "image": "https://cdn.pixabay.com/photo/2015/05/15/14/47/code-768593_1280.jpg",
    "isPremium": true,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Déboguez en équipe",
      "description": "Trouvez et corrigez les bugs avant que le temps ne s'écoule.",
      "image": "https://cdn.pixabay.com/photo/2015/05/15/14/47/code-768593_1280.jpg"
    },
    "demo": "https://example.com/demo/code-en-chaos",
    "maxPlayers": 5,
    "tags": ["logique"]
  },
  {
    "id": "3",
    "name": "Puzzle Express",
    "description": "Assemblez des puzzles en temps réel avec vos amis.",
    "image": "https://cdn.pixabay.com/photo/2016/03/05/19/02/puzzle-1233383_1280.jpg",
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
  },
  {
    "id": "4",
    "name": "Quiz Battle",
    "description": "Affrontez vos amis dans un quiz de culture générale.",
    "image": "https://cdn.pixabay.com/photo/2015/09/05/20/02/quiz-924946_1280.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Testez vos connaissances",
      "description": "Répondez correctement aux questions pour gagner des points.",
      "image": "https://cdn.pixabay.com/photo/2015/09/05/20/02/quiz-924946_1280.jpg"
    },
    "demo": "https://example.com/demo/quiz-battle",
    "maxPlayers": 8,
    "tags": ["quiz"]
  },
  {
    "id": "5",
    "name": "Labyrinthe Mystère",
    "description": "Naviguez dans un labyrinthe généré aléatoirement avec vos coéquipiers.",
    "image": "https://cdn.pixabay.com/photo/2017/08/30/07/52/maze-2693235_1280.jpg",
    "isPremium": true,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Trouvez la sortie",
      "description": "Coopérez pour sortir du labyrinthe avant la fin du temps imparti.",
      "image": "https://cdn.pixabay.com/photo/2017/08/30/07/52/maze-2693235_1280.jpg"
    },
    "demo": "https://example.com/demo/labyrinthe-mystere",
    "maxPlayers": 4,
    "tags": ["aventure"]
  },
  {
    "id": "6",
    "name": "Chasse au Trésor",
    "description": "Résolvez des énigmes pour trouver le trésor caché.",
    "image": "https://cdn.pixabay.com/photo/2017/01/31/19/16/treasure-2029320_1280.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "À la recherche du trésor",
      "description": "Utilisez les indices pour localiser le trésor avant les autres équipes.",
      "image": "https://cdn.pixabay.com/photo/2017/01/31/19/16/treasure-2029320_1280.jpg"
    },
    "demo": "https://example.com/demo/chasse-au-tresor",
    "maxPlayers": 5,
    "tags": ["exploration"]
  },
  {
    "id": "7",
    "name": "Défi Musical",
    "description": "Devinez les chansons jouées en équipe.",
    "image": "https://cdn.pixabay.com/photo/2016/11/29/05/08/music-1867128_1280.jpg",
    "isPremium": true,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Jouez avec la musique",
      "description": "Écoutez les extraits et identifiez les titres le plus rapidement possible.",
      "image": "https://cdn.pixabay.com/photo/2016/11/29/05/08/music-1867128_1280.jpg"
    },
    "demo": "https://example.com/demo/defi-musical",
    "maxPlayers": 6,
    "tags": ["musique"]
  },
  {
    "id": "8",
    "name": "Memory Express",
    "description": "Testez votre mémoire en équipe avec des cartes à retourner.",
    "image": "https://cdn.pixabay.com/photo/2017/01/31/19/16/cards-2029319_1280.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Souvenez-vous des cartes",
      "description": "Retrouvez les paires le plus rapidement possible en coopérant.",
      "image": "https://cdn.pixabay.com/photo/2017/01/31/19/16/cards-2029319_1280.jpg"
    },
    "demo": "https://example.com/demo/memory-express",
    "maxPlayers": 4,
    "tags": ["mémoire"]
  },
  {
    "id": "9",
    "name": "Stratégie Galactique",
    "description": "Conquérez la galaxie en élaborant des stratégies avec votre équipe.",
    "image": "https://cdn.pixabay.com/photo/2016/03/27/21/16/space-1284298_1280.jpg",
    "isPremium": true,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Dominez l'espace",
      "description": "Planifiez vos mouvements pour prendre le contrôle des planètes.",
      "image": "https://cdn.pixabay.com/photo/2016/03/27/21/16/space-1284298_1280.jpg"
    },
    "demo": "https://example.com/demo/strategie-galactique",
    "maxPlayers": 5,
    "tags": ["topGame", "stratégie"]
  },
  {
    "id": "10",
    "name": "Course Contre la Montre",
    "description": "Réalisez des défis en un temps limité avec votre équipe.",
    "image": "https://cdn.pixabay.com/photo/2015/09/05/20/02/stopwatch-924950_1280.jpg",
    "isPremium": false,
    "parts": [],
    "gamePartDetails": null,
    "tutorial": {
      "title": "Défiez le temps",
      "description": "Complétez les missions avant que le chrono ne s'arrête.",
      "image": "https://cdn.pixabay.com/photo/2015/09/05/20/02/stopwatch-924950_1280.jpg"
    },
    "demo": "https://example.com/demo/course-contre-la-montre",
    "maxPlayers": 6,
    "tags": ["réflexe"]
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
        <Slider data={games} activeSlide={2}></Slider>
        <div className={styles.gamesGridContainer}>GAMES GRID CONTAINER</div>
        <div className={styles.footer}></div>
      </div>
    </div>
  );
}

export default Home;
