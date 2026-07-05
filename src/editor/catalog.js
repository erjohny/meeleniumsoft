/* ==================== Каталог блоков и утилиты ==================== */
export const clone = o => JSON.parse(JSON.stringify(o));
export const uid = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export function ph(w, h) { return "https://picsum.photos/seed/n" + Math.random().toString(36).slice(2, 7) + "/" + w + "/" + h + "?grayscale"; }
export function defaultCountdownTarget() { const d = new Date(Date.now() + 7 * 864e5); const z = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()) + "T" + z(d.getHours()) + ":" + z(d.getMinutes()); }
export function newTier(title, price) { return { image: ph(700, 360), title: title || "Тариф", features: ["Что входит — пункт 1", "Пункт 2", "Пункт 3"], price: price || "0 ₽", button: { text: "Заказать", link: "#contact" } }; }
export const RADIUS_OPTS = [["", "Как в теме"], ["0px", "Прямые"], ["6px", "Слегка"], ["12px", "Средне"], ["22px", "Сильно"], ["999px", "Круглые"]];

export const CATALOG = [
  { type: "navbar", ic: "🧭", nm: "Навбар", ds: "меню-пилюля сверху", make: () => ({ brand: "ЛОГОТИП", links: [{ label: "О себе", link: "#" }, { label: "Работы", link: "#" }, { label: "Цены", link: "#" }], cta: { text: "Связаться", link: "#" }, width: "1080px" }) },
  { type: "cover", ic: "🖼️", nm: "Обложка", ds: "фон, заголовок, кнопка", make: () => ({ image: ph(1200, 800), title: "Заголовок", subtitle: "Подзаголовок", button: { text: "Кнопка", link: "#" }, align: "center", overlay: .4, height: "70vh" }) },
  { type: "heading", ic: "🔠", nm: "Заголовок", ds: "секции", make: () => ({ text: "Новый заголовок", subtitle: "", align: "center" }) },
  { type: "text", ic: "📝", nm: "Текст", ds: "абзац", make: () => ({ html: "Введите текст…", align: "left", width: "760px" }) },
  { type: "columns", ic: "▥", nm: "Колонки", ds: "текст в 2–3 столбца", make: () => ({ cols: ["Первая колонка", "Вторая колонка"] }) },
  { type: "image", ic: "🏞️", nm: "Картинка", ds: "одно фото", make: () => ({ src: ph(900, 600), caption: "", width: "100%", radius: "2px" }) },
  { type: "gallery", ic: "🎞️", nm: "Галерея", ds: "сетка фото", make: () => ({ columns: 3, gap: "16px", ratio: "4/5", images: [ph(500, 650), ph(500, 650), ph(500, 650)] }) },
  { type: "pricing", ic: "💳", nm: "Тариф", ds: "одна карточка цены", make: () => ({ image: ph(700, 360), title: "Тариф", features: ["Что входит — пункт 1", "Пункт 2"], price: "0 ₽", button: { text: "Заказать", link: "#" } }) },
  { type: "pricinggroup", ic: "🧾", nm: "Тарифы", ds: "карточки в 1–3 колонки", make: () => ({ columns: 2, cards: [newTier("Базовый", "15 000 ₽"), newTier("Премиум", "50 000 ₽")] }) },
  { type: "button", ic: "🔘", nm: "Кнопка", ds: "призыв к действию", make: () => ({ button: { text: "Нажми меня", link: "#" }, style: "solid", align: "center" }) },
  { type: "video", ic: "🎬", nm: "Видео", ds: "YouTube или mp4", make: () => ({ url: "", caption: "" }) },
  { type: "social", ic: "🔗", nm: "Соцсети", ds: "кнопки-ссылки", make: () => ({ layout: "column", links: [{ label: "Телеграм", url: "https://t.me/" }, { label: "VK", url: "https://vk.com/" }] }) },
  { type: "form", ic: "📋", nm: "Форма / Регистрация", ds: "заявки приходят вам", make: () => ({ title: "Регистрация", subtitle: "Оставьте данные — мы свяжемся с вами", width: "480px", fields: [{ label: "Имя", type: "text", required: true }, { label: "Email", type: "email", required: true }, { label: "Телефон", type: "tel", required: false }], button: { text: "Зарегистрироваться" }, success: "Спасибо! Мы получили вашу заявку." }) },
  { type: "countdown", ic: "⏳", nm: "Таймер", ds: "обратный отсчёт", make: () => ({ target: defaultCountdownTarget(), finished: "Время вышло!" }) },
  { type: "counter", ic: "🔢", nm: "Цифры-счётчик", ds: "500+ клиентов и т.п.", make: () => ({ columns: 3, items: [{ value: 500, suffix: "+", label: "клиентов" }, { value: 12, label: "лет на рынке" }, { value: 99, suffix: "%", label: "довольны" }] }) },
  { type: "marquee", ic: "🔠", nm: "Бегущая строка", ds: "текст едет по кругу", make: () => ({ text: "АКЦИЯ · СКИДКИ · НОВИНКИ · ", speed: 20, direction: "left", size: "30px" }) },
  { type: "photostack", ic: "🖼️", nm: "Стопка фото", ds: "клик — раскрывается", make: () => ({ images: [ph(600, 750), ph(600, 750), ph(600, 750)] }) },
  { type: "scrollstack", ic: "🃏", nm: "Веер фото (скролл)", ds: "фото разъезжаются при прокрутке", make: () => ({ images: [ph(500, 650), ph(500, 650), ph(500, 650), ph(500, 650), ph(500, 650)], spread: 180, angle: 8, width: 280, height: 460 }) },
  { type: "swipestack", ic: "🂠", nm: "Свайп-колода фото", ds: "свайп вверх — следующее фото", make: () => ({ images: Array.from({ length: 10 }, () => ph(600, 750)), peek: 26, width: 320, height: 520 }) },
  { type: "buildstack", ic: "🂡", nm: "Сборка колоды (свайп)", ds: "свайп добавляет фото хаотично", make: () => ({ images: Array.from({ length: 6 }, () => ph(600, 750)), width: 320, height: 520 }) },
  { type: "map", ic: "📍", nm: "Карта", ds: "адрес на карте", make: () => ({ address: "Москва, Красная площадь", zoom: 15, height: "420px", radius: "16px" }) },
  { type: "embed", ic: "🧩", nm: "Свой HTML / виджет", ds: "код, iframe, Lottie", make: () => ({ html: "" }) },
  { type: "spacer", ic: "↕️", nm: "Отступ", ds: "пустое место", make: () => ({ size: "60px" }) },
  { type: "canvas", ic: "🎨", nm: "Холст (коллаж)", ds: "фото/текст слоями, свободно", make: () => ({ height: 480, layers: [
    { id: uid(), type: "image", src: ph(500, 620), x: 42, y: 50, w: 250, rot: -5, radius: 12 },
    { id: uid(), type: "text", text: "Заголовок", x: 56, y: 24, w: 320, rot: 0, color: "#ffffff", size: 34, weight: 700, align: "center" }
  ] }) }
];
