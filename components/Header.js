import { faSearch, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { googleLogout } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { logout } from "../reducers/users";
import { saveSearchValue } from "../reducers/searches";
import styles from "../styles/Header.module.css";
import Modal from "antd/lib/modal";
import Login from "./Login"

function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.value);
  const username = user.username;
  const avatar = user.avatar;
  const token = user.token;
  const isGuest = !user.roles.includes("member");
  const [searchValue, setSearchValue] = useState("");
  const [visibleModal,setVisibleModal] = useState(false)

  const handleLogout = () => {
    router.push("/");
    if (user.connectionWithSocials === false) {
      dispatch(logout());
    } else if (user.connectionWithSocials === true) {
      googleLogout();
      dispatch(logout());
    }
  };

  // Passer en reducer chaque changement de valeur de la recherche pour l'envoyer dans le composant Home
  useEffect(() => {
    dispatch(saveSearchValue(searchValue));
  }, [searchValue]);

  function changeModalState() {
    setVisibleModal(!visibleModal);
   }

  return (
    <header className={styles.header}>
      <Modal
        getContainer="#react-modals"
        open={visibleModal}
        closable={true}
        footer={null}
        onCancel={() => setVisibleModal(null)}
        width={500}
        className="modal"
      >
        {visibleModal && <Login  changeVisibleModal={changeModalState} />}
      </Modal>
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
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              value={searchValue}
            ></input>
          </div>
          <div>
            {isGuest || !token ? (
              <FontAwesomeIcon
                icon={faUser}
                className={styles.userImage}
                onClick={() => setVisibleModal(true)}
              />
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
                <div
                  className={styles.btnLogout}
                  onClick={() => handleLogout()}
                >
                  Déconnexion
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
