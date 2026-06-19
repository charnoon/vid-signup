import styles from "./intro.module.css";

const DISCLAIMER =
  "Videos and imagery featured in this presentation are included solely for demonstration and discussion purposes. No rights have been granted, and inclusion does not imply licensing, endorsement or participation in the platform.";

export function PreviewDisclaimerLink() {
  return (
    <div className={styles.disclaimerDock}>
      <span className={styles.disclaimerLink}>Disclaimer</span>
      <p className={styles.disclaimerPanel}>{DISCLAIMER}</p>
    </div>
  );
}
