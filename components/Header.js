import { faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { googleLogout } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../reducers/users";
import styles from "../styles/Header.module.css";

function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.value);
  const username = user.username;
  const avatar = user.avatar;
  const token = user.token;
  const isGuest = !user.roles.includes("member");

  const handleLogout = () => {
    router.push("/");
    if (user.connectionWithSocials === false) {
      dispatch(logout());
    } else if (user.connectionWithSocials === true) {
      googleLogout();
      dispatch(logout());
    }
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
              width={80}
              height={80}
              style={{ cursor: "pointer" }}
            />
          </Link>
          <Link href="/" className={styles.link}>
            <div className={styles.titlesBox}>
              <h1 className={styles.logoTitle}>Playity</h1>
              <h2 className={styles.logoCatchPhrase}>
                You'll never play alone
              </h2>
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
          <div >
            {isGuest || !token ? (
              <Link href="/login" className={styles.link}>
                <FontAwesomeIcon icon={faUser} className={styles.userImage} />
              </Link>
            ) : (
              <div className={styles.userInfoContainer}>
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
                {/* <Link href="/account" className={styles.link}>
                  <div className={styles.userName}>{user.username}</div>
                </Link> */}
                <Link href="/login" className={styles.link}>
                  <div
                    className={styles.userName}
                    onClick={() => handleLogout()}
                  >
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
              <Link href="/" className={styles.link}>
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
