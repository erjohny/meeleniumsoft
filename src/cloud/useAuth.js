import { useEffect, useState } from "react";
import { Cloud } from "./firebase.js";

// Хук авторизации: следит за состоянием входа. status: "loading" | "in" | "out".
export function useAuth() {
  const [user, setUser] = useState(Cloud.user);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsub = Cloud.onAuth(u => {
      setUser(u || null);
      setStatus(u ? "in" : "out");
    });
    return unsub;
  }, []);

  return { user, status };
}
