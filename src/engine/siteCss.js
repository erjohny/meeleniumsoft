// Единый источник стилей сайта. Используется в конструкторе, предпросмотре и экспорте.
// Цвета/шрифты подставляются из темы через CSS-переменные.
export const SITE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
.anchor{scroll-margin-top:100px}
.site{
  background:var(--bg);color:var(--ink);line-height:1.6;
  font-family:var(--font-body,"Montserrat","Segoe UI",system-ui,sans-serif);
  -webkit-font-smoothing:antialiased;
  overflow-x:clip;
}
.wrap{max-width:var(--maxw,1080px);margin:0 auto;padding:0 clamp(18px,5vw,40px)}
img{display:block;max-width:100%}
a{color:inherit}
h1,h2,h3{font-family:var(--font-head,"Oswald",sans-serif);line-height:1.05;letter-spacing:.5px}

.blk{padding:clamp(40px,7vw,90px) 0;position:relative}
.blk--tight{padding:clamp(20px,4vw,44px) 0}

/* ---- Кнопки ---- */
.btn{display:inline-block;text-decoration:none;text-align:center;
  font-family:var(--font-head,"Oswald",sans-serif);text-transform:uppercase;
  letter-spacing:2px;font-size:13px;font-weight:600;padding:15px 30px;cursor:pointer;
  transition:transform .15s,background .2s,color .2s;border:1px solid transparent;
  border-radius:var(--btn-radius,0px)}
.btn:active{transform:translateY(1px)}
.btn--solid{background:var(--accent);color:var(--accent-ink,#fff)}
.btn--solid:hover{filter:brightness(1.1)}
.btn--outline{background:transparent;color:var(--ink);border-color:var(--ink);-webkit-tap-highlight-color:transparent}
@media (hover:hover){.btn--outline:hover{background:var(--ink);color:var(--bg)}}

/* ---- NAVBAR (скруглённая «пилюля» сверху) ---- */
.navwrap{position:sticky;top:14px;z-index:50;padding:14px clamp(14px,4vw,34px) 0}
.navwrap--overlay{position:fixed;top:0;left:0;right:0}
.navbar{max-width:var(--nav-max,1080px);margin:0 auto;display:flex;align-items:center;
  justify-content:space-between;gap:18px;color:var(--nav-fg,var(--ink));
  background:var(--nav-bg,rgba(255,255,255,.82));backdrop-filter:blur(12px);
  border:1px solid var(--line);border-radius:999px;padding:11px 12px 11px 26px;
  box-shadow:0 12px 34px rgba(0,0,0,.12)}
.navbar--ghost{border-color:transparent;box-shadow:none;backdrop-filter:none}
.nav__brandwrap{display:flex;align-items:center;gap:11px;min-width:0}
.nav__logo{height:34px;width:auto;max-width:150px;object-fit:contain;display:block;border-radius:7px}
.nav__brand{font-family:var(--font-head,"Oswald",sans-serif);font-weight:700;color:inherit;
  text-transform:uppercase;letter-spacing:1.5px;font-size:16px;white-space:nowrap}
.nav__brand:empty{display:none}
.nav__links{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.nav__link{position:relative;text-decoration:none;color:inherit;font-size:12px;font-weight:600;
  padding:9px 15px;border-radius:999px;transition:background .2s,color .2s,opacity .2s,transform .2s,text-shadow .2s;
  font-family:var(--font-head,"Oswald",sans-serif);text-transform:uppercase;letter-spacing:1px;white-space:nowrap;
  -webkit-tap-highlight-color:transparent}
/* Эффекты наведения на пункты (десктоп) */
@media (hover:hover){
  .nav-h-fade .nav__link:hover{opacity:.55}
  .nav-h-color .nav__link:hover{color:var(--accent)}
  .nav-h-pill .nav__link:hover{background:var(--accent);color:var(--accent-ink,#fff)}
  .nav-h-grow .nav__link:hover{transform:scale(1.13)}
  .nav-h-glow .nav__link:hover{color:var(--accent);text-shadow:0 0 8px var(--accent),0 0 18px var(--accent)}
}
.nav-h-underline .nav__link::after{content:"";position:absolute;left:15px;right:15px;bottom:5px;height:2px;
  background:currentColor;transform:scaleX(0);transform-origin:center;transition:transform .26s ease}
@media (hover:hover){.nav-h-underline .nav__link:hover::after{transform:scaleX(1)}}
.nav__cta{padding:11px 22px !important;font-size:12px;border-radius:999px !important}
/* Иконка-бургер (три полоски, морфится в крест) */
.nav__burger{display:none;position:relative;z-index:6;border:0;background:transparent;cursor:pointer;
  color:inherit;width:44px;height:44px;padding:0;border-radius:12px;align-items:center;justify-content:center}
@media (hover:hover){.nav__burger:hover{background:rgba(0,0,0,.06)}}
.nav__bl,.nav__bl::before,.nav__bl::after{position:absolute;left:50%;width:24px;height:2px;
  background:currentColor;border-radius:2px;transition:transform .3s ease,opacity .2s ease}
.nav__bl{top:50%;transform:translate(-50%,-50%)}
.nav__bl::before,.nav__bl::after{content:"";left:0;width:100%}
.nav__bl::before{top:-8px}
.nav__bl::after{top:8px}
.nav-open .nav__bl{background:transparent}
.nav-open .nav__bl::before{transform:translateY(8px) rotate(45deg)}
.nav-open .nav__bl::after{transform:translateY(-8px) rotate(-45deg)}
.nav-b-spin.nav-open .nav__bl::before{transform:translateY(8px) rotate(225deg)}
.nav-b-spin.nav-open .nav__bl::after{transform:translateY(-8px) rotate(135deg)}
.nav-b-classic .nav__bl{display:none}
.nav-b-classic .nav__burger::before{content:"☰";font-size:23px;line-height:1}
.nav-b-classic.nav-open .nav__burger::before{content:"✕"}
/* Форма бара (десктоп) */
.navbar{transition:padding .25s ease,box-shadow .25s ease,background .25s ease,
  border-radius .25s ease,border-color .25s ease}
.nav-s-rect{border-radius:16px}
.nav-s-line{border-radius:0;background:transparent;border-width:0 0 1px;border-color:var(--line);
  box-shadow:none;backdrop-filter:none;padding-left:10px;padding-right:10px}
/* Уменьшение и уплотнение при прокрутке */
.nav-shrinkable.nav-scrolled{padding-top:6px;padding-bottom:6px;box-shadow:0 10px 30px rgba(0,0,0,.22)}
.nav-shrinkable.nav-scrolled .nav__brand{font-size:14px}
.nav-shrinkable.nav-scrolled .nav__logo{height:28px}
.nav-shrinkable.navbar--ghost.nav-scrolled{background:var(--nav-bg,rgba(255,255,255,.9));
  backdrop-filter:blur(12px);border-color:var(--line)}
@media(max-width:720px){
  .navbar{position:relative;padding:10px 12px 10px 18px}
  .nav__brand{font-size:15px}
  .nav__burger{display:flex}
  .nav__links{position:absolute;top:calc(100% + 10px);left:0;right:0;z-index:60;
    flex-direction:column;align-items:stretch;display:none;overflow:auto;
    background:var(--nav-bg,rgba(255,255,255,.96));backdrop-filter:blur(12px);
    border:1px solid var(--line);border-radius:20px;padding:10px;gap:6px;
    box-shadow:0 16px 40px rgba(0,0,0,.16)}
  /* меню на весь экран / боковая панель используют position:fixed — снимаем blur с бара,
     иначе backdrop-filter делает бар «containing block» и меню позиционируется не по экрану */
  .nav-m-fullscreen .navbar,.nav-m-sidebar .navbar{backdrop-filter:none}
  .navbar.nav-open .nav__links{display:flex;transform-origin:top center}
  /* --- анимация появления меню --- */
  .nav-a-bounce.nav-open .nav__links{animation:navDrop .46s cubic-bezier(.34,1.56,.64,1)}
  .nav-a-fade.nav-open .nav__links{animation:navFade .3s ease}
  .nav-a-slide.nav-open .nav__links{animation:navSlideD .34s ease}
  .nav-a-zoom.nav-open .nav__links{animation:navZoom .34s ease}
  .nav-a-flip.nav-open .nav__links{animation:navFlip .44s ease}
  /* --- стиль меню: на весь экран --- */
  .nav-m-fullscreen .nav__brandwrap{position:relative;z-index:6}
  .nav-m-fullscreen .nav__links{position:fixed;inset:0;top:0;left:0;right:0;z-index:4;
    justify-content:center;gap:16px;border:0;border-radius:0;padding:92px 24px 32px;
    box-shadow:none;background:var(--nav-bg,rgba(16,16,16,.98))}
  .nav-m-fullscreen .nav__link{font-size:18px;padding:15px}
  /* --- стиль меню: боковая панель справа --- */
  .nav-m-sidebar .nav__links{position:fixed;top:0;right:0;bottom:0;left:auto;z-index:4;
    width:min(80vw,320px);border-radius:0;padding:84px 20px 28px;gap:10px;
    box-shadow:-18px 0 46px rgba(0,0,0,.34)}
  .nav-m-sidebar.nav-open .nav__links{animation:navSlideR .34s ease !important}
  /* --- проявление пунктов по очереди --- */
  .navbar.nav-open .nav__links>*{animation:navItem .34s ease both}
  .navbar.nav-open .nav__links>*:nth-child(1){animation-delay:.05s}
  .navbar.nav-open .nav__links>*:nth-child(2){animation-delay:.10s}
  .navbar.nav-open .nav__links>*:nth-child(3){animation-delay:.15s}
  .navbar.nav-open .nav__links>*:nth-child(4){animation-delay:.20s}
  .navbar.nav-open .nav__links>*:nth-child(5){animation-delay:.25s}
  .navbar.nav-open .nav__links>*:nth-child(6){animation-delay:.30s}
  .navbar.nav-open .nav__links>*:nth-child(n+7){animation-delay:.34s}
  .nav__link{text-align:center;padding:13px;font-size:13px}
  .nav__cta{text-align:center;padding:14px 22px !important}
}
@keyframes navDrop{
  0%{opacity:0;transform:translateY(-12px) scale(.86)}
  55%{opacity:1;transform:translateY(4px) scale(1.015)}
  100%{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes navItem{
  0%{opacity:0;transform:translateY(-9px)}
  100%{opacity:1;transform:translateY(0)}
}
@keyframes navFade{from{opacity:0}to{opacity:1}}
@keyframes navSlideD{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
@keyframes navZoom{from{opacity:0;transform:scale(.82)}to{opacity:1;transform:none}}
@keyframes navFlip{from{opacity:0;transform:perspective(650px) rotateX(-92deg)}to{opacity:1;transform:none}}
@keyframes navSlideR{from{opacity:0;transform:translateX(46px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
  .navbar.nav-open .nav__links,.navbar.nav-open .nav__links>*{animation:none}
}

/* ---- COVER ---- */
.cover{position:relative;min-height:var(--cover-h,72vh);display:flex;overflow:hidden;
  align-items:var(--cover-va,center)}
.cover__bg{position:absolute;inset:0}
.cover__bg img,.cover__vid{width:100%;height:100%;object-fit:cover;filter:var(--cover-filter,grayscale(100%) contrast(1.05))}
.cover__vid{display:block}
/* «Живой» фон обложки — медленный наезд камеры (Ken Burns) */
.cover--live .cover__bg img{transform-origin:center;will-change:transform;
  animation:coverLive 26s ease-in-out infinite alternate}
@keyframes coverLive{
  0%{transform:scale(1.08) translate3d(0,0,0)}
  100%{transform:scale(1.2) translate3d(-2.5%,-2%,0)}
}
@media (prefers-reduced-motion:reduce){.cover--live .cover__bg img{animation:none}}
.cover__ov{position:absolute;inset:0;background:#000;opacity:var(--cover-ov,.35)}
.cover .wrap{position:relative;width:100%;text-align:var(--cover-al,left);
  padding-top:60px;padding-bottom:60px;color:#fff}
.cover h1{font-size:clamp(36px,8vw,74px);font-weight:700;text-transform:uppercase}
.cover__sub{font-family:var(--font-head,"Oswald",sans-serif);text-transform:uppercase;
  letter-spacing:3px;font-size:clamp(12px,1.6vw,15px);margin-top:16px;font-weight:500;
  display:inline-block;padding-top:12px;border-top:2px solid #fff}
.cover .btn{margin-top:30px}

/* ---- HEADING ---- */
.heading{text-align:var(--al,center)}
.heading h2{font-size:clamp(28px,5vw,48px);font-weight:700;text-transform:uppercase}
.heading__sub{color:var(--muted);letter-spacing:2px;text-transform:uppercase;
  font-size:13px;margin-top:10px;font-family:var(--font-head,"Oswald",sans-serif)}

/* ---- TEXT ---- */
.text{max-width:var(--tw,760px);margin:0 auto;text-align:var(--al,left);
  font-size:clamp(15px,1.7vw,17px);color:var(--ink)}
.text p{margin-bottom:14px}

/* ---- COLUMNS ---- */
.cols{display:grid;gap:clamp(20px,4vw,44px)}
.cols--2{grid-template-columns:1fr 1fr}
.cols--3{grid-template-columns:1fr 1fr 1fr}
.cols .colitem{font-size:15px;color:var(--ink)}

/* ---- IMAGE ---- */
.single{text-align:center}
.single img{width:var(--iw,100%);margin:0 auto;border-radius:var(--irad,2px);
  filter:var(--img-filter,grayscale(100%))}
.single figcaption{color:var(--muted);font-size:13px;margin-top:10px}

/* ---- GALLERY ---- */
.gallery{display:grid;gap:var(--gap,16px)}
.gallery--2{grid-template-columns:repeat(2,1fr)}
.gallery--3{grid-template-columns:repeat(3,1fr)}
.gallery--4{grid-template-columns:repeat(4,1fr)}
.gallery img{width:100%;aspect-ratio:var(--ar,4/5);object-fit:cover;
  border-radius:2px;filter:var(--img-filter,grayscale(100%))}

/* ---- PRICING ---- */
.pricing{max-width:640px;margin:0 auto;border:1px solid var(--line,#ddd);
  border-radius:4px;padding:clamp(22px,3vw,34px);background:var(--surface)}
.pricing__media{aspect-ratio:16/8;margin-bottom:20px;overflow:hidden;border-radius:2px}
.pricing__media img{width:100%;height:100%;object-fit:cover;filter:var(--img-filter,grayscale(100%))}
.pricing h3{text-align:center;text-transform:uppercase;font-weight:600;
  font-size:clamp(16px,2.2vw,20px);margin-bottom:18px}
.pricing ul{list-style:none}
.pricing li{position:relative;padding-left:18px;margin-bottom:11px;font-size:14px;color:var(--ink)}
.pricing li::before{content:"";position:absolute;left:0;top:8px;width:5px;height:5px;
  border-radius:50%;background:var(--accent)}
.pricing__price{text-align:center;font-family:var(--font-head,"Oswald",sans-serif);
  font-weight:700;font-size:clamp(26px,3.4vw,36px);margin:20px 0 6px}
.pricing>.btn{display:block;width:fit-content;margin:6px auto 0}

/* ---- PRICING GROUP (тарифы в колонки) ---- */
.pricegrid{display:grid;gap:20px}
.pricegrid--1{grid-template-columns:1fr;max-width:640px;margin:0 auto}
.pricegrid--2{grid-template-columns:1fr 1fr}
.pricegrid--3{grid-template-columns:repeat(3,1fr)}
.pricegrid .pricing{max-width:none;margin:0}
@media(max-width:820px){.pricegrid--2,.pricegrid--3{grid-template-columns:1fr;max-width:640px;margin:0 auto}}

/* ---- Свободное размещение кнопки ---- */
.freearea{position:relative;width:100%}
.freebtn{position:absolute;transform:translateX(-50%);white-space:nowrap;user-select:none}
body.editing .freearea{outline:1px dashed rgba(47,109,246,.45);border-radius:6px}
body.editing .freebtn{cursor:grab}
body.editing .freebtn:active{cursor:grabbing}

/* ---- Свободное размещение на обложке ---- */
.cover--free{align-items:stretch}
.cover__free{position:absolute;inset:0;z-index:3;color:#fff}
.cover .freeel{position:absolute;transform:translate(-50%,-50%);text-align:center;max-width:88%}
.cover .freeel .cover__sub{margin-top:0}
.cover__extra{outline:0;white-space:pre-wrap}
body.editing .cover__extra:hover{outline:1px dashed rgba(255,255,255,.55)}
.drag-h{display:none}
body.editing .drag-h{display:flex;position:absolute;top:-14px;left:-14px;width:24px;height:24px;
  align-items:center;justify-content:center;background:#2f6df6;color:#fff;border-radius:50%;
  cursor:grab;font-size:12px;z-index:6;box-shadow:0 2px 8px rgba(0,0,0,.45)}
body.editing .drag-h:active{cursor:grabbing}
.size-h{display:none}
body.editing .size-h{display:flex;position:absolute;right:-14px;bottom:-14px;width:24px;height:24px;
  align-items:center;justify-content:center;background:#16a34a;color:#fff;border-radius:50%;
  cursor:nwse-resize;font-size:12px;z-index:6;box-shadow:0 2px 8px rgba(0,0,0,.45)}

/* ---- VIDEO ---- */
.video{max-width:900px;margin:0 auto}
.video__frame{position:relative;aspect-ratio:16/9;background:#000;border-radius:3px;overflow:hidden}
.video__frame iframe,.video__frame video{position:absolute;inset:0;width:100%;height:100%;border:0}
.video figcaption{color:var(--muted);font-size:13px;margin-top:10px;text-align:center}

/* ---- SOCIAL / BUTTONS ROW ---- */
.social{max-width:520px;margin:0 auto;display:flex;gap:14px;
  flex-direction:var(--dir,column)}
.social .btn{flex:1}

/* ---- Веер фото на скролле ---- */
.scrollstack{position:relative;width:100%;height:var(--ss-h,460px);margin:0 auto}
.scrollstack__ph{position:absolute;left:50%;top:50%;width:var(--ss-w,280px);
  background:#fff;padding:10px 10px 14px;border-radius:2px;box-shadow:0 24px 60px rgba(0,0,0,.45);
  transition:transform .12s linear;will-change:transform}
.scrollstack__ph img{width:100%;height:auto;display:block;filter:var(--img-filter,grayscale(100%))}

/* ---- Свайп-колода фото ---- */
.swst{position:relative;width:100%;max-width:var(--sw-w,320px);height:var(--sw-h,520px);margin:0 auto;
  touch-action:none;user-select:none;-webkit-user-select:none}
.swst__card{position:absolute;left:50%;top:50%;width:var(--sw-w,320px);
  background:#fff;padding:10px 10px 14px;border-radius:4px;box-shadow:0 24px 60px rgba(0,0,0,.5);
  cursor:grab;will-change:transform,opacity}
.swst__card:active{cursor:grabbing}
.swst__card img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;filter:var(--img-filter,grayscale(100%))}
.swst__hint{position:absolute;left:50%;bottom:-4px;transform:translateX(-50%);
  font-size:13px;color:var(--muted,#888);opacity:.8;pointer-events:none;z-index:200}

/* ---- Сборка колоды свайпом ---- */
.bust{position:relative;width:100%;max-width:var(--sw-w,320px);height:var(--sw-h,520px);margin:0 auto;
  touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
.bust:active{cursor:grabbing}
.bust__card{position:absolute;left:50%;top:50%;width:var(--sw-w,320px);
  background:#fff;padding:10px 10px 14px;border-radius:4px;box-shadow:0 24px 60px rgba(0,0,0,.5);will-change:transform,opacity}
.bust__card img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;filter:var(--img-filter,grayscale(100%))}

/* ---- SPACER ---- */
.spacer{height:var(--h,60px)}

/* ---- Свободный холст (коллаж) ---- */
.canvas-blk{padding:20px 0}
.canvasarea{position:relative;width:100%;max-width:var(--maxw,1080px);margin:0 auto}
.canvasarea--full{max-width:none}
.canvas__bg{position:absolute;inset:0;z-index:0;overflow:hidden}
.canvas__bg img{width:100%;height:100%;object-fit:cover;display:block;filter:var(--cover-filter,grayscale(100%) contrast(1.05))}
.canvas__ov{position:absolute;inset:0;z-index:0}
.clayer{position:absolute}
.clayer img{width:100%;height:auto;display:block}
.cltext{outline:0}
body.editing .clayer{cursor:grab}
body.editing .clayer:hover{outline:1px dashed rgba(47,109,246,.5)}
body.editing .clayer.sel{outline:1.5px solid #2f6df6}
.ch{display:none;position:absolute;width:16px;height:16px;background:#2f6df6;border:2px solid #fff;
  border-radius:50%;z-index:20;box-shadow:0 1px 5px rgba(0,0,0,.5)}
body.editing .clayer.sel .ch{display:block}
.ch-move{left:-9px;top:-9px;cursor:move}
.ch-resize{right:-9px;bottom:-9px;cursor:nwse-resize}
.ch-rotate{left:50%;top:-32px;margin-left:-8px;cursor:grab;background:#16a34a}

/* ---- Стиль и эффекты блока ---- */
.sblk{position:relative}
.sblk--clip{overflow:hidden}
.sblk__bg{position:absolute;inset:0;z-index:0}
.sblk__ov{position:absolute;inset:0;z-index:1}
.sblk__in{position:relative;z-index:2}
.sblk--glass{background:rgba(255,255,255,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.18)}
.sblk--photoneon :is(.single img,.gallery img,.pricing__media,.cover__bg img){
  border:var(--sb-pn-w,3px) solid var(--sb-pn-c,#d000ff);
  box-shadow:0 0 var(--sb-pn-g,18px) var(--sb-pn-c,#d000ff),
             0 0 calc(var(--sb-pn-g,18px) * 2) var(--sb-pn-c,#d000ff),
             inset 0 0 var(--sb-pn-g,18px) var(--sb-pn-c,#d000ff)}
/* ---- Живая (постоянная) анимация блока ---- */
.sblk--motion .sblk__in{animation-duration:var(--sb-mdur,3s);animation-iteration-count:infinite;animation-timing-function:ease-in-out;transform-origin:center;will-change:transform}
.sblk--m-sway .sblk__in{animation-name:sb-sway}
.sblk--m-float .sblk__in{animation-name:sb-float}
.sblk--m-bounce .sblk__in{animation-name:sb-bounce}
.sblk--m-dance .sblk__in{animation-name:sb-dance}
.sblk--m-swing .sblk__in{animation-name:sb-swing}
.sblk--m-pulse .sblk__in{animation-name:sb-pulse}
.sblk--m-rotate-cw .sblk__in{animation-name:sb-rot-cw;animation-timing-function:linear}
.sblk--m-rotate-ccw .sblk__in{animation-name:sb-rot-ccw;animation-timing-function:linear}
@keyframes sb-sway{0%,100%{transform:translateX(-14px)}50%{transform:translateX(14px)}}
@keyframes sb-float{0%,100%{transform:translateY(-11px)}50%{transform:translateY(11px)}}
@keyframes sb-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes sb-dance{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
@keyframes sb-swing{0%,100%{transform:rotate(-4deg) translateY(0)}25%{transform:rotate(4deg) translateY(-5px)}50%{transform:rotate(-4deg)}75%{transform:rotate(4deg) translateY(-5px)}}
@keyframes sb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes sb-rot-cw{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes sb-rot-ccw{from{transform:rotate(0)}to{transform:rotate(-360deg)}}
@media (prefers-reduced-motion: reduce){.sblk--motion .sblk__in{animation:none!important}}
.sblk--h-lift,.sblk--h-zoom,.sblk--h-glow{transition:transform .3s ease,box-shadow .3s ease}
@media (hover:hover){
  .sblk--h-lift:hover{transform:translateY(-6px)}
  .sblk--h-zoom:hover{transform:scale(1.02)}
  .sblk--h-glow:hover{box-shadow:0 0 28px var(--sb-hglow,#00eaff),0 0 60px var(--sb-hglow,#00eaff)}
}
.sblk--font .sblk__in{font-family:var(--sb-font)}
.sblk--tc :is(h1,h2,h3,p,li,figcaption,.heading__sub,.cover__sub,.text){color:var(--sb-color)!important}
.sblk--ls :is(h1,h2,h3,p,li){letter-spacing:var(--sb-ls)!important}
.sblk--lh :is(h1,h2,h3,p,li,.text){line-height:var(--sb-lh)!important}
.sblk--tglow :is(h1,h2,h3,.cover__sub){text-shadow:var(--sb-tsh)}

/* ---- Анимации появления при прокрутке ---- */
[data-anim]{opacity:0;transition:opacity .7s ease, transform .75s cubic-bezier(.2,.7,.2,1);
  transition-delay:var(--anim-delay,0s);will-change:opacity,transform}
[data-anim="up"]{transform:translateY(36px)}
[data-anim="down"]{transform:translateY(-36px)}
[data-anim="left"]{transform:translateX(46px)}
[data-anim="right"]{transform:translateX(-46px)}
[data-anim="zoom"]{transform:scale(.92)}
[data-anim="blur"]{filter:blur(10px)}
[data-anim].anim-in{opacity:1;transform:none;filter:none}
/* в конструкторе блоки всегда видны */
body.editing [data-anim]{opacity:1 !important;transform:none !important;filter:none !important}
@media (prefers-reduced-motion: reduce){[data-anim]{opacity:1 !important;transform:none !important;filter:none !important;transition:none}}

/* ---- Эффекты при прокрутке ---- */
.sfx{will-change:transform;transform-origin:center}

/* ---- Бегущая строка ---- */
.marquee{overflow:hidden;white-space:nowrap;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.marquee__track{display:inline-flex;gap:44px;animation:mqmove var(--mq-dur,20s) linear infinite;will-change:transform}
.marquee--right .marquee__track{animation-direction:reverse}
.marquee__item{font-family:var(--font-head,"Oswald",sans-serif);text-transform:uppercase;
  letter-spacing:2px;font-size:var(--mq-size,30px);font-weight:700;color:var(--ink)}
@keyframes mqmove{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---- Таймер обратного отсчёта ---- */
.countdown{display:flex;gap:clamp(10px,3vw,26px);justify-content:center;flex-wrap:wrap}
.cd__unit{background:var(--surface);border:1px solid var(--line);border-radius:16px;
  padding:16px clamp(12px,3vw,26px);min-width:84px;text-align:center}
.cd__num{display:block;font-family:var(--font-head,"Oswald",sans-serif);font-weight:700;
  font-size:clamp(30px,6vw,52px);line-height:1;color:var(--ink)}
.cd__lb{display:block;margin-top:8px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted)}
.cd__done{font-family:var(--font-head,"Oswald",sans-serif);font-size:clamp(24px,5vw,40px);
  font-weight:700;color:var(--accent);text-align:center;width:100%}

/* ---- Счётчик-цифры ---- */
.countergrid{display:grid;gap:24px;grid-template-columns:repeat(var(--cg,3),1fr)}
.countergrid--1{--cg:1}.countergrid--2{--cg:2}.countergrid--3{--cg:3}.countergrid--4{--cg:4}
.counter{text-align:center}
.counter__num{font-family:var(--font-head,"Oswald",sans-serif);font-weight:700;
  font-size:clamp(38px,7vw,64px);line-height:1;color:var(--accent)}
.counter__lb{margin-top:8px;color:var(--muted);font-size:15px;letter-spacing:.5px}
@media(max-width:720px){.countergrid--3,.countergrid--4{grid-template-columns:repeat(2,1fr)}}

/* ---- Стопка фото (пила → 3D-карусель по клику) ---- */
.pstack{position:relative;height:380px;cursor:pointer;user-select:none;touch-action:pan-y}
.pstack__ph{position:absolute;top:50%;left:50%;width:min(260px,66vw);background:#fff;
  padding:12px 12px 34px;border-radius:4px;box-shadow:0 14px 34px rgba(0,0,0,.34);
  transform:translate(-50%,-50%) rotate(calc((var(--i) - (var(--n) - 1)/2) * 8deg));
  transition:transform .55s cubic-bezier(.2,.75,.2,1);transform-origin:center;backface-visibility:hidden}
.pstack__ph img{width:100%;display:block;border-radius:2px}
/* раскрытое состояние — 3D-карусель, трансформы ставит скрипт */
.pstack.is-open{perspective:1200px;cursor:grab;height:440px;touch-action:none}
.pstack.is-open.dragging{cursor:grabbing}
.pstack.is-open .pstack__ph{transition:transform .45s cubic-bezier(.2,.7,.2,1),opacity .3s}
.pstack.is-open.dragging .pstack__ph{transition:none}
.pstack.is-open .pstack__ph img{pointer-events:none}
.pstack__hint{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);
  font-size:12px;color:var(--muted);letter-spacing:.5px;background:var(--bg);padding:3px 10px;border-radius:999px;opacity:.85}
.pstack.is-open .pstack__hint{opacity:0}
/* в редакторе — ряд, чтобы менять каждое фото */
.pstack--edit{position:static;height:auto;display:flex;flex-wrap:wrap;gap:14px;cursor:default}
.pstack--edit .pstack__ph{position:static;transform:none;width:170px;box-shadow:0 8px 20px rgba(0,0,0,.22)}
.pstack--edit .pstack__hint{display:none}

/* ---- Карта ---- */
.mapwrap{border-radius:var(--map-rad,16px);overflow:hidden;border:1px solid var(--line)}
.mapframe{display:block;width:100%;height:var(--map-h,420px);border:0}

/* ---- Свой HTML / встраивание ---- */
.embed>iframe,.embed video{max-width:100%}
.embed-ph{border:2px dashed var(--line);border-radius:14px;padding:28px 20px;text-align:center;color:var(--muted)}
.embed-ph__ic{font-size:34px}
.embed-ph__t{font-weight:700;color:var(--ink);margin:6px 0 4px}

/* ---- Плавающая кнопка связи ---- */
.fabwrap{position:fixed;bottom:20px;z-index:300;display:flex;flex-direction:column;gap:12px}
.fabwrap--right{right:20px;align-items:flex-end}
.fabwrap--left{left:20px;align-items:flex-start}
.fab{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.28);text-decoration:none;font-size:26px;
  transition:transform .15s;-webkit-tap-highlight-color:transparent}
.fab:hover{transform:scale(1.08)}
.fab svg{width:30px;height:30px;fill:currentColor}
.fab--whatsapp{background:#25D366}
.fab--telegram{background:#229ED9}
.fab--phone,.fab--email{background:var(--accent);color:var(--accent-ink,#fff)}
@media(max-width:720px){.fab{width:50px;height:50px}}

/* ---- Форма / регистрация ---- */
.siteform{max-width:var(--fw,480px);margin-left:auto;margin-right:auto;
  display:flex;flex-direction:column;gap:14px;text-align:left}
.siteform__title{font-family:var(--font-head,"Oswald",sans-serif);text-transform:uppercase;
  letter-spacing:.5px;text-align:center;color:var(--ink)}
.siteform__sub{text-align:center;color:var(--muted);font-size:15px;margin-top:-6px}
.siteform__fields{display:flex;flex-direction:column;gap:12px}
.formrow{display:flex;flex-direction:column;gap:5px}
.formrow__lb{font-size:13px;font-weight:600;color:var(--ink);letter-spacing:.2px}
.formrow__lb b{color:#e0483f}
.siteform input,.siteform textarea{width:100%;border:1px solid var(--line);border-radius:8px;
  padding:12px 13px;font-size:15px;font-family:var(--font-body,system-ui,sans-serif);
  background:var(--bg);color:var(--ink);transition:border-color .15s,box-shadow .15s}
.siteform textarea{resize:vertical;min-height:96px}
.siteform input:focus,.siteform textarea:focus{outline:0;border-color:var(--accent);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent)}
.siteform__btn{margin-top:4px;cursor:pointer;border:0}
.siteform__btn[disabled]{opacity:.6;cursor:default}
.siteform__msg{text-align:center;padding:12px;border-radius:8px;font-weight:600;
  background:rgba(60,200,120,.14);color:#1f9d55;border:1px solid rgba(60,200,120,.3)}

@media(max-width:720px){
  .cols--2,.cols--3{grid-template-columns:1fr}
  .gallery--3,.gallery--4{grid-template-columns:repeat(2,1fr)}
  .social{flex-direction:column}
  /* «Скрыть на телефоне» — прячем только на живом сайте, в редакторе показываем с пометкой */
  body:not(.editing) .hide-mob{display:none!important}
}
`;
