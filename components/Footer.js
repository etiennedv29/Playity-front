import styles from "../styles/Footer.module.css";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTiktok} from "@fortawesome/free-brands-svg-icons";


function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.topLine}></div>
      <p className={styles.playityPhrase}>&copy; <strong>2025 Playity</strong> Tous droits réservés.</p>
      <div className={styles.footerLinkscontainer}>
      <div className={styles.singleLinkContainer}>
        <Link href="/legal/CGU" className={styles.link}>
          <div className={styles.footerNav}>CGU</div>
        </Link>
        <Link href="/legal/contact"  className={styles.link}>
          <div className={styles.footerNav}>Contact</div>
        </Link>
        <Link href="/legal/confidentiality" className={styles.link}>
          <div className={styles.footerNav}>Confidentialité</div>
        </Link>
        <Link href="/legal/a-propos" className={styles.link}>
          <div className={styles.footerNav}>A propos </div>
        </Link>
      </div>
      <div className={styles.singleLinkContainer}>
        <Link href="/legal/games-development" className={styles.link}>
          <div className={styles.footerNav}>Développement de jeux</div>
        </Link>
        <Link href="/legal/editor"  className={styles.link}>
          <div className={styles.footerNav}>Editeur</div>
        </Link>
        <Link href="/legal/bug-report" className={styles.link}>
          <div className={styles.footerNav}>Signaler un bug</div>
        </Link>
        <Link href="/legal/premium-purchase" className={styles.link}>
          <div className={styles.footerNav}>Passer premium</div>
        </Link>
      </div>
      <div className={styles.singleLinkContainer}>
        <Link href="/legal/games-development" className={styles.link}>
          <div className={styles.footerNav}>Partager</div>
        </Link>
        <Link href="/legal/editor"  className={styles.link}>
          <FontAwesomeIcon icon={faInstagram} color="#F5C242" className={styles.icon}/>
          <div className={styles.footerNav}>Instagram</div>
        </Link>
        <Link href="/legal/bug-report" className={styles.link}>
          <FontAwesomeIcon icon={faFacebookF} color="#F5C242" className={styles.icon}/>
          <div className={styles.footerNav}>Facebook</div>
        </Link>
        <Link href="/legal/premium-purchase" className={styles.link}>
          <FontAwesomeIcon icon={faTiktok} color="#F5C242" className={styles.icon}/>
          <div className={styles.footerNav}>TikTok</div>
        </Link>
      </div>
      </div>
    </footer>
  );
}

export default Footer;
