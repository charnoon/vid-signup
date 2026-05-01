import type { Metadata } from "next";
import Link from "next/link";

import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service · Vid.",
  description:
    "Terms of Service for Vid., a platform for curated music visuals and editorial content.",
};

export default function TermsPage() {
  return (
    <main className={styles.legal}>
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Legal navigation">
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </nav>

        <article className={styles.article}>
          <h1>Terms of Service</h1>

          <h2>1. Introduction</h2>
          <p>
            Vid. is a platform for curated music visuals, editorial content and
            creative discovery.
          </p>
          <p>
            By accessing or using Vid., you agree to these Terms. If you do not
            agree, you should not use the platform.
          </p>
          <p>
            Vid. is operated from France. For any questions, contact:{" "}
            <a href="mailto:info@vid.global">info@vid.global</a>
          </p>

          <hr className={styles.sectionDivider} />

          <h2>2. Use of the Platform</h2>
          <p>You agree to use Vid. in a lawful and respectful manner.</p>
          <p>You must not:</p>
          <ul>
            <li>use the platform for illegal purposes</li>
            <li>attempt to access systems without authorisation</li>
            <li>scrape, copy or exploit the platform or its content at scale</li>
            <li>interfere with the operation or security of the platform</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>3. Accounts</h2>
          <p>You may create an account using your email address.</p>
          <p>You are responsible for:</p>
          <ul>
            <li>maintaining the confidentiality of your account</li>
            <li>all activity under your account</li>
          </ul>
          <p>Vid. may suspend or terminate accounts that violate these Terms.</p>

          <hr className={styles.sectionDivider} />

          <h2>4. Content &amp; Intellectual Property</h2>
          <p>
            Vid. curates and may host or embed content, including music videos and
            related materials.
          </p>
          <p>
            All rights remain with the original creators, artists, labels and rights
            holders.
          </p>
          <p>Use of the platform does not grant you any ownership rights.</p>
          <p>You may not:</p>
          <ul>
            <li>reproduce, distribute or exploit content without permission</li>
            <li>use content for commercial purposes without authorisation</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>5. User Submissions</h2>
          <p>If you submit content, links or information to Vid.:</p>
          <ul>
            <li>you confirm you have the right to share it</li>
            <li>
              you grant Vid. a non-exclusive, worldwide licence to display and
              feature it within the platform
            </li>
          </ul>
          <p>Vid. may choose whether or not to publish submitted content.</p>

          <hr className={styles.sectionDivider} />

          <h2>6. Availability</h2>
          <p>Vid. is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;.</p>
          <p>We do not guarantee:</p>
          <ul>
            <li>uninterrupted access</li>
            <li>error-free operation</li>
            <li>permanent availability of content</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>7. Third-Party Content</h2>
          <p>Vid. may display or link to third-party content.</p>
          <p>We are not responsible for:</p>
          <ul>
            <li>the accuracy or legality of third-party content</li>
            <li>external websites or services</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>8. Limitation of Liability</h2>
          <p>To the extent permitted by law, Vid. is not liable for:</p>
          <ul>
            <li>indirect or consequential damages</li>
            <li>loss of data, revenue or opportunity</li>
            <li>issues arising from third-party content</li>
          </ul>

          <hr className={styles.sectionDivider} />

          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate access to Vid. at any time if these Terms
            are violated.
          </p>

          <hr className={styles.sectionDivider} />

          <h2>10. Changes to Terms</h2>
          <p>We may update these Terms from time to time.</p>
          <p>Continued use of Vid. means you accept the updated Terms.</p>

          <hr className={styles.sectionDivider} />

          <h2>11. Governing Law</h2>
          <p>These Terms are governed by the laws of France.</p>

          <hr className={styles.sectionDivider} />

          <h2>12. Contact</h2>
          <p>For any questions:</p>
          <p>
            <a href="mailto:info@vid.global">info@vid.global</a>
          </p>
        </article>

        <footer className={styles.footer}>
          <p>Last updated: May 2026</p>
          <p>Vid. Copyright 2026</p>
        </footer>
      </div>
    </main>
  );
}
