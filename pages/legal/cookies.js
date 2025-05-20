import styles from "../../styles/Home.module.css";

function confidentialityPage() {
  return (
    <div className ={styles.legalContainer}>
        <h1 className ={styles.legalTitle}>Politique de cookies</h1>
<p className = {styles.legalText}> Nous utilisons des cookies pour :</p>
<ul className = {styles.legalText}>
  <li>Mesurer l’audience du site</li>
  <li>Afficher des publicités personnalisées via Google AdSense</li>
</ul>
<p className = {styles.legalText}> Vous pouvez accepter ou refuser les cookies via la bannière prévue à cet effet.</p>
<p className = {styles.legalText}> En poursuivant votre navigation sans paramétrer les cookies, vous consentez à leur utilisation.</p>

    </div>
  )
}

export default confidentialityPage;
