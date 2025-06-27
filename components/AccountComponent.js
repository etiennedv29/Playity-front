import styles from "../styles/AccountComponent.module.css";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faCrown } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { login } from "../reducers/users";

function AccountComponent(props) {
  let userData = useSelector((state) => state.users.value);
  let msg = "";
  const dispatch = useDispatch();
  const [values, setValues] = useState({
    name: userData.name,
    username: userData.username,
    birthday: "",
    email: userData.email,
  });
  const [isEditableState, setIsEditableState] = useState({
    name: false,
    email: false,
    birthday: false,
    username: false,
  });
  const [activeField, setActiveField] = useState(null);
  const refs = {
    name: useRef(null),
    email: useRef(null),
    birthday: useRef(null),
    username: useRef(null),
  };

  useEffect(() => {
    if (activeField && refs[activeField]?.current) {
      refs[activeField].current.focus();
    }
  }, [activeField]);

  const handleEdit = (field) => {
    setActiveField(field); 
  };

  const handleChange = (e, field) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const accountInfoHasChanged = () => {
    return (
      values.username !== userData.username || values.email !== userData.email
      //values.birthday !== userData.birthday
    );
  };

  async function handleAccountModificationsValidation(
    userId,
    username,
    email,
    name,
    birthday
  ) {
    //update du back
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/users/updateAccount`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          username,
          email,
          name,
          birthday,
        }),
      }
    );
    const updateUserResponse = await response.json();

    try {
      if (response.status === 200) {
        dispatch(
          login({
            _id: updateUserResponse._id,
            firstName: updateUserResponse.firstName,
            username: updateUserResponse.username,
            token: updateUserResponse.token,
            avatar: updateUserResponse.avatar,
            connectionWithSocials: updateUserResponse.connectionWithSocials,
            email: updateUserResponse.email,
            roles: updateUserResponse.roles,
          })
        );
      }
    } catch (exception) {
      msg = updateUserResponse.error;
    }
  }

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
                  priority
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
              <div className={styles.detailedInfoFieldName}>Rôles</div>
            </div>
            <div className={styles.detailedInfoDataRight}>
              <div className={styles.detailedInfoUserDataContainer}>
                <input
                  className={styles.detailedInfoUserDataField}
                  onChange={(e) => {
                    handleChange(e, "username");
                  }}
                  value={values.username}
                  readOnly={activeField !== "username"}
                  ref={refs.username}
                />
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  color="#F5C242"
                  className={styles.modifyAccountInfoIcon}
                  onClick={() => handleEdit("username")}
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
                  value={values.email}
                  className={styles.detailedInfoUserDataField}
                  onChange={(e) => handleChange(e, "email")}
                  readOnly={activeField !== "email"}
                  ref={refs.email}
                />
                <FontAwesomeIcon
                  icon={faPenToSquare}
                  color="#F5C242"
                  className={styles.modifyAccountInfoIcon}
                  onClick={() => handleEdit("email")}
                />
              </div>
              <div className={styles.detailedInfoUserDataContainer}>
                <div className={styles.detailedInfoUserDataField}>
                  {userData.roles.join(", ")}
                </div>
              </div>
            </div>
          </div>
          <button
            className={
              accountInfoHasChanged()
                ? styles.validationButtonEnabled
                : styles.validationButtonDisabled
            }
            disabled={!accountInfoHasChanged()}
            onClick={() =>
              handleAccountModificationsValidation(
                userData._id,
                values.username,
                values.email,
                values.name,
                values.birthday
              )
            }
          >
            Enregistrer
          </button>
          <div className={styles.errorMsg}> {msg} </div>
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
