import type { ReactNode } from "react";

export default function PreviewLandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: "html,body{background:#000;color:#fff}",
        }}
      />
      {children}
    </>
  );
}
