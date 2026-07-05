import { useEffect, useState } from "react";
import { Cloud } from "../cloud/firebase.js";
import { DEFAULT_DATA, REG_EXAMPLE_DATA, EMPTY_DATA } from "../engine/defaultData.js";
import { clone } from "../editor/catalog.js";
import { uiAlert, uiConfirm, uiPrompt } from "../dialogs/dialogs.jsx";
import LeadsModal from "../editor/LeadsModal.jsx";
import AddressModal from "../editor/AddressModal.jsx";

function siteHasForm(data) {
  if (!data) return false;
  const blocks = data.pages ? data.pages.reduce((a, p) => a.concat(p.blocks || []), []) : (data.blocks || []);
  return blocks.some(b => b.type === "form");
}

// Заменяет ссылки imgref:oldId -> imgref:newId в данных (для дубликата с копией картинок)
function remapImgrefs(obj, map) {
  if (Array.isArray(obj)) { obj.forEach(x => remapImgrefs(x, map)); return; }
  if (obj && typeof obj === "object") {
    for (const k in obj) {
      const v = obj[k];
      if (typeof v === "string" && v.indexOf("imgref:") === 0) {
        const nid = map[v.slice(7)]; if (nid) obj[k] = "imgref:" + nid;
      } else remapImgrefs(v, map);
    }
  }
}

export default function Dashboard({ user, onOpenSite, uiTheme, onToggleUiTheme }) {
  const [state, setState] = useState({ status: "loading", sites: [], error: "" });
  const [leadsSiteId, setLeadsSiteId] = useState(null);
  const [addrSiteId, setAddrSiteId] = useState(null);
  const [tick, setTick] = useState(0);

  const reload = () => setTick(t => t + 1);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", sites: [], error: "" });
    (async () => {
      let sites = [];
      try {
        sites = await Promise.race([
          Cloud.listSites(),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000))
        ]);
      } catch (e) {
        if (cancelled) return;
        const isTimeout = e && e.message === "timeout";
        setState({
          status: "error", sites: [],
          error: isTimeout
            ? "База данных долго не отвечает. Убедитесь, что в Firebase создана Firestore-база (регион europe-west), и обновите страницу."
            : "Не удалось загрузить сайты. " + (e && e.message)
        });
        return;
      }
      if (!cancelled) setState({ status: "ok", sites, error: "" });
    })();
    return () => { cancelled = true; };
  }, [tick]);

  const createNewSite = async () => {
    const title = await uiPrompt("Как назвать новый сайт?", "Мой сайт", { title: "Новый сайт", okText: "Создать", icon: "✨" });
    if (title === null) return;
    const data = clone(EMPTY_DATA);
    data.meta.title = title || "Мой сайт";
    const id = await Cloud.createSite(title || "Мой сайт", data);
    onOpenSite(id);
  };

  const useExample = async (opts) => {
    const title = await uiPrompt("Название нового сайта из образца:", opts.defTitle, { title: "Создать из образца", okText: "Создать", icon: "✨" });
    if (title === null) return;
    const data = clone(opts.data); data.meta.title = title || opts.defTitle;
    const id = await Cloud.createSite(title || opts.defTitle, data);
    onOpenSite(id);
  };

  const duplicateSite = async (s) => {
    try {
      const data = clone(s.data || EMPTY_DATA);
      const title = (s.title || "Сайт") + " (копия)";
      const newId = await Cloud.createSite(title, data);
      let imgs = {};
      try { imgs = await Cloud.listImages(s.id); } catch (e) { imgs = {}; }
      const idMap = {};
      for (const oldId in imgs) { idMap[oldId] = await Cloud.addImage(newId, imgs[oldId]); }
      if (Object.keys(idMap).length) { remapImgrefs(data, idMap); await Cloud.saveSite(newId, { data }); }
      reload();
    } catch (e) {
      uiAlert("Не удалось создать копию: " + (e && e.message), { icon: "⚠️", title: "Ошибка" });
    }
  };

  const deleteSite = async (s) => {
    if (await uiConfirm("Удалить сайт «" + (s.title || "") + "»? Это действие необратимо.", { danger: true, okText: "Удалить", icon: "🗑" })) {
      await Cloud.deleteSite(s.id); reload();
    }
  };

  return (
    <div className="cover-screen" id="dashScreen" style={{ display: "flex" }}>
      <div className="dash">
        <div className="dash-top">
          <div><h2>Мои сайты</h2></div>
          <div className="dash-user">
            <button className="theme-toggle" title="Тёмная/светлая тема" onClick={onToggleUiTheme}>{uiTheme === "dark" ? "☀️" : "🌙"}</button>
            <span>{user ? user.email : ""}</span>
            <button onClick={() => Cloud.logout()}>Выйти</button>
          </div>
        </div>
        <div className="dash-sub">Каждый сайт хранится в вашем аккаунте. Откройте, чтобы редактировать, или опубликуйте и поделитесь ссылкой.</div>
        <div className="dash-grid">
          {state.status === "loading" && <div className="dash-loading"><div className="spinner"></div> Загрузка ваших сайтов…</div>}
          {state.status === "error" && <div className="dash-msg" dangerouslySetInnerHTML={{ __html: state.error }} />}
          {state.status === "ok" && <>
            <div className="dash-new" onClick={createNewSite}><span className="plus">＋</span> Создать сайт</div>
            <ExampleCard data={DEFAULT_DATA} preview="/example" name="Пример сайта — портфолио" onUse={() => useExample({ data: DEFAULT_DATA, name: "Пример сайта — портфолио", defTitle: "Портфолио" })} />
            <ExampleCard data={REG_EXAMPLE_DATA} preview="/example-reg" name="Пример — форма регистрации" onUse={() => useExample({ data: REG_EXAMPLE_DATA, name: "Пример — форма регистрации", defTitle: "Регистрация" })} />
            {state.sites.map(s => (
              <SiteCard key={s.id} s={s}
                onOpen={() => onOpenSite(s.id)}
                onLink={() => setAddrSiteId(s.id)}
                onLeads={() => setLeadsSiteId(s.id)}
                onDup={() => duplicateSite(s)}
                onDel={() => deleteSite(s)} />
            ))}
          </>}
        </div>
      </div>
      <LeadsModal siteId={leadsSiteId} onClose={() => setLeadsSiteId(null)} />
      <AddressModal siteId={addrSiteId} onClose={() => setAddrSiteId(null)} />
    </div>
  );
}

function ExampleCard({ data, preview, name, onUse }) {
  const cover = (data.blocks || []).find(b => b.type === "cover");
  const thumbStyle = cover && cover.props.image ? { backgroundImage: `url("${cover.props.image}")` } : undefined;
  return (
    <div className="dash-card">
      <div className="thumb" style={thumbStyle}><div className="badge pub">★ образец</div></div>
      <div className="body"><div className="nm">{name}</div></div>
      <div className="acts">
        <button className="open" onClick={() => window.open(preview, "_blank")}>Просмотр ↗</button>
        <button onClick={onUse}>Взять за основу</button>
      </div>
    </div>
  );
}

function SiteCard({ s, onOpen, onLink, onLeads, onDup, onDel }) {
  const sblocks = s.data ? (s.data.pages ? s.data.pages.reduce((a, p) => a.concat(p.blocks || []), []) : (s.data.blocks || [])) : [];
  const cover = sblocks.find(b => b.type === "cover");
  const cimg = cover && cover.props.image;
  const hasImg = cimg && cimg.indexOf("imgref:") !== 0;
  return (
    <div className="dash-card">
      <div className="thumb" style={hasImg ? { backgroundImage: `url("${cimg}")` } : undefined}>
        {!hasImg && "нет обложки"}
        <div className={"badge " + (s.published ? "pub" : "draft")}>{s.published ? "опубликован" : "черновик"}</div>
      </div>
      <div className="body"><div className="nm">{s.title || "Без названия"}</div></div>
      <div className="acts">
        <button className="open" onClick={onOpen}>Открыть</button>
        <button onClick={onLink}>🔗 Ссылка</button>
        {siteHasForm(s.data) && <button onClick={onLeads}>📋 Заявки</button>}
        <button title="Сделать дубликат" onClick={onDup}>⧉ Копия</button>
        <button className="danger" title="Удалить" onClick={onDel}>🗑</button>
      </div>
    </div>
  );
}
