import styles from "../../styles/Home.module.css";

function legalMentionsPage() {
  return (
    <div className={styles.legalContainer}>
    <h1 className = {styles.legalTitle}>Mentions légales</h1>
<p className = {styles.legalText}><strong>Éditeur du site :</strong> UselessTrueStuff</p>
<p className = {styles.legalText}><strong>Responsable de la publication :</strong> Etienne de Valmont - contact@uts.fr</p>
<p className = {styles.legalText}> <strong>Hébergement :</strong> Vercel Inc. – vercel.com</p>
<p className = {styles.legalText}><strong>Nom de domaine :</strong> www.uselesstuestuff.info</p>
{/* <p className = {styles.legalText}><strong>Numéro de SIRET :</strong> 123 456 789 00010</p>
<p className = {styles.legalText}>Ce site est déclaré auprès de la CNIL sous le numéro XXXXXXX si applicable.</p> */}
</div>
  )
}

export default legalMentionsPage;
