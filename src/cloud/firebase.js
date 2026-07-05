// Облачный слой: вход (Google), хранилище сайтов (Firestore), картинки (Storage).
// Порт cloud.js на npm-пакет firebase. Выдаёт объект Cloud (тот же API, что в оригинале).
import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs,
  deleteDoc, query, where, serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZreNqg8l1jMSDh-q5cxjpijSO3vh5prk",
  authDomain: "meelleniumsoft.firebaseapp.com",
  projectId: "meelleniumsoft",
  storageBucket: "meelleniumsoft.firebasestorage.app",
  messagingSenderId: "33715273291",
  appId: "1:33715273291:web:ff93531d189e375d92d7ce"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const Cloud = {
  user: null,
  ready: false,

  onAuth(cb) { return onAuthStateChanged(auth, u => { Cloud.user = u; cb(u); }); },
  login() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).catch(err => {
      const code = err && err.code;
      // на телефоне/во встроенных браузерах popup часто не работает — уходим на redirect
      if (["auth/popup-blocked", "auth/popup-closed-by-user", "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment", "auth/web-storage-unsupported",
        "auth/missing-or-invalid-nonce", "auth/internal-error"].indexOf(code) !== -1) {
        return signInWithRedirect(auth, provider);
      }
      throw err;
    });
  },
  logout() { return signOut(auth); },

  async listSites() {
    const q = query(collection(db, "sites"), where("ownerUid", "==", auth.currentUser.uid));
    const snap = await getDocs(q);
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    arr.sort((a, b) => (b.updatedMs || 0) - (a.updatedMs || 0));
    return arr;
  },
  async getSite(id) {
    const s = await getDoc(doc(db, "sites", id));
    return s.exists() ? { id: s.id, ...s.data() } : null;
  },
  async createSite(title, data) {
    const ref = await addDoc(collection(db, "sites"), {
      ownerUid: auth.currentUser.uid, title, data,
      published: false, updatedMs: Date.now(),
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return ref.id;
  },
  async saveSite(id, patch) {
    return setDoc(doc(db, "sites", id),
      { ...patch, updatedMs: Date.now(), updatedAt: serverTimestamp() }, { merge: true });
  },
  deleteSite(id) { return deleteDoc(doc(db, "sites", id)); },

  // Фото хранятся отдельными записями в подколлекции sites/{id}/images
  async addImage(siteId, dataUrl) {
    const ref = await addDoc(collection(db, "sites", siteId, "images"),
      { data: dataUrl, createdAt: serverTimestamp() });
    return ref.id;
  },
  async listImages(siteId) {
    const snap = await getDocs(collection(db, "sites", siteId, "images"));
    const map = {};
    snap.docs.forEach(d => { map[d.id] = d.data().data; });
    return map;
  },

  // Заявки с форм сайта (регистрации/обращения), новые сверху
  async listSubmissions(siteId) {
    const snap = await getDocs(collection(db, "sites", siteId, "submissions"));
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    arr.sort((a, b) => (b.createdMs || 0) - (a.createdMs || 0));
    return arr;
  },
  deleteSubmission(siteId, subId) {
    return deleteDoc(doc(db, "sites", siteId, "submissions", subId));
  },

  // ----- Короткие адреса сайтов (slug) -----
  slugNorm(s) {
    return String(s || "").trim().toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  },
  // Найти siteId по красивому адресу (для публичного открытия сайта)
  async resolveSlug(slug) {
    const s = await getDoc(doc(db, "slugs", Cloud.slugNorm(slug)));
    return s.exists() ? s.data().siteId : null;
  },
  // Занять/сменить адрес для сайта. oldSlug — прежний адрес, чтобы освободить его.
  async setSlug(siteId, slug, oldSlug) {
    const norm = Cloud.slugNorm(slug);
    const RESERVED = ["view", "editor", "index", "example", "example-reg", "media", "public", "s", "api", "build", "cloud", "render", "site-css", "default-data"];
    if (norm.length < 3) throw new Error("Адрес слишком короткий: минимум 3 символа (латиница, цифры, дефис).");
    if (RESERVED.indexOf(norm) !== -1) throw new Error("Этот адрес зарезервирован — выберите другой.");
    const ref = doc(db, "slugs", norm);
    const ex = await getDoc(ref);
    if (ex.exists() && ex.data().siteId !== siteId) throw new Error("Такой адрес уже занят. Попробуйте другой.");
    await setDoc(ref, { siteId, ownerUid: auth.currentUser.uid, updatedAt: serverTimestamp() });
    const old = Cloud.slugNorm(oldSlug);
    if (old && old !== norm) { try { await deleteDoc(doc(db, "slugs", old)); } catch (e) { /* уже нет */ } }
    return norm;
  }
};

// Для публичного просмотра нужен доступ к отдельным функциям Firestore/getDoc — экспортируем db и хелперы.
export { db };

// завершаем вход, если вернулись после redirect (мобильные браузеры)
getRedirectResult(auth).catch(e => console.warn("redirect result:", e && e.code));
