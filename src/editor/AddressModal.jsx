import { useEffect, useState } from "react";
import { Cloud } from "../cloud/firebase.js";

// Ссылка на сайт: красивая /s/<slug> или запасная /view?id=<id>
export function siteLink(id, slug) {
  return slug ? location.origin + "/s/" + slug : location.origin + "/view?id=" + id;
}

// Окно «Адрес сайта» (короткая ссылка). siteId=null → закрыто.
export default function AddressModal({ siteId, onClose }) {
  const [input, setInput] = useState("");
  const [curSlug, setCurSlug] = useState("");
  const [msg, setMsg] = useState({ text: "", cls: "" });
  const [full, setFull] = useState("");

  useEffect(() => {
    if (!siteId) return;
    setMsg({ text: "", cls: "" }); setInput(""); setFull("Загрузка…");
    (async () => {
      let slug = "";
      try { const s = await Cloud.getSite(siteId); slug = (s && s.slug) || ""; } catch (e) { slug = ""; }
      setCurSlug(slug); setInput(slug);
      setFull(siteLink(siteId, Cloud.slugNorm(slug)));
    })();
  }, [siteId]);

  const onInput = (v) => { setInput(v); setMsg({ text: "", cls: "" }); setFull(siteLink(siteId, Cloud.slugNorm(v))); };

  const save = async () => {
    setMsg({ text: "Сохраняем…", cls: "" });
    try {
      const norm = await Cloud.setSlug(siteId, input, curSlug);
      await Cloud.saveSite(siteId, { slug: norm });
      setCurSlug(norm); setInput(norm);
      setMsg({ text: "✓ Адрес сохранён", cls: "ok" });
      setFull(siteLink(siteId, norm));
    } catch (e) {
      setMsg({ text: (e && e.message) || "Не удалось сохранить адрес.", cls: "err" });
    }
  };

  const copy = async () => {
    const url = siteLink(siteId, curSlug);
    try { await navigator.clipboard.writeText(url); setMsg({ text: "✓ Ссылка скопирована", cls: "ok" }); }
    catch (e) { setMsg({ text: url, cls: "" }); }
  };

  return (
    <div className={"leads-back" + (siteId ? " on" : "")} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="leads" style={{ width: "min(480px,96vw)" }}>
        <div className="leads-h">
          <h3>🔗 Адрес сайта</h3>
          <button className="leads-x" aria-label="Закрыть" onClick={onClose}>✕</button>
        </div>
        <div className="addr-wrap">
          <div className="addr-hint">Придумайте короткий адрес — латиница, цифры и дефис:</div>
          <div className="addr-row">
            <span className="addr-prefix">{location.host}/s/</span>
            <input type="text" placeholder="my-event" autoComplete="off" spellCheck="false" value={input} onChange={e => onInput(e.target.value)} />
          </div>
          <div className={"addr-msg " + msg.cls}>{msg.text}</div>
          <div className="addr-full">Ссылка: <a href={full} target="_blank" rel="noopener">{full}</a></div>
          <div className="addr-acts">
            <button className="dlg-btn dlg-cancel" onClick={copy}>Копировать ссылку</button>
            <button className="dlg-btn dlg-ok" onClick={save}>Сохранить адрес</button>
          </div>
        </div>
      </div>
    </div>
  );
}
