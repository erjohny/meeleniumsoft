import { CATALOG } from "./catalog.js";

// Каталог блоков (модалка). open — виден ли; onPick(cat); onClose.
export default function Catalog({ open, onPick, onClose }) {
  return (
    <div className={"modal" + (open ? " on" : "")} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="catalog">
        <h3>Добавить блок</h3>
        <div className="cat-grid">
          {CATALOG.map(c => (
            <div key={c.type} className="cat-card" onClick={() => onPick(c)}>
              <span className="ic">{c.ic}</span>
              <span className="nm">{c.nm}</span>
              <span className="ds">{c.ds}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
