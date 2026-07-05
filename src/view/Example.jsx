import { useEffect, useRef } from "react";
import { renderSiteDoc, resolveImages } from "../engine/render.js";

// Просмотр сайта-образца (порт example.html / example-reg.html)
export default function Example({ data }) {
  const frameRef = useRef(null);
  useEffect(() => {
    try {
      if (frameRef.current) frameRef.current.srcdoc = renderSiteDoc(resolveImages(data, {}));
    } catch (e) {
      if (frameRef.current) frameRef.current.outerHTML = '<div style="color:#ece2ce;font-family:system-ui,sans-serif;display:flex;height:100%;align-items:center;justify-content:center;text-align:center;padding:24px">Не удалось показать пример. ' + (e && e.message ? e.message : "") + "</div>";
    }
  }, [data]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0c0a" }}>
      <iframe ref={frameRef} title="Пример сайта" style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
    </div>
  );
}
