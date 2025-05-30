import styles from "../styles/Home.module.css";
import Carousel from "./Carousel";
import GameMiniature from "./GameMiniature";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { useRouter } from "next/router"; //récupération de l'url
import Link from "next/link";

function Home() {
  const router = useRouter();
  const [gamesData, setGamesData] = useState([]);
  const searchValue = useSelector((state) => state.searches.value.search);
  console.log({searchValue})
  let gamesMock = [];

  const getAllGames = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/games`
    );

    const data = await response.json();
    const otherGamesData = data.filter((e) => !e.tags.includes("topGame"));
    setGamesData(otherGamesData);
  };

  useEffect(() => {
    getAllGames();
  }, []);

  // ci-dessous à transformer après avoir créé le composant des miniatures de jeux
  let games = gamesData
    .filter((e) => e.name.toLowerCase().includes(searchValue.toLowerCase()))
    .map((data, i) => {
      return <GameMiniature key={i} {...data} />;
    });

  return (
    <div>
      <Head>
        <title>Playity | Home</title>
      </Head>
      <div className={styles.main}>
        <div className={styles.carrouselContainer}>
          <Carousel
            data={gamesMock}
            activeSlide={2}
            className={styles.slider}
          ></Carousel>
        </div>
        <h3 className={styles.gamesGridTitle}>Plus de jeux</h3>
        <div className={styles.gamesGridContainer}>{games}</div>
        <div className={styles.footer}></div>
      </div>
    </div>
  );
}

export default Home;
