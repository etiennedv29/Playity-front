require("dotenv").config();
import Head from "next/head";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/globals.css";
//imports google connect
import { GoogleOAuthProvider } from "@react-oauth/google";
//imports redux
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import storage from "redux-persist/lib/storage";
import AuthProvider from "../components/auth/Provider";
import users from "../reducers/users";
import searches from "../reducers/searches";

// autres imports
import { useEffect, useState } from "react";

const reducers = combineReducers({ users, searches });
const persistConfig = { key: "playity", storage };
const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
const persistor = persistStore(store);

function App({ Component, pageProps }) {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // 🔒 S'assurer que ce code s'exécute côté client uniquement

    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;

      // 🔍 UA plus large que react-device-detect
      const isMobileUA =
        /Mobi|Android|iPhone|iPad|iPod|Samsung|SM-|Pixel/i.test(navigator.userAgent) || window.innerWidth < 800;

      console.log("🧪 UA:", navigator.userAgent);
      console.log(
        "📐 innerWidth:",
        window.innerWidth,
        "| innerHeight:",
        window.innerHeight
      );
      console.log("🧭 isPortrait:", isPortrait, "| isMobileUA:", isMobileUA);

      setIsPortraitMobile(isPortrait && isMobileUA);
    };

    checkOrientation();

    // 🕒 Certaines mises à jour prennent un instant après le 1er render
    setTimeout(checkOrientation, 0);

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return (
    <>
      <GoogleOAuthProvider clientId="989907452331-35nuap8qhtt317b0j93dkt2d0u6u0svl.apps.googleusercontent.com">
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <AuthProvider>
              <Head>
                <meta
                  name="description"
                  content="Play fun and new collaborative games with your friends ! "
                ></meta>
                <meta
                  name="viewport"
                  content="initial-scale=1.0, width=device-width"
                ></meta>
                <link rel="icon" href="playity-logo.png"></link>
                <link
                  rel="preconnect"
                  href="https://fonts.googleapis.com"
                ></link>
                <link
                  rel="preconnect"
                  href="https://fonts.gstatic.com"
                  crossorigin
                ></link>
                <link
                  href="https://fonts.googleapis.com/css2?family=Caveat+Brush&display=swap"
                  rel="stylesheet"
                ></link>
              </Head>
              {/* ⛔️ Blocker fullscreen overlay */}
              {isPortraitMobile && (
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 9999,
                    width: "90vw",
                    height: "90vh",
                    backgroundColor: "#000000ee",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    textAlign: "center",
                    padding: "20px",
                    borderRadius: "12px",
                  }}
                >
                  Pour profiter de l'expérience, passe ton mobile en mode
                  paysage ! 📱↔️
                </div>
              )}

              {/* Normal layout */}
              <Header />
              <Component {...pageProps} />
              <Footer />
            </AuthProvider>
          </PersistGate>
        </Provider>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
