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
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchTopGames = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/games`
    );
    const data = await response.json();
    const topGamesData = data.filter((e) => e.tags.includes("topGame"));
    setTopGames(topGamesData);
  };

  useEffect(() => {
    fetchTopGames();
  }, []);

  const currentTopGames = topGames.map((slide, index) => (
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
      onClick={() =>
        swiperRef.current.slideTo(topGames.findIndex((g) => g.id === slide.id))
      }
      onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
    >
      <Slide
        {...slide}
        className={styles.slide}
        isActive={index === activeIndex}
      />
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
          rotate: 5, // Pas de rotation
          stretch: 30, // slides plus proches (valeur négative = elles se recouvrent)
          depth: 120, // profondeur pour le Z-index
          modifier: 3, // augmente l'effet de profondeur
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
            style={{color: "white"}}
            className={styles.btn}
            onClick={() => swiperRef.current?.slidePrev()}
          />
          <FontAwesomeIcon
            icon={faChevronRight}
            style={{color: "white"}}
            className={styles.btn}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </div>
      </Swiper>
    </div>
  );
}

export default Slider;
