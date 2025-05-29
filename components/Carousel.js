import React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "../styles/Carousel.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "swiper/css";
import Slide from "./Slide";

function Slider() {
  const swiperRef = useRef(null);
  const [topGames, setTopGames] = useState([]);

  const fetchTopGames = async () => {
    const response = await fetch("http://localhost:3000/games");
    //const response = await fetch("https://p01--playity-back--c9dy8yj49fkp.code.run/games")
    const data = await response.json();
    const topGamesData = data.filter((e) => e.tags.includes("topGame"));
    setTopGames(topGamesData);
    //console.log(topGamesData);
  };

  useEffect(() => {
    fetchTopGames();
  }, []);

  const currentTopGames = topGames.map((slide) => (
    <SwiperSlide
      key={slide.id}
      className={styles.slideContainer}
      style={{
        width: "400px",
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Slide {...slide} className={styles.slide} />
    </SwiperSlide>
  ));

  return (
    <div className="relative w-full min-h-[400px] flex justify-center items-center">
      <Swiper
        modules={[EffectCoverflow, Pagination]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        initialSlide={2}
        loop={false}
        coverflowEffect={{
          rotate: 10, // pas de rotation
          stretch: 10, // slides plus proches (valeur négative = elles se recouvrent)
          depth: 200, // profondeur pour le Z-index
          modifier: 2.5, // augmente l'effet de profondeur
          slideShadows: false, // tu peux passer à true si tu veux un effet 3D
        }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        pagination={{ clickable: true }}
        className={styles.carouselContainer}
      >
        {currentTopGames}
        <div className={styles.buttonsBox}>
          <FontAwesomeIcon
            icon={faChevronLeft}
            color="white"
            className={styles.btn}
            onClick={() => swiperRef.current?.slidePrev()}
          />
          <FontAwesomeIcon
            icon={faChevronRight}
            color="white"
            className={styles.btn}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </div>
      </Swiper>
    </div>
  );
}

export default Slider;
