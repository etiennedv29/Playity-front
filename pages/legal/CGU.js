import styles from "../../styles/Home.module.css";

function CGUPage() {
  return (
    <div className ={styles.legalContainer}>
      <h1 className ={styles.legalTitle}>Conditions Générales d’Utilisation</h1>
<p className = {styles.legalText}> UselessTrueStuff permet aux utilisateurs de publier des faits dont la particularité est d'être vrais et amusants, de les commenter et de les liker.</p>
<p className = {styles.legalText}>Les contenus sont vérifiés pour les faits et modérés pour les commentaires. Les utilisateurs s'engagent à ne pas publier de contenu haineux, diffamatoire ou illégal.</p>
<p className = {styles.legalText}>La création de compte est obligatoire pour publier ou commenter.</p>
<p className = {styles.legalText}>Le site se réserve le droit de suspendre ou supprimer tout compte contrevenant aux règles.</p>

    </div>
  )
}

export default CGUPage;
