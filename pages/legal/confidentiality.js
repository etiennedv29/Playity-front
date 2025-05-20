import styles from "../../styles/Home.module.css";

function confidentialityPage() {
  return (
    <div className ={styles.legalContainer}>
        <h1 className ={styles.legalTitle}>Politique de confidentialité</h1>
<p className = {styles.legalText}>Nous collectons des données personnelles lors de la création d’un compte (email, pseudonyme, mot de passe hashé).</p>
<p className = {styles.legalText}>Les données ne sont pas revendues. Elles peuvent être utilisées pour vous contacter ou sécuriser l’accès à votre compte.</p>
<p className = {styles.legalText}>Vous pouvez exercer vos droits (accès, rectification, suppression) en nous écrivant à dpo@hackatweet.fr.</p>

    </div>
  )
}

export default confidentialityPage;
