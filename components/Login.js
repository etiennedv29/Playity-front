import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { login } from "../reducers/users";
import { rememberOrigin } from "../reducers/navigations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSignupDisplay, setIsSignupDisplay] = useState(false);
  const [showPassword, setshowPassword] = useState(false);
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

  // User connection
  // WARNING - adapter à playity
  async function handleSignin() {
    console.log("want to signin");
    if (password === "" || email === "") {
      setMissingFields(true);
      return;
    }

    // WARNING - adapter à playity
    const response = await fetch(
      //"http://localhost:3000/users/signin",
      "https://useless-true-stuff-backend.vercel.app/users/signin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await response.json();
    try {
      if (response.status === 200) {
        dispatch(
          login({
            _id: data._id,
            firstName: data.firstName,
            username,
            token: data.token,
          })
        );
        setUsername("");
        setPassword("");
        setEmail("");
        setMissingFields(false);
        router.push(`${previousPage}`);
        dispatch(rememberOrigin(""));
      } else if (response.status === 401) {
        setCorrectCredentials(false);
      }
    } catch (error) {
      msg = data.error;
    }
  }

  // WARNING - adapter à playity
  //Create account
  async function handleSignup() {
    console.log("signup try");
    //missing fields verification
    if (
      firstName === "" ||
      lastName === "" ||
      username === "" ||
      password === "" ||
      email === ""
    ) {
      console.log("missing fields");
      setMissingFields(true);
      return;
    }

    //CGU checkbox verification
    if (!isCheckedCGU) {
      setDisplayWarningCGU(true);
      return;
    }
    const response = await fetch(
      //"http://localhost:3000/users/signup",
      "https://useless-true-stuff-backend.vercel.app/users/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    try {
      if (response.status === 200) {
        setExistingUser(false);
        dispatch(
          login({ _id: data._id, firstName, username, token: data.token })
        );
        setUsername("");
        setPassword("");
        setfirstName("");
        setLastName("");
        setEmail("");
        setMissingFields(false);
        router.push(`${previousPage}`);
      } else if (response.status === 409) {
        setExistingUser(true);
      }
    } catch (error) {
      msg = data.error;
    }
  }

  // WARNING - adapter à playity
  //forgot password functionality
  async function handleForgotPasswordClick() {}

  //signin and signup box design
  let boxSize = {
    height: isSignupDisplay ? 550 : 300,
    transition: "height 0.15s ease-out",
  };

  //switch from signin and signup
  const handleSwitchSignupClick = () => {
    setIsSignupDisplay(!isSignupDisplay);
  };

  //switch to visible password and back
  const handleShowPassword = () => {
    setshowPassword(!showPassword);
  };

  // WARNING - adapter à playity ()
  return (
    <div className={styles.connectSectionContainer}>
      <div className={styles.registerContainer} style={boxSize}>
        {isSignupDisplay && (
          <div className={styles.registerSection}>
            <h2 className={styles.loginModalTitle}>
              Crée un compte et rejoins Playity
            </h2>
            {existingUser && (
              <p style={{ color: "red" }}>
                {" "}
                Il y en a déjà un qui a ton mail ou ton pseudo !
              </p>
            )}
            {missingFields && (
              <p style={{ color: "red" }}>Remplis tous les champs stp</p>
            )}
            <input
              className={styles.loginField}
              type="text"
              placeholder="Prénom"
              id="signUpfirstName"
              onChange={(e) => setfirstName(e.target.value)}
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
                    console.log(incorrectPassword);
                  }}
                  value={password}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSignup();
                    }
                  }}
                />
                <div
                  onClick={() => handleShowPassword()}
                  className={styles.toggleShowPassword}
                >
                  {!showPassword ? (
                    <FontAwesomeIcon icon={faEye} color="#1ad4ff" size={15} />
                  ) : (
                    <FontAwesomeIcon
                      icon={faEyeSlash}
                      color="#1ad4ff"
                      size={15}
                    />
                  )}
                </div>
              </div>
              <div
                className={styles.passwordWarning}
                style={
                  password.length < 8
                    ? { color: "#1ad4ff" }
                    : passwordRegex.test(password)
                    ? { color: "lightgreen" }
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
                  Checked={isCheckedCGU}
                  onChange={() => setIsCheckedCGU(!isCheckedCGU)}
                />{" "}
                <div className={styles.agreeConditionsText}>
                  Accepter les CGU et la politique de confidentialité
                </div>
              </div>
              {displayWarningCGU && (
                <div className={styles.warningCGU}>
                  Pour t'inscrire, il faut accepter les conditions d'utilisation
                  du service !
                </div>
              )}
            </div>
            <button
              className={styles.modalSigninButton}
              id="register"
              onClick={() => handleSignup()}
            >
              {" "}
              Crée ton compte{" "}
            </button>
            <div
              className={styles.switchSignup}
              onClick={() => handleSwitchSignupClick()}
            >
              Déjà un compte ? Connecte-toi ici !
            </div>
            <div className={styles.errorMsg}> {msg} </div>
          </div>
        )}
        {!isSignupDisplay && (
          <div className={styles.registerSection}>
            <h2 className={styles.loginModalTitle}>Connexion</h2>
            {missingFields && (
              <p style={{ color: "red" }}>Remplis tous les champs stp</p>
            )}
            {!correctCredentials && (
              <p style={{ color: "red" }}>
                Ton email et/ou ton mot de passe semblent incorrects
              </p>
            )}

            <input
              className={styles.loginField}
              type="text"
              placeholder="Email"
              id="signInEmail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
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
                      handleSignin();
                    }
                  }}
                />
                <div
                  onClick={() => handleShowPassword()}
                  className={styles.toggleShowPassword}
                >
                  {!showPassword ? (
                    <FontAwesomeIcon icon={faEye} color="#1ad4ff" size={15} />
                  ) : (
                    <FontAwesomeIcon
                      icon={faEyeSlash}
                      color="#1ad4ff"
                      size={15}
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
              onClick={() => handleSignin()}
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
        )}
      </div>
    </div>
  );
}

export default Login;
