import { useEditor } from "./EditorContext.js";
import BlockPanel from "./panels/BlockPanel.jsx";
import ThemePanel from "./panels/ThemePanel.jsx";

export default function SidePanel() {
  const ed = useEditor();

  let content;
  if (ed.sideMode === "theme") {
    content = <ThemePanel />;
  } else {
    const b = ed.selectedId && ed.findBlock(ed.selectedId);
    if (!b) {
      content = <div className="empty" dangerouslySetInnerHTML={{ __html: "👈 Наведи на блок и жми <b>+</b>, чтобы добавить новый.<br><br>Кликни на блок, чтобы выбрать его и открыть настройки.<br><br>Текст меняется <b>прямо на холсте</b> — просто кликни и печатай. Клик по фото — заменить его." }} />;
    } else {
      // ключ — чтобы при смене блока/слоя поля перечитали defaultValue
      content = <BlockPanel key={b.id + ":" + (ed.selLayer ? ed.selLayer.lid : "")} b={b} />;
    }
  }

  return (
    <aside className="side" id="side">
      <div className="sheet-grip" id="sheetGrip">
        <span></span>
        <button className="sheet-x" aria-label="Закрыть" onClick={ed.closePanel}>✕</button>
      </div>
      <div className="side-body" id="sideBody" key={ed.sideMode + ":" + (ed.selectedId || "") + ":" + ed.sideNonce}>{content}</div>
    </aside>
  );
}
