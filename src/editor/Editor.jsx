import { useCallback, useEffect, useRef, useState } from "react";
import { Cloud } from "../cloud/firebase.js";
import { DEFAULT_DATA } from "../engine/defaultData.js";
import { renderSiteDoc, resolveImages } from "../engine/render.js";
import { uiAlert, uiConfirm, uiPrompt } from "../dialogs/dialogs.jsx";
import { EditorContext } from "./EditorContext.js";
import { useSiteStore, ensurePages } from "./useSiteStore.js";
import { clone, uid, CATALOG } from "./catalog.js";
import { displaySrc } from "./fields.jsx";
import Header from "./Header.jsx";
import PagesBar from "./PagesBar.jsx";
import Stage from "./Stage.jsx";
import SidePanel from "./SidePanel.jsx";
import Catalog from "./Catalog.jsx";
import LeadsModal from "./LeadsModal.jsx";
import AddressModal from "./AddressModal.jsx";

const isMobileEditor = () => window.matchMedia("(max-width:820px)").matches;

export default function Editor({ siteId, onHome, uiTheme, onToggleUiTheme, device, onDevice }) {
  const [savehint, setSavehint] = useState("сохранено");
  const store = useSiteStore({ onSaveHint: setSavehint });
  const {
    stateRef, currentSiteIdRef, imgMapRef, page, findBlock, idx,
    selectedId, setSelectedId, sideMode, setSideMode, selLayer, setSelLayer,
    curPageId, setCurPageId, renderStage, buildSide, save, initHistory,
    undo, redo, setSiteTitle,
  } = store;

  const [catalogOpen, setCatalogOpen] = useState(false);
  const pendingAfter = useRef(null);
  const [leadsSiteId, setLeadsSiteId] = useState(null);
  const [addrSiteId, setAddrSiteId] = useState(null);
  const [ready, setReady] = useState(false);
  const [, forceHeader] = useState(0);

  // --- панель-шторка (мобильные) ---
  const openPanel = useCallback(() => { if (isMobileEditor()) document.body.classList.add("panel-open"); }, []);
  const closePanel = useCallback(() => document.body.classList.remove("panel-open"), []);

  // --- картинки ---
  const readFile = useCallback((f) => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); }), []);
  const compress = useCallback((dataUrl, maxDim = 1500, quality = 0.72) => new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      try { res(c.toDataURL("image/jpeg", quality)); } catch (e) { res(dataUrl); }
    };
    img.onerror = () => res(dataUrl);
    img.src = dataUrl;
  }), []);
  const storeImage = useCallback(async (dataUrl, applyRef) => {
    setSavehint("обработка фото…");
    const small = await compress(dataUrl);
    try {
      const id = await Cloud.addImage(currentSiteIdRef.current, small);
      imgMapRef.current[id] = small;
      applyRef("imgref:" + id);
    } catch (e) {
      console.warn("Фото не сохранилось в облако, встраиваю напрямую:", e && e.message);
      applyRef(small);
    }
    setSavehint("сохранено");
  }, [compress]);
  const pickImage = useCallback((cb) => {
    const i = document.createElement("input"); i.type = "file"; i.accept = "image/*";
    i.onchange = async () => { const f = i.files[0]; if (!f) return; storeImage(await readFile(f), cb); };
    i.click();
  }, [readFile, storeImage]);

  // --- выбор блока / слоя ---
  const select = useCallback((id) => { setSelectedId(id); setSideMode("block"); setSelLayer(null); openPanel(); }, [openPanel]);
  const selectCanvasLayer = useCallback((bid, lid) => { setSelectedId(bid); setSideMode("block"); setSelLayer({ bid, lid }); buildSide(); }, [buildSide]);
  const moveLayer = useCallback((p, lid, dir) => {
    const a = p.layers, i = a.findIndex(x => x.id === lid), j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; renderStage(true); buildSide();
  }, [renderStage, buildSide]);

  // --- действия с блоками ---
  const moveBlock = useCallback((id, dir) => {
    const bl = page().blocks, i = idx(id), j = i + dir;
    if (j < 0 || j >= bl.length) return;
    const [b] = bl.splice(i, 1); bl.splice(j, 0, b); renderStage(true);
  }, [page, idx, renderStage]);
  const dropBlock = useCallback((dragId, before) => {
    const bl = page().blocks, from = idx(dragId);
    if (from < 0) return;
    const [b] = bl.splice(from, 1);
    let to = (before === "__end") ? bl.length : idx(before);
    if (to < 0) to = bl.length;
    bl.splice(to, 0, b); renderStage(true);
  }, [page, idx, renderStage]);
  const dupBlock = useCallback((id) => {
    const bl = page().blocks, i = idx(id); const copy = clone(bl[i]); copy.id = uid();
    bl.splice(i + 1, 0, copy); select(copy.id); renderStage(true);
  }, [page, idx, select, renderStage]);
  const delBlock = useCallback(async (id) => {
    if (!(await uiConfirm("Удалить этот блок?", { danger: true, okText: "Удалить", icon: "🗑" }))) return;
    page().blocks.splice(idx(id), 1);
    if (selectedId === id) { setSelectedId(null); }
    buildSide(); renderStage(true);
  }, [page, idx, selectedId, buildSide, renderStage]);

  const openCatalog = useCallback((after) => { pendingAfter.current = after; setCatalogOpen(true); }, []);
  const addBlock = useCallback((cat) => {
    const b = { id: uid(), type: cat.type, props: cat.make() };
    const at = pendingAfter.current === "__start" || pendingAfter.current == null ? 0 : idx(pendingAfter.current) + 1;
    page().blocks.splice(at, 0, b);
    setCatalogOpen(false);
    select(b.id); renderStage(true);
  }, [page, idx, select, renderStage]);
  const handleAct = useCallback((act, id, after) => {
    if (act === "add") { openCatalog(after); return; }
    if (act === "up") moveBlock(id, -1);
    else if (act === "down") moveBlock(id, 1);
    else if (act === "dup") dupBlock(id);
    else if (act === "del") delBlock(id);
  }, [openCatalog, moveBlock, dupBlock, delBlock]);

  // --- страницы ---
  const setPage = useCallback((id) => {
    setCurPageId(id); setSelectedId(null); setSelLayer(null); setSideMode("block");
    buildSide(); renderStage(false);
  }, [buildSide, renderStage]);
  const addPage = useCallback(async () => {
    const name = await uiPrompt("Название новой страницы:", "Страница " + ((stateRef.current.pages || []).length + 1), { title: "Новая страница", okText: "Создать", icon: "📄" });
    if (name === null) return;
    const pg = { id: uid(), name: name || "Страница", blocks: [] };
    stateRef.current.pages.push(pg);
    setPage(pg.id);
  }, [setPage]);
  const renamePage = useCallback(async (id) => {
    const pg = (stateRef.current.pages || []).find(p => p.id === id); if (!pg) return;
    const name = await uiPrompt("Название страницы:", pg.name, { title: "Переименовать", okText: "Сохранить", icon: "✎" });
    if (name === null) return;
    pg.name = name || pg.name; forceHeader(x => x + 1); save();
  }, [save]);
  const deletePage = useCallback(async (id) => {
    if ((stateRef.current.pages || []).length <= 1) { uiAlert("Нельзя удалить единственную страницу."); return; }
    const pg = stateRef.current.pages.find(p => p.id === id); if (!pg) return;
    if (!(await uiConfirm("Удалить страницу «" + pg.name + "» со всеми её блоками?", { danger: true, okText: "Удалить", icon: "🗑" }))) return;
    stateRef.current.pages = stateRef.current.pages.filter(p => p.id !== id);
    let cur = id === curPageId ? stateRef.current.pages[0].id : curPageId;
    setPage(cur);
  }, [curPageId, setPage]);

  // --- верхние кнопки ---
  const openDashboard = useCallback(() => { closePanel(); onHome(); }, [onHome, closePanel]);
  const openTheme = useCallback(() => { setSideMode("theme"); setSelectedId(null); buildSide(); openPanel(); }, [buildSide, openPanel]);
  const openLeadsCurrent = useCallback(() => { if (currentSiteIdRef.current) setLeadsSiteId(currentSiteIdRef.current); }, []);
  const preview = useCallback(() => {
    const blob = new Blob([renderSiteDoc(resolveImages(stateRef.current, imgMapRef.current), { siteId: currentSiteIdRef.current })], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  }, []);
  const exportHtml = useCallback(() => {
    const blob = new Blob([renderSiteDoc(resolveImages(stateRef.current, imgMapRef.current), { siteId: currentSiteIdRef.current })], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "index.html"; a.click();
  }, []);
  const publish = useCallback(async () => {
    if (!currentSiteIdRef.current) return;
    try {
      await Cloud.saveSite(currentSiteIdRef.current, { data: stateRef.current, title: stateRef.current.meta.title, published: true });
      setAddrSiteId(currentSiteIdRef.current);
    } catch (e) { uiAlert("Не удалось опубликовать: " + (e && e.message), { icon: "⚠️", title: "Ошибка" }); }
  }, []);

  // --- горячие клавиши ---
  const onUndoKey = useCallback((e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = (e.key || "").toLowerCase();
    const isZ = k === "z" || k === "я";
    const isY = k === "y" || k === "н";
    const isS = k === "s" || k === "ы";
    if (isS) { e.preventDefault(); if (currentSiteIdRef.current) { save(); setSavehint("сохранение…"); } }
    else if (isZ && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (isY || (isZ && e.shiftKey)) { e.preventDefault(); redo(); }
  }, [save, undo, redo]);

  useEffect(() => {
    document.addEventListener("keydown", onUndoKey);
    return () => document.removeEventListener("keydown", onUndoKey);
  }, [onUndoKey]);

  // --- загрузка сайта ---
  useEffect(() => {
    document.body.classList.add("in-editor");
    let cancelled = false;
    (async () => {
      setReady(false);
      const s = await Cloud.getSite(siteId);
      if (cancelled) return;
      if (!s) { await uiAlert("Сайт не найден."); onHome(); return; }
      currentSiteIdRef.current = siteId;
      try { imgMapRef.current = await Cloud.listImages(siteId); } catch (e) { imgMapRef.current = {}; }
      if (cancelled) return;
      stateRef.current = ensurePages(clone(s.data || DEFAULT_DATA));
      setCurPageId(stateRef.current.pages[0].id);
      setSelectedId(null); setSideMode("block"); setSelLayer(null);
      initHistory();
      setSiteTitle(s.title || "Мой сайт");
      setReady(true);
      renderStage(false);
    })();
    return () => { cancelled = true; document.body.classList.remove("in-editor"); closePanel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);

  const ctx = {
    ...store,
    // операции
    select, selectCanvasLayer, moveLayer, setSelLayer,
    handleAct, dropBlock, delBlock, openCatalog, addBlock,
    setPage, addPage, renamePage, deletePage,
    openDashboard, openTheme, openLeadsCurrent, preview, exportHtml, publish,
    readFile, storeImage, pickImage, displaySrc: (v) => displaySrc(v, imgMapRef.current),
    openPanel, closePanel, onUndoKey, uid,
  };

  const blocksAll = (stateRef.current.pages || []).reduce((a, p) => a.concat(p.blocks || []), []);
  const hasForm = blocksAll.some(b => b.type === "form");

  return (
    <EditorContext.Provider value={ctx}>
      <div className="app">
        <Header uiTheme={uiTheme} onToggleUiTheme={onToggleUiTheme} device={device} onDevice={onDevice} hasForm={hasForm} />
        <div className="stagewrap">
          <PagesBar />
          <Stage deviceWidth={device} />
          <div className="savehint">{savehint}</div>
        </div>
        <SidePanel />
      </div>
      <button id="btnPanelFab" onClick={() => document.body.classList.add("panel-open")}>⚙ Настройки</button>
      <div className="sheet-back" onClick={closePanel}></div>
      <Catalog open={catalogOpen} onPick={addBlock} onClose={() => setCatalogOpen(false)} />
      <LeadsModal siteId={leadsSiteId} onClose={() => setLeadsSiteId(null)} />
      <AddressModal siteId={addrSiteId} onClose={() => setAddrSiteId(null)} />
    </EditorContext.Provider>
  );
}
