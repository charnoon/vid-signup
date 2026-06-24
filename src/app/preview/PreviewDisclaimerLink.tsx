"use client";

import { useEffect, useState } from "react";

import styles from "./intro.module.css";

const DISCLAIMER =
  "Videos and imagery featured in this presentation are included solely for demonstration and discussion purposes. No rights have been granted, and inclusion does not imply licensing, endorsement or participation in the platform.";

function isMobileUi() {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(max-width: 768px)").matches;
}

type PreviewDisclaimerLinkProps = {
  dockClassName?: string;
};

export function PreviewDisclaimerLink({ dockClassName }: PreviewDisclaimerLinkProps = {}) {
  const [open, setOpen] = useState(false);
  const [mobileUi, setMobileUi] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const sync = () => setMobileUi(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || !mobileUi) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, mobileUi]);

  const handleToggle = () => {
    if (!mobileUi) return;

    setOpen((current) => !current);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {open && mobileUi ? (
        <>
          <button
            type="button"
            className={styles.disclaimerBackdrop}
            aria-label="Close usage notice"
            onClick={handleClose}
          />
          <div className={styles.disclaimerMobileSheet} role="dialog" aria-label="Usage notice">
            <p className={styles.disclaimerMobileCopy}>{DISCLAIMER}</p>
          </div>
        </>
      ) : null}
      <div className={`${styles.disclaimerDock} ${dockClassName ?? ""}`.trim()}>
        <button
          type="button"
          className={`${styles.disclaimerLink} ${open && mobileUi ? styles.disclaimerLinkOpen : ""}`}
          aria-label="Usage notice"
          aria-expanded={open}
          onClick={handleToggle}
        >
          Disclaimer
        </button>
        {!mobileUi ? (
          <p className={styles.disclaimerPanel} role="note">
            {DISCLAIMER}
          </p>
        ) : null}
      </div>
    </>
  );
}
