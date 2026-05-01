"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "./BouncingLogo.module.css";

const SPEED_PX_S = 148;

function normalize(vx: number, vy: number, speed: number) {
  const m = Math.hypot(vx, vy);
  if (m < 1e-6) {
    return { vx: speed, vy: 0 };
  }
  return { vx: (vx / m) * speed, vy: (vy / m) * speed };
}

/** Reflect on bounce + small random rotation (DVD-style drift). */
function jitterReflect(
  vx: number,
  vy: number,
  flipX: boolean,
  flipY: boolean,
) {
  let nx = flipX ? -vx : vx;
  let ny = flipY ? -vy : vy;
  const twist = (Math.random() - 0.5) * 0.62;
  const cos = Math.cos(twist);
  const sin = Math.sin(twist);
  const rx = nx * cos - ny * sin;
  const ry = nx * sin + ny * cos;
  return normalize(rx, ry, SPEED_PX_S);
}

export function BouncingLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ vx: SPEED_PX_S, vy: SPEED_PX_S * 0.65 });
  const lastRef = useRef(0);
  const rafRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }

    const angle = Math.random() * Math.PI * 2;
    velRef.current = normalize(
      Math.cos(angle) * SPEED_PX_S,
      Math.sin(angle) * SPEED_PX_S,
      SPEED_PX_S,
    );

    const seedPosition = () => {
      const rect = wrap.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const maxX = Math.max(0, window.innerWidth - w);
      const maxY = Math.max(0, window.innerHeight - h);
      posRef.current = {
        x: Math.random() * maxX,
        y: Math.random() * maxY,
      };
      wrap.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
    };

    seedPosition();

    const clampToViewport = () => {
      const rect = wrap.getBoundingClientRect();
      const maxX = Math.max(0, window.innerWidth - rect.width);
      const maxY = Math.max(0, window.innerHeight - rect.height);
      posRef.current.x = Math.min(Math.max(0, posRef.current.x), maxX);
      posRef.current.y = Math.min(Math.max(0, posRef.current.y), maxY);
      wrap.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
    };

    const onResize = () => clampToViewport();
    window.addEventListener("resize", onResize);

    lastRef.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.072);
      lastRef.current = now;

      const el = wrapRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const rect = el.getBoundingClientRect();
      const logoW = rect.width;
      const logoH = rect.height;
      if (logoW < 2 || logoH < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const maxX = Math.max(0, window.innerWidth - logoW);
      const maxY = Math.max(0, window.innerHeight - logoH);

      let { x, y } = posRef.current;
      let { vx, vy } = velRef.current;

      x += vx * dt;
      y += vy * dt;

      let flipX = false;
      let flipY = false;

      if (x <= 0) {
        x = 0;
        flipX = true;
      } else if (x >= maxX) {
        x = maxX;
        flipX = true;
      }

      if (y <= 0) {
        y = 0;
        flipY = true;
      } else if (y >= maxY) {
        y = maxY;
        flipY = true;
      }

      if (flipX || flipY) {
        const next = jitterReflect(vx, vy, flipX, flipY);
        vx = next.vx;
        vy = next.vy;
      }

      posRef.current = { x, y };
      velRef.current = { vx, vy };
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div ref={wrapRef} className={styles.bouncingLogo} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- local SVG asset */}
      <img src="/logo.svg" alt="" width={96} height={45} decoding="async" />
    </div>
  );
}
