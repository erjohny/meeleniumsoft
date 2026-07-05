import { useEditor } from "../EditorContext.js";
import { GOOGLE_FONTS } from "../../engine/render.js";
import { Fld, TextField, SelectField, ColorField, CheckField, ImgCtl } from "../fields.jsx";

/* ---------- Универсальная панель «Стиль и эффекты» ---------- */
export default function StylePanel({ p }) {
  const ed = useEditor();
  const s = p.st || (p.st = {});
  const rs = () => ed.renderStageDebounced();
  const reb = () => { ed.renderStage(true); ed.buildSide(); };

  return (
    <>
      <h2>🎨 Стиль и эффекты</h2>

      {/* ---- Фон ---- */}
      <Fld>Фон блока</Fld>
      <SelectField value={s.bgType || "none"} options={[["none", "Нет"], ["color", "Цвет"], ["gradient", "Градиент"], ["neon", "Неон-градиент"], ["image", "Картинка"]]}
        onChange={v => { s.bgType = v; reb(); }} />
      {s.bgType === "color" && <ColorField label="Цвет фона" value={s.bgColor || "#111318"} onInput={v => { s.bgColor = v; rs(); }} />}
      {(s.bgType === "gradient" || s.bgType === "neon") && (() => {
        const a = s.bgType === "neon";
        return <>
          <ColorField label="Цвет 1" value={(a ? s.neonFrom : s.gradFrom) || (a ? "#ff00e6" : "#6a11cb")} onInput={v => { if (a) s.neonFrom = v; else s.gradFrom = v; rs(); }} />
          <ColorField label="Цвет 2" value={(a ? s.neonTo : s.gradTo) || (a ? "#00eaff" : "#2575fc")} onInput={v => { if (a) s.neonTo = v; else s.gradTo = v; rs(); }} />
          <Fld>Угол (град.)</Fld>
          <TextField value={s.gradAngle || 135} onInput={v => { s.gradAngle = parseInt(v) || 135; rs(); }} />
        </>;
      })()}
      {s.bgType === "image" && <>
        <Fld>Фоновое изображение</Fld>
        <ImgCtl value={s.bgImage || ""} onInput={v => { s.bgImage = v; rs(); }} />
        <Fld>Размытие фона (px)</Fld>
        <TextField value={s.bgBlur || ""} onInput={v => { s.bgBlur = parseFloat(v) || 0; rs(); }} />
      </>}
      {s.bgType && s.bgType !== "none" && <>
        <Fld>Затемнение поверх (0–1)</Fld>
        <TextField value={s.bgOverlay != null ? s.bgOverlay : ""} onInput={v => { s.bgOverlay = v === "" ? 0 : parseFloat(v); rs(); }} />
        <Fld>Прозрачность фона (0–1)</Fld>
        <TextField value={s.bgOpacity != null ? s.bgOpacity : ""} onInput={v => { s.bgOpacity = v === "" ? null : parseFloat(v); rs(); }} />
      </>}

      {/* ---- Эффекты ---- */}
      <Fld>Скругление углов (px)</Fld>
      <TextField value={s.radius || ""} onInput={v => { s.radius = parseInt(v) || 0; rs(); }} />
      <Fld>Тень</Fld>
      <SelectField value={s.shadow || "none"} options={[["none", "Нет"], ["soft", "Мягкая"], ["medium", "Средняя"], ["hard", "Сильная"]]} onChange={v => { s.shadow = v; rs(); }} />
      <CheckField label="Свечение (неон)" checked={!!s.glow} onChange={v => { s.glow = v; reb(); }} />
      {s.glow && <>
        <ColorField label="Цвет свечения" value={s.glowColor || "#00eaff"} onInput={v => { s.glowColor = v; rs(); }} />
        <Fld>Сила свечения (px)</Fld>
        <TextField value={s.glowSize || 24} onInput={v => { s.glowSize = parseInt(v) || 24; rs(); }} />
      </>}
      <CheckField label="Неоновая обводка фото" checked={!!s.photoNeon} onChange={v => { s.photoNeon = v; reb(); }} />
      {s.photoNeon && <>
        <ColorField label="Цвет обводки" value={s.photoNeonColor || "#d000ff"} onInput={v => { s.photoNeonColor = v; rs(); }} />
        <Fld>Толщина (px)</Fld>
        <TextField value={s.photoNeonWidth != null ? s.photoNeonWidth : 3} onInput={v => { s.photoNeonWidth = parseInt(v) || 0; rs(); }} />
        <Fld>Сила свечения (px)</Fld>
        <TextField value={s.photoNeonGlow != null ? s.photoNeonGlow : 18} onInput={v => { s.photoNeonGlow = parseInt(v) || 0; rs(); }} />
      </>}
      <CheckField label="Стекло (glassmorphism)" checked={!!s.glass} onChange={v => { s.glass = v; rs(); }} />
      <Fld>При наведении</Fld>
      <SelectField value={s.hover || "none"} options={[["none", "Нет"], ["lift", "Подъём"], ["zoom", "Увеличение"], ["glow", "Свечение"]]} onChange={v => { s.hover = v; rs(); }} />
      <Fld>Прозрачность блока (0–1)</Fld>
      <TextField value={s.opacity != null ? s.opacity : ""} onInput={v => { s.opacity = v === "" ? null : parseFloat(v); rs(); }} />

      {/* ---- Живая (постоянная) анимация ---- */}
      <Fld>🕺 Живая анимация (постоянная)</Fld>
      <SelectField value={s.motion || "none"} options={[
        ["none", "Нет"], ["sway", "Влево-вправо"], ["float", "Парение (вверх-вниз)"], ["bounce", "Прыжки"],
        ["rotate-cw", "Вращение по часовой"], ["rotate-ccw", "Вращение против часовой"], ["dance", "Танец (покачивание)"],
        ["swing", "Качание маятником"], ["pulse", "Пульсация"]
      ]} onChange={v => { s.motion = v; reb(); }} />
      {s.motion && s.motion !== "none" && <>
        <Fld>Длительность цикла (сек)</Fld>
        <TextField value={s.motionDur != null ? s.motionDur : 3} onInput={v => { s.motionDur = parseFloat(v) || 3; rs(); }} />
      </>}

      {/* ---- Текст ---- */}
      <Fld>Шрифт блока</Fld>
      <SelectField value={s.font || ""} options={[["", "Как в теме"]].concat(GOOGLE_FONTS.map(f => [f.css, f.label]))} onChange={v => { s.font = v; rs(); }} />
      <CheckField label="Свой цвет текста" checked={!!s.textColor} onChange={v => { s.textColor = v ? (s.textColor || "#ffffff") : ""; reb(); }} />
      {s.textColor && <ColorField label="Цвет текста" value={s.textColor} onInput={v => { s.textColor = v; rs(); }} />}
      <Fld>Межбуквенный интервал (px)</Fld>
      <TextField value={s.letterSpacing != null ? s.letterSpacing : ""} onInput={v => { s.letterSpacing = v === "" ? "" : parseFloat(v); rs(); }} />
      <Fld>Высота строки (напр. 1.5)</Fld>
      <TextField value={s.lineHeight != null ? s.lineHeight : ""} onInput={v => { s.lineHeight = v === "" ? "" : parseFloat(v); rs(); }} />
      <CheckField label="Неон-свечение текста" checked={!!s.textGlow} onChange={v => { s.textGlow = v; reb(); }} />
      {s.textGlow && <>
        <ColorField label="Цвет свечения текста" value={s.textGlowColor || "#00eaff"} onInput={v => { s.textGlowColor = v; rs(); }} />
        <Fld>Сила (px)</Fld>
        <TextField value={s.textGlowSize || 10} onInput={v => { s.textGlowSize = parseInt(v) || 10; rs(); }} />
      </>}
    </>
  );
}
