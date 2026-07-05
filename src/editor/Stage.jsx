import { useEffect, useRef } from "react";
import { useEditor } from "./EditorContext.js";
import { renderBlock, wrapVisibility, wrapStyle, wrapAnim, themeVars, resolveImages, fontsHref } from "../engine/render.js";
import { SITE_CSS } from "../engine/siteCss.js";
import { RUNTIME_CSS } from "./runtimeCss.js";

// Собираем HTML холста: блоки текущей страницы + инструменты редактора (как stageDoc в editor.js)
function buildStageDoc(state, pageObj, imgMap) {
  const start = `<button class="addbar addstart" data-act="add" data-after="__start">+ добавить блок</button>`;
  const R = resolveImages(pageObj, imgMap);
  const shells = R.blocks.map(b => `
    <div class="shell" data-id="${b.id}">
      <div class="shell-tools">
        <button class="drag-handle" data-draghandle title="Перетащить блок">⇕</button>
        <button data-act="up" title="Выше">↑</button>
        <button data-act="down" title="Ниже">↓</button>
        <button data-act="dup" title="Дублировать">⧉</button>
        <button data-act="del" title="Удалить">🗑</button>
      </div>
      ${wrapVisibility(b, wrapStyle(b, wrapAnim(b, renderBlock(b, true), state.theme)))}
      <button class="addbar" data-act="add" data-after="${b.id}">+ добавить блок</button>
    </div>`).join("");
  const onboard = R.blocks.length ? "" : `
    <div class="onboard"><div class="onboard__card">
      <div class="onboard__ic">🚀</div>
      <h2>Соберём ваш сайт</h2>
      <ul>
        <li>Нажмите <b>«+ добавить блок»</b> сверху и выберите нужный: обложку, текст, галерею, <b>форму регистрации</b>…</li>
        <li>Текст меняется <b>прямо на холсте</b> — кликните и печатайте. Клик по фото — заменить его.</li>
        <li>Блоки можно <b>перетаскивать</b> за ручку ⇕ и настраивать в панели справа.</li>
        <li><b>Ctrl+Z</b> — отменить, кнопка <b>📱</b> сверху — вид как на телефоне.</li>
        <li>Готово — жмите <b>«Опубликовать ▲»</b> и задайте красивый адрес сайта.</li>
      </ul>
    </div></div>`;
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
    <link href="${fontsHref()}" rel="stylesheet"/>
    <style>${SITE_CSS}${RUNTIME_CSS}</style></head>
    <body class="editing"><div class="site" style="${themeVars(state.theme)}">${start}${shells}${onboard}</div>
    <script>document.addEventListener("click",function(e){var b=e.target.closest("[data-navtoggle]");if(b){var n=b.closest(".navbar");if(n)n.classList.toggle("nav-open");}});<\/script>
    </body></html>`;
}

export default function Stage({ deviceWidth }) {
  const ed = useEditor();
  const iframeRef = useRef(null);
  const { stageVersion } = ed;

  // Перерисовка холста при изменении данных (bump stageVersion)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const y = ed.stagePreserveRef.current && iframe.contentWindow ? iframe.contentWindow.scrollY : 0;
    iframe.onload = () => { attach(iframe); if (y) iframe.contentWindow.scrollTo(0, y); markSel(iframe); };
    iframe.srcdoc = buildStageDoc(ed.stateRef.current, ed.page(), ed.imgMapRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageVersion]);

  // Отметка выбранного блока/слоя без полной перерисовки
  useEffect(() => { markSel(iframeRef.current); }, [ed.selectedId, ed.selLayer]);

  function markSel(iframe) {
    const doc = iframe && iframe.contentDocument; if (!doc) return;
    doc.querySelectorAll(".shell").forEach(s => s.classList.toggle("sel", s.dataset.id === ed.selectedId));
    doc.querySelectorAll(".clayer").forEach(x => x.classList.toggle("sel", !!ed.selLayer && x.dataset.lid === ed.selLayer.lid));
  }

  function attach(iframe) {
    const doc = iframe.contentDocument;
    if (!doc) return;

    // редактирование текста на месте
    doc.querySelectorAll("[contenteditable]").forEach(el => {
      if (el.dataset.ltext) return; // слои холста ниже
      el.addEventListener("input", () => {
        const b = ed.findBlock(el.dataset.eid); if (!b) return;
        ed.setField(b, el.dataset.field, el.dataset.rich ? el.innerHTML : el.innerText);
        ed.save();
      });
    });

    // замена картинок по клику
    doc.querySelectorAll("[data-imgedit]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        ed.pickImage(url => { const b = ed.findBlock(el.dataset.eid); ed.setField(b, el.dataset.field, url); ed.renderStage(true); });
      });
    });

    // перетаскивание свободных элементов (кнопка-блок и элементы обложки)
    doc.querySelectorAll("[data-drag]").forEach(h => {
      h.addEventListener("mousedown", e => {
        e.preventDefault(); e.stopPropagation();
        const b = ed.findBlock(h.dataset.drag);
        const area = doc.querySelector('[data-dragarea="' + h.dataset.drag + '"]');
        const field = h.dataset.dfield;
        const target = field ? h.closest(".freeel") : h;
        if (!b || !area || !target) return;
        const rect = area.getBoundingClientRect();
        function move(ev) {
          let x = Math.max(0, Math.min(100, (ev.clientX - rect.left) / rect.width * 100));
          if (field) {
            let y = Math.max(0, Math.min(100, (ev.clientY - rect.top) / rect.height * 100));
            const pos = { x: Math.round(x), y: Math.round(y) };
            if (field.indexOf(".") >= 0) ed.setField(b, field, pos);
            else b.props[field] = pos;
            target.style.left = x + "%"; target.style.top = y + "%";
          } else {
            let y = Math.max(0, Math.min(rect.height, ev.clientY - rect.top));
            b.props.x = Math.round(x); b.props.y = Math.round(y);
            target.style.left = x + "%"; target.style.top = y + "px";
          }
        }
        function up() { doc.removeEventListener("mousemove", move); doc.removeEventListener("mouseup", up); ed.save(); }
        doc.addEventListener("mousemove", move); doc.addEventListener("mouseup", up);
      });
    });

    // изменение размера свободных текстов обложки (тянуть зелёную ручку ⤡)
    doc.querySelectorAll("[data-dsize]").forEach(h => {
      h.addEventListener("mousedown", e => {
        e.preventDefault(); e.stopPropagation();
        const b = ed.findBlock(h.dataset.dsize); if (!b) return;
        const L = (b.props.extras || [])[+h.dataset.didx]; if (!L) return;
        const textEl = h.closest(".freeel").querySelector(".cover__extra");
        const sx = e.clientX, sy = e.clientY, start = L.size || 30;
        function move(ev) {
          const d = ((ev.clientX - sx) + (ev.clientY - sy)) / 2;
          const s = Math.max(10, Math.min(200, Math.round(start + d)));
          L.size = s; if (textEl) textEl.style.fontSize = s + "px";
        }
        function up() { doc.removeEventListener("mousemove", move); doc.removeEventListener("mouseup", up); ed.save(); ed.buildSide(); }
        doc.addEventListener("mousemove", move); doc.addEventListener("mouseup", up);
      });
    });

    // перетаскивание блоков за ручку
    doc.querySelectorAll("[data-draghandle]").forEach(h => {
      h.addEventListener("mousedown", e => {
        e.preventDefault(); e.stopPropagation();
        const shell = h.closest(".shell");
        if (shell) startBlockDrag(doc, shell, e);
      });
    });

    // ---- Холст (коллаж): перемещение / размер / поворот слоёв ----
    doc.querySelectorAll(".canvasarea").forEach(area => {
      const bid = area.dataset.canvas;
      area.querySelectorAll(".clayer").forEach(el => {
        const lid = el.dataset.lid;
        el.addEventListener("mousedown", e => {
          const handle = e.target.closest("[data-lh]");
          const inText = e.target.closest("[data-ltext]");
          e.stopPropagation();
          const b = ed.findBlock(bid); if (!b) return;
          const L = (b.props.layers || []).find(x => x.id === lid); if (!L) return;
          ed.selectCanvasLayer(bid, lid);
          const mode = handle ? handle.dataset.lh : (inText ? null : "move");
          if (!mode) return;
          e.preventDefault();
          const arect = area.getBoundingClientRect();
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
          function mv(ev) {
            if (mode === "move") {
              const x = Math.max(-20, Math.min(120, (ev.clientX - arect.left) / arect.width * 100));
              const y = Math.max(-20, Math.min(120, (ev.clientY - arect.top) / arect.height * 100));
              L.x = Math.round(x); L.y = Math.round(y); el.style.left = x + "%"; el.style.top = y + "%";
            } else if (mode === "resize") {
              L.w = Math.max(30, Math.round(2 * Math.abs(ev.clientX - cx))); el.style.width = L.w + "px";
            } else if (mode === "rotate") {
              L.rot = Math.round(Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90);
              el.style.transform = `translate(-50%,-50%) rotate(${L.rot}deg)`;
            }
          }
          function up() { doc.removeEventListener("mousemove", mv); doc.removeEventListener("mouseup", up); ed.save(); }
          doc.addEventListener("mousemove", mv); doc.addEventListener("mouseup", up);
        });
      });
      area.querySelectorAll("[data-ltext]").forEach(t => {
        t.addEventListener("input", () => {
          const b = ed.findBlock(bid); const L = b && (b.props.layers || []).find(x => x.id === t.dataset.ltext);
          if (L) { L.text = t.innerText; ed.save(); }
        });
      });
    });

    // тулбар, добавление, выбор блока
    doc.addEventListener("click", e => {
      if (e.target.closest("a")) e.preventDefault();
      const act = e.target.closest("[data-act]");
      if (act) {
        e.preventDefault();
        const shell = act.closest(".shell");
        ed.handleAct(act.dataset.act, shell ? shell.dataset.id : null, act.dataset.after);
        return;
      }
      if (e.target.closest("[data-imgedit]")) return;
      if (e.target.closest(".clayer")) return;
      const shell = e.target.closest(".shell");
      if (shell) ed.select(shell.dataset.id);
    });

    // Ctrl+Z / Ctrl+Y внутри iframe
    doc.addEventListener("keydown", ed.onUndoKey);
  }

  // Перетаскивание блока мышью: линия-индикатор + перестановка (порт startBlockDrag)
  function startBlockDrag(doc, shell, startEv) {
    const site = doc.querySelector(".site");
    const dragId = shell.dataset.id;
    const win = doc.defaultView;
    const startY = startEv.clientY;
    let moved = false, ind = null, before = "__end";

    const others = () => Array.from(doc.querySelectorAll(".shell")).filter(s => s !== shell);
    function place(y) {
      const list = others();
      for (const s of list) {
        const r = s.getBoundingClientRect();
        if (y < r.top + r.height / 2) { ind.style.top = s.offsetTop + "px"; before = s.dataset.id; return; }
      }
      const last = list[list.length - 1];
      ind.style.top = (last ? last.offsetTop + last.offsetHeight : 0) + "px";
      before = "__end";
    }
    function begin() {
      moved = true;
      shell.classList.add("dragging");
      doc.body.classList.add("dragging-block");
      ind = doc.createElement("div"); ind.className = "drop-ind"; site.appendChild(ind);
    }
    function move(ev) {
      if (!moved) { if (Math.abs(ev.clientY - startY) < 4) return; begin(); }
      place(ev.clientY);
      const h = doc.documentElement.clientHeight;
      if (ev.clientY < 60) win.scrollBy(0, -14);
      else if (ev.clientY > h - 60) win.scrollBy(0, 14);
    }
    function up() {
      doc.removeEventListener("mousemove", move); doc.removeEventListener("mouseup", up);
      window.removeEventListener("mouseup", up);
      if (!moved) return;
      if (ind) ind.remove();
      shell.classList.remove("dragging"); doc.body.classList.remove("dragging-block");
      ed.dropBlock(dragId, before);
    }
    doc.addEventListener("mousemove", move); doc.addEventListener("mouseup", up);
    window.addEventListener("mouseup", up);
  }

  const maxWidth = deviceWidth === "1180px" ? undefined : deviceWidth;
  return (
    <div className="stage-inner">
      <iframe id="stage" ref={iframeRef} title="Холст" style={{ maxWidth }} />
    </div>
  );
}
