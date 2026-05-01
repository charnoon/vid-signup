import type { Metadata } from "next";
import Link from "next/link";

import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy · Vid.",
  description:
    "How Vid. collects, uses and protects your personal data — privacy notice.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.legal}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Legal navigation">
          <Link href="/">Home</Link>
          <Link href="/terms">Terms of Service</Link>
        </nav>

        <article className={styles.article}>
          <h1>Privacy Policy</h1>

          <h2>1. Introduction</h2>
          <p>
            Vid. respects your privacy and is committed to protecting your personal
            data.
          </p>
          <p>
            This Privacy Policy explains what data we collect, how we use it and your
            rights.
          </p>
          <p>Vid. operates from France.</p>
          <p>
            Contact:{" "}
            <a href="mailto:info@vid.global">info@vid.global</a>
          </p>

          <hr className={styles.sectionDivider} />

          <h2>2. Data We Collect</h2>
          <p>We may collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (if provided)</li>
            <li>
              Profile information (e.g. role such as Director, Artist, Viewer)
            </li>
            <li>Links you submit (e.g. Instagram, website)</li>
            <li>Basic usage data (e.g. interactions with the platform)</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>create and manage your account</li>
            <li>provide access to the platform</li>
            <li>improve the platform and user experience</li>
            <li>communicate with you</li>
          </ul>
          <p>If you opt in, we may send:</p>
          <ul>
            <li>new releases</li>
            <li>editor picks</li>
            <li>platform updates</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>4. Legal Basis (GDPR)</h2>
          <p>We process your data based on:</p>
          <ul>
            <li>
              Contractual necessity → to provide access to Vid.
            </li>
            <li>Consent → for email updates (if you opt in)</li>
            <li>Legitimate interest → to improve the platform</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>5. Marketing Communications</h2>
          <p>You will only receive emails if you have opted in.</p>
          <p>You can unsubscribe at any time via:</p>
          <ul>
            <li>the link in emails</li>
            <li>or by contacting us</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>6. Data Sharing</h2>
          <p>We do not sell your data.</p>
          <p>We may share data with service providers such as:</p>
          <ul>
            <li>hosting providers</li>
            <li>email delivery services</li>
            <li>analytics tools (if used)</li>
          </ul>
          <p>These providers process data on our behalf.</p>

          <hr className={styles.sectionDivider} />

          <h2>7. Data Retention</h2>
          <p>We retain your data only as long as necessary.</p>
          <p>You may request deletion of your data at any time.</p>

          <hr className={styles.sectionDivider} />

          <h2>8. Your Rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li>access your data</li>
            <li>correct inaccurate data</li>
            <li>request deletion</li>
            <li>restrict processing</li>
            <li>object to processing</li>
            <li>request data portability</li>
          </ul>
          <p>To exercise your rights:</p>
          <p>
            <a href="mailto:info@vid.global">info@vid.global</a>
          </p>

          <hr className={styles.sectionDivider} />

          <h2>9. Cookies &amp; Tracking</h2>
          <p>Vid. may use cookies or similar technologies.</p>
          <p>
            If tracking or analytics are introduced, a cookie notice will be provided.
          </p>

          <hr className={styles.sectionDivider} />

          <h2>10. Data Security</h2>
          <p>
            We take reasonable technical and organisational measures to protect your
            data.
          </p>

          <hr className={styles.sectionDivider} />

          <h2>11. Changes to this Policy</h2>
          <p>We may update this Privacy Policy.</p>
          <p>Continued use of Vid. means you accept the updated policy.</p>

          <hr className={styles.sectionDivider} />

          <h2>12. Contact</h2>
          <p>
            <a href="mailto:info@vid.global">info@vid.global</a>
          </p>
        </article>

        <footer className={styles.footer}>
          <p>Vid. Copyright 2026</p>
        </footer>
      </div>
    </main>
  );
}
