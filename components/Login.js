import styles from "../styles/Login.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { login } from "../reducers/users";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login({changeVisibleModal}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSignupDisplay, setIsSignupDisplay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [existingUser, setExistingUser] = useState(false);
  const [correctCredentials, setCorrectCredentials] = useState(true);
  const [missingFields, setMissingFields] = useState(false);
  const [isCheckedCGU, setIsCheckedCGU] = useState(false);
  const [displayWarningCGU, setDisplayWarningCGU] = useState(false);
  let msg = "";

  //password conditions
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/;

  useEffect(()=>{
    setIsSignupDisplay(false)
  },[changeVisibleModal])

  // User connection
  async function handleSignin(email, password, connectionWithSocials = false) {
    if ((!connectionWithSocials && password === "") || email === "") {
      setMissingFields(true);
      return;
    } else {
      setMissingFields(false);
    }

    //abort signin if password is not satisfying regex
    if (!connectionWithSocials && !passwordRegex.test(password)) {
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, connectionWithSocials }),
      }
    );
    const data = await response.json();
    try {
      if (response.status === 200) {
        dispatch(
          login({
            _id: data._id,
            firstName: data.firstName,
            username: data.username,
            token: data.token,
            avatar: data.avatar,
            connectionWithSocials: data.connectionWithSocials,
            email: data.email,
            roles: data.roles,
          })
        );
        setUsername("");
        setPassword("");
        setEmail("");
        setCorrectCredentials(true);
        changeVisibleModal()

        router.push("/");
      } else if (response.status === 401) {
        setCorrectCredentials(false);
      }
    } catch (error) {
      msg = data.error;
    }
  }

  // Create account
  async function handleSignup(
    firstName,
    lastName,
    username,
    password,
    email,
    connectionWithSocials = false
  ) {
    // Missing fields verification
    if (
      firstName === "" ||
      lastName === "" ||
      username === "" ||
      (!connectionWithSocials && password === "") ||
      email === ""
    ) {
      setMissingFields(true);
      return;
    } else {
      setMissingFields(false);
    }

    // Abort signup process if password is not satisfying regex
    if (!connectionWithSocials && !passwordRegex.test(password)) {
      return;
    }

    // CGU checkbox verification
    if (!connectionWithSocials && !isCheckedCGU) {
      setDisplayWarningCGU(true);
      return;
    } else {
      setDisplayWarningCGU(false);
    }
    // Calling register route
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username,
          password,
          connectionWithSocials,
        }),
      }
    );
    const data = await response.json();

    try {
      if (response.status === 200) {
        setExistingUser(false);
        dispatch(
          login({
            _id: data._id,
            firstName,
            username,
            token: data.token,
            avatar: data.avatar,
            connectionWithSocials: data.connectionWithSocials,
            email: data.email,
            roles: data.roles,
          })
        );
        setUsername("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setEmail("");
        router.push("/");
        changeVisibleModal()
      } else if (response.status === 409) {
        setExistingUser(true);
      }
    } catch (error) {
      msg = data.error;
    }
  }

  // Forgot password functionality -> Nice to have
  async function handleForgotPasswordClick() {
    alert("this functionality is not available yet");
  }

  // Signin and signup box design
  let boxSize = {
    height: isSignupDisplay ? 600 : 410,
    transition: "height 0.15s ease-out",
  };

  // Switch from signin and signup
  const handleSwitchSignupClick = () => {
    setIsSignupDisplay(!isSignupDisplay);
  };

  // Switch to visible password and back
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.connectSectionContainer}>
      <div className={styles.registerContainer} style={boxSize}>
        {isSignupDisplay && (
          <div className={styles.registerSection}>
            <h2 className={styles.loginModalTitle}>
              Crée un compte et rejoins Playity
            </h2>
            {existingUser && (
              <p style={{ color: "lightcoral" }}>
                Il y en a déjà un qui a ton mail ou ton pseudo !
              </p>
            )}
            {missingFields && (
              <p style={{ color: "lightcoral" }}>Remplis tous les champs stp</p>
            )}
            <div className={styles.traditionalSigninContainer}>
              <div className={styles.inputFieldsArea}>
                <input
                  className={styles.loginField}
                  type="text"
                  placeholder="Prénom"
                  id="signUpfirstName"
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                />
                <input
                  className={styles.loginField}
                  type="text"
                  placeholder="Nom"
                  id="signUpLastName"
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                />
                <input
                  className={styles.loginField}
                  type="text"
                  placeholder="Email"
                  id="signUpEmail"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <input
                  className={styles.loginField}
                  type="text"
                  placeholder="Pseudo"
                  id="signUpUsername"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
              <div className={styles.passwordArea}>
                <div className={styles.passwordAreaInput}>
                  <input
                    className={styles.loginFieldPassword}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    id="signUpPassword"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIncorrectPassword(passwordRegex.test(e.target.value));
                    }}
                    value={password}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSignup(
                          firstName,
                          lastName,
                          username,
                          password,
                          email,
                          (connectionWithSocials = false)
                        );
                      }
                    }}
                  />
                  <div
                    onClick={() => handleShowPassword()}
                    className={styles.toggleShowPassword}
                  >
                    {!showPassword ? (
                      <FontAwesomeIcon
                        icon={faEye}
                        color="#F5C242"
                        size="lg"
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faEyeSlash}
                        color="#F5C242"
                        size="lg"
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </div>
                </div>
                <div
                  className={styles.passwordWarning}
                  style={
                    password.length < 8
                      ? { color: "#CFA75F" }
                      : passwordRegex.test(password)
                      ? { color: "#A7D8A2" }
                      : { color: "lightcoral" }
                  }
                >
                  Le mot de passe doit contenir 1 minuscule, 1 majuscule, 1
                  chiffre, 1 caractère parmi #@$!%*?& et être d'au moins 8
                  caractères
                </div>
              </div>
              <div className={styles.agreeConditionsCheckboxContainer}>
                <div className={styles.agreeConditionsCheckbox}>
                  <input
                    type="checkbox"
                    checked={isCheckedCGU}
                    onChange={() => setIsCheckedCGU(!isCheckedCGU)}
                  />{" "}
                  <div className={styles.agreeConditionsText}>
                    Accepter les CGU et la politique de confidentialité
                  </div>
                </div>
                {displayWarningCGU && (
                  <div className={styles.warningCGU}>
                    Pour t'inscrire, il faut accepter les conditions
                    d'utilisation du service !
                  </div>
                )}
              </div>
              <button
                className={styles.modalSigninButton}
                id="register"
                onClick={() =>
                  handleSignup(
                    firstName,
                    lastName,
                    username,
                    password,
                    email,
                    false
                  )
                }
              >
                Crée ton compte
              </button>
              <div
                className={styles.switchSignup}
                onClick={() => handleSwitchSignupClick()}
              >
                Déjà un compte ? Connecte-toi ici !
              </div>
            </div>
            <div className={styles.connectsSeparator}>
              <div className={styles.connectsSeparatorLine}></div>
              <p className={styles.connectsSeparatorText}>OU</p>
              <div className={styles.connectsSeparatorLine}></div>
            </div>
            <div className={styles.connectsContainer}>
              <GoogleLogin
                className={styles.googleConnect}
                text="continue_with"
                onSuccess={(credentialResponse) => {
                  let googleUserInfo = jwtDecode(credentialResponse.credential);
                  handleSignup(
                    googleUserInfo.given_name,
                    googleUserInfo.family_name,
                    googleUserInfo.name,
                    "",
                    googleUserInfo.email,
                    true
                  );
                }}
              />
            </div>

            <div className={styles.errorMsg}> {msg} </div>
          </div>
        )}
        {!isSignupDisplay && (
          <div className={styles.registerSection}>
            <h2 className={styles.loginModalTitle}>Connexion</h2>
            {missingFields && (
              <p style={{ color: "lightcoral" }}>Remplis tous les champs stp</p>
            )}
            {!correctCredentials && (
              <p style={{ color: "lightcoral" }}>
                Ton email et/ou ton mot de passe semblent incorrects
              </p>
            )}
            <div className={styles.traditionalSigninContainer}>
              <div className={styles.inputFieldsArea}>
                <input
                  className={styles.loginField}
                  type="text"
                  placeholder="Email"
                  id="signInEmail"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className={styles.passwordArea}>
                <div className={styles.passwordAreaInput}>
                  <input
                    className={styles.loginFieldPassword}
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    id="signInPassword"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    value={password}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSignin(
                          email,
                          password,
                          (connectionWithSocials = false)
                        );
                      }
                    }}
                  />
                  <div
                    onClick={() => handleShowPassword()}
                    className={styles.toggleShowPassword}
                  >
                    {!showPassword ? (
                      <FontAwesomeIcon
                        icon={faEye}
                        color="#F5C242"
                        size="lg"
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faEyeSlash}
                        color="#F5C242"
                        size="lg"
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </div>
                </div>
                <div
                  className={styles.forgotPassword}
                  onClick={() => handleForgotPasswordClick()}
                >
                  Mot de passe oublié ?
                </div>
              </div>
              <button
                className={styles.modalSigninButton}
                id="connection"
                onClick={() => {
                  handleSignin(email, password, false);
                }}
              >
                Connexion
              </button>
              <div
                className={styles.switchSignup}
                onClick={() => handleSwitchSignupClick()}
              >
                Toujours pas de compte ? Sois collaboratif et crées-en un !
              </div>
            </div>
            <div className={styles.connectsSeparator}>
              <div className={styles.connectsSeparatorLine}></div>
              <p className={styles.connectsSeparatorText}>OU</p>
              <div className={styles.connectsSeparatorLine}></div>
            </div>
            <div className={styles.connectsContainer}>
              <GoogleLogin
                className={styles.googleConnect}
                text="continue_with"
                onSuccess={(credentialResponse) => {
                  let googleUserInfo = jwtDecode(credentialResponse.credential);
                  handleSignin(googleUserInfo.email, "", true);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
