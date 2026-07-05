/* ==================== Стили редактора внутри холста ==================== */
export const RUNTIME_CSS = `
/* в редакторе — мгновенное восстановление прокрутки без плавной анимации при перерисовке */
html{scroll-behavior:auto !important}
.shell{position:relative}
body.editing .shell{outline:1px dashed transparent}
body.editing .shell:hover{outline:1px dashed #2f6df6}
.shell.sel{outline:2px solid #2f6df6 !important}
.shell-tools{position:absolute;top:8px;right:8px;display:none;gap:3px;z-index:60}
/* навбар в редакторе — обычный поток, чтобы не перекрывал панель блока */
body.editing .navwrap{position:static !important;padding-top:40px}
/* когда меню навбара открыто — поднимаем его блок над следующими, иначе выпадающее меню уходит за них */
.shell:has(.nav-open){z-index:200}
body.editing .shell:hover .shell-tools,.shell.sel .shell-tools{display:flex}
.shell-tools button{width:28px;height:28px;border:0;border-radius:6px;background:#17150f;color:#fff;cursor:pointer;font-size:14px;opacity:.92;line-height:1}
.shell-tools button:hover{background:#2f6df6}
.addbar{display:block;width:100%;border:0;background:transparent;color:#2f6df6;font-weight:700;padding:5px;cursor:pointer;font-size:13px;opacity:0;transition:.15s;font-family:inherit}
.shell:hover>.addbar{opacity:1}
.addstart{opacity:.7}
.addbar:hover{background:#eef3ff;opacity:1}
[contenteditable]:focus{outline:0;box-shadow:0 0 0 2px rgba(47,109,246,.4);border-radius:2px}
body.editing [data-imgedit]{cursor:pointer}
body.editing [data-imgedit]:hover{outline:3px solid #2f6df6;outline-offset:-3px}
/* перетаскивание блоков */
body.editing .site{position:relative}
.drag-handle{cursor:grab}
.shell.dragging{opacity:.35}
.shell.dragging .shell-tools{display:flex}
.shell.dragging .drag-handle{cursor:grabbing}
.drop-ind{position:absolute;left:0;right:0;height:3px;margin-top:-1px;background:#2f6df6;
  border-radius:2px;z-index:70;pointer-events:none;box-shadow:0 0 0 2px rgba(47,109,246,.25)}
body.dragging-block,body.dragging-block *{cursor:grabbing !important;user-select:none !important}
/* пометка «скрыт на телефоне» в редакторе */
body.editing .hide-mob{position:relative;outline:1px dashed rgba(161,34,34,.5);outline-offset:-1px}
body.editing .hide-mob::after{content:"📵 скрыт на телефоне";position:absolute;top:0;left:0;
  background:#a12;color:#fff;font:700 10px/1.5 system-ui,sans-serif;padding:2px 7px;
  border-radius:0 0 7px 0;z-index:40;pointer-events:none;letter-spacing:.3px}
/* онбординг в пустом холсте */
.onboard{display:flex;justify-content:center;padding:44px 20px}
.onboard__card{max-width:540px;background:#fff;border:1px solid #e3e0db;border-radius:18px;
  padding:26px 30px;box-shadow:0 14px 44px rgba(0,0,0,.12);font-family:system-ui,sans-serif}
.onboard__ic{font-size:40px;line-height:1}
.onboard__card h2{margin:8px 0 14px;font-size:22px;color:#16150f}
.onboard__card ul{margin:0;padding-left:20px;color:#4a463d;font-size:14.5px;line-height:1.95}
.onboard__card b{color:#16150f}
`;
