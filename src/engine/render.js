/* ============================================================
   Рендер сайта из блоков. Один код на предпросмотр, редактор и экспорт.
   editable=true добавляет contenteditable и «горячие» зоны для картинок.
============================================================ */
import { SITE_CSS } from "./siteCss.js";

// Псевдослучайные смещения/повороты для «хаотичной» колоды (детерминированы по позиции).
const CHAOS_R = [-5, 4, -3, 6, -4, 5, -6, 3, -2, 5, -4, 2];
const CHAOS_X = [0, 7, -6, 5, -8, 6, -5, 8, -4, 7, -6, 4];

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------- Шрифты (все с кириллицей) ---------- */
export const GOOGLE_FONTS = [
  // системные (без загрузки)
  { css: "system-ui,sans-serif", label: "Системный", api: null },
  { css: "Georgia,serif", label: "Georgia", api: null },
  // без засечок
  { css: '"Montserrat",sans-serif', label: "Montserrat", api: "Montserrat:wght@300;400;600;700" },
  { css: '"Roboto",sans-serif', label: "Roboto", api: "Roboto:wght@400;500;700" },
  { css: '"Open Sans",sans-serif', label: "Open Sans", api: "Open+Sans:wght@400;600;700" },
  { css: '"Inter",sans-serif', label: "Inter", api: "Inter:wght@400;600;700" },
  { css: '"Manrope",sans-serif', label: "Manrope", api: "Manrope:wght@400;600;700" },
  { css: '"Rubik",sans-serif', label: "Rubik", api: "Rubik:wght@400;500;700" },
  { css: '"Raleway",sans-serif', label: "Raleway", api: "Raleway:wght@400;600;700" },
  { css: '"Nunito",sans-serif', label: "Nunito", api: "Nunito:wght@400;600;700" },
  { css: '"PT Sans",sans-serif', label: "PT Sans", api: "PT+Sans:wght@400;700" },
  { css: '"Fira Sans",sans-serif', label: "Fira Sans", api: "Fira+Sans:wght@400;600;700" },
  { css: '"Ubuntu",sans-serif', label: "Ubuntu", api: "Ubuntu:wght@400;500;700" },
  { css: '"Comfortaa",sans-serif', label: "Comfortaa", api: "Comfortaa:wght@400;600;700" },
  // акцент/заголовки
  { css: '"Oswald",sans-serif', label: "Oswald", api: "Oswald:wght@400;500;600;700" },
  { css: '"Unbounded",sans-serif', label: "Unbounded", api: "Unbounded:wght@400;600;800" },
  { css: '"Russo One",sans-serif', label: "Russo One", api: "Russo+One" },
  { css: '"Philosopher",sans-serif', label: "Philosopher", api: "Philosopher:wght@400;700" },
  // с засечками
  { css: '"Playfair Display",serif', label: "Playfair Display", api: "Playfair+Display:wght@400;600;700" },
  { css: '"Merriweather",serif', label: "Merriweather", api: "Merriweather:wght@400;700" },
  { css: '"Lora",serif', label: "Lora", api: "Lora:wght@400;600;700" },
  { css: '"PT Serif",serif', label: "PT Serif", api: "PT+Serif:wght@400;700" },
  { css: '"Cormorant",serif', label: "Cormorant", api: "Cormorant:wght@400;600;700" },
  { css: '"Yeseva One",serif', label: "Yeseva One", api: "Yeseva+One" },
  // рукописные
  { css: '"Caveat",cursive', label: "Caveat (рукопись)", api: "Caveat:wght@400;700" },
  { css: '"Marck Script",cursive', label: "Marck Script (рукопись)", api: "Marck+Script" }
];
export function fontsHref() {
  const fams = GOOGLE_FONTS.filter(f => f.api).map(f => "family=" + f.api).join("&");
  return "https://fonts.googleapis.com/css2?" + fams + "&display=swap";
}
// Ссылка только на реально используемые сайтом шрифты (тема + стили блоков + слои холста).
// Экономит загрузку: вместо ~23 семейств тянем 1–3. Для редактора по-прежнему грузим все (fontsHref).
export function fontsUsedHref(site) {
  const used = new Set();
  const t = (site && site.theme) || {};
  [t.fontHead, t.fontBody].forEach(v => v && used.add(v));
  allBlocks(site).forEach(b => {
    const p = b.props || {};
    if (p.st && p.st.font) used.add(p.st.font);
    (p.layers || []).forEach(L => { if (L.font) used.add(L.font); });
  });
  const fams = GOOGLE_FONTS.filter(f => f.api && used.has(f.css)).map(f => "family=" + f.api);
  return fams.length ? "https://fonts.googleapis.com/css2?" + fams.join("&") + "&display=swap" : "";
}
// Разрешаем простую разметку внутри rich-полей, экранируя только опасное
function rich(s) { return String(s == null ? "" : s); }

// Редактируемый текстовый узел
function txt(tag, cls, value, ed, id, field, opt) {
  opt = opt || {};
  const richMode = opt.rich;
  const content = richMode ? rich(value) : esc(value);
  const attrs = ed
    ? ` contenteditable="true" data-eid="${id}" data-field="${field}"${richMode ? ' data-rich="1"' : ""}`
    : "";
  const c = cls ? ` class="${cls}"` : "";
  return `<${tag}${c}${attrs}>${content}</${tag}>`;
}

function img(src, alt, ed, id, field) {
  const hot = ed ? ` data-imgedit="1" data-eid="${id}" data-field="${field}" title="Кликните, чтобы заменить фото"` : "";
  return `<img src="${esc(src)}" alt="${esc(alt || "")}"${hot} />`;
}

// Ссылка кнопки: обычный URL/якорь или переход на страницу (page:<id>)
function linkAttr(link) {
  return (typeof link === "string" && link.indexOf("page:") === 0)
    ? `href="#" data-goto="${esc(link.slice(5))}"`
    : `href="${link ? esc(link) : "#"}"`;
}
function btn(b, cls, radius) {
  const st = radius ? ` style="border-radius:${esc(radius)}"` : "";
  return `<a ${linkAttr(b && b.link)} class="btn ${cls || "btn--solid"}"${st}>${esc(b ? b.text : "Кнопка")}</a>`;
}

/* ---------- Рендер одного блока ---------- */
export function renderBlock(b, ed) {
  const p = b.props || {};
  const id = b.id;
  switch (b.type) {

    case "navbar": {
      const navBg = p.transparent ? "transparent" : (p.bg || "rgba(255,255,255,.82)");
      const navFg = p.fg || "var(--ink)";
      const st = `--nav-max:${p.width || "1080px"};--nav-bg:${navBg};--nav-fg:${navFg};`;
      const navHref = link => (typeof link === "string" && link.indexOf("page:") === 0)
        ? `href="#" data-goto="${esc(link.slice(5))}"`
        : `href="${link ? esc(link) : "#"}"`;
      const links = (p.links || []).map(l =>
        `<a ${navHref(l.link)} class="nav__link">${esc(l.label)}</a>`).join("");
      const cta = p.cta && p.cta.text
        ? `<a ${navHref(p.cta.link)} class="btn btn--solid nav__cta">${esc(p.cta.text)}</a>` : "";
      const logo = p.logo
        ? `<img class="nav__logo" src="${esc(p.logo)}" alt="Логотип"${ed ? ` data-imgedit="1" data-eid="${id}" data-field="logo" title="Заменить логотип"` : ""} />`
        : "";
      const wrapCls = "navwrap" + (p.overlay ? " navwrap--overlay" : "");
      const barCls = ["navbar",
        p.transparent ? "navbar--ghost" : "",
        "nav-h-" + (p.linkHover || "fade"),    // эффект наведения на пункты
        "nav-m-" + (p.menuStyle || "dropdown"),// стиль меню на телефоне
        "nav-a-" + (p.menuAnim || "bounce"),   // анимация появления меню
        "nav-b-" + (p.burger || "morph"),      // вид иконки-бургера
        "nav-s-" + (p.navShape || "pill"),     // форма бара (десктоп)
        p.shrink ? "nav-shrinkable" : ""       // уменьшать при прокрутке
      ].filter(Boolean).join(" ");
      return `<div class="${wrapCls}" data-blk style="${st}">
        <nav class="${barCls}">
          <div class="nav__brandwrap">${logo}${txt("div", "nav__brand", p.brand || "", ed, id, "brand")}</div>
          <button class="nav__burger" type="button" aria-label="Меню" data-navtoggle><span class="nav__bl"></span></button>
          <div class="nav__links">${links}${cta}</div>
        </nav>
      </div>`;
    }

    case "cover": {
      const st = `--cover-h:${p.height || "72vh"};--cover-al:${p.align || "left"};--cover-ov:${p.overlay != null ? p.overlay : .35};`;
      const liveCls = (p.liveBg && !p.videoBg) ? " cover--live" : "";
      const media = p.videoBg
        ? `<video class="cover__vid" autoplay muted loop playsinline preload="auto"${p.image ? ` poster="${esc(p.image)}"` : ""}><source src="${esc(p.videoBg)}" type="video/mp4"></video>`
        : img(p.image, "Обложка", ed, id, "image");
      const bg = `<div class="cover__bg">${media}</div><div class="cover__ov"></div>`;
      if (p.free) {
        const T = p.titlePos || { x: 50, y: 38 }, S = p.subPos || { x: 50, y: 56 }, B = p.btnPos || { x: 50, y: 72 };
        const handle = f => ed ? `<span class="drag-h" data-drag="${id}" data-dfield="${f}" title="Перетащить">✥</span>` : "";
        // Дополнительные свободные тексты со своими эффектами и цветным свечением
        const extras = (p.extras || []).map((L, i) => {
          const pos = L.pos || { x: 50, y: 50 };
          const gz = L.glowSize || 12;
          const glow = L.glow ? `0 0 ${gz}px ${L.glowColor || "#00eaff"},0 0 ${gz * 2}px ${L.glowColor || "#00eaff"}` : "none";
          const est = `color:${L.color || "#ffffff"};font-family:${L.font || "inherit"};font-size:${L.size || 28}px;font-weight:${L.weight || 700};letter-spacing:${L.ls || 0}px;text-align:${L.align || "center"};text-shadow:${glow};line-height:1.2`;
          const eattr = ed ? ` contenteditable="true" data-eid="${id}" data-field="extras.${i}.text"` : "";
          const rz = ed ? `<span class="size-h" data-dsize="${id}" data-didx="${i}" title="Тянуть — менять размер">⤡</span>` : "";
          return `<div class="freeel" style="left:${pos.x}%;top:${pos.y}%">${handle("extras." + i + ".pos")}<div class="cover__extra" style="${est}"${eattr}>${esc(L.text || "")}</div>${rz}</div>`;
        }).join("");
        return `<section class="blk cover cover--free${liveCls}" data-blk style="${st}">
          ${bg}
          <div class="cover__free" data-dragarea="${id}">
            <div class="freeel" style="left:${T.x}%;top:${T.y}%">${handle("titlePos")}${txt("h1", null, p.title || "", ed, id, "title")}</div>
            <div class="freeel" style="left:${S.x}%;top:${S.y}%">${handle("subPos")}${txt("div", "cover__sub", p.subtitle || "", ed, id, "subtitle")}</div>
            <div class="freeel" style="left:${B.x}%;top:${B.y}%">${handle("btnPos")}${btn(p.button, "btn--solid", p.btnRadius)}</div>
            ${extras}
          </div>
        </section>`;
      }
      return `<section class="blk cover${liveCls}" data-blk style="${st}">
        ${bg}
        <div class="wrap">
          ${txt("h1", null, p.title || "", ed, id, "title")}
          ${txt("div", "cover__sub", p.subtitle || "", ed, id, "subtitle")}
          <div>${btn(p.button, "btn--solid", p.btnRadius)}</div>
        </div>
      </section>`;
    }

    case "heading": {
      const st = `--al:${p.align || "center"};`;
      return `<section class="blk heading" data-blk style="${st}">
        <div class="wrap">
          ${txt("h2", null, p.text || "", ed, id, "text")}
          ${p.subtitle || ed ? txt("div", "heading__sub", p.subtitle || "", ed, id, "subtitle") : ""}
        </div>
      </section>`;
    }

    case "text": {
      const st = `--al:${p.align || "left"};--tw:${p.width || "760px"};`;
      return `<section class="blk" data-blk style="${st}">
        <div class="wrap">
          <div class="text">${txt("div", null, p.html || "", ed, id, "html", { rich: true })}</div>
        </div>
      </section>`;
    }

    case "columns": {
      const n = (p.cols || []).length || 2;
      const items = (p.cols || []).map((c, i) =>
        `<div class="colitem">${txt("div", null, c || "", ed, id, "cols." + i, { rich: true })}</div>`
      ).join("");
      return `<section class="blk" data-blk>
        <div class="wrap"><div class="cols cols--${n}">${items}</div></div>
      </section>`;
    }

    case "image": {
      const st = `--iw:${p.width || "100%"};--irad:${p.radius || "2px"};`;
      return `<section class="blk" data-blk style="${st}">
        <div class="wrap"><figure class="single">
          ${img(p.src, p.caption || "Изображение", ed, id, "src")}
          ${p.caption || ed ? txt("figcaption", null, p.caption || "", ed, id, "caption") : ""}
        </figure></div>
      </section>`;
    }

    case "gallery": {
      const cols = p.columns || 2;
      const st = `--gap:${p.gap || "16px"};--ar:${p.ratio || "4/5"};`;
      const imgs = (p.images || []).map((src, i) => img(src, "Фото " + (i + 1), ed, id, "images." + i)).join("");
      return `<section class="blk" data-blk style="${st}">
        <div class="wrap"><div class="gallery gallery--${cols}">${imgs}</div></div>
      </section>`;
    }

    case "pricing": {
      const feats = (p.features || []).map((f, i) =>
        `<li${ed ? ` contenteditable="true" data-eid="${id}" data-field="features.${i}"` : ""}>${esc(f)}</li>`
      ).join("");
      return `<section class="blk" data-blk>
        <div class="wrap"><div class="pricing">
          <div class="pricing__media">${img(p.image, "Тариф", ed, id, "image")}</div>
          ${txt("h3", null, p.title || "", ed, id, "title")}
          <ul>${feats}</ul>
          ${txt("div", "pricing__price", p.price || "", ed, id, "price")}
          ${btn(p.button, "btn--solid", p.btnRadius)}
        </div></div>
      </section>`;
    }

    case "button": {
      const rad = p.radius ? `border-radius:${esc(p.radius)};` : "";
      const la = linkAttr(p.button && p.button.link);
      const cls = p.style === "outline" ? "btn--outline" : "btn--solid";
      const label = esc(p.button ? p.button.text : "Кнопка");
      if (p.free) {
        const x = p.x == null ? 50 : p.x, y = p.y == null ? 20 : p.y;
        return `<section class="blk blk--tight" data-blk>
          <div class="wrap"><div class="freearea" data-dragarea="${id}" style="height:${p.areaH || 140}px">
            <a ${la} class="btn ${cls} freebtn" data-drag="${id}" draggable="false" style="left:${x}%;top:${y}px;${rad}">${label}</a>
          </div></div>
        </section>`;
      }
      const st = `text-align:${p.align || "center"};`;
      return `<section class="blk blk--tight" data-blk>
        <div class="wrap" style="${st}"><a ${la} class="btn ${cls}" style="${rad}">${label}</a></div>
      </section>`;
    }

    case "pricinggroup": {
      const cols = p.columns || 2;
      const cards = (p.cards || []).map((t, ci) => `
        <div class="pricing">
          <div class="pricing__media">${img(t.image, "Тариф", ed, id, "cards." + ci + ".image")}</div>
          ${txt("h3", null, t.title || "", ed, id, "cards." + ci + ".title")}
          <ul>${(t.features || []).map((f, fi) =>
            `<li${ed ? ` contenteditable="true" data-eid="${id}" data-field="cards.${ci}.features.${fi}"` : ""}>${esc(f)}</li>`).join("")}</ul>
          ${txt("div", "pricing__price", t.price || "", ed, id, "cards." + ci + ".price")}
          ${btn(t.button, "btn--solid", p.btnRadius)}
        </div>`).join("");
      return `<section class="blk" data-blk>
        <div class="wrap"><div class="pricegrid pricegrid--${cols}">${cards}</div></div>
      </section>`;
    }

    case "video": {
      let frame = "";
      const url = p.url || "";
      const yt = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
      if (yt) frame = `<iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe>`;
      else if (/\.mp4($|\?)/i.test(url)) frame = `<video src="${esc(url)}" controls></video>`;
      else frame = `<div style="display:flex;align-items:center;justify-content:center;color:#888;height:100%">Вставьте ссылку на видео (YouTube или .mp4)</div>`;
      return `<section class="blk" data-blk>
        <div class="wrap"><div class="video">
          <div class="video__frame">${frame}</div>
          ${p.caption || ed ? txt("figcaption", null, p.caption || "", ed, id, "caption") : ""}
        </div></div>
      </section>`;
    }

    case "social": {
      const st = `--dir:${p.layout === "row" ? "row" : "column"};`;
      const links = (p.links || []).map(l =>
        `<a href="${esc(l.url)}" target="_blank" rel="noopener" class="btn btn--outline">${esc(l.label)}</a>`
      ).join("");
      return `<section class="blk" data-blk style="${st}">
        <div class="wrap"><div class="social">${links}</div></div>
      </section>`;
    }

    case "form": {
      // Форма заявок/регистрации. В редакторе (ed) — контейнер div, чтобы Enter не отправлял;
      // на живом сайте — <form data-siteform>, который ловит FORM_SCRIPT и пишет в Firestore.
      const tag = ed ? "div" : "form";
      const st = `--fw:${p.width || "480px"};--fal:${p.align || "center"};`;
      const fields = (p.fields && p.fields.length) ? p.fields : [{ label: "Имя", type: "text", required: true }];
      const rows = fields.map((f, i) => {
        const type = f.type || "text";
        const req = f.required ? " required" : "";
        const lbl = esc(f.label || ("Поле " + (i + 1)));
        const ph = esc(f.placeholder || "");
        const control = type === "textarea"
          ? `<textarea name="f${i}" data-label="${lbl}" placeholder="${ph}"${req} rows="4"></textarea>`
          : `<input type="${esc(type)}" name="f${i}" data-label="${lbl}" placeholder="${ph}"${req} />`;
        return `<label class="formrow"><span class="formrow__lb">${lbl}${f.required ? " <b>*</b>" : ""}</span>${control}</label>`;
      }).join("");
      const submit = esc((p.button && p.button.text) || "Отправить");
      const ok = esc(p.success || "Спасибо! Заявка отправлена.");
      const titleHtml = (p.title || ed) ? txt("h3", "siteform__title", p.title || "", ed, id, "title") : "";
      const subHtml = (p.subtitle || ed) ? txt("div", "siteform__sub", p.subtitle || "", ed, id, "subtitle") : "";
      return `<section class="blk" data-blk style="${st}">
        <div class="wrap"><${tag} class="siteform"${ed ? "" : " data-siteform novalidate"}>
          ${titleHtml}${subHtml}
          <div class="siteform__fields">${rows}</div>
          <button type="submit" class="btn btn--solid siteform__btn"${ed ? " disabled" : ""}>${submit}</button>
          <div class="siteform__msg" data-formok hidden>${ok}</div>
        </${tag}></div>
      </section>`;
    }

    case "marquee": {
      const phrase = esc(p.text || "Бегущая строка •");
      const half = Array(8).fill(`<span class="marquee__item">${phrase}</span>`).join("");
      const dir = p.direction === "right" ? " marquee--right" : "";
      const st = `--mq-dur:${p.speed || 20}s;--mq-size:${esc(p.size || "30px")};`;
      return `<section class="blk blk--tight" data-blk><div class="marquee${dir}" style="${st}">
        <div class="marquee__track">${half}${half}</div></div></section>`;
    }

    case "countdown": {
      const targetMs = p.target ? new Date(p.target).getTime() : 0;
      const L = p.labels || {};
      const unit = (k, lb) => `<div class="cd__unit"><span class="cd__num" data-cd="${k}">00</span><span class="cd__lb">${esc(lb)}</span></div>`;
      return `<section class="blk" data-blk><div class="wrap"><div class="countdown" data-countdown="${targetMs}" data-done="${esc(p.finished || "Время вышло!")}">
        ${unit("d", L.d || "дней")}${unit("h", L.h || "часов")}${unit("m", L.m || "минут")}${unit("s", L.s || "секунд")}
      </div></div></section>`;
    }

    case "counter": {
      const cols = p.columns || 3;
      const cards = (p.items || []).map(it =>
        `<div class="counter"><div class="counter__num" data-count="${esc(it.value || 0)}" data-prefix="${esc(it.prefix || "")}" data-suffix="${esc(it.suffix || "")}">${esc(it.prefix || "")}0${esc(it.suffix || "")}</div><div class="counter__lb">${esc(it.label || "")}</div></div>`
      ).join("");
      return `<section class="blk" data-blk><div class="wrap"><div class="countergrid countergrid--${cols}">${cards}</div></div></section>`;
    }

    case "photostack": {
      const imgs = (p.images || []).slice(0, 10);
      const n = imgs.length || 1;
      const cls = "pstack" + (ed ? " pstack--edit" : "");
      const items = imgs.map((src, i) =>
        `<div class="pstack__ph" style="--i:${i};--n:${n}">${img(src, "Фото " + (i + 1), ed, id, "images." + i)}</div>`).join("");
      return `<section class="blk" data-blk><div class="wrap"><div class="${cls}" data-pstack tabindex="0">
        ${items}${ed ? "" : `<div class="pstack__hint">нажмите, затем листайте</div>`}
      </div></div></section>`;
    }

    case "scrollstack": {
      // Веер фото: сложены стопкой, разъезжаются по мере прокрутки (эффект на скролле).
      const imgs = (p.images || []).slice(0, 8);
      const n = imgs.length || 1;
      const spread = p.spread != null ? p.spread : 180;
      const angle = p.angle != null ? p.angle : 8;
      const st = `--ss-h:${p.height || 460}px;--ss-w:${p.width || 280}px;`;
      const c = (n - 1) / 2;
      // Базовый трансформ — «раскрытый» веер: так блок красиво выглядит в редакторе (скрипт не запущен),
      // а на живом сайте SCROLLSTACK_SCRIPT пересчитывает его по положению в экране.
      const items = imgs.map((src, i) => {
        const off = i - c;
        const tf = `translate(-50%,-50%) translate(${(off * spread).toFixed(1)}px,${(-Math.abs(off) * 14).toFixed(1)}px) rotate(${(off * angle).toFixed(2)}deg)`;
        const z = 100 - Math.abs(Math.round(off * 10));
        return `<div class="scrollstack__ph" style="transform:${tf};z-index:${z}">${img(src, "Фото " + (i + 1), ed, id, "images." + i)}</div>`;
      }).join("");
      return `<section class="blk" data-blk><div class="wrap"><div class="scrollstack" data-scrollstack data-spread="${spread}" data-angle="${angle}" style="${st}">${items}</div></div></section>`;
    }

    case "swipestack": {
      // Колода фото: свайп верхнего фото вверх жестом — оно улетает, следующее поднимается снизу.
      const imgs = (p.images || []).slice(0, 12);
      const peek = p.peek != null ? p.peek : 26;
      const st = `--sw-h:${p.height || 520}px;--sw-w:${p.width || 320}px;`;
      const cards = imgs.map((src, i) => {
        const jx = i === 0 ? 0 : CHAOS_X[i % 12], jr = i === 0 ? 0 : CHAOS_R[i % 12];
        const tf = `translate(calc(-50% + ${jx}px),calc(-50% + ${i * peek}px)) rotate(${jr}deg) scale(${(1 - i * 0.05).toFixed(3)})`;
        const op = i < 5 ? 1 : 0;
        return `<div class="swst__card" style="transform:${tf};z-index:${100 - i};opacity:${op}">${img(src, "Фото " + (i + 1), ed, id, "images." + i)}</div>`;
      }).join("");
      return `<section class="blk" data-blk><div class="wrap"><div class="swst" data-swipestack data-peek="${peek}" style="${st}">${cards}${ed ? "" : `<div class="swst__hint">↑ свайп вверх</div>`}</div></div></section>`;
    }

    case "buildstack": {
      // Обратная колода: свайп добавляет фото — они появляются и ложатся сверху хаотично.
      const imgs = (p.images || []).slice(0, 12);
      const n = imgs.length || 1;
      const st = `--sw-h:${p.height || 520}px;--sw-w:${p.width || 320}px;`;
      const cards = imgs.map((src, i) => {
        const jx = CHAOS_X[i % 12], jr = CHAOS_R[i % 12];
        const tf = `translate(calc(-50% + ${jx}px),calc(-50% + ${-i * 3}px)) rotate(${jr}deg)`;
        // В редакторе показываем всю стопку собранной; на сайте по умолчанию видно только первое фото.
        const op = ed ? 1 : (i === 0 ? 1 : 0);
        return `<div class="bust__card" style="transform:${tf};z-index:${10 + i};opacity:${op}">${img(src, "Фото " + (i + 1), ed, id, "images." + i)}</div>`;
      }).join("");
      return `<section class="blk" data-blk><div class="wrap"><div class="bust" data-buildstack style="${st}">${cards}${ed ? "" : `<div class="swst__hint">↑ свайп — добавить фото</div>`}</div></div></section>`;
    }

    case "map": {
      const q = encodeURIComponent(p.address || "Москва, Красная площадь");
      const src = p.embed ? esc(p.embed) : `https://maps.google.com/maps?q=${q}&z=${p.zoom || 15}&output=embed`;
      const st = `--map-h:${esc(p.height || "420px")};--map-rad:${esc(p.radius || "16px")};`;
      return `<section class="blk" data-blk style="${st}"><div class="wrap"><div class="mapwrap">
        <iframe class="mapframe" src="${src}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div></div></section>`;
    }

    case "embed": {
      // Свой HTML/виджет. В редакторе — заглушка (не запускаем чужие скрипты), на сайте — как есть.
      if (ed) {
        return `<section class="blk" data-blk><div class="wrap"><div class="embed-ph">
          <div class="embed-ph__ic">🧩</div>
          <div class="embed-ph__t">Свой HTML / встраивание</div>
          <small>${p.html ? "Код вставлен. Виден на опубликованном сайте и в «Просмотр ↗»." : "Вставьте код в панели справа →"}</small>
        </div></div></section>`;
      }
      return `<section class="blk" data-blk><div class="wrap"><div class="embed">${p.html || ""}</div></div></section>`;
    }

    case "spacer": {
      return `<section class="blk--tight" data-blk><div class="spacer" style="--h:${p.size || "60px"}"></div></section>`;
    }

    case "canvas": {
      const h = p.height || 480;
      const areaCls = "canvasarea" + (p.full ? " canvasarea--full" : "");
      const cbg = p.bg
        ? `<div class="canvas__bg">${img(p.bg, "Фон", ed, id, "bg")}</div><div class="canvas__ov" style="background:rgba(0,0,0,${p.overlay != null ? p.overlay : .35})"></div>`
        : "";
      const layers = (p.layers || []).map((L, i) => {
        const tf = `translate(-50%,-50%) rotate(${L.rot || 0}deg)`;
        const base = `left:${L.x != null ? L.x : 50}%;top:${L.y != null ? L.y : 50}%;width:${L.w || 220}px;transform:${tf};z-index:${i + 1}`;
        const hs = ed ? `<span class="ch ch-move" data-lh="move"></span><span class="ch ch-rotate" data-lh="rotate"></span><span class="ch ch-resize" data-lh="resize"></span>` : "";
        if (L.type === "text") {
          const glow = L.glow ? `0 0 ${L.glowSize || 10}px ${L.glowColor || "#00eaff"},0 0 ${(L.glowSize || 10) * 2}px ${L.glowColor || "#00eaff"}` : "none";
          const ts = `${base};color:${L.color || "#ffffff"};font-family:${L.font || "inherit"};font-size:${L.size || 26}px;font-weight:${L.weight || 600};letter-spacing:${L.ls || 0}px;text-align:${L.align || "center"};text-shadow:${glow};line-height:1.2`;
          const inner = ed
            ? `<div class="cltext" contenteditable="true" data-ltext="${L.id}">${esc(L.text || "")}</div>`
            : `<div class="cltext">${esc(L.text || "")}</div>`;
          return `<div class="clayer clayer--text" data-lid="${L.id}" style="${ts}">${inner}${hs}</div>`;
        }
        const glow = L.glow ? `box-shadow:0 0 ${L.glowSize || 20}px ${L.glowColor || "#00eaff"},0 0 ${(L.glowSize || 20) * 2}px ${L.glowColor || "#00eaff"};` : "";
        const border = L.border ? `border:${L.borderW || 3}px solid ${L.borderColor || "#00eaff"};` : "";
        return `<div class="clayer" data-lid="${L.id}" style="${base};border-radius:${L.radius || 0}px;${glow}${border}overflow:hidden">
          <img src="${esc(L.src || "")}" alt="Фото" style="border-radius:${L.radius || 0}px" />${hs}</div>`;
      }).join("");
      return `<section class="blk canvas-blk" data-blk><div class="${areaCls}" data-canvas="${id}" style="height:${h}px">${cbg}${layers}</div></section>`;
    }

    default:
      return `<section class="blk" data-blk><div class="wrap">Неизвестный блок: ${esc(b.type)}</div></section>`;
  }
}

/* ---------- Стиль темы в переменных ---------- */
export function themeVars(t) {
  t = t || {};
  return [
    `--bg:${t.bg || "#ffffff"}`,
    `--surface:${t.surface || "#f4f2ef"}`,
    `--ink:${t.ink || "#16150f"}`,
    `--muted:${t.muted || "#6b6a66"}`,
    `--accent:${t.accent || "#16150f"}`,
    `--accent-ink:${t.accentInk || "#ffffff"}`,
    `--line:${t.line || "#dcd9d4"}`,
    `--maxw:${t.maxw || "1080px"}`,
    `--font-head:${t.fontHead || '"Oswald",sans-serif'}`,
    `--font-body:${t.fontBody || '"Montserrat",system-ui,sans-serif'}`,
    `--img-filter:${t.grayscale === false ? "none" : "grayscale(100%)"}`,
    `--cover-filter:${t.grayscale === false ? "none" : "grayscale(100%) contrast(1.05)"}`,
    `--btn-radius:${t.btnRadius || "0px"}`
  ].join(";");
}

/* ---------- Обёртка анимации появления ---------- */
// a === "" или undefined  → берём эффект из темы (по умолчанию все блоки анимируются)
// a === "none"            → без анимации для этого блока
export function wrapAnim(b, html, theme) {
  if (b.type === "navbar") return html; // sticky-навбар не анимируем
  const p = b.props || {};
  let a = p.anim;
  if (a === undefined || a === "") a = (theme && theme.animDefault) || "up";
  if (!a || a === "none") return html;
  const delay = p.animDelay ? ` style="--anim-delay:${esc(p.animDelay)}"` : "";
  return `<div data-anim="${esc(a)}"${delay}>${html}</div>`;
}

// Скрипт, проявляющий блоки при попадании в экран
const ANIM_SCRIPT = `<script>(function(){var e=document.querySelectorAll('[data-anim]');if(!e.length)return;if(!('IntersectionObserver'in window)){e.forEach(function(x){x.classList.add('anim-in')});return;}var o=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('anim-in');o.unobserve(x.target);}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});e.forEach(function(x){o.observe(x)});})();</script>`;

// Меню навбара (бургер) + плавная прокрутка к якорям (надёжно на телефоне)
const NAV_SCRIPT = `<script>document.addEventListener('click',function(e){
var b=e.target.closest('[data-navtoggle]');
if(b){var n=b.closest('.navbar');if(n)n.classList.toggle('nav-open');return;}
var link=e.target.closest('a[href^="#"]');
if(link){
  var id=link.getAttribute('href').slice(1);
  var el=id?document.getElementById(id):null;
  if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}
  var nav=link.closest('.navbar');if(nav)nav.classList.remove('nav-open');
}
});
(function(){var last=-1;function on(){var s=(window.scrollY||0)>24;if(s===last)return;last=s;
document.querySelectorAll('.navbar').forEach(function(n){n.classList.toggle('nav-scrolled',s);});}
window.addEventListener('scroll',on,{passive:true});on();})();</script>`;

// Скрипт отправки заявок форм в Firestore (sites/{id}/submissions).
// Встраивается только когда на сайте есть блок «Форма» и известен siteId.
function formScript(siteId) {
  return `<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
var app = initializeApp({apiKey:"AIzaSyCZreNqg8l1jMSDh-q5cxjpijSO3vh5prk",authDomain:"meelleniumsoft.firebaseapp.com",projectId:"meelleniumsoft",storageBucket:"meelleniumsoft.firebasestorage.app",messagingSenderId:"33715273291",appId:"1:33715273291:web:ff93531d189e375d92d7ce"});
var db = getFirestore(app);
var SITE = ${JSON.stringify(siteId || "")};
document.querySelectorAll('form[data-siteform]').forEach(function(f){
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    if(!SITE){ alert('Форма ещё не привязана к сайту. Опубликуйте сайт из конструктора.'); return; }
    var btn=f.querySelector('[type=submit]'); var lbl=btn?btn.textContent:'';
    if(btn){ btn.disabled=true; btn.textContent='Отправляем…'; }
    var fields={};
    f.querySelectorAll('[data-label]').forEach(function(el){ fields[el.getAttribute('data-label')]=el.value; });
    try{
      await addDoc(collection(db,'sites',SITE,'submissions'),{ fields:fields, createdMs:Date.now(), createdAt:serverTimestamp(), page:location.href });
      var ok=f.querySelector('[data-formok]'); if(ok){ ok.hidden=false; }
      f.querySelectorAll('input,textarea').forEach(function(el){ el.value=''; });
    }catch(err){ alert('Не удалось отправить: '+((err&&err.message)||err)); }
    if(btn){ btn.disabled=false; btn.textContent=lbl; }
  });
});
</script>`;
}
// Обёртка видимости: скрыть блок на телефоне (на живом сайте; в редакторе показываем с пометкой)
export function wrapVisibility(b, html) {
  return (b.props && b.props.hideMob) ? `<div class="hide-mob">${html}</div>` : html;
}

// Эффекты, привязанные к прокрутке (вращение, параллакс, масштаб, сдвиг, 3D). Своя обёртка, чтобы
// не конфликтовать с анимацией появления. Трансформ считает SCROLL_FX_SCRIPT по позиции в экране.
export function wrapScrollFx(b, html) {
  const f = b.props && b.props.scrollFx;
  if (!f || !f.type || f.type === "none") return html;
  const s = f.str != null ? f.str : 1;
  return `<div class="sfx" data-sfx="${esc(f.type)}" data-str="${esc(s)}">${html}</div>`;
}
// Скрипт: на каждый кадр прокрутки пересчитывает трансформ элементов [data-sfx] по их месту в экране.
const SCROLL_FX_SCRIPT = `<script>(function(){
var els=[].slice.call(document.querySelectorAll('[data-sfx]'));if(!els.length)return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var tick=false;
function upd(){tick=false;var vh=window.innerHeight||1;
els.forEach(function(el){var r=el.getBoundingClientRect();var c=r.top+r.height/2;var p=(vh/2-c)/vh;
var s=parseFloat(el.getAttribute('data-str'))||1;var t=el.getAttribute('data-sfx');var tf='';
if(t==='parallax')tf='translateY('+(p*90*s).toFixed(1)+'px)';
else if(t==='rotate')tf='rotate('+(p*120*s).toFixed(1)+'deg)';
else if(t==='scale')tf='scale('+(1+p*0.35*s).toFixed(3)+')';
else if(t==='driftx')tf='translateX('+(p*140*s).toFixed(1)+'px)';
else if(t==='rotate3d')tf='perspective(900px) rotateY('+(p*70*s).toFixed(1)+'deg)';
el.style.transform=tf;});}
function onScroll(){if(!tick){tick=true;requestAnimationFrame(upd);}}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);upd();
})();</script>`;

// Таймер обратного отсчёта
const COUNTDOWN_SCRIPT = `<script>(function(){var els=[].slice.call(document.querySelectorAll('[data-countdown]'));if(!els.length)return;
function pad(n){return(n<10?'0':'')+n;}
function upd(){els.forEach(function(el){var t=+el.getAttribute('data-countdown');var diff=t-Date.now();
if(diff<=0){el.innerHTML='<div class="cd__done">'+(el.getAttribute('data-done')||'')+'</div>';return;}
var d=Math.floor(diff/864e5),h=Math.floor(diff/36e5)%24,m=Math.floor(diff/6e4)%60,s=Math.floor(diff/1e3)%60;
var q=function(k){return el.querySelector('[data-cd="'+k+'"]');};
if(q('d'))q('d').textContent=pad(d);if(q('h'))q('h').textContent=pad(h);if(q('m'))q('m').textContent=pad(m);if(q('s'))q('s').textContent=pad(s);});}
upd();setInterval(upd,1000);})();</script>`;

// Счётчик-цифры (анимация подсчёта при появлении в экране)
const COUNTER_SCRIPT = `<script>(function(){var els=[].slice.call(document.querySelectorAll('[data-count]'));if(!els.length)return;
function run(el){var to=parseFloat(el.getAttribute('data-count'))||0;var pre=el.getAttribute('data-prefix')||'';var suf=el.getAttribute('data-suffix')||'';
var dur=1400,st=null;function step(ts){if(!st)st=ts;var pr=Math.min(1,(ts-st)/dur);var ease=1-Math.pow(1-pr,3);
var val=to*ease;var out=(to%1===0)?Math.round(val):val.toFixed(1);el.textContent=pre+out.toLocaleString('ru-RU')+suf;
if(pr<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
if(!('IntersectionObserver'in window)){els.forEach(run);return;}
var o=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){run(x.target);o.unobserve(x.target);}})},{threshold:.4});
els.forEach(function(e){o.observe(e);});})();</script>`;

// Стопка фото: клик раскрывает в 3D-карусель (цилиндр), листается свайпом/перетаскиванием
const PSTACK_SCRIPT = `<script>document.querySelectorAll('[data-pstack]').forEach(function(st){
var phs=[].slice.call(st.querySelectorAll('.pstack__ph'));if(!phs.length)return;
var n=phs.length,cur=0,open=false,drag=false,sx=0,scur=0,W=1,moved=false;
function render(){phs.forEach(function(el,i){var off=i-cur,a=Math.abs(off);
var rot=Math.max(-2,Math.min(2,off))*-40;var tx=off*52,tz=-a*130,sc=Math.max(.55,1-a*0.14);
el.style.transform='translate(-50%,-50%) translateX('+tx+'%) translateZ('+tz+'px) rotateY('+rot+'deg) scale('+sc.toFixed(3)+')';
el.style.opacity=a>2.6?'0':'1';el.style.zIndex=String(120-Math.round(a*12));el.style.pointerEvents=a>2.6?'none':'auto';});}
function snap(){cur=Math.max(0,Math.min(n-1,Math.round(cur)));st.classList.remove('dragging');render();}
function openIt(){open=true;st.classList.add('is-open');cur=0;render();}
st.addEventListener('click',function(e){if(!open){openIt();return;}if(moved){moved=false;return;}
var ph=e.target.closest('.pstack__ph');if(ph){var i=phs.indexOf(ph);if(i>-1){cur=i;snap();}}});
function down(x){if(!open)return;drag=true;moved=false;sx=x;scur=cur;W=st.getBoundingClientRect().width||300;st.classList.add('dragging');}
function move(x){if(!drag)return;var dx=x-sx;if(Math.abs(dx)>4)moved=true;cur=scur-dx/(W*0.5);render();}
function up(){if(!drag)return;drag=false;snap();}
st.addEventListener('touchstart',function(e){down(e.touches[0].clientX);},{passive:true});
st.addEventListener('touchmove',function(e){if(drag){e.preventDefault();move(e.touches[0].clientX);}},{passive:false});
st.addEventListener('touchend',up);
st.addEventListener('mousedown',function(e){e.preventDefault();down(e.clientX);});
window.addEventListener('mousemove',function(e){move(e.clientX);});
window.addEventListener('mouseup',up);
});</script>`;

// Веер фото на скролле: фото разъезжаются, когда блок в центре экрана, и собираются на краях.
const SCROLLSTACK_SCRIPT = `<script>(function(){
var wraps=[].slice.call(document.querySelectorAll('[data-scrollstack]'));if(!wraps.length)return;
var tick=false;
function upd(){tick=false;var vh=window.innerHeight||1;
wraps.forEach(function(w){var phs=[].slice.call(w.querySelectorAll('.scrollstack__ph'));var n=phs.length;if(!n)return;
var r=w.getBoundingClientRect();var cy=r.top+r.height/2;var d=(vh/2-cy)/(vh*0.6);
var prog=Math.max(0,Math.min(1,1-Math.abs(d)));
var spread=parseFloat(w.getAttribute('data-spread'))||180;var angle=parseFloat(w.getAttribute('data-angle'))||8;
var c=(n-1)/2;
phs.forEach(function(el,i){var off=i-c;
var tx=off*spread*prog;var ty=-Math.abs(off)*14*prog;var rot=off*angle*prog;
el.style.transform='translate(-50%,-50%) translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg)';
el.style.zIndex=String(100-Math.abs(Math.round(off*10)));});});}
function onS(){if(!tick){tick=true;requestAnimationFrame(upd);}}
window.addEventListener('scroll',onS,{passive:true});window.addEventListener('resize',onS);upd();
})();</script>`;

// Свайп-колода фото: тянешь верхнее фото вверх — улетает, колода поднимается снизу (по кругу).
const SWIPESTACK_SCRIPT = `<script>(function(){
[].slice.call(document.querySelectorAll('[data-swipestack]')).forEach(function(st){
var cards=[].slice.call(st.querySelectorAll('.swst__card'));var n=cards.length;if(n<2)return;
var peek=parseFloat(st.getAttribute('data-peek'))||26;var order=cards.slice();
var R=[-5,4,-3,6,-4,5,-6,3,-2,5,-4,2],X=[0,7,-6,5,-8,6,-5,8,-4,7,-6,4];
function layout(anim){order.forEach(function(c,rel){
c.style.transition=anim?'transform .38s cubic-bezier(.22,.7,.3,1),opacity .38s':'none';
c.style.zIndex=String(100-rel);
var jx=rel===0?0:X[rel%12],jr=rel===0?0:R[rel%12];
c.style.transform='translate(calc(-50% + '+jx+'px),calc(-50% + '+(rel*peek)+'px)) rotate('+jr+'deg) scale('+(1-rel*0.05).toFixed(3)+')';
c.style.opacity=rel<5?'1':'0';c.style.pointerEvents=rel===0?'auto':'none';});}
layout(false);
var top=null,sy=0,dy=0,drag=false;
function down(y){top=order[0];drag=true;dy=0;sy=y;top.style.transition='none';}
function move(y,ev){if(!drag)return;dy=y-sy;var up=Math.min(0,dy);
top.style.transform='translate(-50%,calc(-50% + '+up+'px)) rotate('+(dy*0.02).toFixed(2)+'deg)';
if(ev&&ev.cancelable)ev.preventDefault();}
function up(){if(!drag)return;drag=false;
if(dy<-70){top.style.transition='transform .3s ease,opacity .3s';
top.style.transform='translate(-50%,calc(-50% - 150%)) rotate('+(dy*0.02).toFixed(2)+'deg)';top.style.opacity='0';
setTimeout(function(){order.push(order.shift());layout(true);},180);}else{layout(true);}}
st.addEventListener('mousedown',function(e){if(e.button)return;e.preventDefault();down(e.clientY);});
window.addEventListener('mousemove',function(e){move(e.clientY,e);});
window.addEventListener('mouseup',up);
st.addEventListener('touchstart',function(e){down(e.touches[0].clientY);},{passive:true});
st.addEventListener('touchmove',function(e){move(e.touches[0].clientY,e);},{passive:false});
st.addEventListener('touchend',up);
});})();</script>`;

// Сборка колоды свайпом: старт с 1 фото, каждый свайп добавляет следующее с эффектом появления.
const BUILDSTACK_SCRIPT = `<script>(function(){
var R=[-5,4,-3,6,-4,5,-6,3,-2,5,-4,2],X=[0,7,-6,5,-8,6,-5,8,-4,7,-6,4];
[].slice.call(document.querySelectorAll('[data-buildstack]')).forEach(function(st){
var cards=[].slice.call(st.querySelectorAll('.bust__card'));var n=cards.length;if(!n)return;var shown=1;
function rest(i){return 'translate(calc(-50% + '+X[i%12]+'px),calc(-50% + '+(-i*3)+'px)) rotate('+R[i%12]+'deg)';}
function layout(newi){cards.forEach(function(c,i){c.style.zIndex=String(10+i);
if(i<shown){
 if(i===newi){c.style.transition='none';c.style.opacity='0';c.style.transform='translate(-50%,calc(-50% + 70px)) scale(.6) rotate(0deg)';
   requestAnimationFrame(function(){requestAnimationFrame(function(){
   c.style.transition='transform .55s cubic-bezier(.2,.85,.3,1.25),opacity .4s';c.style.transform=rest(i);c.style.opacity='1';});});}
 else{c.style.transition='transform .4s ease,opacity .4s';c.style.transform=rest(i);c.style.opacity='1';}
}else{c.style.transition='none';c.style.opacity='0';c.style.transform=rest(i)+' scale(.6)';}});}
layout(-1);
var sy=0,dy=0,drag=false;
function down(y){drag=true;dy=0;sy=y;}
function move(y,ev){if(!drag)return;dy=y-sy;if(ev&&ev.cancelable&&Math.abs(dy)>4)ev.preventDefault();}
function up(){if(!drag)return;drag=false;if(dy<-60){if(shown<n){shown++;layout(shown-1);}else{shown=1;layout(-1);}}}
st.addEventListener('mousedown',function(e){if(e.button)return;down(e.clientY);});
window.addEventListener('mousemove',function(e){move(e.clientY,e);});window.addEventListener('mouseup',up);
st.addEventListener('touchstart',function(e){down(e.touches[0].clientY);},{passive:true});
st.addEventListener('touchmove',function(e){move(e.touches[0].clientY,e);},{passive:false});
st.addEventListener('touchend',up);
});})();</script>`;

// Обёртка с якорем (id) для ссылок-прокрутки
export function wrapAnchor(b, html) {
  const a = b.props && b.props.anchor;
  if (!a) return html;
  return `<div id="${esc(String(a).replace(/^#/, ""))}" class="anchor">${html}</div>`;
}

/* ---------- Обёртка «Стиль и эффекты» (фон, тени, неон, стекло, типографика) ---------- */
export function wrapStyle(b, html) {
  if (b.type === "navbar") return html;
  const s = b.props && b.props.st;
  if (!s) return html;
  const cls = ["sblk"], wrap = [], bg = [], vars = [];
  let hasBg = false;

  if (s.bgType === "color" && s.bgColor) { bg.push("background:" + s.bgColor); hasBg = true; }
  else if (s.bgType === "gradient") { bg.push(`background:linear-gradient(${s.gradAngle || 135}deg,${s.gradFrom || "#6a11cb"},${s.gradTo || "#2575fc"})`); hasBg = true; }
  else if (s.bgType === "neon") { bg.push(`background:linear-gradient(${s.gradAngle || 135}deg,${s.neonFrom || "#ff00e6"},${s.neonTo || "#00eaff"})`); hasBg = true; }
  else if (s.bgType === "image" && s.bgImage) { bg.push(`background:center/cover no-repeat url("${esc(s.bgImage)}")`); hasBg = true; }
  if (hasBg) {
    if (s.bgBlur) bg.push("filter:blur(" + s.bgBlur + "px)");
    if (s.bgOpacity != null) bg.push("opacity:" + s.bgOpacity);
  }
  const overlay = hasBg ? (s.bgOverlay || 0) : 0;

  if (s.radius) { wrap.push("border-radius:" + s.radius + "px"); cls.push("sblk--clip"); }
  if (s.opacity != null) wrap.push("opacity:" + s.opacity);
  const shadows = [];
  if (s.shadow === "soft") shadows.push("0 8px 24px rgba(0,0,0,.14)");
  else if (s.shadow === "medium") shadows.push("0 16px 40px rgba(0,0,0,.24)");
  else if (s.shadow === "hard") shadows.push("0 26px 60px rgba(0,0,0,.42)");
  if (s.glow) { const c = s.glowColor || "#00eaff", z = s.glowSize || 24; shadows.push(`0 0 ${z}px ${c},0 0 ${z * 2}px ${c}`); }
  if (shadows.length) wrap.push("box-shadow:" + shadows.join(","));
  if (s.photoNeon) {
    cls.push("sblk--photoneon");
    vars.push("--sb-pn-c:" + (s.photoNeonColor || "#d000ff"));
    vars.push("--sb-pn-w:" + (s.photoNeonWidth != null ? s.photoNeonWidth : 3) + "px");
    vars.push("--sb-pn-g:" + (s.photoNeonGlow != null ? s.photoNeonGlow : 18) + "px");
  }
  if (s.motion && s.motion !== "none") {
    cls.push("sblk--motion", "sblk--m-" + s.motion);
    vars.push("--sb-mdur:" + (s.motionDur != null ? s.motionDur : 3) + "s");
  }
  if (s.glass) cls.push("sblk--glass");
  if (s.hover && s.hover !== "none") { cls.push("sblk--h-" + s.hover); if (s.hover === "glow") vars.push("--sb-hglow:" + (s.glowColor || "#00eaff")); }

  if (s.font) { cls.push("sblk--font"); vars.push("--font-head:" + s.font, "--sb-font:" + s.font); }
  if (s.textColor) { cls.push("sblk--tc"); vars.push("--sb-color:" + s.textColor); }
  if (s.letterSpacing !== "" && s.letterSpacing != null) { cls.push("sblk--ls"); vars.push("--sb-ls:" + s.letterSpacing + "px"); }
  if (s.lineHeight !== "" && s.lineHeight != null) { cls.push("sblk--lh"); vars.push("--sb-lh:" + s.lineHeight); }
  if (s.textGlow) { cls.push("sblk--tglow"); const c = s.textGlowColor || "#00eaff", z = s.textGlowSize || 10; vars.push(`--sb-tsh:0 0 ${z}px ${c},0 0 ${z * 2}px ${c}`); }

  const bgLayer = hasBg ? `<div class="sblk__bg" style="${bg.join(";")}"></div>` : "";
  const ovLayer = overlay ? `<div class="sblk__ov" style="background:rgba(0,0,0,${overlay})"></div>` : "";
  return `<div class="${cls.join(" ")}" style="${wrap.concat(vars).join(";")}">${bgLayer}${ovLayer}<div class="sblk__in">${html}</div></div>`;
}

/* ---------- Список страниц (совместимо со старым одностраничным форматом) ---------- */
function sitePages(site) {
  if (site.pages && site.pages.length) return site.pages;
  return [{ id: "main", name: "Главная", blocks: site.blocks || [] }];
}
// Все блоки всех страниц — для подсчёта используемых шрифтов и нужных скриптов
function allBlocks(site) {
  return sitePages(site).reduce((a, pg) => a.concat(pg.blocks || []), []);
}

/* ---------- Тело сайта ---------- */
function renderBlockList(blocks, theme) {
  return (blocks || []).map(b => wrapVisibility(b, wrapAnchor(b, wrapStyle(b, wrapAnim(b, wrapScrollFx(b, renderBlock(b, false)), theme))))).join("\n");
}
export function renderBody(site) {
  const t = themeVars(site.theme);
  const pages = sitePages(site);
  if (pages.length === 1) {
    return `<div class="site" style="${t}">${renderBlockList(pages[0].blocks, site.theme)}</div>`;
  }
  const html = pages.map((pg, i) =>
    `<div class="site-page" data-pageid="${esc(pg.id)}"${i ? " hidden" : ""}>${renderBlockList(pg.blocks, site.theme)}</div>`).join("");
  return `<div class="site" style="${t}">${html}</div>`;
}

// Роутер многостраничного сайта: переключает .site-page по ссылкам [data-goto] и по hash (#!id)
const ROUTER_SCRIPT = `<script>(function(){
var pages=[].slice.call(document.querySelectorAll('.site-page'));if(pages.length<2)return;
function show(id){var ok=false;pages.forEach(function(p){var on=p.getAttribute('data-pageid')===id;p.hidden=!on;if(on)ok=true;});
if(!ok)pages.forEach(function(p,i){p.hidden=i!==0;});window.scrollTo(0,0);}
function fromHash(){var h=location.hash||'';if(h.indexOf('#!')===0)show(decodeURIComponent(h.slice(2)));else show(pages[0].getAttribute('data-pageid'));}
document.addEventListener('click',function(e){var a=e.target.closest('[data-goto]');if(!a)return;e.preventDefault();
var id=a.getAttribute('data-goto');show(id);try{history.replaceState(null,'','#!'+encodeURIComponent(id));}catch(_){}});
window.addEventListener('hashchange',fromHash);fromHash();
})();</script>`;

/* ---------- Подстановка фото: imgref:ID -> data-URL из карты ---------- */
export function resolveImages(obj, map) {
  map = map || {};
  if (Array.isArray(obj)) return obj.map(x => resolveImages(x, map));
  if (obj && typeof obj === "object") {
    const o = {};
    for (const k in obj) o[k] = resolveImages(obj[k], map);
    return o;
  }
  if (typeof obj === "string" && obj.indexOf("imgref:") === 0) {
    return map[obj.slice(7)] || "";
  }
  return obj;
}

/* ---------- Плавающая кнопка связи (сквозная, на всех страницах) ---------- */
const WA_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.1.1.6-.1 1.4Z"/></svg>';
const TG_SVG = '<svg viewBox="0 0 24 24"><path d="M9.8 15.6 9.6 19c.4 0 .6-.2.8-.4l1.9-1.8 4 2.9c.7.4 1.3.2 1.5-.7l2.7-12.6c.3-1.1-.4-1.6-1.1-1.3L2.6 9.5c-1.1.4-1.1 1-.2 1.3l4.3 1.3 9.9-6.2c.5-.3.9-.1.5.2Z"/></svg>';
function contactWidget(site) {
  const c = site.contact || {};
  const items = [];
  if (c.whatsapp) items.push({ cls: "whatsapp", href: "https://wa.me/" + String(c.whatsapp).replace(/[^0-9]/g, ""), ic: WA_SVG });
  if (c.telegram) items.push({ cls: "telegram", href: "https://t.me/" + String(c.telegram).replace(/^@/, ""), ic: TG_SVG });
  if (c.phone) items.push({ cls: "phone", href: "tel:" + String(c.phone).replace(/[^0-9+]/g, ""), ic: "☎" });
  if (c.email) items.push({ cls: "email", href: "mailto:" + esc(c.email), ic: "✉" });
  if (!items.length) return "";
  const pos = c.position === "left" ? "left" : "right";
  const btns = items.map(it => `<a class="fab fab--${it.cls}" href="${it.href}" target="_blank" rel="noopener" aria-label="${it.cls}">${it.ic}</a>`).join("");
  return `<div class="fabwrap fabwrap--${pos}">${btns}</div>`;
}

/* ---------- Полный документ (для предпросмотра и экспорта) ---------- */
// opts.siteId — id сайта в облаке; нужен, чтобы формы слали заявки в нужную коллекцию.
export function renderSiteDoc(site, opts) {
  opts = opts || {};
  const blocksAll = allBlocks(site);
  const hasForm = blocksAll.some(b => b.type === "form");
  const formJs = hasForm ? formScript(opts.siteId) : "";
  const hasSfx = blocksAll.some(b => b.props && b.props.scrollFx && b.props.scrollFx.type && b.props.scrollFx.type !== "none");
  const sfxJs = hasSfx ? SCROLL_FX_SCRIPT : "";
  const has = t => blocksAll.some(b => b.type === t);
  const widgetJs = (has("countdown") ? COUNTDOWN_SCRIPT : "") + (has("counter") ? COUNTER_SCRIPT : "") + (has("photostack") ? PSTACK_SCRIPT : "") + (has("scrollstack") ? SCROLLSTACK_SCRIPT : "") + (has("swipestack") ? SWIPESTACK_SCRIPT : "") + (has("buildstack") ? BUILDSTACK_SCRIPT : "");
  const routerJs = sitePages(site).length > 1 ? ROUTER_SCRIPT : "";
  const meta = site.meta || {};
  const title = esc(meta.title || "Мой сайт");
  const seo = [
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:type" content="website" />`,
    meta.description ? `<meta name="description" content="${esc(meta.description)}" />` : "",
    meta.description ? `<meta property="og:description" content="${esc(meta.description)}" />` : "",
    meta.ogImage ? `<meta property="og:image" content="${esc(meta.ogImage)}" />` : "",
    meta.ogImage ? `<meta name="twitter:card" content="summary_large_image" />` : "",
    meta.favicon ? `<link rel="icon" href="${esc(meta.favicon)}" />` : ""
  ].filter(Boolean).join("\n");
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
${seo}
${(() => { const fh = fontsUsedHref(site); return fh ? `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${fh}" rel="stylesheet" />` : ""; })()}
<style>${SITE_CSS}</style>
</head>
<body>${renderBody(site)}${contactWidget(site)}${ANIM_SCRIPT}${NAV_SCRIPT}${routerJs}${sfxJs}${widgetJs}${formJs}</body>
</html>`;
}
