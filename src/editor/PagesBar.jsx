import { useEditor } from "./EditorContext.js";

export default function PagesBar() {
  const ed = useEditor();
  const pages = ed.stateRef.current.pages || [];
  return (
    <div className="pagesbar" id="pagesBar">
      {pages.map(pg => (
        <button key={pg.id} className={"ptab" + (pg.id === ed.curPageId ? " on" : "")}
          title="Двойной клик — переименовать"
          onClick={() => { if (pg.id !== ed.curPageId) ed.setPage(pg.id); }}
          onDoubleClick={() => ed.renamePage(pg.id)}>{pg.name}</button>
      ))}
      <button className="ptab ptab--add" onClick={ed.addPage}>＋ страница</button>
      <span className="ptools">
        <button title="Переименовать страницу" onClick={() => ed.renamePage(ed.curPageId)}>✎</button>
        <button title="Удалить страницу" onClick={() => ed.deletePage(ed.curPageId)}>🗑</button>
      </span>
    </div>
  );
}
