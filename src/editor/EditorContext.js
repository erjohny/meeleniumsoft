import { createContext, useContext } from "react";

// Контекст редактора: даёт панелям и холсту доступ к данным сайта и операциям
// (аналог глобальных функций из editor.js: rr/renderStage/buildSide/save/select и т.д.).
export const EditorContext = createContext(null);
export const useEditor = () => useContext(EditorContext);
