import { useEffect, useRef, useState } from "react";

/* ==================== Кастомные диалоги (порт uiDialog) ====================
   Модуль-синглтон: DialogProvider регистрирует функцию открытия, а helper-функции
   uiAlert/uiConfirm/uiPrompt/uiLink вызывают её откуда угодно — как глобальные в оригинале. */
let opener = null;

export function uiDialog(opt) {
  if (!opener) return Promise.resolve(opt.input ? null : false);
  return opener(opt);
}
export const uiAlert = (message, o = {}) => uiDialog({ icon: o.icon || "ℹ️", title: o.title || "Сообщение", message, cancelText: null, okText: "Понятно" });
export const uiConfirm = (message, o = {}) => uiDialog({ icon: o.icon || "❓", title: o.title || "Подтверждение", message, danger: o.danger, okText: o.okText || "Да", cancelText: o.cancelText || "Отмена" });
export const uiPrompt = (message, defaultValue = "", o = {}) => uiDialog({ icon: o.icon || "✏️", title: o.title || "Ввод", message, input: true, defaultValue, okText: o.okText || "OK" });
export const uiLink = (url) => uiDialog({ icon: "🔗", title: "Ссылка на сайт", message: "Опубликованный сайт открывается по этой ссылке у любого:", input: true, defaultValue: url, readonly: true, showCopy: true, cancelText: null, okText: "Закрыть" });

export function DialogProvider({ children }) {
  const [stack, setStack] = useState([]); // очередь открытых диалогов

  useEffect(() => {
    opener = (opt) => new Promise(resolve => {
      const id = Math.random().toString(36).slice(2);
      setStack(s => [...s, { id, opt, resolve }]);
    });
    return () => { opener = null; };
  }, []);

  const close = (id, val, resolve) => {
    resolve(val);
    setStack(s => s.filter(d => d.id !== id));
  };

  return (
    <>
      {children}
      {stack.map(d => <Dialog key={d.id} entry={d} onClose={close} />)}
    </>
  );
}

function Dialog({ entry, onClose }) {
  const { id, opt, resolve } = entry;
  const [on, setOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const okRef = useRef(null);
  const danger = opt.danger ? " danger" : "";

  useEffect(() => {
    const r = requestAnimationFrame(() => setOn(true));
    // фокус
    setTimeout(() => {
      if (opt.input && !opt.readonly && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
      else if (okRef.current) okRef.current.focus();
    }, 0);
    return () => cancelAnimationFrame(r);
  }, []);

  const finish = (val) => { setOn(false); setTimeout(() => onClose(id, val, resolve), 150); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") finish(opt.input ? null : false);
      if (e.key === "Enter" && (opt.input || !opt.showCopy)) { e.preventDefault(); finish(opt.input ? (inputRef.current ? inputRef.current.value : "") : true); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const doCopy = async () => {
    try { await navigator.clipboard.writeText(opt.defaultValue); }
    catch (e) { if (inputRef.current) { inputRef.current.select(); document.execCommand("copy"); } }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={"dlg-back" + (on ? " on" : "")}
      onMouseDown={e => { if (e.target === e.currentTarget) finish(opt.input ? null : false); }}>
      <div className="dlg" role="dialog">
        <div className="dlg-h">
          <div className={"dlg-ic" + danger}>{opt.icon || "💬"}</div>
          <h3>{opt.title || ""}</h3>
        </div>
        <div className="dlg-body">
          {opt.message ? <p>{opt.message}</p> : null}
          {opt.input ? (
            <input ref={inputRef} type="text" defaultValue={opt.defaultValue || ""} readOnly={!!opt.readonly} />
          ) : null}
        </div>
        <div className="dlg-acts">
          {opt.showCopy ? <span className={"dlg-copied" + (copied ? " on" : "")}>Скопировано ✓</span> : null}
          {opt.showCopy ? <button className="dlg-btn dlg-cancel" onClick={doCopy}>Копировать</button> : null}
          {opt.cancelText !== null ? (
            <button className="dlg-btn dlg-cancel" onClick={() => finish(opt.input ? null : false)}>{opt.cancelText || "Отмена"}</button>
          ) : null}
          <button ref={okRef} className={"dlg-btn dlg-ok" + danger}
            onClick={() => finish(opt.input ? (inputRef.current ? inputRef.current.value : "") : true)}>{opt.okText || "OK"}</button>
        </div>
      </div>
    </div>
  );
}
