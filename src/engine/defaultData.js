// Стартовый сайт: набор блоков + тема. Всё можно менять и дополнять в конструкторе.
// Тёмный «магический» стиль-образец: золото по кремовому, антиква, живые анимации.
export const DEFAULT_DATA = {
  meta: { title: "Пример сайта · Портфолио фотографа" },

  theme: {
    bg: "#0e0c0a", surface: "#17130d", ink: "#ece2ce", muted: "#9c8f74",
    accent: "#c6a662", accentInk: "#14110b", line: "#362f22", maxw: "1120px",
    fontHead: '"Cormorant",serif', fontBody: '"Raleway",sans-serif',
    grayscale: false, btnRadius: "999px", animDefault: "up"
  },

  blocks: [
    {
      id: "b0", type: "navbar", props: {
        brand: "@your.photo",
        links: [
          { label: "О себе", link: "#about" },
          { label: "Как я работаю", link: "#how" },
          { label: "Портфолио", link: "#works" },
          { label: "Цены", link: "#price" },
          { label: "Контакты", link: "#contact" }
        ],
        cta: { text: "Забронировать", link: "#contact" },
        width: "1120px",
        overlay: true, transparent: true, fg: "#ece2ce"
      }
    },

    {
      id: "b1", type: "cover", props: {
        image: "https://picsum.photos/seed/muse-hero/1500/1800",
        videoBg: "https://meelleniumsoft.web.app/media/hero.mp4",
        title: "Погрузись в мир мечты в моих кадрах",
        subtitle: "Фотограф · снимаю истории, эмоции и немного магии",
        button: { text: "Смотреть портфолио ↓", link: "#works" },
        btnRadius: "999px", liveBg: true,
        align: "center", overlay: 0.52, height: "94vh", anim: "fade",
        st: { textGlow: true, textGlowColor: "#c6a662", textGlowSize: 14 }
      }
    },

    {
      id: "b1n", type: "text", props: {
        align: "center", width: "760px", anim: "fade",
        html: '<span style="letter-spacing:3px;text-transform:uppercase;font-size:12px;color:#9c8f74">✦ Это пример сайта · демоверсия — всё можно изменить под себя ✦</span>'
      }
    },

    {
      id: "b2", type: "heading", props: {
        anim: "blur", text: "Обо мне", subtitle: "немного о том, кто за кадром", align: "center", anchor: "about"
      }
    },
    {
      id: "b3", type: "text", props: {
        align: "center", width: "720px", anim: "up",
        html: "Привет! Я воплощаю ваши фантазии в реальность с помощью камеры и капельки волшебства. Люблю тёплый свет, живые эмоции и кадры, к которым хочется возвращаться. Замените этот текст на свой — просто кликните и напечатайте."
      }
    },
    {
      id: "b4", type: "image", props: {
        anim: "zoom", width: "62%", radius: "18px",
        src: "https://picsum.photos/seed/muse-about/900/1100",
        caption: "",
        st: {
          hover: "zoom",
          photoNeon: true, photoNeonColor: "#c6a662", photoNeonWidth: 1, photoNeonGlow: 26,
          motion: "sway", motionDur: 7
        }
      }
    },

    {
      id: "b5", type: "heading", props: {
        anim: "up", text: "Как я работаю", subtitle: "три шага до вашей съёмки", align: "center", anchor: "how"
      }
    },
    {
      id: "b6", type: "columns", props: {
        anim: "up",
        cols: [
          '<div style="font-family:Cormorant,serif;font-size:58px;color:#c6a662;line-height:.9;margin-bottom:6px">01</div><b style="font-family:Cormorant,serif;font-size:24px;letter-spacing:.5px">Знакомство</b><br><span style="color:#9c8f74">Обсуждаем идею и настроение съёмки. Нет своей идеи — придумаем магию вместе.</span>',
          '<div style="font-family:Cormorant,serif;font-size:58px;color:#c6a662;line-height:.9;margin-bottom:6px">02</div><b style="font-family:Cormorant,serif;font-size:24px;letter-spacing:.5px">Подготовка</b><br><span style="color:#9c8f74">Подбираем локацию, образ и референсы, чтобы в кадре всё было продумано до детали.</span>',
          '<div style="font-family:Cormorant,serif;font-size:58px;color:#c6a662;line-height:.9;margin-bottom:6px">03</div><b style="font-family:Cormorant,serif;font-size:24px;letter-spacing:.5px">Съёмка</b><br><span style="color:#9c8f74">Лёгкая атмосфера, живые эмоции — и десятки кадров, которыми захочется делиться.</span>'
        ]
      }
    },

    {
      id: "b6d", type: "image", props: {
        anim: "fade", width: "160px", radius: "999px",
        src: "https://picsum.photos/seed/muse-bloom/500/500",
        caption: "",
        st: { motion: "dance", motionDur: 6, glow: true, glowColor: "#c6a662", glowSize: 20 }
      }
    },

    {
      id: "b7", type: "heading", props: {
        anim: "up", text: "Портфолио", subtitle: "избранные кадры", align: "center", anchor: "works"
      }
    },
    {
      id: "b8", type: "gallery", props: {
        anim: "up", columns: 3, gap: "14px", ratio: "4/5",
        images: [
          "https://picsum.photos/seed/pf-a/600/750",
          "https://picsum.photos/seed/pf-b/600/750",
          "https://picsum.photos/seed/pf-c/600/750",
          "https://picsum.photos/seed/pf-d/600/750",
          "https://picsum.photos/seed/pf-e/600/750",
          "https://picsum.photos/seed/pf-f/600/750"
        ],
        st: { hover: "zoom", radius: 14 }
      }
    },

    {
      id: "b9", type: "heading", props: {
        anim: "up", text: "Цены", subtitle: "пакеты съёмки", align: "center", anchor: "price"
      }
    },
    {
      id: "b10", type: "pricinggroup", props: {
        anim: "up", columns: 3, btnRadius: "999px",
        cards: [
          {
            image: "https://picsum.photos/seed/price-a/700/420",
            title: "Мини",
            features: ["30 минут съёмки", "1 локация", "10 обработанных кадров", "Все исходники"],
            price: "5 000 ₽", button: { text: "Выбрать", link: "#contact" }
          },
          {
            image: "https://picsum.photos/seed/price-b/700/420",
            title: "История",
            features: ["1.5 часа съёмки", "2 локации / образа", "40 обработанных кадров", "Помощь со стилем"],
            price: "12 000 ₽", button: { text: "Выбрать", link: "#contact" }
          },
          {
            image: "https://picsum.photos/seed/price-c/700/420",
            title: "Магия",
            features: ["Полдня съёмки", "Локации без ограничений", "80+ кадров", "Референсы и мудборд", "Приоритетная обработка"],
            price: "25 000 ₽", button: { text: "Выбрать", link: "#contact" }
          }
        ]
      }
    },

    {
      id: "b11", type: "cover", props: {
        image: "https://picsum.photos/seed/muse-cta/1500/1000",
        title: "Создадим вашу магию вместе?",
        subtitle: "Напишите мне — и мы придумаем идеальную съёмку",
        button: { text: "Связаться со мной", link: "#contact" },
        btnRadius: "999px", liveBg: true,
        align: "center", overlay: 0.55, height: "62vh", anim: "zoom",
        st: { textGlow: true, textGlowColor: "#c6a662", textGlowSize: 12 }
      }
    },

    {
      id: "b12", type: "heading", props: {
        anim: "up", text: "Контакты", subtitle: "на связи в любимых мессенджерах", align: "center", anchor: "contact"
      }
    },
    {
      id: "b13", type: "social", props: {
        anim: "up", layout: "row",
        links: [
          { label: "Telegram", url: "https://t.me/" },
          { label: "Instagram", url: "https://instagram.com/" },
          { label: "WhatsApp", url: "https://wa.me/" }
        ],
        st: { motion: "float", motionDur: 5 }
      }
    },
    {
      id: "b14", type: "spacer", props: { size: "40px" }
    }
  ]
};

// Пример-образец: лендинг с формой регистрации на мероприятие.
export const REG_EXAMPLE_DATA = {
  meta: { title: "Регистрация на мероприятие" },
  theme: {
    bg: "#ffffff", surface: "#f5f7fb", ink: "#141a2e", muted: "#5c6478",
    accent: "#2f6df6", accentInk: "#ffffff", line: "#e3e7ef", maxw: "1080px",
    fontHead: '"Unbounded",sans-serif', fontBody: '"Manrope",sans-serif',
    grayscale: false, btnRadius: "12px", animDefault: "up"
  },
  blocks: [
    {
      id: "r0", type: "navbar", props: {
        brand: "MEETUP 2026",
        links: [
          { label: "О событии", link: "#about" },
          { label: "Программа", link: "#prog" },
          { label: "Регистрация", link: "#reg" }
        ],
        cta: { text: "Зарегистрироваться", link: "#reg" },
        width: "1080px", overlay: true, transparent: true, fg: "#ffffff"
      }
    },
    {
      id: "r1", type: "cover", props: {
        image: "https://picsum.photos/seed/meetup-hero/1600/1000",
        title: "IT-конференция MEETUP 2026",
        subtitle: "12 апреля · Алматы · офлайн и онлайн. Доклады, нетворкинг и афтепати.",
        button: { text: "Зарегистрироваться", link: "#reg" },
        align: "center", overlay: .55, height: "78vh", btnRadius: "12px"
      }
    },
    {
      id: "r2", type: "heading", props: { anchor: "about", text: "Что вас ждёт", subtitle: "Один день, чтобы прокачаться и обрасти полезными знакомствами", align: "center" }
    },
    {
      id: "r3", type: "columns", props: {
        anchor: "prog",
        cols: [
          "<h3>8 докладов</h3><p>Спикеры из ведущих продуктовых команд — про ИИ, продукт и карьеру.</p>",
          "<h3>Нетворкинг</h3><p>Зона знакомств, менторские столы и живое общение в перерывах.</p>",
          "<h3>Афтепати</h3><p>Неформальная часть вечером — музыка, напитки и разговоры до ночи.</p>"
        ]
      }
    },
    {
      id: "r4", type: "form", props: {
        anchor: "reg",
        title: "Регистрация на MEETUP 2026",
        subtitle: "Оставьте данные — пришлём билет и детали на почту",
        width: "500px",
        fields: [
          { label: "Имя и фамилия", type: "text", required: true },
          { label: "Email", type: "email", required: true },
          { label: "Телефон", type: "tel", required: false },
          { label: "Компания / должность", type: "text", required: false },
          { label: "Формат участия", type: "text", required: false, placeholder: "офлайн или онлайн" }
        ],
        button: { text: "Зарегистрироваться" },
        success: "Готово! Мы отправили подтверждение вам на почту."
      }
    },
    {
      id: "r5", type: "social", props: {
        anchor: "contact", layout: "row",
        links: [
          { label: "Telegram", url: "https://t.me/" },
          { label: "Instagram", url: "https://instagram.com/" },
          { label: "Почта", url: "mailto:hello@example.com" }
        ]
      }
    }
  ]
};

// Пустой стартовый сайт — с ним создаётся новый сайт («Создать сайт»).
export const EMPTY_DATA = {
  meta: { title: "Мой сайт" },
  theme: {
    bg: "#ffffff", surface: "#f4f2ef", ink: "#16150f", muted: "#6b6a66",
    accent: "#16150f", accentInk: "#ffffff", line: "#dcd9d4", maxw: "1080px",
    fontHead: '"Oswald",sans-serif', fontBody: '"Montserrat",system-ui,sans-serif',
    grayscale: false, btnRadius: "0px", animDefault: "up"
  },
  blocks: []
};
