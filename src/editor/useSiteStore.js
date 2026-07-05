import { useCallback, useReducer, useRef, useState } from "react";
import { Cloud } from "../cloud/firebase.js";
import { DEFAULT_DATA } from "../engine/defaultData.js";
import { clone, uid } from "./catalog.js";

// Приводим данные к многостраничному формату (старые сайты — одна страница «Главная»)
export function ensurePages(d) {
  if (!d.pages || !d.pages.length) d.pages = [{ id: uid(), name: "Главная", blocks: d.blocks || [] }];
  delete d.blocks;
  d.pages.forEach(pg => { if (!pg.id) pg.id = uid(); if (!pg.name) pg.name = "Страница"; if (!pg.blocks) pg.blocks = []; });
  return d;
}

/* ==================== Хранилище редактора: данные + история + сохранение ====================
   Порт императивной логики editor.js на хуки. Данные лежат в ref (глубокие мутации как в оригинале),
   перерисовка холста и панели инициируется явными «bump»-счётчиками — 1:1 с renderStage/buildSide. */
export function useSiteStore({ onSaveHint }) {
  const stateRef = useRef(clone(DEFAULT_DATA));
  const currentSiteIdRef = useRef(null);
  const imgMapRef = useRef({});

  const [selectedId, setSelectedId] = useState(null);
  const [sideMode, setSideMode] = useState("block"); // "block" | "theme"
  const [selLayer, setSelLayer] = useState(null);     // {bid, lid}
  const [curPageId, setCurPageId] = useState(null);
  const [stageVersion, setStageVersion] = useState(0);
  // Полная пересборка панели настроек (аналог side.innerHTML="" в оригинале): меняем nonce → remount
  const [sideNonce, forceSide] = useReducer(x => x + 1, 0);
  const [siteTitle, setSiteTitle] = useState("Конструктор");
  const [hist2, setHist2] = useState({ canUndo: false, canRedo: false });

  const stagePreserveRef = useRef(false);

  // --- текущая страница ---
  const page = useCallback(() => {
    const st = stateRef.current;
    return (st.pages || []).find(p => p.id === curPageId) || (st.pages || [])[0] || { blocks: [] };
  }, [curPageId]);

  const findBlock = useCallback((id) => page().blocks.find(b => b.id === id), [page]);
  const idx = useCallback((id) => page().blocks.findIndex(b => b.id === id), [page]);
  const setField = useCallback((b, path, value) => {
    const parts = path.split(".");
    let o = b.props;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = value;
  }, []);

  // --- сохранение (debounced) ---
  const saveTimer = useRef(null);
  const restoringRef = useRef(false);
  const histTimer = useRef(null);
  const hist = useRef([]);
  const hi = useRef(-1);

  const updateUndoButtons = useCallback(() => {
    setHist2({ canUndo: hi.current > 0, canRedo: hi.current < hist.current.length - 1 });
  }, []);

  const recordHistory = useCallback(() => {
    const snap = JSON.stringify(stateRef.current);
    if (hi.current >= 0 && hist.current[hi.current] === snap) return;
    hist.current = hist.current.slice(0, hi.current + 1);
    hist.current.push(snap); hi.current = hist.current.length - 1;
    if (hist.current.length > 80) { hist.current.shift(); hi.current--; }
    updateUndoButtons();
  }, [updateUndoButtons]);

  const scheduleHistory = useCallback(() => {
    clearTimeout(histTimer.current);
    histTimer.current = setTimeout(recordHistory, 350);
  }, [recordHistory]);

  const initHistory = useCallback(() => {
    hist.current = [JSON.stringify(stateRef.current)]; hi.current = 0; updateUndoButtons();
  }, [updateUndoButtons]);

  const save = useCallback(() => {
    if (!currentSiteIdRef.current) return;
    clearTimeout(saveTimer.current);
    onSaveHint("сохранение…");
    saveTimer.current = setTimeout(async () => {
      try {
        await Cloud.saveSite(currentSiteIdRef.current, { data: stateRef.current, title: stateRef.current.meta.title || "Без названия" });
        onSaveHint("сохранено в облаке ✓");
      } catch (e) {
        onSaveHint("ошибка сохранения");
        console.error(e);
      }
    }, 500);
    if (!restoringRef.current) scheduleHistory();
  }, [onSaveHint, scheduleHistory]);

  // --- перерисовка холста / панели ---
  const renderStage = useCallback((preserve) => {
    stagePreserveRef.current = !!preserve;
    setStageVersion(v => v + 1);
    save();
  }, [save]);

  const rsTimer = useRef(null);
  const renderStageDebounced = useCallback(() => {
    clearTimeout(rsTimer.current);
    rsTimer.current = setTimeout(() => renderStage(true), 300);
  }, [renderStage]);

  const buildSide = useCallback(() => forceSide(), []);

  // --- история: применение ---
  const applyHistory = useCallback(() => {
    restoringRef.current = true;
    stateRef.current = JSON.parse(hist.current[hi.current]);
    const st = stateRef.current;
    if (!(st.pages || []).some(p => p.id === curPageId)) {
      setCurPageId((st.pages && st.pages[0] && st.pages[0].id) || null);
    }
    setSelectedId(null); setSelLayer(null);
    renderStage(true); buildSide();
    restoringRef.current = false;
    updateUndoButtons();
  }, [curPageId, renderStage, buildSide, updateUndoButtons]);

  const undo = useCallback(() => {
    clearTimeout(histTimer.current); recordHistory();
    if (hi.current <= 0) return;
    hi.current--; applyHistory();
  }, [recordHistory, applyHistory]);

  const redo = useCallback(() => {
    clearTimeout(histTimer.current); recordHistory();
    if (hi.current >= hist.current.length - 1) return;
    hi.current++; applyHistory();
  }, [recordHistory, applyHistory]);

  return {
    stateRef, currentSiteIdRef, imgMapRef,
    selectedId, setSelectedId, sideMode, setSideMode, selLayer, setSelLayer,
    curPageId, setCurPageId, stageVersion, stagePreserveRef, buildSide, sideNonce,
    siteTitle, setSiteTitle,
    page, findBlock, idx, setField,
    save, renderStage, renderStageDebounced,
    initHistory, undo, redo, canUndo: hist2.canUndo, canRedo: hist2.canRedo, recordHistory,
  };
}
