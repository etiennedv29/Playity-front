import styles from "../styles/AccountComponent.module.css";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faCrown } from "@fortawesome/free-solid-svg-icons";

function AccountComponent(props) {
  let userData = useSelector((state) => state.users.value);

  return (
    <div className={styles.accountContainer}>
      <div className={styles.accountLeft}>
        <div className={styles.accountNavigation}>
          <h2 className={styles.sectionTitleNav}>Profil</h2>
          <h2 className={styles.sectionTitleNav}>Informations</h2>
          <h2 className={styles.sectionTitleNav}>Statistiques</h2>
          <h2 className={styles.sectionTitleNav}>Préférences</h2>
        </div>
      </div>
      <div className={styles.accountRight}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Profil</h2>
          <div className={styles.profileSection}>
            <div className={styles.profileLeft}>
              <div className={styles.profileAvatarUsername}>
                <Image
                  className={styles.profileAvatarPicture}
                  src={userData.avatar}
                  alt="User Avatar"
                  width={150}
                  height={150}
                />
                <div className={styles.profileUsername}>
                  {userData.username}
                </div>
              </div>
              <div className={styles.profileChangeAvatarContainer}>
                <button
                  className={styles.modifyAvatarPictureButton}
                  onClick={() => {}}
                >
                  Changer d'avatar
                </button>
                <div className={styles.warningAvatarChangePremiumOnly}>
                  <FontAwesomeIcon
                    icon={faCrown}
                    className={styles.avatarChangePremiumIcon}
                  />
                  <div className={styles.warningAvatarChangePremiumOnlyText}>
                    Premium
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.profileRight}></div>
          </div>
        </div>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Informations</h2>
          <div className={styles.detailedInfoData}>
            <div className={styles.detailedInfoDataLeft}>
              <div className={styles.detailedInfoFieldName}>Pseudo</div>
              <div className={styles.detailedInfoFieldName}>Mot de Passe</div>
              <div className={styles.detailedInfoFieldName}>
                Date de naissance
              </div>
              <div className={styles.detailedInfoFieldName}>Email</div>
              <div className={styles.detailedInfoFieldName}>Roles</div>
            </div>
            <div className={styles.detailedInfoDataRight}>
              <div className={styles.detailedInfoUserDataContainer}>
                <input
                  value={userData.username}
                  className={styles.detailedInfoUserDataField}
                  onChange={() => {}}
                />
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  color="#F5C242"
                  className={styles.modifyAccountInfoIcon}
                />
              </div>
              <div className={styles.detailedInfoUserDataContainer}>
                <input
                  onChange={() => {}}
                  defaultValue="***********"
                  className={styles.detailedInfoUserDataField}
                  type="password"
                  disabled={userData.connectionWithSocials}
                  style={
                    userData.connectionWithSocials
                      ? { backgroundColor: "gray" }
                      : { backgroundColor: "white" }
                  }
                />
                <button
                  className={styles.modifyPasswordButton}
                  id="modifyPassword"
                  onClick={() => {}}
                  disabled={userData.connectionWithSocials}
                >
                  Changer ton mot de passe
                </button>
              </div>

              <div className={styles.detailedInfoUserDataContainer}>
                <input
                  value={userData.dateOfBirth}
                  type="date"
                  className={styles.detailedInfoUserDataField}
                  onChange={() => {}}
                />
              </div>
              <div className={styles.detailedInfoUserDataContainer}>
                <input
                  value={userData.email}
                  className={styles.detailedInfoUserDataField}
                  onChange={() => {}}
                />
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  color="#F5C242"
                  className={styles.modifyAccountInfoIcon}
                />
              </div>
              <div className={styles.detailedInfoUserDataContainer}>
                <div className={styles.detailedInfoUserDataField}>
                  {userData.roles.join(", ")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Statistiques</h2>
        </div>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Préférences</h2>
        </div>
      </div>
    </div>
  );
}

export default AccountComponent;
