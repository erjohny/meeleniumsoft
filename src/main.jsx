import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/editor.css";

// StrictMode намеренно не используется: редактор активно работает с императивным iframe-холстом,
// и двойной прогон эффектов в dev вносил бы лишний шум в отладку. Логика едина с оригиналом.
createRoot(document.getElementById("root")).render(<App />);
