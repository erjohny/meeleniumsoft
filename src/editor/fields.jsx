import { useRef, useState } from "react";
import { useEditor } from "./EditorContext.js";

/* ==================== Переиспользуемые поля панели настроек ====================
   Неуправляемые (defaultValue) — как DOM-поля в оригинале: пишут в данные и дёргают
   перерисовку холста, не перерисовывая саму панель на каждый символ (нет скачка курсора). */

export function Fld({ children }) {
  return <label className="fld">{children}</label>;
}

export function TextField({ value, onInput, placeholder, style, className, type = "text" }) {
  return (
    <input type={type} className={className} placeholder={placeholder} style={style}
      defaultValue={value == null ? "" : value}
      onChange={e => onInput(e.target.value)} />
  );
}

export function AreaField({ value, onInput, style }) {
  return <textarea style={style} defaultValue={value == null ? "" : value} onChange={e => onInput(e.target.value)} />;
}

export function SelectField({ value, options, onChange, style, className }) {
  return (
    <select className={className} style={style} defaultValue={String(value)} onChange={e => onChange(e.target.value)}>
      {options.map(([val, label]) => <option key={String(val)} value={String(val)}>{label}</option>)}
    </select>
  );
}

export function ColorField({ label, value, onInput }) {
  return (
    <div className="colorrow">
      <label>{label}</label>
      <input type="color" defaultValue={value || "#ffffff"} onChange={e => onInput(e.target.value)} />
    </div>
  );
}

export function CheckField({ label, checked, onChange }) {
  return (
    <div className="colorrow">
      <label>{label}</label>
      <input type="checkbox" defaultChecked={!!checked} onChange={e => onChange(e.target.checked)} />
    </div>
  );
}

export function MiniBtn({ label, onClick, cls }) {
  return <button className={"mini " + (cls || "")} onClick={onClick}>{label}</button>;
}

export function ListItem({ title, onRemove, headExtra, children }) {
  return (
    <div className="listitem">
      <div className="h">
        <span>{title}</span>
        {headExtra || (onRemove ? <button className="xbtn" onClick={onRemove}>✕</button> : null)}
      </div>
      {children}
    </div>
  );
}

// показать фактическую картинку по значению поля (ссылка imgref или обычный URL)
export function displaySrc(v, imgMap) {
  return (typeof v === "string" && v.indexOf("imgref:") === 0) ? (imgMap[v.slice(7)] || "") : (v || "");
}

// Контрол картинки: превью + URL-поле + загрузка файла (с сжатием и записью в облако)
export function ImgCtl({ value, onInput }) {
  const ed = useEditor();
  const isRef = typeof value === "string" && value.indexOf("imgref:") === 0;
  const [src, setSrc] = useState(displaySrc(value, ed.imgMapRef.current));
  const [urlVal, setUrlVal] = useState(isRef ? "" : (value || ""));
  const [ph, setPh] = useState(isRef ? "загружено с устройства" : "URL или файл →");
  const fileRef = useRef(null);

  const onUrl = (v) => { setUrlVal(v); setSrc(v); onInput(v); };
  const onFile = async () => {
    const f = fileRef.current.files[0]; if (!f) return;
    const dataUrl = await ed.readFile(f);
    await ed.storeImage(dataUrl, ref => {
      onInput(ref); setSrc(displaySrc(ref, ed.imgMapRef.current)); setUrlVal(""); setPh("загружено с устройства");
    });
  };

  return (
    <div className="imgctl">
      <img src={src} alt="" />
      <input type="text" className="grow" value={urlVal} placeholder={ph} onChange={e => onUrl(e.target.value)} />
      <label className="mini filebtn" style={{ margin: 0 }}>Файл
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} />
      </label>
    </div>
  );
}
