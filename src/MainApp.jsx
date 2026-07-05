import { useEffect, useState } from "react";
import { useAuth } from "./cloud/useAuth.js";
import { useUiTheme } from "./useUiTheme.js";
import Login from "./dashboard/Login.jsx";
import Dashboard from "./dashboard/Dashboard.jsx";
import Editor from "./editor/Editor.jsx";

// Определение платформы (классы на body — как в editor.js)
function detectPlatform() {
  const ua = navigator.userAgent || "";
  const ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const b = document.body.classList;
  if (ios) b.add("os-ios");
  else if (/Android/.test(ua)) b.add("os-android");
  else if (/Mac/.test(ua)) b.add("os-mac");
  else if (/Win/.test(ua)) b.add("os-win");
  if (window.matchMedia("(pointer:coarse)").matches || navigator.maxTouchPoints > 0) b.add("is-touch");
}

export default function MainApp() {
  const { user, status } = useAuth();
  const ui = useUiTheme();
  const [screen, setScreen] = useState({ name: "dash", siteId: null });
  const [device, setDevice] = useState(() => localStorage.getItem("ui-device") || "1180px");

  useEffect(() => { detectPlatform(); }, []);
  // при выходе — возвращаемся на дашборд
  useEffect(() => { if (status === "out") setScreen({ name: "dash", siteId: null }); }, [status]);

  const setDeviceP = (w) => { setDevice(w); try { localStorage.setItem("ui-device", w); } catch (e) { /* приватный режим */ } };

  if (status === "loading") return null;
  if (status === "out") return <Login />;

  if (screen.name === "editor") {
    return (
      <Editor
        siteId={screen.siteId}
        onHome={() => setScreen({ name: "dash", siteId: null })}
        uiTheme={ui.theme} onToggleUiTheme={ui.toggle}
        device={device} onDevice={setDeviceP}
      />
    );
  }
  return (
    <Dashboard
      user={user}
      onOpenSite={(id) => setScreen({ name: "editor", siteId: id })}
      uiTheme={ui.theme} onToggleUiTheme={ui.toggle}
    />
  );
}
