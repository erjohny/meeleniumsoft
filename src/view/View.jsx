import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Cloud } from "../cloud/firebase.js";
import { renderSiteDoc, resolveImages } from "../engine/render.js";

function setMeta(attr, key, content) {
  if (!content) return;
  let m = document.head.querySelector('meta[' + attr + '="' + key + '"]');
  if (!m) { m = document.createElement("meta"); m.setAttribute(attr, key); document.head.appendChild(m); }
  m.setAttribute("content", content);
}
function setFavicon(href) {
  let l = document.head.querySelector('link[rel="icon"]');
  if (!l) { l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); }
  l.href = href;
}

// Публичный просмотр опубликованного сайта: /view?id=SITEID или /s/:slug
export default function View() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [msg, setMsg] = useState("");
  const frameRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let id = params.get("id");
        if (slug) { id = await Cloud.resolveSlug(slug); }
        if (!id) { setMsg("Сайт по этой ссылке не найден."); return; }
        const s = await Cloud.getSite(id);
        if (cancelled) return;
        if (!s) { setMsg("Сайт не найден."); return; }
        if (!s.published) { setMsg("Этот сайт ещё не опубликован."); return; }
        const meta = (s.data && s.data.meta) || {};
        document.title = meta.title || "Сайт";
        setMeta("name", "description", meta.description);
        setMeta("property", "og:title", meta.title);
        setMeta("property", "og:description", meta.description);
        if (meta.ogImage && /^https?:\/\//.test(meta.ogImage)) setMeta("property", "og:image", meta.ogImage);
        if (meta.favicon && /^https?:\/\//.test(meta.favicon)) setFavicon(meta.favicon);
        let map = {};
        try { map = await Cloud.listImages(id); } catch (e) { /* фото могут отсутствовать */ }
        if (cancelled) return;
        if (frameRef.current) frameRef.current.srcdoc = renderSiteDoc(resolveImages(s.data, map), { siteId: id });
      } catch (e) {
        if (!cancelled) setMsg("Не удалось загрузить сайт. " + (e && e.message ? e.message : ""));
      }
    })();
    return () => { cancelled = true; };
  }, [slug, params]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#1c1b1a" }}>
      {msg
        ? <div style={{ color: "#ddd", fontFamily: "system-ui,sans-serif", display: "flex", height: "100%", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>{msg}</div>
        : <iframe ref={frameRef} title="Сайт" style={{ width: "100%", height: "100%", border: 0, display: "block" }} />}
    </div>
  );
}
