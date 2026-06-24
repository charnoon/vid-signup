import localFont from "next/font/local";

export const temporaryDisplay = localFont({
  src: "../../public/assets/fonts/TemporaryDisplayGX.ttf",
  display: "block",
  weight: "100 900",
  variable: "--vid-display",
  adjustFontFallback: false,
  declarations: [{ prop: "font-synthesis", value: "none" }],
});
