import { useEffect, useState } from "react";
import { Cloud } from "../cloud/firebase.js";
import { uiAlert, uiConfirm } from "../dialogs/dialogs.jsx";

function fmtDate(ms) {
  if (!ms) return "";
  try { return new Date(ms).toLocaleString("ru-RU"); } catch (e) { return ""; }
}

// Окно «Заявки» — заявки с форм сайта. siteId=null → закрыто.
export default function LeadsModal({ siteId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  const load = async (id) => {
    setLoading(true); setError(""); setData([]);
    try {
      const arr = await Cloud.listSubmissions(id);
      setData(arr);
    } catch (e) {
      setError((e && e.message) || "");
    }
    setLoading(false);
  };

  useEffect(() => { if (siteId) load(siteId); }, [siteId]);

  const del = async (sub) => {
    if (!(await uiConfirm("Удалить эту заявку?", { danger: true, okText: "Удалить", icon: "🗑" }))) return;
    try { await Cloud.deleteSubmission(siteId, sub.id); } catch (e) { return uiAlert("Не удалось удалить: " + (e && e.message)); }
    setData(d => d.filter(x => x.id !== sub.id));
  };

  const downloadCsv = () => {
    if (!data.length) return uiAlert("Пока нечего выгружать — заявок нет.");
    const cols = [];
    data.forEach(s => Object.keys(s.fields || {}).forEach(k => { if (cols.indexOf(k) === -1) cols.push(k); }));
    const cell = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const head = ["Дата"].concat(cols).map(cell).join(",");
    const rows = data.map(s => [fmtDate(s.createdMs)].concat(cols.map(c => (s.fields || {})[c] || "")).map(cell).join(","));
    const csv = "﻿" + [head].concat(rows).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "zayavki.csv"; a.click();
  };

  return (
    <div className={"leads-back" + (siteId ? " on" : "")} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="leads">
        <div className="leads-h">
          <h3>Заявки</h3>
          <span className="count">{data.length ? data.length + " шт." : ""}</span>
          <button className="leads-x" aria-label="Закрыть" onClick={onClose}>✕</button>
        </div>
        <div className="leads-tools">
          <button onClick={downloadCsv}>⤓ Скачать CSV</button>
          <button onClick={() => siteId && load(siteId)}>↻ Обновить</button>
        </div>
        <div className="leads-body">
          {loading ? <div className="leads-empty"><div className="spinner"></div></div>
            : error ? <div className="leads-empty">Не удалось загрузить заявки.<br /><small>{error}</small></div>
              : !data.length ? <div className="leads-empty" dangerouslySetInnerHTML={{ __html: "Заявок пока нет.<br>Добавьте на сайт блок <b>«Форма / Регистрация»</b>, опубликуйте — и заявки посетителей появятся здесь." }} />
                : data.map(sub => (
                  <div className="lead" key={sub.id}>
                    <div className="lead-top">
                      <span className="lead-date">{fmtDate(sub.createdMs)}</span>
                      <button className="lead-del" onClick={() => del(sub)}>🗑 удалить</button>
                    </div>
                    <dl>
                      {Object.keys(sub.fields || {}).map(k => (
                        <div key={k} style={{ display: "contents" }}>
                          <dt>{k}</dt><dd>{sub.fields[k]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
        </div>
      </div>
    </div>
  );
}
