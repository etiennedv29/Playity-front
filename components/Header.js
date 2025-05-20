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
  const avatar = useSelector((state) => state.users.value.avatar);
  const token = useSelector((state) => state.users.value.token);

  const handleLogout = () => {
    router.push("/");
    dispatch(logout());
  };

  return (
    <header className={styles.header}>
      <div className={styles.globalInfo}>
        <div className={styles.globalInfoLeft}>
          <Link href="/" className={styles.link}>
            <Image
              className={styles.logoImage}
              src="/playity-logo.png"
              alt="Playity logo"
              width={100}
              height={100}
              style={{ cursor: "pointer" }}
            />
          </Link>
          <Link href="/" className={styles.link}>          
            <div className={styles.titlesBox}>
              <h1 className={styles.logoTitle}>Playity</h1>
              <h2 className={styles.logoCatchPhrase}>You'll never play alone</h2>
            </div>
          </Link>
        </div>
        <div className={styles.globalInfoRight}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher un jeu"
              className={styles.searchInput}
            ></input>
          </div>
          <div className={styles.userInfoContainer}>
            {token === "" ? (
              <Link href="/login" className={styles.link}>
                <FontAwesomeIcon
                  icon={faUser}
                  className={styles.userImage}
                />
              </Link>
            ) : (
              <div>
              <Link href="/account" className={styles.link}>
                <Image
                  src={avatar}
                  alt="user avatar"
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                  className={styles.avatarImage}
                  width={50}
                  height={50}
                />
              </Link>
              <Link href="/login" className={styles.link}>
                <div className={styles.userName} onClick={() => handleLogout()}>
                  Déconnexion
                </div>
              </Link>
              </div>
            )}
            {/* {token ? (
              <Link href="/login" className={styles.link}>
                <div className={styles.userName}>Se connecter</div>
              </Link>
            ) : (
              <Link href="/login" className={styles.link}>
                <div className={styles.userName} onClick={() => handleLogout()}>
                  Déconnexion
                </div>
              </Link>
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
