import { useEditor } from "../EditorContext.js";
import { GOOGLE_FONTS } from "../../engine/render.js";
import { CATALOG, RADIUS_OPTS, ph, newTier } from "../catalog.js";
import { Fld, TextField, AreaField, SelectField, ColorField, CheckField, MiniBtn, ListItem, ImgCtl } from "../fields.jsx";
import StylePanel from "./StylePanel.jsx";

// Подсказка-блок (аналог .empty в оригинале)
function Hint({ html, style }) {
  return <div className="empty" style={{ padding: "6px 16px", ...(style || {}) }} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function BlockPanel({ b }) {
  const ed = useEditor();
  const p = b.props;
  const cat = CATALOG.find(c => c.type === b.type);
  const rr = () => ed.renderStageDebounced();
  const rs = () => ed.renderStage(true);
  const reb = () => { ed.renderStage(true); ed.buildSide(); };
  const save = () => ed.save();
  const pageOptions = () => (ed.stateRef.current.pages || []).map(pg => ["page:" + pg.id, "Страница: " + pg.name]);

  return (
    <>
      <h2>Блок: {cat ? cat.nm : b.type}</h2>
      {renderByType()}

      {/* --- Стиль и эффекты (кроме навбара) --- */}
      {b.type !== "navbar" && <><div style={{ height: 8 }} /><StylePanel p={p} /></>}

      {/* --- Якорь для ссылок меню --- */}
      <div style={{ height: 8 }} />
      <h2>🔗 Якорь (для меню)</h2>
      <Fld>Имя якоря, напр. price</Fld>
      <TextField value={p.anchor || ""} onInput={v => { p.anchor = v.replace(/[^a-zA-Z0-9_-]/g, ""); }} />
      <Hint html="Задай якорь блоку (напр. <b>price</b>), затем в навбаре впиши ссылку пункта <b>#price</b> — клик будет прокручивать сюда." />

      {/* --- Анимация появления --- */}
      <div style={{ height: 8 }} />
      <h2>✨ Анимация появления</h2>
      <Fld>Эффект при прокрутке</Fld>
      <SelectField value={p.anim == null ? "" : p.anim} options={[
        ["", "Как в теме (по умолчанию)"], ["none", "Отключить у этого блока"],
        ["fade", "Проявление"], ["up", "Снизу вверх"], ["down", "Сверху вниз"],
        ["left", "Слева"], ["right", "Справа"], ["zoom", "Увеличение"], ["blur", "Из размытия"]
      ]} onChange={v => { p.anim = v; ed.renderStage(true); }} />
      <Fld>Задержка (напр. 0.2s)</Fld>
      <TextField value={p.animDelay || ""} onInput={v => { p.animDelay = v; ed.renderStageDebounced(); }} />

      {/* --- Эффекты при прокрутке --- */}
      <div style={{ height: 8 }} />
      <h2>🌀 Эффекты при прокрутке</h2>
      <Fld>Эффект</Fld>
      <SelectField value={(p.scrollFx || {}).type || "none"} options={[
        ["none", "Нет"], ["parallax", "Параллакс (плавный сдвиг)"], ["rotate", "Вращение"],
        ["scale", "Приближение"], ["driftx", "Сдвиг вбок"], ["rotate3d", "Поворот 3D"]
      ]} onChange={v => { p.scrollFx = Object.assign({}, p.scrollFx, { type: v }); ed.renderStage(true); ed.buildSide(); }} />
      {p.scrollFx && p.scrollFx.type && p.scrollFx.type !== "none" && <>
        <Fld>Сила эффекта</Fld>
        <SelectField value={String(p.scrollFx.str != null ? p.scrollFx.str : 1)} options={[
          ["0.5", "Слабо"], ["1", "Средне"], ["1.8", "Сильно"], ["3", "Очень сильно"]
        ]} onChange={v => { p.scrollFx = Object.assign({}, p.scrollFx, { str: parseFloat(v) }); save(); }} />
        <Hint html="Эффект виден в <b>«Просмотр ↗»</b> и на опубликованном сайте. В редакторе блок остаётся неподвижным — так удобнее править." />
      </>}

      {/* --- Видимость --- */}
      <div style={{ height: 8 }} />
      <h2>📱 Видимость</h2>
      <CheckField label="Скрыть этот блок на телефоне" checked={!!p.hideMob} onChange={v => { p.hideMob = v; ed.renderStage(true); }} />

      <div style={{ height: 14 }} />
      <MiniBtn label="🗑 Удалить этот блок" onClick={() => ed.delBlock(b.id)} cls="mini--del mini--wide" />
    </>
  );

  function renderByType() {
    switch (b.type) {
      case "navbar": return <>
        <Fld>Название (текст логотипа)</Fld><TextField value={p.brand} onInput={v => { p.brand = v; rr(); }} />
        <Fld>Логотип-картинка (необязательно)</Fld><ImgCtl value={p.logo || ""} onInput={v => { p.logo = v; rs(); }} />
        {p.logo && <MiniBtn label="Убрать логотип-картинку" onClick={() => { p.logo = ""; reb(); }} cls="mini--del mini--wide" />}
        <ColorField label="Цвет фона" value={p.bg && p.bg[0] === "#" ? p.bg : "#ffffff"} onInput={v => { p.bg = v; ed.renderStageDebounced(); }} />
        <ColorField label="Цвет текста" value={p.fg && p.fg[0] === "#" ? p.fg : "#16150f"} onInput={v => { p.fg = v; ed.renderStageDebounced(); }} />
        <CheckField label="Прозрачный фон (видно картинку)" checked={!!p.transparent} onChange={v => { p.transparent = v; rs(); }} />
        <CheckField label="Поверх обложки (на весь верх)" checked={!!p.overlay} onChange={v => { p.overlay = v; rs(); }} />
        <Fld>Ширина (напр. 1080px)</Fld><TextField value={p.width} onInput={v => { p.width = v; rr(); }} />
        <Fld>Форма бара</Fld>
        <SelectField value={p.navShape || "pill"} options={[["pill", "Пилюля (скруглённый)"], ["rect", "Прямоугольник"], ["line", "Линия снизу"]]} onChange={v => { p.navShape = v; rs(); }} />
        <CheckField label="Уменьшать бар при прокрутке" checked={!!p.shrink} onChange={v => { p.shrink = v; rs(); }} />
        <h2>🎨 Дизайн меню</h2>
        <Fld>Эффект наведения на пункты</Fld>
        <SelectField value={p.linkHover || "fade"} options={[["fade", "Затухание"], ["underline", "Подчёркивание"], ["pill", "Заливка-пилюля"], ["color", "Цвет акцента"], ["grow", "Увеличение"], ["glow", "Неон-свечение"]]} onChange={v => { p.linkHover = v; rs(); }} />
        <Fld>Иконка «бургер» (на телефоне)</Fld>
        <SelectField value={p.burger || "morph"} options={[["morph", "Полоски → крест"], ["spin", "С поворотом"], ["classic", "☰ / ✕"]]} onChange={v => { p.burger = v; rs(); }} />
        <Fld>Стиль меню на телефоне</Fld>
        <SelectField value={p.menuStyle || "dropdown"} options={[["dropdown", "Выпадающее окошко"], ["fullscreen", "На весь экран"], ["sidebar", "Боковая панель"]]} onChange={v => { p.menuStyle = v; rs(); }} />
        <Fld>Анимация появления меню</Fld>
        <SelectField value={p.menuAnim || "bounce"} options={[["bounce", "Пружина"], ["fade", "Проявление"], ["slide", "Сверху вниз"], ["zoom", "Увеличение"], ["flip", "Переворот 3D"]]} onChange={v => { p.menuAnim = v; rs(); }} />
        <Hint html="👉 Меню и бургер видно в режиме <b>📱 телефон</b> (переключатель устройств сверху). Нажми на бургер в холсте, чтобы раскрыть меню и увидеть стиль." />
        <Fld>Текст кнопки (пусто — скрыть)</Fld>
        <TextField value={p.cta ? p.cta.text : ""} onInput={v => { p.cta = p.cta || { text: "", link: "#" }; p.cta.text = v; rs(); }} />
        <Fld>Куда ведёт кнопка</Fld>
        {(() => {
          const clink = (p.cta && p.cta.link) || ""; const isP = clink.indexOf("page:") === 0;
          return <>
            <SelectField value={isP ? clink : ""} options={[["", "Ссылка / якорь (ниже)"]].concat(pageOptions())}
              onChange={v => { p.cta = p.cta || { text: "", link: "#" }; p.cta.link = v || "#"; ed.renderStage(true); ed.buildSide(); }} />
            {!isP && <TextField value={clink === "#" ? "" : clink} onInput={v => { p.cta = p.cta || { text: "", link: "#" }; p.cta.link = v; rr(); }} />}
          </>;
        })()}
        <Fld>Пункты меню</Fld>
        {p.links.map((l, i) => {
          const isPage = typeof l.link === "string" && l.link.indexOf("page:") === 0;
          return <ListItem key={i} title={"Пункт " + (i + 1)} onRemove={() => { p.links.splice(i, 1); reb(); }}>
            <TextField value={l.label} onInput={v => { l.label = v; rr(); }} />
            <SelectField style={{ marginTop: 4, width: "100%" }} value={isPage ? l.link : ""} options={[["", "Ссылка / якорь (ниже)"]].concat(pageOptions())}
              onChange={v => { l.link = v || "#"; ed.renderStage(true); ed.buildSide(); }} />
            {!isPage && <TextField style={{ marginTop: 4, width: "100%" }} placeholder="#якорь или https://…" value={l.link === "#" ? "" : l.link} onInput={v => { l.link = v; rr(); }} />}
          </ListItem>;
        })}
        <MiniBtn label="+ добавить пункт" onClick={() => { p.links.push({ label: "Пункт", link: "#" }); reb(); }} cls="mini--wide" />
      </>;

      case "cover": return <>
        <Fld>Размещение</Fld>
        <SelectField value={p.free ? "free" : "align"} options={[["align", "Стандартное"], ["free", "Свободно (перетаскивать)"]]} onChange={v => {
          p.free = v === "free";
          if (p.free) { p.titlePos = p.titlePos || { x: 50, y: 38 }; p.subPos = p.subPos || { x: 50, y: 56 }; p.btnPos = p.btnPos || { x: 50, y: 72 }; }
          reb();
        }} />
        {p.free
          ? <Hint html="🖱️ Перетаскивай заголовок, подзаголовок и кнопку за синий кружок ✥ прямо на обложке." />
          : <><Fld>Выравнивание</Fld><SelectField value={p.align} options={[["left", "Слева"], ["center", "По центру"]]} onChange={v => { p.align = v; rr(); }} /></>}
        <Fld>Затемнение фона (0–1)</Fld><TextField value={p.overlay} onInput={v => { p.overlay = parseFloat(v) || 0; rr(); }} />
        <CheckField label="🎥 Живой фон (эффект камеры)" checked={!!p.liveBg} onChange={v => { p.liveBg = v; rs(); }} />
        <Fld>🎬 Видео-фон (ссылка на .mp4, необязательно)</Fld>
        <TextField value={p.videoBg || ""} onInput={v => { p.videoBg = v.trim(); rs(); }} />
        {p.videoBg && <MiniBtn label="Убрать видео-фон" onClick={() => { p.videoBg = ""; reb(); }} cls="mini--del mini--wide" />}
        <Fld>Высота (напр. 70vh)</Fld><TextField value={p.height} onInput={v => { p.height = v; rr(); }} />
        <Fld>Текст кнопки</Fld><TextField value={p.button.text} onInput={v => { p.button.text = v; rr(); }} />
        <Fld>Ссылка кнопки</Fld><TextField value={p.button.link} onInput={v => { p.button.link = v; rr(); }} />
        <Fld>Скругление кнопки</Fld><SelectField value={p.btnRadius || ""} options={RADIUS_OPTS} onChange={v => { p.btnRadius = v; rr(); }} />
        <Fld>Фон</Fld><ImgCtl value={p.image} onInput={v => { p.image = v; rr(); }} />
        {p.free && <>
          <div style={{ height: 8 }} />
          <h2>✨ Свободные тексты</h2>
          <Hint html="Добавляй отдельные надписи, таскай их за кружок ✥ по обложке, задавай шрифт, цвет и <b>неон-свечение</b> любого цвета." style={{ padding: "6px 16px" }} />
          {(p.extras || []).map((L, i) => (
            <ListItem key={i} title={"Текст " + (i + 1)} onRemove={() => { p.extras.splice(i, 1); reb(); }}>
              <Fld>Текст</Fld><AreaField value={L.text} onInput={v => { L.text = v; rr(); }} />
              <ColorField label="Цвет" value={L.color || "#ffffff"} onInput={v => { L.color = v; rr(); }} />
              <Fld>Шрифт</Fld><SelectField value={L.font || ""} options={[["", "Как в теме"]].concat(GOOGLE_FONTS.map(f => [f.css, f.label]))} onChange={v => { L.font = v; rr(); }} />
              <Fld>Размер (px)</Fld><TextField value={L.size || 28} onInput={v => { L.size = parseInt(v) || 28; rr(); }} />
              <Fld>Жирность</Fld><SelectField value={L.weight || 700} options={[[300, "300"], [400, "400"], [600, "600"], [700, "700"], [800, "800"]]} onChange={v => { L.weight = +v; rr(); }} />
              <Fld>Выравнивание</Fld><SelectField value={L.align || "center"} options={[["left", "Слева"], ["center", "По центру"], ["right", "Справа"]]} onChange={v => { L.align = v; rr(); }} />
              <CheckField label="Неон-свечение" checked={!!L.glow} onChange={v => { L.glow = v; reb(); }} />
              {L.glow && <><ColorField label="Цвет свечения" value={L.glowColor || "#00eaff"} onInput={v => { L.glowColor = v; rr(); }} /><Fld>Сила (px)</Fld><TextField value={L.glowSize || 12} onInput={v => { L.glowSize = parseInt(v) || 12; rr(); }} /></>}
            </ListItem>
          ))}
          <MiniBtn label="+ добавить текст" cls="mini--wide" onClick={() => { p.extras = p.extras || []; p.extras.push({ text: "Новый текст", pos: { x: 50, y: 50 }, color: "#ffffff", size: 30, weight: 700, align: "center", glow: true, glowColor: "#00eaff", glowSize: 14 }); reb(); }} />
        </>}
      </>;

      case "heading": return <>
        <Fld>Выравнивание</Fld>
        <SelectField value={p.align} options={[["left", "Слева"], ["center", "По центру"], ["right", "Справа"]]} onChange={v => { p.align = v; rr(); }} />
      </>;

      case "text": return <>
        <Fld>Выравнивание</Fld>
        <SelectField value={p.align} options={[["left", "Слева"], ["center", "По центру"], ["right", "Справа"]]} onChange={v => { p.align = v; rr(); }} />
        <Fld>Макс. ширина (напр. 720px)</Fld><TextField value={p.width} onInput={v => { p.width = v; rr(); }} />
      </>;

      case "columns": return <>
        <Fld>Кол-во колонок</Fld>
        <SelectField value={p.cols.length} options={[[2, "2"], [3, "3"]]} onChange={v => {
          const n = +v; while (p.cols.length < n) p.cols.push("Новая колонка"); p.cols.length = n; rs();
        }} />
      </>;

      case "image": return <>
        <Fld>Ширина (напр. 60%)</Fld><TextField value={p.width} onInput={v => { p.width = v; rr(); }} />
        <Fld>Скругление (напр. 8px)</Fld><TextField value={p.radius} onInput={v => { p.radius = v; rr(); }} />
        <Fld>Фото</Fld><ImgCtl value={p.src} onInput={v => { p.src = v; rr(); }} />
      </>;

      case "gallery": return <>
        <Fld>Колонок</Fld><SelectField value={p.columns} options={[[2, "2"], [3, "3"], [4, "4"]]} onChange={v => { p.columns = +v; rs(); }} />
        <Fld>Пропорции (напр. 4/5, 1/1)</Fld><TextField value={p.ratio} onInput={v => { p.ratio = v; rr(); }} />
        <Fld>Зазор (напр. 16px)</Fld><TextField value={p.gap} onInput={v => { p.gap = v; rr(); }} />
        <Fld>Фотографии</Fld>
        {p.images.map((src, i) => (
          <ListItem key={i} title={"Фото " + (i + 1)} onRemove={() => { p.images.splice(i, 1); reb(); }}>
            <ImgCtl value={src} onInput={v => { p.images[i] = v; rr(); }} />
          </ListItem>
        ))}
        <MiniBtn label="+ добавить фото" onClick={() => { p.images.push(ph(500, 650)); reb(); }} cls="mini--wide" />
      </>;

      case "pricing": return <>
        <Fld>Цена</Fld><TextField value={p.price} onInput={v => { p.price = v; rr(); }} />
        <Fld>Текст кнопки</Fld><TextField value={p.button.text} onInput={v => { p.button.text = v; rr(); }} />
        <Fld>Ссылка кнопки</Fld><TextField value={p.button.link} onInput={v => { p.button.link = v; rr(); }} />
        <Fld>Скругление кнопки</Fld><SelectField value={p.btnRadius || ""} options={RADIUS_OPTS} onChange={v => { p.btnRadius = v; rr(); }} />
        <Fld>Фото тарифа</Fld><ImgCtl value={p.image} onInput={v => { p.image = v; rr(); }} />
        <Fld>Что входит</Fld>
        {p.features.map((f, i) => (
          <ListItem key={i} title={"Пункт " + (i + 1)} onRemove={() => { p.features.splice(i, 1); reb(); }}>
            <AreaField value={f} onInput={v => { p.features[i] = v; rr(); }} />
          </ListItem>
        ))}
        <MiniBtn label="+ добавить пункт" onClick={() => { p.features.push("Новый пункт"); reb(); }} cls="mini--wide" />
      </>;

      case "button": return <>
        <Fld>Текст</Fld><TextField value={p.button.text} onInput={v => { p.button.text = v; rr(); }} />
        <Fld>Ссылка</Fld><TextField value={p.button.link} onInput={v => { p.button.link = v; rr(); }} />
        <Fld>Стиль</Fld><SelectField value={p.style} options={[["solid", "Заливка"], ["outline", "Контур"]]} onChange={v => { p.style = v; rr(); }} />
        <Fld>Скругление углов</Fld><SelectField value={p.radius || ""} options={RADIUS_OPTS} onChange={v => { p.radius = v; rr(); }} />
        <Fld>Размещение</Fld>
        <SelectField value={p.free ? "free" : "align"} options={[["align", "По выравниванию"], ["free", "Свободно (перетаскивать)"]]} onChange={v => {
          p.free = v === "free";
          if (p.free) { p.x = p.x == null ? 50 : p.x; p.y = p.y == null ? 20 : p.y; p.areaH = p.areaH || 140; }
          reb();
        }} />
        {p.free
          ? <><Fld>Высота зоны (px)</Fld><TextField value={p.areaH || 140} onInput={v => { p.areaH = parseInt(v) || 140; ed.renderStageDebounced(); }} /><Hint html="🖱️ Перетаскивай кнопку мышью прямо на холсте в нужное место." /></>
          : <><Fld>Выравнивание</Fld><SelectField value={p.align} options={[["left", "Слева"], ["center", "По центру"], ["right", "Справа"]]} onChange={v => { p.align = v; rr(); }} /></>}
      </>;

      case "pricinggroup": return <>
        <Fld>Колонок</Fld><SelectField value={p.columns} options={[[1, "1"], [2, "2"], [3, "3"]]} onChange={v => { p.columns = +v; rs(); }} />
        <Fld>Скругление кнопок</Fld><SelectField value={p.btnRadius || ""} options={RADIUS_OPTS} onChange={v => { p.btnRadius = v; rr(); }} />
        <Fld>Карточки тарифов</Fld>
        {p.cards.map((t, ci) => {
          const head = <span>
            <button className="xbtn" style={{ background: "#e6ecff", color: "#2f6df6", marginRight: 4 }} onClick={() => { if (ci > 0) { const a = p.cards;[a[ci - 1], a[ci]] = [a[ci], a[ci - 1]]; reb(); } }}>↑</button>
            <button className="xbtn" style={{ background: "#e6ecff", color: "#2f6df6", marginRight: 4 }} onClick={() => { const a = p.cards; if (ci < a.length - 1) { [a[ci + 1], a[ci]] = [a[ci], a[ci + 1]]; reb(); } }}>↓</button>
            <button className="xbtn" onClick={() => { p.cards.splice(ci, 1); reb(); }}>✕</button>
          </span>;
          return <ListItem key={ci} title={"Тариф " + (ci + 1)} headExtra={head}>
            <Fld>Название</Fld><TextField value={t.title} onInput={v => { t.title = v; rr(); }} />
            <Fld>Цена</Fld><TextField value={t.price} onInput={v => { t.price = v; rr(); }} />
            <Fld>Текст кнопки</Fld><TextField value={t.button.text} onInput={v => { t.button.text = v; rr(); }} />
            <Fld>Ссылка кнопки</Fld><TextField value={t.button.link} onInput={v => { t.button.link = v; rr(); }} />
            <Fld>Фото</Fld><ImgCtl value={t.image} onInput={v => { t.image = v; rr(); }} />
            <Fld>Пункты (по одному на строку)</Fld>
            <AreaField style={{ minHeight: 90 }} value={(t.features || []).join("\n")} onInput={v => { t.features = v.split("\n").map(s => s.trim()).filter(Boolean); rr(); }} />
          </ListItem>;
        })}
        <MiniBtn label="+ добавить тариф" onClick={() => { p.cards.push(newTier()); reb(); }} cls="mini--wide" />
      </>;

      case "video": return <>
        <Fld>Ссылка (YouTube или .mp4)</Fld><TextField value={p.url} onInput={v => { p.url = v; rr(); }} />
        <Fld>Подпись</Fld><TextField value={p.caption} onInput={v => { p.caption = v; rr(); }} />
      </>;

      case "social": return <>
        <Fld>Расположение</Fld><SelectField value={p.layout} options={[["column", "Столбиком"], ["row", "В ряд"]]} onChange={v => { p.layout = v; rr(); }} />
        <Fld>Ссылки</Fld>
        {p.links.map((l, i) => (
          <ListItem key={i} title={"Ссылка " + (i + 1)} onRemove={() => { p.links.splice(i, 1); reb(); }}>
            <TextField value={l.label} onInput={v => { l.label = v; rr(); }} />
            <TextField style={{ marginTop: 4, width: "100%" }} value={l.url} onInput={v => { l.url = v; rr(); }} />
          </ListItem>
        ))}
        <MiniBtn label="+ добавить ссылку" onClick={() => { p.links.push({ label: "Ссылка", url: "https://" }); reb(); }} cls="mini--wide" />
      </>;

      case "form": {
        const FIELD_TYPES = [["text", "Текст"], ["email", "Email"], ["tel", "Телефон"], ["number", "Число"], ["date", "Дата"], ["textarea", "Много текста"]];
        p.fields = p.fields || [];
        return <>
          <Fld>Заголовок формы</Fld><TextField value={p.title} onInput={v => { p.title = v; rr(); }} />
          <Fld>Подзаголовок</Fld><TextField value={p.subtitle} onInput={v => { p.subtitle = v; rr(); }} />
          <Fld>Ширина (напр. 480px)</Fld><TextField value={p.width} onInput={v => { p.width = v; rr(); }} />
          <Fld>Текст кнопки</Fld><TextField value={p.button.text} onInput={v => { p.button.text = v; rr(); }} />
          <Fld>Сообщение после отправки</Fld><TextField value={p.success} onInput={v => { p.success = v; rr(); }} />
          <Fld>Поля формы</Fld>
          {p.fields.map((f, i) => (
            <ListItem key={i} title={"Поле " + (i + 1)} onRemove={() => { p.fields.splice(i, 1); reb(); }}>
              <Fld>Название поля</Fld><TextField value={f.label} onInput={v => { f.label = v; rr(); }} />
              <Fld>Тип</Fld><SelectField value={f.type || "text"} options={FIELD_TYPES} onChange={v => { f.type = v; rr(); }} />
              <CheckField label="Обязательное" checked={!!f.required} onChange={v => { f.required = v; rr(); }} />
            </ListItem>
          ))}
          <MiniBtn label="+ добавить поле" onClick={() => { p.fields.push({ label: "Новое поле", type: "text", required: false }); reb(); }} cls="mini--wide" />
          <Hint style={{ padding: "10px 16px" }} html="📥 Заявки приходят в раздел <b>«Заявки»</b> (кнопка сверху). Чтобы форма принимала заявки от посетителей — <b>опубликуйте</b> сайт." />
        </>;
      }

      case "marquee": return <>
        <Fld>Текст (повторяется по кругу)</Fld><TextField value={p.text} onInput={v => { p.text = v; rr(); }} />
        <Fld>Скорость (сек, меньше — быстрее)</Fld><TextField value={p.speed || 20} onInput={v => { p.speed = parseFloat(v) || 20; rr(); }} />
        <Fld>Направление</Fld><SelectField value={p.direction || "left"} options={[["left", "Влево"], ["right", "Вправо"]]} onChange={v => { p.direction = v; rr(); }} />
        <Fld>Размер текста (напр. 30px)</Fld><TextField value={p.size || "30px"} onInput={v => { p.size = v; rr(); }} />
      </>;

      case "countdown": {
        const cl = p.labels || (p.labels = {});
        return <>
          <Fld>Дата и время окончания</Fld>
          <TextField type="datetime-local" value={p.target || ""} onInput={v => { p.target = v; rr(); }} />
          <Fld>Текст по завершении</Fld><TextField value={p.finished || ""} onInput={v => { p.finished = v; rr(); }} />
          <Fld>Подписи (дни / часы / минуты / секунды)</Fld>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "0 16px" }}>
            {[["d", "дней"], ["h", "часов"], ["m", "минут"], ["s", "секунд"]].map(([k, def]) => (
              <TextField key={k} style={{ margin: 0, width: "100%" }} value={cl[k] || def} onInput={v => { cl[k] = v; rr(); }} />
            ))}
          </div>
        </>;
      }

      case "counter": {
        p.items = p.items || [];
        return <>
          <Fld>Колонок</Fld><SelectField value={p.columns || 3} options={[[1, "1"], [2, "2"], [3, "3"], [4, "4"]]} onChange={v => { p.columns = +v; rs(); }} />
          <Fld>Показатели</Fld>
          {p.items.map((it, i) => (
            <ListItem key={i} title={"Цифра " + (i + 1)} onRemove={() => { p.items.splice(i, 1); reb(); }}>
              <Fld>Число</Fld><TextField value={String(it.value != null ? it.value : 0)} onInput={v => { it.value = parseFloat(v) || 0; rr(); }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
                <TextField style={{ margin: 0, width: "100%" }} placeholder="до (напр. $)" value={it.prefix || ""} onInput={v => { it.prefix = v; rr(); }} />
                <TextField style={{ margin: 0, width: "100%" }} placeholder="после (напр. +)" value={it.suffix || ""} onInput={v => { it.suffix = v; rr(); }} />
              </div>
              <Fld>Подпись</Fld><TextField value={it.label || ""} onInput={v => { it.label = v; rr(); }} />
            </ListItem>
          ))}
          <MiniBtn label="+ добавить цифру" onClick={() => { p.items.push({ value: 100, suffix: "+", label: "показатель" }); reb(); }} cls="mini--wide" />
        </>;
      }

      case "photostack": {
        p.images = p.images || [];
        return <>
          <Hint html="До <b>10 фото</b>. На сайте: клик раскрывает <b>3D-карусель</b> — листается свайпом (телефон) и перетаскиванием (мышь)." />
          <Fld>Фотографии</Fld>
          {p.images.map((src, i) => (
            <ListItem key={i} title={"Фото " + (i + 1)} onRemove={() => { p.images.splice(i, 1); reb(); }}>
              <ImgCtl value={src} onInput={v => { p.images[i] = v; rr(); }} />
            </ListItem>
          ))}
          {p.images.length < 10
            ? <MiniBtn label="+ добавить фото" onClick={() => { p.images.push(ph(600, 750)); reb(); }} cls="mini--wide" />
            : <div className="empty" style={{ padding: "4px 16px" }}>Максимум 10 фото.</div>}
        </>;
      }

      case "scrollstack": {
        p.images = p.images || [];
        return <>
          <Hint html="Фото сложены веером и <b>разъезжаются при прокрутке</b>. Эффект виден в <b>«Просмотр ↗»</b> и на сайте. В редакторе веер показан статично." style={{ padding: "8px 16px" }} />
          <Fld>Разброс в стороны (px)</Fld><TextField value={p.spread != null ? p.spread : 180} onInput={v => { p.spread = parseInt(v) || 0; rs(); }} />
          <Fld>Угол наклона (град.)</Fld><TextField value={p.angle != null ? p.angle : 8} onInput={v => { p.angle = parseFloat(v) || 0; rs(); }} />
          <Fld>Ширина фото (px)</Fld><TextField value={p.width || 280} onInput={v => { p.width = parseInt(v) || 280; rs(); }} />
          <Fld>Высота блока (px)</Fld><TextField value={p.height || 460} onInput={v => { p.height = parseInt(v) || 460; rs(); }} />
          <Fld>Фотографии (до 8)</Fld>
          {p.images.map((src, i) => (
            <ListItem key={i} title={"Фото " + (i + 1)} onRemove={() => { p.images.splice(i, 1); reb(); }}>
              <ImgCtl value={src} onInput={v => { p.images[i] = v; rr(); }} />
            </ListItem>
          ))}
          {p.images.length < 8
            ? <MiniBtn label="+ добавить фото" onClick={() => { p.images.push(ph(500, 650)); reb(); }} cls="mini--wide" />
            : <div className="empty" style={{ padding: "4px 16px" }}>Максимум 8 фото.</div>}
        </>;
      }

      case "swipestack": {
        p.images = p.images || [];
        return <>
          <Hint html="Колода фото. На сайте: <b>свайп верхнего фото вверх</b> (палец/мышь) — оно улетает, следующее поднимается снизу, по кругу. Работает в <b>«Просмотр ↗»</b> и на сайте." style={{ padding: "8px 16px" }} />
          <Fld>Выглядывание нижних (px)</Fld><TextField value={p.peek != null ? p.peek : 26} onInput={v => { p.peek = parseInt(v) || 0; rs(); }} />
          <Fld>Ширина фото (px)</Fld><TextField value={p.width || 320} onInput={v => { p.width = parseInt(v) || 320; rs(); }} />
          <Fld>Высота блока (px)</Fld><TextField value={p.height || 520} onInput={v => { p.height = parseInt(v) || 520; rs(); }} />
          <Fld>Фотографии (до 12)</Fld>
          {p.images.map((src, i) => (
            <ListItem key={i} title={"Фото " + (i + 1)} onRemove={() => { p.images.splice(i, 1); reb(); }}>
              <ImgCtl value={src} onInput={v => { p.images[i] = v; rr(); }} />
            </ListItem>
          ))}
          {p.images.length < 12
            ? <MiniBtn label="+ добавить фото" onClick={() => { p.images.push(ph(600, 750)); reb(); }} cls="mini--wide" />
            : <div className="empty" style={{ padding: "4px 16px" }}>Максимум 12 фото.</div>}
        </>;
      }

      case "buildstack": {
        p.images = p.images || [];
        return <>
          <Hint html="Стопка собирается свайпом. На сайте: старт с 1 фото, каждый <b>свайп вверх</b> добавляет следующее — оно появляется и ложится сверху хаотично. Когда все выложены — свайп собирает заново. В редакторе показана вся стопка." style={{ padding: "8px 16px" }} />
          <Fld>Ширина фото (px)</Fld><TextField value={p.width || 320} onInput={v => { p.width = parseInt(v) || 320; rs(); }} />
          <Fld>Высота блока (px)</Fld><TextField value={p.height || 520} onInput={v => { p.height = parseInt(v) || 520; rs(); }} />
          <Fld>Фотографии (до 12)</Fld>
          {p.images.map((src, i) => (
            <ListItem key={i} title={"Фото " + (i + 1)} onRemove={() => { p.images.splice(i, 1); reb(); }}>
              <ImgCtl value={src} onInput={v => { p.images[i] = v; rr(); }} />
            </ListItem>
          ))}
          {p.images.length < 12
            ? <MiniBtn label="+ добавить фото" onClick={() => { p.images.push(ph(600, 750)); reb(); }} cls="mini--wide" />
            : <div className="empty" style={{ padding: "4px 16px" }}>Максимум 12 фото.</div>}
        </>;
      }

      case "map": return <>
        <Fld>Адрес (город, улица, дом)</Fld><TextField value={p.address || ""} onInput={v => { p.address = v; p.embed = ""; ed.renderStageDebounced(); }} />
        <Fld>Приближение (10–18)</Fld><TextField value={p.zoom || 15} onInput={v => { p.zoom = parseInt(v) || 15; ed.renderStageDebounced(); }} />
        <Fld>Высота (напр. 420px)</Fld><TextField value={p.height || "420px"} onInput={v => { p.height = v; rr(); }} />
        <Fld>Скругление (напр. 16px)</Fld><TextField value={p.radius || "16px"} onInput={v => { p.radius = v; rr(); }} />
        <Fld>Или свой код вставки (embed URL, необязательно)</Fld><TextField value={p.embed || ""} onInput={v => { p.embed = v.trim(); ed.renderStageDebounced(); }} />
      </>;

      case "embed": return <>
        <Fld>HTML-код / код вставки</Fld>
        <textarea style={{ minHeight: 160, fontFamily: "monospace" }} placeholder="<iframe …></iframe> или скрипт виджета"
          defaultValue={p.html || ""} onChange={e => { p.html = e.target.value; ed.renderStageDebounced(); }} />
        <Hint html="Вставьте код виджета, <b>iframe</b>, Lottie-анимации и т.п. В редакторе — заглушка, результат виден в <b>«Просмотр ↗»</b> и на сайте (там выполняется и код/скрипты)." />
      </>;

      case "spacer": return <>
        <Fld>Высота (напр. 80px)</Fld><TextField value={p.size} onInput={v => { p.size = v; rr(); }} />
      </>;

      case "canvas": return <CanvasPanel b={b} p={p} />;

      default: return null;
    }
  }
}

/* ---------- Панель холста-коллажа (слои) ---------- */
function CanvasPanel({ b, p }) {
  const ed = useEditor();
  const rr = () => ed.renderStageDebounced();
  const rs = () => ed.renderStage(true);
  const reb = () => { ed.renderStage(true); ed.buildSide(); };
  p.layers = p.layers || [];
  const L = ed.selLayer && ed.selLayer.bid === b.id ? p.layers.find(x => x.id === ed.selLayer.lid) : null;

  return <>
    <Fld>Высота холста (px)</Fld>
    <TextField value={p.height || 480} onInput={v => { p.height = parseInt(v) || 480; ed.renderStageDebounced(); }} />
    <Fld>Фон холста (картинка — необязательно)</Fld>
    <ImgCtl value={p.bg || ""} onInput={v => { p.bg = v; ed.renderStageDebounced(); }} />
    {p.bg && <>
      <MiniBtn label="Убрать фон" cls="mini--del mini--wide" onClick={() => { p.bg = ""; reb(); }} />
      <Fld>Затемнение фона (0–1)</Fld>
      <TextField value={p.overlay != null ? p.overlay : .35} onInput={v => { p.overlay = parseFloat(v) || 0; rr(); }} />
    </>}
    <CheckField label="Фон во всю ширину экрана" checked={!!p.full} onChange={v => { p.full = v; rs(); }} />
    <MiniBtn label="＋ Фото-слой" cls="mini--wide" onClick={() => ed.pickImage(url => {
      const NL = { id: ed.uid(), type: "image", src: url, x: 50, y: 50, w: 240, rot: 0, radius: 10 };
      p.layers.push(NL); ed.renderStage(true); ed.selectCanvasLayer(b.id, NL.id);
    })} />
    <MiniBtn label="＋ Текст-слой" cls="mini--wide" onClick={() => {
      const NL = { id: ed.uid(), type: "text", text: "Текст", x: 50, y: 50, w: 260, rot: 0, color: "#ffffff", size: 28, weight: 600, align: "center" };
      p.layers.push(NL); ed.renderStage(true); ed.selectCanvasLayer(b.id, NL.id);
    }} />

    {!L && <Hint html="Добавь фото/текст-слои и таскай их по холсту.<br>Клик по слою — выбрать. Точки: 🔵 угол — размер, 🟢 сверху — поворот, синяя слева-сверху — двигать. Слои можно накладывать и выводить за края." style={{ padding: "8px 16px" }} />}

    {L && <>
      <h2>{L.type === "text" ? "Слой: текст" : "Слой: фото"}</h2>
      <div style={{ display: "flex", gap: 8, margin: "6px 16px" }}>
        <button className="mini" style={{ margin: 0, flex: 1 }} onClick={() => ed.moveLayer(p, L.id, -1)}>↓ назад</button>
        <button className="mini" style={{ margin: 0, flex: 1 }} onClick={() => ed.moveLayer(p, L.id, 1)}>↑ вперёд</button>
      </div>
      {L.type === "text" ? <>
        <Fld>Текст</Fld><AreaField value={L.text} onInput={v => { L.text = v; rr(); }} />
        <ColorField label="Цвет" value={L.color || "#ffffff"} onInput={v => { L.color = v; rr(); }} />
        <Fld>Шрифт</Fld><SelectField value={L.font || ""} options={[["", "Как в теме"]].concat(GOOGLE_FONTS.map(f => [f.css, f.label]))} onChange={v => { L.font = v; rr(); }} />
        <Fld>Размер (px)</Fld><TextField value={L.size || 28} onInput={v => { L.size = parseInt(v) || 28; rr(); }} />
        <Fld>Жирность</Fld><SelectField value={L.weight || 600} options={[[300, "300"], [400, "400"], [600, "600"], [700, "700"], [800, "800"]]} onChange={v => { L.weight = +v; rr(); }} />
        <Fld>Поворот (град.)</Fld><TextField value={L.rot || 0} onInput={v => { L.rot = parseInt(v) || 0; rr(); }} />
        <CheckField label="Неон-свечение" checked={!!L.glow} onChange={v => { L.glow = v; reb(); }} />
        {L.glow && <><ColorField label="Цвет свечения" value={L.glowColor || "#00eaff"} onInput={v => { L.glowColor = v; rr(); }} /><Fld>Сила (px)</Fld><TextField value={L.glowSize || 10} onInput={v => { L.glowSize = parseInt(v) || 10; rr(); }} /></>}
      </> : <>
        <Fld>Заменить фото</Fld><ImgCtl value={L.src || ""} onInput={v => { L.src = v; rr(); }} />
        <Fld>Ширина (px)</Fld><TextField value={L.w || 240} onInput={v => { L.w = parseInt(v) || 240; rr(); }} />
        <Fld>Скругление (px)</Fld><TextField value={L.radius || 0} onInput={v => { L.radius = parseInt(v) || 0; rr(); }} />
        <Fld>Поворот (град.)</Fld><TextField value={L.rot || 0} onInput={v => { L.rot = parseInt(v) || 0; rr(); }} />
        <CheckField label="Неон-рамка" checked={!!L.border} onChange={v => { L.border = v; reb(); }} />
        {L.border && <><ColorField label="Цвет рамки" value={L.borderColor || "#00eaff"} onInput={v => { L.borderColor = v; rr(); }} /><Fld>Толщина (px)</Fld><TextField value={L.borderW || 3} onInput={v => { L.borderW = parseInt(v) || 3; rr(); }} /></>}
        <CheckField label="Свечение" checked={!!L.glow} onChange={v => { L.glow = v; reb(); }} />
        {L.glow && <><ColorField label="Цвет свечения" value={L.glowColor || "#00eaff"} onInput={v => { L.glowColor = v; rr(); }} /><Fld>Сила (px)</Fld><TextField value={L.glowSize || 20} onInput={v => { L.glowSize = parseInt(v) || 20; rr(); }} /></>}
      </>}
      <MiniBtn label="🗑 Удалить слой" cls="mini--del mini--wide" onClick={() => { p.layers = p.layers.filter(x => x.id !== L.id); ed.setSelLayer(null); ed.renderStage(true); ed.buildSide(); }} />
    </>}
  </>;
}
