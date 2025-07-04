import styles from "../styles/Home.module.css";
import Carousel from "./Carousel";
import GameMiniature from "./GameMiniature";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function Home() {
  const [gamesData, setGamesData] = useState([]);
  const searchValue = useSelector((state) => state.searches.value.search);
  let gamesMock = [];

  const getAllGames = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/games`
    );

    const data = await response.json();
    const otherGamesData = data;
    setGamesData(otherGamesData);
  };

  useEffect(() => {
    getAllGames();
  }, []);

  let carouselBoxSize = {
    height: searchValue.length===0 ? "400px" : "1px",
    transition: "height 0.4s ease 0s"
  };

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
        <div className={styles.carrouselContainer} style ={carouselBoxSize}>
          {searchValue.length ===0 && (
            <Carousel
              data={gamesMock}
              activeSlide={2}
              className={styles.slider}
            ></Carousel>
          )}
        </div>
        <h3 className={styles.gamesGridTitle}>Plus de jeux</h3>
        <div className={styles.gamesGridContainer}>{games}</div>
        <div className={styles.footer}></div>
      </div>
    </div>
  );
}

export default Home;
