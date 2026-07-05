import { useEditor } from "../EditorContext.js";
import { GOOGLE_FONTS } from "../../engine/render.js";
import { Fld, TextField, AreaField, SelectField, ImgCtl } from "../fields.jsx";

/* ---------- Настройки темы (порт buildThemeSide) ---------- */
export default function ThemePanel() {
  const ed = useEditor();
  const state = ed.stateRef.current;
  const t = state.theme;
  const c = state.contact || (state.contact = {});
  const rsd = () => ed.renderStageDebounced();
  const save = () => ed.save();

  const colors = [["bg", "Фон страницы"], ["surface", "Фон карточек"], ["ink", "Текст"], ["accent", "Акцент (кнопки)"], ["line", "Линии/рамки"]];
  const fontOpts = GOOGLE_FONTS.map(f => [f.css, f.label]);

  return (
    <>
      <h2>Тема и страница</h2>
      <Fld>Заголовок сайта (вкладка)</Fld>
      <TextField value={state.meta.title} onInput={v => { state.meta.title = v; save(); }} />

      <h2>🔍 SEO и превью ссылки</h2>
      <Fld>Описание сайта (для поиска и соцсетей)</Fld>
      <AreaField value={state.meta.description || ""} onInput={v => { state.meta.description = v; save(); }} />
      <Fld>Картинка превью (при отправке ссылки)</Fld>
      <ImgCtl value={state.meta.ogImage || ""} onInput={v => { state.meta.ogImage = v; save(); }} />
      <Fld>Иконка вкладки (favicon)</Fld>
      <ImgCtl value={state.meta.favicon || ""} onInput={v => { state.meta.favicon = v; save(); }} />
      <div className="empty" style={{ padding: "6px 16px" }} dangerouslySetInnerHTML={{ __html: "Для превью в мессенджерах картинку лучше указывать <b>ссылкой (URL)</b> — загруженные файлы соцсети не всегда видят." }} />

      {colors.map(([k, lbl]) => (
        <div className="colorrow" key={k}>
          <label>{lbl}</label>
          <input type="color" defaultValue={t[k] || "#000000"} onChange={e => { t[k] = e.target.value; rsd(); }} />
        </div>
      ))}

      <Fld>Анимация появления (для всех блоков)</Fld>
      <SelectField value={t.animDefault || "up"} options={[
        ["none", "Выключить везде"], ["fade", "Проявление"], ["up", "Снизу вверх"],
        ["down", "Сверху вниз"], ["left", "Слева"], ["right", "Справа"], ["zoom", "Увеличение"], ["blur", "Из размытия"]
      ]} onChange={v => { t.animDefault = v; ed.renderStage(true); }} />

      <Fld>Скругление кнопок (все кнопки)</Fld>
      <SelectField value={t.btnRadius || "0px"} options={[["0px", "Прямые"], ["6px", "Слегка"], ["12px", "Средне"], ["22px", "Сильно"], ["999px", "Круглые (пилюля)"]]} onChange={v => { t.btnRadius = v; rsd(); }} />

      <Fld>Ширина контента (напр. 1080px)</Fld>
      <TextField value={t.maxw} onInput={v => { t.maxw = v; rsd(); }} />

      <Fld>Шрифт заголовков</Fld>
      <SelectField value={t.fontHead} options={fontOpts} onChange={v => { t.fontHead = v; rsd(); }} />
      <Fld>Шрифт текста</Fld>
      <SelectField value={t.fontBody} options={fontOpts} onChange={v => { t.fontBody = v; rsd(); }} />

      <div className="colorrow">
        <label>Ч/б фотографии</label>
        <input type="checkbox" defaultChecked={t.grayscale !== false} onChange={e => { t.grayscale = e.target.checked; rsd(); }} />
      </div>

      <h2>📞 Плавающая кнопка связи</h2>
      <Fld>Сторона</Fld>
      <SelectField value={c.position || "right"} options={[["right", "Справа"], ["left", "Слева"]]} onChange={v => { c.position = v; save(); }} />
      <Fld>WhatsApp (номер, напр. 79991234567)</Fld>
      <TextField value={c.whatsapp || ""} onInput={v => { c.whatsapp = v.trim(); save(); }} />
      <Fld>Telegram (логин без @)</Fld>
      <TextField value={c.telegram || ""} onInput={v => { c.telegram = v.trim(); save(); }} />
      <Fld>Телефон (для звонка)</Fld>
      <TextField value={c.phone || ""} onInput={v => { c.phone = v.trim(); save(); }} />
      <Fld>Email</Fld>
      <TextField value={c.email || ""} onInput={v => { c.email = v.trim(); save(); }} />
      <div className="empty" style={{ padding: "6px 16px" }} dangerouslySetInnerHTML={{ __html: "Заполни нужные — кнопки появятся в углу на <b>всех страницах</b>. Пусто — кнопок нет. Видно в «Просмотр ↗» и на сайте." }} />
    </>
  );
}
