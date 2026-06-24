import localFont from "next/font/local";

export const temporaryDisplay = localFont({
  src: "../../public/assets/fonts/TemporaryDisplayGX.ttf",
  display: "block",
  weight: "100 900",
  variable: "--vid-display",
  adjustFontFallback: false,
  declarations: [{ prop: "font-synthesis", value: "none" }],
});

export const temporaryDisplayBold = localFont({
  src: "../../public/assets/fonts/TemporaryDisplay-Bold.otf",
  display: "block",
  weight: "700",
  variable: "--vid-display-bold",
  adjustFontFallback: false,
  declarations: [{ prop: "font-synthesis", value: "none" }],
});

export const temporaryDisplayBoldClassName = temporaryDisplayBold.className;
