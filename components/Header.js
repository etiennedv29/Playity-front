import styles from "../styles/Header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../reducers/users";
import { useRouter } from "next/router";

function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.users.value.username);
  const token = useSelector((state) => state.users.value.token);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.globalInfo}>
        <Link href="/" className={styles.link}>
          <Image
            className={styles.logoImage}
            src="/playity-logo.png"
            alt="Playity logo"
            width={133}
            height={100}
            style={{ cursor: "pointer" }}
          />
        </Link>
        <div className={styles.titlesBox}>
          <h1 className={styles.logoTitle}>
            Playity
          </h1>
          <h2 className={styles.logoCatchPhrase}>
            You'll never play alone
            </h2>
        </div>
        <div className={styles.searchContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon}/>
          <input type="text" placeholder="Rechercher un jeu" className={styles.searchInput}></input>
        </div>
         
        <FontAwesomeIcon icon={faUser} className={styles.userSection}/>
      </div>
    </header>
  );
}

export default Header;
