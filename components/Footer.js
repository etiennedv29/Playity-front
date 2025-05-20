import styles from "../styles/Home.module.css";
import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <p>&copy; <strong>2025 Playity</strong> Tous droits réservés.</p>
      <div className={styles.footerLinkscontainer}>
        <Link href="/legal/legal-mentions"  className={styles.link}>
          <div className={styles.footerNav}>Mentions légales</div>
        </Link>
        <Link href="/legal/confidentiality" className={styles.link}>
          <div className={styles.footerNav}>Confidentialité</div>
        </Link>
        <Link href="/legal/cookies" className={styles.link}>
          <div className={styles.footerNav}>Cookies </div>
        </Link>
        <Link href="/legal/CGU" className={styles.link}>
          <div className={styles.footerNav}>CGU</div>
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
