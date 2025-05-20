import styles from "../styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
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
    dispatch(logout());
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.globalInfo}>
        <div className={styles.logoContainer}>
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
          <div className={styles.logoCatchPhrase}>
            <h1 className={styles.logoCatchPhrase}>
              Fun collaborative games with your friends
            </h1>
          </div>
        </div>

        <div className={styles.userInfoContainer}>
          {token === "" ? (
            <Link href="/login" className={styles.link}>
              <FontAwesomeIcon
                icon={faUser}
                className={styles.userImage}
                style={{ color: "#1ad4ff", cursor: "pointer" }}
              />
            </Link>
          ) : (
            <Link href="/account" className={styles.link}>
              <Image
                src={avatar}
                alt="user avatar"
                style={{ cursor: "pointer", borderRadius: "50%" }}
                width={50}
                height={50}
              />
            </Link>
          )}
          {token === "" ? (
            <Link href="/login" className={styles.link}>
              <div className={styles.userName}>Se connecter</div>
            </Link>
          ) : (
            <Link href="/login" className={styles.link}>
              <div className={styles.userName} onClick={() => handleLogout()}>
                Déconnexion
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
