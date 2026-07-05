import { useEditor } from "./EditorContext.js";

export default function Header({ uiTheme, onToggleUiTheme, device, onDevice, hasForm }) {
  const ed = useEditor();
  return (
    <header>
      <button className="tbtn tbtn--ghost" id="btnHome" onClick={ed.openDashboard}>← Мои сайты</button>
      <h1 id="siteTitle">{ed.siteTitle}</h1>
      <button className="tbtn tbtn--ghost" title="Отменить (Ctrl+Z)" disabled={!ed.canUndo} onClick={ed.undo}>↶</button>
      <button className="tbtn tbtn--ghost" title="Вернуть (Ctrl+Y)" disabled={!ed.canRedo} onClick={ed.redo}>↷</button>
      <div className="spacer"></div>
      <span className="devsel" id="devSel">
        <button className={device === "1180px" ? "on" : ""} title="Компьютер" onClick={() => onDevice("1180px")}>🖥</button>
        <button className={device === "820px" ? "on" : ""} title="Планшет" onClick={() => onDevice("820px")}>▭</button>
        <button className={device === "390px" ? "on" : ""} title="Телефон" onClick={() => onDevice("390px")}>📱</button>
      </span>
      <button className="tbtn tbtn--ghost theme-toggle" title="Тёмная/светлая тема" onClick={onToggleUiTheme}>{uiTheme === "dark" ? "☀️" : "🌙"}</button>
      <button className="tbtn tbtn--ghost" onClick={ed.openTheme}>⚙ Тема</button>
      {hasForm && <button className="tbtn tbtn--ghost" onClick={ed.openLeadsCurrent}>📋 Заявки</button>}
      <button className="tbtn tbtn--ghost" onClick={ed.preview}>Просмотр ↗</button>
      <button className="tbtn tbtn--ghost" onClick={ed.exportHtml}>Скачать ⤓</button>
      <button className="tbtn tbtn--go" onClick={ed.publish}>Опубликовать ▲</button>
    </header>
  );
}
