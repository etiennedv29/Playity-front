require('dotenv').config();
import Head from "next/head";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Login from "../components/Login";
import Modal from "antd/lib/modal";
import { useState } from 'react';
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

const reducers = combineReducers({ users });
const persistConfig = { key: "playity", storage };
const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
const persistor = persistStore(store);

function App({ Component, pageProps }) {

  const [visibleModal, setVisibleModal] = useState(false);

  function activateModal() {
    setVisibleModal(!visibleModal);
  }

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
              <Header changeModalState={activateModal}/>
              <Modal
                getContainer="#react-modals"
                open={visibleModal}
                closable={true}
                footer={null}
                onCancel={() => setVisibleModal(null)}
                width={500}
              >
                {visibleModal && <Login />}
              </Modal>
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
