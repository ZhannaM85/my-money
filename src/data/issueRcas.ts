export interface IssueRca {
  issue: number
  title: { en: string; ru: string }
  en: string
  ru: string
}

/**
 * One RCA per shipped issue, newest number first. Skip open epics with no
 * code yet (#19, #20). Add a row when an issue ships, like releaseNotes.
 */
export const issueRcas: IssueRca[] = [
  {
    issue: 137,
    title: {
      en: 'Compare holdings across selected dates (table page)',
      ru: 'Сравнить позиции на выбранных датах (таблица)',
    },
    en: 'Screenshots were the only way to diff two days. Add to comparison next to As of collects dates; a banner opens a table page (rows = assets, columns = dates) where days can be removed. More than two dates allowed. Session-only.',
    ru: 'Раньше сравнение дней было только скриншотами. «Добавить к сравнению» рядом с «На дату» собирает даты; баннер открывает таблицу (строки — активы, столбцы — дни), дни можно убрать. Больше двух дат можно. Только на сессию.',
  },
  {
    issue: 136,
    title: {
      en: 'Asset details chart tooltip: show original amount in muted grey under converted',
      ru: 'Подсказка графика в карточке актива: оригинальная сумма серым под пересчётом',
    },
    en: 'Converted tooltip showed only the base total. The point now carries native amount/currency; muted grey under net worth when they differ. Original mode and same-currency skip the extra line.',
    ru: 'В режиме пересчёта подсказка показывала только сумму в базе. Точка несёт оригинал; серым под чистым капиталом, если валюты разные. В оригинале и если валюта уже база — одной строки.',
  },
  {
    issue: 135,
    title: {
      en: 'Restore Dashboard chart holdings tooltip now that Positions are below the graph',
      ru: 'Вернуть подсказку графика на Сводке: Позиции теперь под графиком',
    },
    en: '#133 hid the popover because Positions sat above the chart. After #134 the list is below, so Dashboard uses the same simple holdings tooltip as History (no pin / dismiss-on-scroll).',
    ru: '#133 прятал карточку, потому что Позиции были над графиком. После #134 список снизу, поэтому Сводка снова использует ту же простую подсказку, что История (без pin / dismiss-on-scroll).',
  },
  {
    issue: 134,
    title: {
      en: 'Move Dashboard Positions below the net-worth chart',
      ru: 'Перенести Позиции на Сводке под график',
    },
    en: 'Positions sat between As of and the chart, so a long list hid the graph. The list (heading, total, cards) now follows the chart and zoom strip; As of stays above.',
    ru: 'Позиции стояли между «На дату» и графиком, длинный список прятал график. Список (заголовок, итого, карточки) теперь под графиком и полосой масштаба; «На дату» остаётся сверху.',
  },
  {
    issue: 133,
    title: {
      en: 'Remove chart holdings tooltip; it duplicates the list above the graph',
      ru: 'Убрать подсказку графика: она дублирует список над графиком',
    },
    en: 'The overlay repeated Positions on Dashboard. The popover is gone there; tapping a day still selects it via a hidden Recharts tooltip (#112). History and asset details keep the holdings popover — they have no Positions list above the graph.',
    ru: 'Оверлей дублировал Позиции на Сводке. Там карточки нет; тап по дню по-прежнему выбирает его скрытым tooltip Recharts (#112). В Истории и в карточке актива подсказка с активами остаётся — над графиком нет списка Позиций.',
  },
  {
    issue: 132,
    title: {
      en: 'Chart tooltip flickers open then closed on tap',
      ru: 'Подсказка графика мигает: открывается и сразу закрывается',
    },
    en: 'Pinning kept the list open, but a tap still nudged the page. Dismiss-on-scroll treated that jiggle as a real scroll and hid the card. Scroll is ignored for a short grace after pin; a later page scroll still dismisses.',
    ru: 'Закрепление держало список, но тап чуть сдвигал страницу. Скрытие по scroll считало это настоящим скроллом и убирало карточку. Сразу после pin скролл игнорируется; поздний скролл страницы по-прежнему скрывает.',
  },
  {
    issue: 131,
    title: {
      en: 'Chart tooltip is hidden behind the tab bar',
      ru: 'Подсказка графика прячется под нижней панелью',
    },
    en: 'The holdings card is tall (70svh) and lives in main; the tab bar is a later sibling so it painted on top. Main is now above the nav in stacking, the wrapper z-index is higher, and max-height leaves room for the tab bar + safe area.',
    ru: 'Карточка высокая (70svh) и живёт в main; панель вкладок — следующий sibling и рисовалась сверху. Main выше nav по stacking, z-index обёртки больше, max-height оставляет место под таббар и safe area.',
  },
  {
    issue: 130,
    title: {
      en: 'Chart tooltip does not close when tapping away',
      ru: 'Подсказка графика не закрывается по тапу мимо',
    },
    en: '#128 pinned the tooltip until page scroll, so a tap on Positions or empty space left it stuck. Pointer down outside the chart and holdings card now dismisses; taps on the plot or list do not.',
    ru: '#128 закреплял подсказку до скролла страницы, поэтому тап по Позициям или пустому месту её не убирал. Pointer down вне графика и карточки скрывает; тап по графику или списку — нет.',
  },
  {
    issue: 129,
    title: {
      en: 'Show original amount in muted text under converted values on asset details',
      ru: 'Показывать оригинальную сумму серым под пересчётом на карточке актива',
    },
    en: 'Converted history rows showed only the base amount, so checking native meant scrolling up to Original. Same pattern as Dashboard Positions: converted primary, muted native under it when currencies differ.',
    ru: 'В пересчёте строки истории показывали только сумму в базовой валюте — оригинал был только через переключение. Как на Позициях Сводки: пересчёт сверху, приглушённый оригинал под ним, если валюты разные.',
  },
  {
    issue: 128,
    title: {
      en: 'Chart tooltip closes when scrolling its holdings list',
      ru: 'Подсказка графика закрывается при прокрутке списка активов',
    },
    en: 'A finger on the holdings list scrolled the page (Recharts transform + iOS overflow), so dismiss-on-scroll closed the card. That gesture now pins the tooltip, preventDefaults, and pans scrollTop; page scroll still dismisses.',
    ru: 'Палец по списку в подсказке крутил страницу (transform Recharts + overflow на iOS), и скрытие по scroll закрывало карточку. Жест теперь закрепляет подсказку, preventDefault и двигает scrollTop; скролл страницы по-прежнему скрывает.',
  },
  {
    issue: 127,
    title: {
      en: 'No automatic GEL to RUB conversion despite NBG rates',
      ru: 'Нет автоматической конвертации GEL→RUB при курсах НБГ',
    },
    en: 'NBG quotes every currency vs GEL. The parser crossed other codes to RUB but never inverted the RUB row, so GEL holdings had no fx/rub/GEL.json. GEL per GEL is 1, so GEL→RUB = 1 / (RUB rate / quantity).',
    ru: 'НБГ котирует все валюты к лари. Парсер кроссил другие коды в RUB, но не инвертировал строку RUB, поэтому для GEL не было fx/rub/GEL.json. 1 GEL = 1 GEL, значит GEL→RUB = 1 / (курс RUB / quantity).',
  },
  {
    issue: 126,
    title: {
      en: 'Let user pick chart range: week, month, year, all, custom',
      ru: 'Выбор диапазона графика: неделя, месяц, год, всё, свой',
    },
    en: 'Charts only offered Zoom in/out on a 1M→3M→6M→1Y→All ladder. Shared Week / Month / Year / All / Custom chips (with From/To dates) now sit on Dashboard, History, and asset details; zoom stays on the preset ladder and skips Custom.',
    ru: 'Графики давали только Zoom по лестнице 1M→3M→6M→1Y→All. Общие чипы Неделя / Месяц / Год / Всё / Свой (с датами С/По) на Сводке, Истории и карточке актива; масштаб остаётся на пресетах и не заходит в Custom.',
  },
  {
    issue: 125,
    title: {
      en: 'Add a Today button next to Dashboard As of',
      ru: 'Кнопка «Сегодня» рядом с «На дату» на Сводке',
    },
    en: 'After picking a past As of day there was no one-tap return to today. A Turtle-style Today button now sits beside As of and clears the selection.',
    ru: 'После выбора прошедшей даты «На дату» не было быстрого возврата к сегодня. Кнопка «Сегодня» (как в Turtle) рядом с полем сбрасывает выбор.',
  },
  {
    issue: 124,
    title: {
      en: 'Show Positions total for the selected As of date',
      ru: 'Показывать итог Позиций на выбранную дату',
    },
    en: 'Positions listed holdings for As of without a sum. A Total line under the Positions header now shows the same day total as the net-worth headline.',
    ru: 'Позиции на дату перечисляли активы без суммы. Строка «Итого» под заголовком Позиций показывает тот же итог дня, что и карточка чистого капитала.',
  },
  {
    issue: 123,
    title: {
      en: 'Allocation Type rows should expand to show assets',
      ru: 'Строки Типа в Распределении должны раскрываться до активов',
    },
    en: '#122 left Type as a static total. Type rows now expand the same way as Class and Currency (including Original per-currency rows like Cash · USD).',
    ru: '#122 оставлял Тип статическим итогом. Строки Типа раскрываются так же, как Класс и Валюта (включая Original-строки по валюте, например Cash · USD).',
  },
  {
    issue: 122,
    title: {
      en: 'Allocation Class and Currency rows should expand to show assets',
      ru: 'Строки Класса и Валюты в Распределении должны раскрываться до активов',
    },
    en: 'Class and Currency lists were totals only. Rows now expand like Dashboard currency holdings to show the assets in that slice. Type stays a static total.',
    ru: 'Списки Класса и Валюты были только итогами. Строки раскрываются, как позиции по валюте на Сводке, и показывают активы среза. Тип остаётся статическим итогом.',
  },
  {
    issue: 121,
    title: {
      en: 'Allocation share percentages should convert to one base, not compare raw native amounts',
      ru: 'Доли в Распределении должны считаться через одну базу, а не по сырым нативным суммам',
    },
    en: 'Original + All used abs(native amounts) for donut/%. $8,500 looked like 1% of 1.6M ₽. Share math now converts behind the scenes to a hidden RUB default (not leftover Settings EUR); row amounts stay native.',
    ru: 'В Original + Все кольцо и % брали abs нативных сумм. $8 500 выглядели как 1% от 1,6 млн ₽. Доли теперь считаются скрытым пересчётом в RUB (не leftover EUR из настроек); суммы в строках остаются нативными.',
  },
  {
    issue: 108,
    title: {
      en: 'Allocation ignores All / Original and shows everything in EUR',
      ru: 'Распределение игнорирует «Все» / «В оригинале» и показывает всё в EUR',
    },
    en: 'Original Class/Type used leftover base conversion (or an empty “pick Currency” block). They now use nativeBreakdownBy with one row per class/type·currency (Money · RUB), formatted in that currency; Converted still compares in the base.',
    ru: 'Класс/Тип в Original шли через leftover base (или пустой блок «выберите Валюта»). Теперь nativeBreakdownBy — строка на класс/тип·валюту (Деньги · RUB) в этой валюте; «В пересчёте» по-прежнему сравнивает в базе.',
  },
  {
    issue: 112,
    title: {
      en: 'Dashboard Positions should follow the selected chart day',
      ru: 'Позиции на Сводке должны следовать за выбранным днём на графике',
    },
    en: 'On iOS the tooltip could show a historical day while mouseMove/click never fired, so Positions stayed on As of / today. Tooltip active payload now drives onSelectDate (and As of).',
    ru: 'На iOS подсказка могла показать исторический день без mouseMove/click, поэтому Позиции оставались на «На дату» / сегодня. Активный payload подсказки теперь задаёт onSelectDate (и «На дату»).',
  },
  {
    issue: 116,
    title: {
      en: 'Pinch zoom in/out on every chart',
      ru: 'Масштаб щипком на каждом графике',
    },
    en: 'Tooltip covered the plot and stopped multi-touch from reaching pinch handlers. Two-finger pinches now dismiss the tooltip and are not stopPropagated; single-finger scroll in the tooltip still works.',
    ru: 'Подсказка закрывала график и не давала multi-touch дойти до щипка. Щипок двумя пальцами скрывает подсказку и не stopPropagate; прокрутка одним пальцем в подсказке по-прежнему работает.',
  },
  {
    issue: 120,
    title: {
      en: 'Place chart range / pan / zoom controls under each graph',
      ru: 'Разместить диапазон / pan / масштаб графика под каждым графиком',
    },
    en: 'Controls sat above the chart. Moved the range / arrows / zoom strip below NetWorthChart on Dashboard, History, and asset details.',
    ru: 'Элементы управления были над графиком. Полоса диапазона / стрелок / масштаба перенесена под NetWorthChart на Сводке, в Истории и в карточке актива.',
  },
  {
    issue: 118,
    title: {
      en: 'Attach Playwright screenshots to GitHub issues as proof before validation',
      ru: 'Прикреплять скриншоты Playwright к issues как доказательство перед validation',
    },
    en: 'Unit tests alone missed phone UI gaps. Added Playwright smoke captures plus npm run screenshots:capture / screenshots:attach so agents attach visual proof before validation.',
    ru: 'Юнит-тестов не хватало для UI на телефоне. Добавлены Playwright-снимки и npm run screenshots:capture / screenshots:attach, чтобы перед validation прикреплять визуальное доказательство.',
  },
  {
    issue: 117,
    title: {
      en: 'Dashboard date input to choose which day Positions show',
      ru: 'Поле даты на Сводке для выбора дня Позиций',
    },
    en: 'Positions only changed via chart tap. An As of DateField now sets the same selected day (and can resolve holdings outside the visible series window).',
    ru: 'Позиции менялись только нажатием на график. Поле «На дату» задаёт тот же выбранный день (и может взять позиции вне видимого окна серии).',
  },
  {
    issue: 119,
    title: {
      en: 'Show soft warnings (e.g. duplicate snapshot) in light orange',
      ru: 'Показывать мягкие предупреждения (напр. дубликат снимка) светло-оранжевым',
    },
    en: 'Duplicate soft hints used text-muted-foreground, so they looked like helper copy. They now use a design-system --warning token (text-warning / light orange).',
    ru: 'Мягкие подсказки о дубликате использовали text-muted-foreground и выглядели как обычная подсказка. Теперь — токен --warning (text-warning / светло-оранжевый).',
  },
  {
    issue: 113,
    title: {
      en: 'Loading Dashboard takes a long time',
      ru: 'Загрузка Сводки занимает много времени',
    },
    en: 'Dashboard always called ensureRange (Frankfurter) even in Original + All, so offline opens waited on a network timeout. Original now skips remote FX; offline skips Frankfurter and uses cache/static RUB only. Converted history series is not built in Original.',
    ru: 'Сводка всегда вызывала ensureRange (Frankfurter) даже в «В оригинале» + Все, поэтому офлайн ждал таймаут сети. В оригинале удалённый FX не вызывается; офлайн пропускает Frankfurter и берёт кэш/static RUB. Исторический Converted-ряд в Original не строится.',
  },
  {
    issue: 111,
    title: {
      en: 'Allow user to navigate the chart timeline (pan)',
      ru: 'Позволить листать шкалу времени на графике (pan)',
    },
    en: 'Zoom changed window width but the end was always today. Drag alone was not discoverable on-device. Visible ← → arrows (and drag) now shift rangeEnd within earliest…today; All keeps arrows disabled (full span).',
    ru: 'Масштаб менял ширину окна, но конец всегда был «сегодня». Одного жеста было мало — на устройстве не находили. Видимые ← → (и жест) сдвигают rangeEnd в пределах earliest…today; в «All» стрелки выключены (весь диапазон).',
  },
  {
    issue: 107,
    title: {
      en: 'Add support for GEL (Georgian Lari)',
      ru: 'Добавить поддержку GEL (грузинский лари)',
    },
    en: 'BASE_CURRENCIES omitted GEL even though NBG is already used for RUB via GEL. GEL is now in every shared picker; Frankfurter skips it (not on ECB). Converted mode uses manual FX when needed until a dedicated GEL static series exists.',
    ru: 'В BASE_CURRENCIES не было GEL, хотя НБГ уже используется для RUB через GEL. GEL теперь во всех общих списках; Frankfurter его пропускает (нет в ECB). В режиме «В пересчёте» при необходимости — ручные курсы, пока нет отдельного статического ряда GEL.',
  },
  {
    issue: 115,
    title: {
      en: 'Warn on duplicate snapshot (same date and amount) without blocking',
      ru: 'Предупреждать о дубликате снимка (та же дата и сумма), не блокируя',
    },
    en: 'Nothing warned when saving another snapshot with the same date and amount, so accidental doubles were easy. Soft hint only; Save still works.',
    ru: 'При сохранении ещё одного снимка с той же датой и суммой не было предупреждения, поэтому случайные дубликаты были лёгкими. Только мягкая подсказка; Сохранить по-прежнему работает.',
  },
  {
    issue: 109,
    title: {
      en: 'Show institution on Assets subtitle and Dashboard holdings second row',
      ru: 'Показывать учреждение в подписи активов и второй строкой в позициях Сводки',
    },
    en: 'Institution was only on asset details (#102). Assets list showed type alone; Dashboard currency accordion holdings were a single name line. Both now surface institution when set.',
    ru: 'Учреждение было только в карточке актива (#102). В списке активов был один тип; в аккордеоне валют на Сводке — одна строка с именем. Теперь учреждение показывается, если задано.',
  },
  {
    issue: 114,
    title: {
      en: 'Pinch zoom does not work on asset details chart',
      ru: 'Масштаб щипком не работает на графике карточки актива',
    },
    en: 'NetWorthChart only pinched when onZoomIn/onZoomOut were passed. Dashboard wired them via HistoryRange; asset details rendered the chart with no handlers and no range filter, so pinch was a no-op.',
    ru: 'NetWorthChart реагировал на щипок только при onZoomIn/onZoomOut. На Сводке они шли через HistoryRange; в карточке актива график был без колбэков и без фильтра диапазона, поэтому щипок ничего не делал.',
  },
  {
    issue: 110,
    title: {
      en: 'Do not allow negative Y-axis when chart values are non-negative',
      ru: 'Не допускать отрицательную ось Y, если значения графика неотрицательные',
    },
    en: 'chartAxisScale always padded min − pad, so a positive asset series got a floor like −7 тыс. even though every snapshot was ≥ 0. Floor is now clamped to 0 when the data min is ≥ 0; real negatives still pad below zero.',
    ru: 'chartAxisScale всегда делал min − pad, поэтому у положительной серии активов пол уходил в −7 тыс., хотя все снимки ≥ 0. Теперь пол не ниже 0, если минимум данных ≥ 0; реальные отрицательные значения по-прежнему уходят ниже нуля.',
  },
  {
    issue: 106,
    title: {
      en: 'Tab bar still disconnects from the bottom on iPhone 17 Pro Max',
      ru: 'Панель вкладок всё ещё отрывается от низа на iPhone 17 Pro Max',
    },
    en: '#25 used position:fixed bottom:0 like Turtle. That stays put on iPhone 14 Pro. Safari 26 on 17 Pro Max shifts fixed/sticky footers when the URL bar shrinks, leaving a gap. The bar is now in the layout (dvh flex column, main scrolls) instead of fixed.',
    ru: '#25 держала панель position:fixed bottom:0 как Turtle. На iPhone 14 Pro это работает. Safari 26 на 17 Pro Max сдвигает fixed/sticky футер при сжатии адресной строки и оставляет щель. Панель теперь в вёрстке (колонка dvh, скролл в main), а не fixed.',
  },
  {
    issue: 105,
    title: {
      en: 'Do not auto-save Assets order on drop; add a Save control',
      ru: 'Не сохранять порядок активов при отпускании; добавить Сохранить',
    },
    en: 'After #104, dropping a row called persist immediately. Done only left reorder mode. There was no way to try an order and confirm or discard it.',
    ru: 'После #104 отпускание строки сразу писало порядок. «Готово» только выходило из режима. Нельзя было примерить порядок и подтвердить или отменить.',
  },
  {
    issue: 104,
    title: {
      en: 'Only enable Assets drag-and-drop in an explicit reorder mode',
      ru: 'Включать перетаскивание активов только в режиме изменения порядка',
    },
    en: '#100 put a grip on every Assets row. On a phone that competed with opening an asset and made the list feel permanently in edit mode.',
    ru: 'После #100 у каждой строки активов была ручка. На телефоне она мешала открыть актив и список казался постоянно в режиме правки.',
  },
  {
    issue: 103,
    title: {
      en: 'Show snapshot comments in a lighter color and give them more width',
      ru: 'Показывать комментарии к снимкам более светлым цветом и шире',
    },
    en: 'After #97 the note sat in the left column next to the amount and icons, in the same black text-sm as the amount, so a two-line comment wrapped early with empty space to the right.',
    ru: 'После #97 комментарий стоял в левой колонке рядом с суммой и иконками, тем же чёрным text-sm, что и сумма, поэтому двухстрочный текст рано переносился, справа оставалась пустота.',
  },
  {
    issue: 102,
    title: {
      en: 'Show institution name in the asset details sub-header next to currency',
      ru: 'Показывать учреждение в подзаголовке карточки актива рядом с валютой',
    },
    en: 'The details sub-header was hardcoded to type · currency. Institution already exists on the asset and in the details list, but the line under the name never included it.',
    ru: 'Подзаголовок карточки был зашит как тип · валюта. Учреждение уже есть у актива и в списке сведений, но в строке под названием его не было.',
  },
  {
    issue: 101,
    title: {
      en: 'Add regression tests so phone bugs are caught in CI, not only on device',
      ru: 'Добавить регрессионные тесты, чтобы ошибки с телефона ловил CI',
    },
    en: 'Vitest existed, but live-feedback bugs often had no failing test first. Phone sessions were the suite. CI now requires every RCA from #90 onward to be named in a unit test.',
    ru: 'Vitest был, но ошибки с телефона часто шли без падающего теста. Сессии на устройстве и были набором. CI теперь требует, чтобы каждый RCA с #90 был назван в юнит-тесте.',
  },
  {
    issue: 100,
    title: {
      en: 'Sort Assets by name or amount, and allow drag-and-drop order',
      ru: 'Сортировка активов по имени или сумме и порядок перетаскиванием',
    },
    en: 'The Assets list used IndexedDB primary-key order with no sort control. There was no persisted custom order, so cash, deposits, and cards appeared in insert order.',
    ru: 'Список активов шёл в порядке ключей IndexedDB без сортировки. Своего сохранённого порядка не было, поэтому кэш, вклады и карты шли как добавлялись.',
  },
  {
    issue: 99,
    title: {
      en: 'Add bank card / debit card as a Money type',
      ru: 'Добавить тип «банковская / дебетовая карта» для денег',
    },
    en: 'Money types were only bank, savings, cash, and deposit. A Mir debit card had to be saved as Bank account. credit_card already exists under Liabilities as debt, so this is a separate Money type.',
    ru: 'У денег были только счёт, накопления, наличные и вклад. Дебетовую карту Мир приходилось сохранять как банковский счёт. credit_card уже есть в обязательствах как долг, поэтому это отдельный тип денег.',
  },
  {
    issue: 98,
    title: {
      en: 'Fresh and Neutral appearance moods look the same',
      ru: 'Темы «Свежее» и «Нейтральное» выглядят одинаково',
    },
    en: 'Fresh is design-system blue (#2878e8). Neutral used another blue (#4c7dff) on the same light chrome, so Settings chips, Converted, and the + tab looked identical. Neutral was meant to be slate (#57), not a second blue.',
    ru: '«Свежее» — синий дизайн-системы (#2878e8). «Нейтральное» брало другой синий (#4c7dff) на том же светлом хроме, поэтому чипы, «В пересчёте» и «+» совпадали. «Нейтральное» задумывалось сланцевым (#57), не вторым синим.',
  },
  {
    issue: 97,
    title: {
      en: 'Add optional comments on asset entries and show them in History',
      ru: 'Добавить необязательные комментарии к записям активов и показывать их в Истории',
    },
    en: 'Snapshots stored only date, amount, and currency. saveAsset / saveSnapshots copied those fields and dropped anything else, so there was no place for a note on History, details, or holdings.',
    ru: 'Снимки хранили только дату, сумму и валюту. saveAsset / saveSnapshots копировали эти поля и отбрасывали остальное, поэтому комментарию негде было появиться в Истории, карточке и позициях.',
  },
  {
    issue: 96,
    title: {
      en: 'History shows EUR when All currencies is selected',
      ru: 'В Истории EUR, хотя выбраны все валюты',
    },
    en: 'Show all currencies only switches display mode to Original and leaves settings.baseCurrency as the last choice (often EUR). History always formatted with baseCurrency, so it kept showing a converted EUR total.',
    ru: '«Показать все валюты» только включает оригинал и оставляет settings.baseCurrency как прошлый выбор (часто EUR). История всегда форматировала в baseCurrency, поэтому оставался пересчитанный евро.',
  },
  {
    issue: 95,
    title: {
      en: 'Date field is too narrow; expand width by 1.5',
      ru: 'Поле даты слишком узкое; расширить в 1,5 раза',
    },
    en: 'After #84 copied Turtle’s fixed w-36, locale dates like “22 Aug 2026” plus the calendar icon wrapped onto two lines. The field needed 1.5× that width, not another overflow clamp.',
    ru: 'После #84 скопировали фиксированные w-36 из Turtle, и даты вроде «22 Aug 2026» вместе со значком календаря переносились на две строки. Нужна ширина в 1,5 раза больше, а не очередной clamp overflow.',
  },
  {
    issue: 94,
    title: {
      en: 'Settings: root-cause log for shipped issues',
      ru: 'Ещё: журнал корневых причин по выпущенным задачам',
    },
    en: 'Not a defect. Release notes say what shipped, not why it was wrong. RCAs lived only in chat. This list is the in-app log, same card pattern as the changelog.',
    ru: 'Не дефект. «Что нового» говорит, что вышло, а не почему было неправильно. RCA оставались в чате. Этот список — журнал в приложении, в том же виде, что и список изменений.',
  },
  {
    issue: 93,
    title: {
      en: 'Rate editor shows 1 RUB = 119474 USD',
      ru: 'Редактор курсов показывает 1 RUB = 119474 USD',
    },
    en: 'Rate fields reused money parsing. parseAmount treats a dot or comma as a decimal only when the fraction has one or two digits. A real 1 RUB→USD quote like 0.0119474 has more digits, so the separator was stripped (0.0119474 → 119474). Blur then formatted that as a USD amount.',
    ru: 'Поля курса использовали разбор денег. parseAmount считает точку или запятую десятичной только при 1–2 знаках после неё. Реальная котировка 1 RUB→USD вроде 0.0119474 длиннее, разделитель выкидывался (0.0119474 → 119474). По потере фокуса это форматировалось как сумма в долларах.',
  },
  {
    issue: 92,
    title: {
      en: 'Chart holdings popover clips the last row',
      ru: 'Подсказка по позициям на графике обрезает последнюю строку',
    },
    en: 'The tooltip was capped at 15rem with overflow-y-auto. Six two-line holdings plus date and total need more space, so the last row clipped. iOS hides overlay scrollbars, and touches bubbled to the chart, so the overflow was not usable.',
    ru: 'Подсказка была ограничена 15rem с overflow-y-auto. Шесть двухстрочных позиций плюс дата и итог не влезают, последняя строка обрезалась. iOS прячет оверлейные скроллбары, касания уходили в график — прокрутка не работала.',
  },
  {
    issue: 91,
    title: {
      en: 'Tab bar floats mid-screen after resume from background',
      ru: 'Панель вкладок посередине экрана после возврата из фона',
    },
    en: 'The bar is position:fixed plus translateY(visualViewport offsetTop + height − innerHeight). Listeners were only resize/scroll. After iOS PWA resume, Safari often keeps a stale short visualViewport height, so the shift stays largely negative and the bar sits over the chart.',
    ru: 'Панель — position:fixed плюс translateY(offsetTop + height − innerHeight у visualViewport). Слушались только resize/scroll. После возврата PWA iOS часто оставляет устаревшую короткую высоту visualViewport, сдвиг остаётся сильно отрицательным, панель висит на графике.',
  },
  {
    issue: 90,
    title: {
      en: 'History 3M change is last two snapshot days',
      ru: 'Изменение за 3М в Истории — это два последних снимка',
    },
    en: 'The 3M chip still meant 90 days, but rangeStartIso clamps to the first snapshot. With data only from 17 Aug, the window was 17–22 Aug while copy still said “over 3M”. List deltas are vs the previous snapshot day, so two snapshots made that equal the whole window. The chart axis followed the clamped series.',
    ru: 'Чип 3М по-прежнему значил 90 дней, но rangeStartIso обрезает к первому снимку. При данных только с 17 авг. окно было 17–22 авг., а подпись всё ещё «за 3М». Дельта в списке — к предыдущему дню снимка, при двух снимках она совпадала со всем окном. Ось графика шла за обрезанным рядом.',
  },
  {
    issue: 89,
    title: {
      en: 'Dashboard and History show different period deltas',
      ru: 'Сводка и История показывают разную дельту за период',
    },
    en: 'Totals already matched. Definitions did not. Dashboard “this month” is From amounts (#86). History used last − first of the converted series (amounts + FX). On device that was −49,933.36 vs −61,891.82; the gap is exactly From rates.',
    ru: 'Итоги уже совпадали, определения — нет. «За этот месяц» на Сводке — «Из сумм» (#86). История брала последнюю минус первую точку пересчитанного ряда (суммы + FX). На устройстве это −49 933,36 против −61 891,82; разница ровно «Из курсов».',
  },
  {
    issue: 88,
    title: {
      en: 'Show amount change vs rate change on Dashboard',
      ru: 'Показать изменение из сумм и из курсов на Сводке',
    },
    en: 'Not a defect in isolation. Converted period change was one number, so an FX drop on dollars already held looked like a cash loss. There was no split and no “update rates” that only fetches quotes.',
    ru: 'Само по себе не дефект. Изменение за период в пересчёте было одним числом, поэтому падение курса уже имевшихся долларов выглядело как потеря кэша. Не было разбиения и кнопки «обновить курсы», которая только подтягивает котировки.',
  },
  {
    issue: 87,
    title: {
      en: 'All currencies selected but EUR still shown',
      ru: 'Выбраны все валюты, но показан EUR',
    },
    en: 'In Converted mode the Dashboard filter still showed All, while totals were in the base currency. The control was leftover from Original + All; Converted has no “all currencies” total, only the base.',
    ru: 'В режиме пересчёта фильтр Сводки всё ещё показывал «Все», хотя итоги были в базовой валюте. Контрол остался от «В оригинале + Все»; у пересчёта нет итога «все валюты», только база.',
  },
  {
    issue: 86,
    title: {
      en: 'Dashboard this-month change includes FX on existing dollars',
      ru: 'Изменение за месяц на Сводке включает FX по уже имеющимся долларам',
    },
    en: '“This month” used full converted start→end. Marking existing USD to a weaker RUB rate dominated the headline (~61k), not the cash exchange (~6k). Amount updates and FX on starting balances were not separated in the StatCard.',
    ru: '«За этот месяц» брало полный пересчёт начало→конец. Переоценка уже имевшихся USD более слабым курсом рубля доминировала в заголовке (~61k), а не обмен кэша (~6k). В карточке не разделялись изменения сумм и FX на стартовых остатках.',
  },
  {
    issue: 85,
    title: {
      en: 'Dashboard month change has no breakdown',
      ru: 'У изменения за месяц на Сводке нет расшифровки',
    },
    en: 'After a cash USD purchase the headline looked like a large loss with no way to see amounts vs rates. The split existed in domain later (#88); the UI had no hint or expandable lines.',
    ru: 'После покупки долларов за кэш заголовок выглядел как большая потеря, без сумм против курсов. Разбиение позже появилось в домене (#88); в UI не было подсказки и раскрываемых строк.',
  },
  {
    issue: 84,
    title: {
      en: 'Safari date fields overflow the card',
      ru: 'Поля даты в Safari вылезают за карточку',
    },
    en: 'Safari ignores max-width/overflow on input[type=date] and lays the native control out at intrinsic width, stretching the page. Turtle #47 uses a fixed h-12 w-36 field instead of clipping.',
    ru: 'Safari игнорирует max-width/overflow у input[type=date] и рисует нативный контрол по собственной ширине, растягивая страницу. Turtle #47 задаёт поле h-12 w-36, а не обрезает overflow.',
  },
  {
    issue: 83,
    title: {
      en: 'No way to change currency when editing a past snapshot',
      ru: 'Нельзя сменить валюту при правке прошлого снимка',
    },
    en: 'The snapshot editor exposed date and amount only. Currency lived on the row in IndexedDB but had no control, so a wrong-currency snapshot could not be corrected in place.',
    ru: 'Редактор снимка показывал только дату и сумму. Валюта уже была в IndexedDB, но без контрола ошибочную валюту нельзя было исправить на месте.',
  },
  {
    issue: 82,
    title: {
      en: 'Update-this-asset inputs overflow the phone screen',
      ru: 'Поля «Обновить этот актив» не влезают в экран телефона',
    },
    en: 'Amount and Save sat on one row with the date field. On a narrow phone the flex row overflowed. Date width is a separate Safari issue (#84).',
    ru: 'Сумма и «Сохранить» стояли в одном ряду с датой. На узком телефоне flex-ряд вылезал. Ширина даты — отдельный баг Safari (#84).',
  },
  {
    issue: 81,
    title: {
      en: 'Dashboard and History show different net worth totals',
      ru: 'Сводка и История показывают разный чистый капитал',
    },
    en: 'History values each day at that day’s FX. Dashboard Converted used each holding’s snapshot date rate (or a mixed path), so “today’s” headline was not today’s historicalNetWorth point. Deltas are #89.',
    ru: 'История оценивает каждый день курсом той даты. Сводка в пересчёте брала курс на дату снимка позиции (или смешанный путь), поэтому «сегодняшний» заголовок не был точкой historicalNetWorth на сегодня. Дельты — #89.',
  },
  {
    issue: 80,
    title: {
      en: 'Tab bar hides on scroll and can reappear mid-page',
      ru: 'Панель вкладок прячется при скролле и всплывает посередине',
    },
    en: 'A visual-viewport shrink (URL bar, dynamic chrome) was treated like the keyboard, so the bar hid or translated with a stale offset while scrolling. Keyboard focus should still hide it; pin-to-bottom is #25.',
    ru: 'Сжатие visual viewport (адресная строка, хром) считалось клавиатурой, панель пряталась или ехала со старым сдвигом при скролле. При фокусе в поле её по-прежнему нужно скрывать; прижатие к низу — #25.',
  },
  {
    issue: 79,
    title: {
      en: 'History list shows every calendar day',
      ru: 'Список Истории показывает каждый календарный день',
    },
    en: 'The list reused the daily carry-forward series built for the chart. Days the user never edited appeared as rows. The chart still needs those interpolated days to draw a line.',
    ru: 'Список брал дневной ряд с переносом, построенный для графика. Дни без правок пользователя становились строками. Графику эти дни всё ещё нужны, чтобы нарисовать линию.',
  },
  {
    issue: 78,
    title: {
      en: 'Adopt the My Money design system as the default UI',
      ru: 'Взять дизайн-систему My Money как UI по умолчанию',
    },
    en: 'Not a defect. Product default was still an older mood. Fresh was added from the design system for new installs; existing moods were left alone so on-device themes did not jump.',
    ru: 'Не дефект. По умолчанию стояла старая тема. «Свежее» добавлено из дизайн-системы для новых установок; старые темы не трогали, чтобы оформление на телефоне не прыгнуло.',
  },
  {
    issue: 77,
    title: {
      en: 'Dashboard chart tooltip stays visible while scrolling',
      ru: 'Подсказка графика Сводки остаётся при прокрутке',
    },
    en: 'Recharts keeps the tooltip active after a tap on iOS; page scroll does not clear it. There was no listener to dismiss on scroll.',
    ru: 'Recharts на iOS оставляет подсказку активной после тапа; скролл страницы её не сбрасывает. Не было слушателя, который закрывает её при прокрутке.',
  },
  {
    issue: 74,
    title: {
      en: 'Chart X-axis repeats the same date',
      ru: 'Ось X графика повторяет одну и ту же дату',
    },
    en: 'Ticks used date.slice(8) (day-of-month only). Several August days all labeled “18”, and same-day snapshots duplicated ticks.',
    ru: 'Подписи брали date.slice(8) (только число). Несколько августовских дней подписывались «18», снимки одного дня дублировали риски.',
  },
  {
    issue: 73,
    title: {
      en: 'Allow deleting previous snapshot rows',
      ru: 'Разрешить удаление прошлых строк снимков',
    },
    en: 'Not a defect. History rows could not be removed without deleting the whole asset. There was no per-row delete or confirmation.',
    ru: 'Не дефект. Строку истории нельзя было убрать, не удалив актив. Не было удаления по строке и подтверждения.',
  },
  {
    issue: 72,
    title: {
      en: 'Allow editing previous snapshot rows',
      ru: 'Разрешить правку прошлых строк снимков',
    },
    en: 'Not a defect. Saving from a history row appended today instead of updating that snapshot. There was no in-place edit of amount/date.',
    ru: 'Не дефект. Сохранение из строки истории добавляло сегодня, а не обновляло снимок. Не было правки суммы/даты на месте.',
  },
  {
    issue: 71,
    title: {
      en: 'Explain the two amount inputs with an info tooltip',
      ru: 'Пояснить два поля суммы подсказкой',
    },
    en: 'Not a defect. “Update this asset” vs “New amount (optional)” looked like duplicates. Hover-only tooltips do not work on the phone.',
    ru: 'Не дефект. «Обновить этот актив» и «Новая сумма (необязательно)» выглядели как дубли. Подсказки только по hover на телефоне не работают.',
  },
  {
    issue: 70,
    title: {
      en: 'Original mode still shows a EUR conversion on one asset',
      ru: 'В режиме «В оригинале» у актива всё ещё пересчёт в EUR',
    },
    en: 'Native lists still appended an estimated euro line from the converted path. Original mode is supposed to show only the holding’s currency.',
    ru: 'Списки в оригинале всё ещё добавляли оценку в евро из пути пересчёта. Режим «В оригинале» должен показывать только валюту позиции.',
  },
  {
    issue: 69,
    title: {
      en: 'Show assets distribution on Dashboard when currency is All',
      ru: 'Показать распределение активов на Сводке при валюте «Все»',
    },
    en: 'Original + All had no on-Dashboard breakdown of what made the totals (a donut was tried, then reverted). Currency totals now expand to holdings; Allocation stays its own page.',
    ru: 'В «В оригинале + Все» на Сводке не было расшифровки итогов (кольцо пробовали, потом убрали). Итоги по валюте раскрываются в позиции; Распределение остаётся отдельной страницей.',
  },
  {
    issue: 68,
    title: {
      en: 'Date input is broken in the PWA',
      ru: 'Поле даты сломано в PWA',
    },
    en: 'iPhone PWA date inputs had no reliable calendar affordance; the native picker often did not open. Overlaying the indicator so the whole field opens the picker (and later a fixed width, #84) was required.',
    ru: 'В PWA на iPhone у даты не было понятной иконки календаря; системный picker часто не открывался. Нужен оверлей индикатора на всё поле (и позже фиксированная ширина, #84).',
  },
  {
    issue: 67,
    title: {
      en: 'Existing asset Save does nothing; add a read-only mode',
      ru: 'Сохранить у существующего актива ничего не делает',
    },
    en: 'Opening an asset showed the edit form with Save. With no dirty fields, Save was a no-op. There was no view vs edit split.',
    ru: 'Открытие актива показывало форму с «Сохранить». Без изменений Save ничего не делал. Не было разделения просмотр / правка.',
  },
  {
    issue: 66,
    title: {
      en: 'Add and edit past snapshot entries on existing assets',
      ru: 'Добавлять и править прошлые снимки у существующих активов',
    },
    en: 'Not a defect. Updates were today-only, so backfill of history was impossible from Update this asset / Save details. Edit of an existing row is #72.',
    ru: 'Не дефект. Обновления были только на сегодня, историю нельзя было дописать из «Обновить этот актив» / «Сохранить сведения». Правка существующей строки — #72.',
  },
  {
    issue: 65,
    title: {
      en: 'Show what each day’s total is made of',
      ru: 'Показать, из чего складывается сумма дня',
    },
    en: 'Not a defect. The chart and History showed only a combined total. There was no per-day holdings breakdown in the tooltip or list.',
    ru: 'Не дефект. График и История показывали только общий итог. Не было расшифровки позиций за день в подсказке или списке.',
  },
  {
    issue: 64,
    title: {
      en: 'Dashboard chart shows a decrease when holdings did not change',
      ru: 'График Сводки падает, хотя позиции не менялись',
    },
    en: 'A day without an FX quote treated the holding as unconvertible (dropped from the total). The series did not carry forward the last earlier rate, so the line dipped with no amount change.',
    ru: 'День без котировки считал позицию неконвертируемой (выбрасывал из суммы). Ряд не переносил последний более ранний курс, линия проседала без изменения сумм.',
  },
  {
    issue: 63,
    title: {
      en: 'Pages deploy fails type-check on Colorful CSS test Node imports',
      ru: 'Деплой Pages падает на typecheck теста Colorful с Node-импортами',
    },
    en: 'A test that imported Node fs lived under src/, so app tsc -b typechecked it during Pages deploy and failed.',
    ru: 'Тест с импортом Node fs лежал в src/, поэтому tsc -b приложения на деплое Pages его проверял и падал.',
  },
  {
    issue: 62,
    title: {
      en: 'Pages deploy of #61 failed on a racy Settings currency test',
      ru: 'Деплой Pages для #61 упал на гонке в тесте валюты настроек',
    },
    en: 'The Converted-mode test asserted the base-currency dropdown was enabled before settings finished loading from IndexedDB, so CI was flaky.',
    ru: 'Тест режима пересчёта проверял, что селект базовой валюты включён, до загрузки настроек из IndexedDB — CI был флаки.',
  },
  {
    issue: 61,
    title: {
      en: 'Allow adding an asset with a past first-snapshot date',
      ru: 'Разрешить завести актив с первой датой в прошлом',
    },
    en: 'Not a defect. New assets always snapshotted today, so history could not start on a past As of date. Future dates were not rejected either.',
    ru: 'Не дефект. Новый актив всегда снимался на сегодня, историю нельзя было начать с прошедшей «На дату». Будущие даты тоже не отклонялись.',
  },
  {
    issue: 60,
    title: {
      en: 'Collapse Dashboard holdings behind an accordion',
      ru: 'Свернуть позиции Сводки в аккордеон',
    },
    en: 'Not a defect. Holdings always expanded and pushed the chart far below net worth on a phone.',
    ru: 'Не дефект. Позиции всегда были развёрнуты и на телефоне уезжали график далеко от чистого капитала.',
  },
  {
    issue: 59,
    title: {
      en: 'Retune Colorful mood so it is not a black UI',
      ru: 'Перенастроить «Цветное», чтобы UI не был чёрным',
    },
    en: 'Colorful was either too black or later too teal/green versus the intended charcoal + violet actions. Tokens did not match the agreed mock.',
    ru: '«Цветное» было либо слишком чёрным, либо слишком бирюзово-зелёным вместо угля и фиолетовых действий. Токены не совпадали с макетом.',
  },
  {
    issue: 58,
    title: {
      en: 'History shows 0,00 for the selected range while the list moved',
      ru: 'История показывает 0,00 за диапазон, хотя список двигался',
    },
    en: 'Period change compared “current net worth” to a point that used a different FX date, so a pure rate move printed 0,00. It needed last − first of the visible series.',
    ru: 'Изменение за период сравнивало «текущий капитал» с точкой на другой дате курса, чистое движение курса давало 0,00. Нужно last − first видимого ряда.',
  },
  {
    issue: 57,
    title: {
      en: 'Add Soft Finance, Neutral, and Pastel moods',
      ru: 'Добавить темы Спокойное, Нейтральное и Пастель',
    },
    en: 'Not a defect. Only Colorful and Green existed; Colorful was the only non-green look.',
    ru: 'Не дефект. Были только Цветное и Зелёное; Цветное — единственный не-зелёный вид.',
  },
  {
    issue: 56,
    title: {
      en: 'Chart Y-axis repeats the same compact label',
      ru: 'Ось Y графика повторяет одну компактную подпись',
    },
    en: 'Compact formatting rounded a tight ~2M range to the same “2M” on every tick. Domain was not padded and ticks were not forced unique.',
    ru: 'Компактный формат округлял узкий диапазон ~2 млн к одному «2 млн» на каждой риске. Домен не расширяли, уникальные тики не задавали.',
  },
  {
    issue: 55,
    title: {
      en: 'Safari unbinds fetch — static RUB rates never load',
      ru: 'Safari отвязывает fetch — статические курсы RUB не грузятся',
    },
    en: 'Passing window.fetch as a callback made Safari throw “Can only call Window.fetch on instances of Window”. FX clients must call globalThis.fetch as a method.',
    ru: 'Передача window.fetch колбэком в Safari даёт «Can only call Window.fetch on instances of Window». FX-клиенты должны вызывать globalThis.fetch как метод.',
  },
  {
    issue: 54,
    title: {
      en: 'Pinch to zoom charts',
      ru: 'Масштаб графиков щипком',
    },
    en: 'Not a defect. Zoom existed only as buttons; there was no pinch, unlike Turtle Steps.',
    ru: 'Не дефект. Зум был только кнопками, без щипка, в отличие от Turtle Steps.',
  },
  {
    issue: 53,
    title: {
      en: 'In-app FX debug panel for iPhone Safari / PWA',
      ru: 'Панель отладки FX в приложении для Safari / PWA',
    },
    en: 'Converted totals failed on device with no Mac console. localStorage debug (#49) was not reachable from iPhone. Settings needed an on-screen log and copy.',
    ru: 'Пересчёт на устройстве ломался без консоли Mac. localStorage-отладка (#49) с iPhone недоступна. В настройках нужен был лог на экране и копирование.',
  },
  {
    issue: 52,
    title: {
      en: 'Show unconvertible holdings instead of hiding them',
      ru: 'Показывать неконвертируемые позиции, а не скрывать',
    },
    en: 'Missing FX dropped holdings from Converted lists, so the book looked smaller with no explanation. Native amount + “conversion not available” had to stay visible.',
    ru: 'Без курса позиции выпадали из списков пересчёта — книга казалась меньше без объяснения. Нужно оставлять сумму в оригинале и пометку «конвертация недоступна».',
  },
  {
    issue: 51,
    title: {
      en: 'Converted Dashboard should list each item with original and converted amounts',
      ru: 'Сводка в пересчёте должна показывать оригинал и пересчёт по каждой позиции',
    },
    en: 'Not a defect. Converted showed only a combined total. There was no per-holding native + base pair under it.',
    ru: 'Не дефект. В пересчёте был только общий итог. Не было пар оригинал + база по каждой позиции.',
  },
  {
    issue: 50,
    title: {
      en: 'Manual FX save gives no feedback',
      ru: 'Сохранение ручных курсов без обратной связи',
    },
    en: 'After save the editor stayed open with no confirmation, so it was unclear whether overrides applied. It needed to collapse and show a read-only list.',
    ru: 'После сохранения редактор оставался открытым без подтверждения — непонятно, применились ли курсы. Нужно сворачивать и показывать список только для чтения.',
  },
  {
    issue: 49,
    title: {
      en: 'Converted totals still fail on device — add FX diagnostic loggers',
      ru: 'Пересчёт на устройстве всё ещё падает — добавить логи FX',
    },
    en: 'On-device Converted stayed zero/missing with no trace of static RUB fetch or ensureRange. There was no opt-in logger for iPhone.',
    ru: 'На устройстве пересчёт оставался нулём без следа загрузки RUB или ensureRange. Не было opt-in логгера для iPhone.',
  },
  {
    issue: 48,
    title: {
      en: 'Static CBR RUB dataset deploys empty',
      ru: 'Статический набор CBR RUB деплоится пустым',
    },
    en: 'The CBR XML parser required attributes the feed did not put on Record (Date/Id). The generate step produced empty series and still deployed. Copy also blamed ECB.',
    ru: 'Парсер XML CBR требовал атрибуты, которых нет на Record (Date/Id). Генерация давала пустые серии и всё равно деплоилась. Тексты винили ЕЦБ.',
  },
  {
    issue: 47,
    title: {
      en: 'Use National Bank of Georgia rates for RUB conversion',
      ru: 'Курсы НБ Грузии для конвертации RUB',
    },
    en: 'CBR/static paths were empty or blocked. NBG JSON (GEL cross, quantity applied) is a same-origin static source that actually has RUB.',
    ru: 'Пути CBR/static были пустыми или заблокированы. JSON НБГ (кросс через GEL, с quantity) — same-origin источник, в котором RUB есть.',
  },
  {
    issue: 46,
    title: {
      en: 'Original + All should show every native holding; disable inactive currency dropdown',
      ru: '«В оригинале + Все» — все нативные позиции; выключить неактивный селект валюты',
    },
    en: 'Original + All still mixed converted totals or left both Settings and Dashboard currency controls active, which contradicted the mode.',
    ru: '«В оригинале + Все» смешивало пересчёт или оставляло активными оба выбора валюты (настройки и Сводка), что противоречило режиму.',
  },
  {
    issue: 45,
    title: {
      en: 'Allow manual entry of today’s FX rates as a fallback',
      ru: 'Ручной ввод курсов на сегодня как запасной путь',
    },
    en: 'Not a defect. When reference rates were missing, Converted had no same-day override. There was no Settings editor merged above system quotes.',
    ru: 'Не дефект. Без справочных курсов в пересчёте не было переопределения на сегодня. Не было редактора в настройках поверх системных котировок.',
  },
  {
    issue: 44,
    title: {
      en: 'Own a static RUB FX dataset for the PWA',
      ru: 'Свой статический набор курсов RUB для PWA',
    },
    en: 'Browser-side live fetches for RUB failed on the phone (CORS, Safari, blocked APIs). The PWA needed same-origin files generated at deploy.',
    ru: 'Живые запросы RUB в браузере на телефоне падали (CORS, Safari, закрытые API). PWA нужны same-origin файлы, собранные на деплое.',
  },
  {
    issue: 43,
    title: {
      en: 'Add a Dashboard currency filter dropdown',
      ru: 'Добавить фильтр валюты на Сводке',
    },
    en: 'Not a defect. Filtering the chart/totals required changing global Settings display mode.',
    ru: 'Не дефект. Фильтр графика/итогов требовал менять глобальный режим в настройках.',
  },
  {
    issue: 42,
    title: {
      en: 'Add a show-all-currencies display option',
      ru: 'Опция «показать все валюты»',
    },
    en: 'Not a defect. Settings only had a single base currency, so native mixed books always converted.',
    ru: 'Не дефект. В настройках была только одна базовая валюта, смешанная книга всегда пересчитывалась.',
  },
  {
    issue: 41,
    title: {
      en: 'Add zoom in and zoom out controls for graphs',
      ru: 'Кнопки увеличения и уменьшения графиков',
    },
    en: 'Not a defect. History range chips existed on History; Dashboard had no in-place zoom.',
    ru: 'Не дефект. Чипы диапазона были в Истории; на Сводке не было зума на месте.',
  },
  {
    issue: 40,
    title: {
      en: 'Add spacing between bottom content and sticky footer',
      ru: 'Отступ между контентом и липким футером',
    },
    en: 'Main scroll area did not reserve enough padding for the fixed tab bar plus iOS safe area, so the last control sat under the footer.',
    ru: 'У основной прокрутки не хватало padding под фиксированную панель и safe area iOS — последний контрол оказывался под футером.',
  },
  {
    issue: 39,
    title: {
      en: 'Show pull-to-refresh loading indicator in the PWA',
      ru: 'Индикатор pull-to-refresh в PWA',
    },
    en: 'Not a defect. Pull-to-refresh had no visible badge/spinner (Turtle has PullToRefreshIndicator).',
    ru: 'Не дефект. У pull-to-refresh не было бейджа/спиннера (в Turtle есть PullToRefreshIndicator).',
  },
  {
    issue: 38,
    title: {
      en: 'Offline banner does not show in Safari',
      ru: 'Баннер офлайна не показывается в Safari',
    },
    en: 'navigator.onLine stays true in iPhone Safari airplane mode. The banner only listened to the browser offline flag, not a connectivity check that Safari actually fails.',
    ru: 'navigator.onLine в Safari на iPhone в авиарежиме остаётся true. Баннер слушал только флаг браузера, а не проверку сети, которая в Safari реально падает.',
  },
  {
    issue: 37,
    title: {
      en: 'Installed PWA does not pick up new deploys',
      ru: 'Установленное PWA не подхватывает новые деплои',
    },
    en: 'The old service worker never loaded the update-banner code (#34 chicken-and-egg). version.json could be current while the shell stayed cached. Polling and cache bypass were required.',
    ru: 'Старый service worker не загружал код баннера обновления (#34 — порочный круг). version.json мог быть новым при старой оболочке. Нужны опрос и обход кэша.',
  },
  {
    issue: 36,
    title: {
      en: 'Show changelog and app version on Settings',
      ru: 'Показать список изменений и версию в настройках',
    },
    en: 'Not a defect. There was no way to see which build the phone was on. Turtle’s incrementing vN notes were copied.',
    ru: 'Не дефект. Нельзя было понять, какая сборка на телефоне. Взят подход Turtle с нарастающим vN.',
  },
  {
    issue: 35,
    title: {
      en: 'Offline banner and resilient refresh via service worker',
      ru: 'Баннер офлайна и обновление через service worker',
    },
    en: 'PWA refresh while offline dumped the SPA; #16 only scaffolded the worker. There was no precache or offline banner.',
    ru: 'Обновление PWA без сети сбрасывало SPA; #16 только набросал worker. Не было precache и баннера офлайна.',
  },
  {
    issue: 34,
    title: {
      en: 'Show banner when a new deploy is available',
      ru: 'Баннер, когда вышел новый деплой',
    },
    en: 'Not a defect at first, then a gap: Pages deploys did not signal the open tab. No poll of version.json vs baked app version, no Reload in the shell.',
    ru: 'Сначала не дефект, потом пробел: деплой Pages не сигналил открытой вкладке. Не было опроса version.json против зашитой версии и Reload в оболочке.',
  },
  {
    issue: 33,
    title: {
      en: 'Format money inputs with locale grouping and decimals',
      ru: 'Форматировать ввод денег с разрядами и копейками',
    },
    en: 'Lists used formatAmount; inputs showed raw 116420. There was no shared editable formatter with the #29 parser.',
    ru: 'Списки шли через formatAmount; в полях было голое 116420. Не было общего форматтера ввода с парсером #29.',
  },
  {
    issue: 32,
    title: {
      en: 'Permanently delete an asset and its history',
      ru: 'Навсегда удалить актив и его историю',
    },
    en: 'Not a defect. Archive hid assets; there was no cascade delete of snapshots and no confirm UI.',
    ru: 'Не дефект. Архив скрывал активы; не было каскадного удаления снимков и UI подтверждения.',
  },
  {
    issue: 31,
    title: {
      en: 'Hide an asset from the active list',
      ru: 'Скрыть актив из рабочего списка',
    },
    en: 'Archive existed in the domain but the only control was a buried “Archive asset” label. Hide/restore was not obvious.',
    ru: 'Архив в домене был, но единственный контрол — спрятанная подпись «Архивировать». Скрыть/вернуть было неочевидно.',
  },
  {
    issue: 30,
    title: {
      en: 'Exclude an asset from net worth without hiding it',
      ru: 'Исключить актив из капитала, не скрывая его',
    },
    en: 'trackingStatus excluded already existed but only as a buried Tracking select. There was no clear Exclude control on the asset.',
    ru: 'trackingStatus excluded уже был, но только как спрятанный селект Tracking. Явного «Не учитывать» на активе не было.',
  },
  {
    issue: 29,
    title: {
      en: 'Cannot enter kopecks/cents: comma decimals fail validation',
      ru: 'Нельзя ввести копейки: запятая не проходит валидацию',
    },
    en: 'Forms used Number() which rejects 16155,11. CSV parseAmount already accepted comma decimals; the inputs did not share it.',
    ru: 'Формы вызывали Number(), который отвергает 16155,11. CSV parseAmount уже принимал запятую; поля ввода его не использовали.',
  },
  {
    issue: 28,
    title: {
      en: 'Record ownership share for jointly owned assets',
      ru: 'Доля владения для совместных активов',
    },
    en: 'Not a defect. Net worth always used 100% of the recorded value. There was no share on the asset applied to the total.',
    ru: 'Не дефект. В капитал всегда шла 100% записанной суммы. Доли на активе, которая умножает итог, не было.',
  },
  {
    issue: 27,
    title: {
      en: 'Make car a first-class, obvious asset',
      ru: 'Сделать машину очевидным активом',
    },
    en: 'Not a defect. Vehicle existed under Property in the model but was easy to miss in the add flow. Quick-add chips needed to surface it.',
    ru: 'Не дефект. Транспорт был в модели под Property, но его было легко не увидеть при добавлении. Нужны быстрые чипы.',
  },
  {
    issue: 26,
    title: {
      en: 'Add a colorful appearance mood matching the mockups',
      ru: 'Цветная тема по макетам',
    },
    en: 'Not a defect. Only the green mood existed. A second data-mood (neutral chrome + category colors) was missing.',
    ru: 'Не дефект. Была только зелёная тема. Второго data-mood (нейтральный хром + цвета категорий) не было.',
  },
  {
    issue: 25,
    title: {
      en: 'Tab bar disconnects from the bottom on iPhone Safari',
      ru: 'Панель вкладок отрывается от низа в Safari на iPhone',
    },
    en: 'A visualViewport translateY pin jumped on History scroll (IMG_0348). Turtle’s still fixed inset-x-0 bottom-0 footer does not translate (IMG_0349). Keyboard hide stays #80.',
    ru: 'Сдвиг translateY от visualViewport прыгал при прокрутке Истории (IMG_0348). Неподвижный футер Turtle fixed inset-x-0 bottom-0 не сдвигается (IMG_0349). Скрытие с клавиатуры — #80.',
  },
  {
    issue: 24,
    title: {
      en: 'Tab bar sits flush on the iPhone home indicator',
      ru: 'Панель вкладок прилипает к индикатору Home',
    },
    en: 'viewport-fit=cover was missing, so env(safe-area-inset-bottom) was 0. Tab links were also shorter than a comfortable tap target.',
    ru: 'Не было viewport-fit=cover, поэтому env(safe-area-inset-bottom) был 0. Ссылки вкладок были ниже удобной зоны нажатия.',
  },
  {
    issue: 23,
    title: {
      en: 'RUB assets show €0 when base currency is EUR',
      ru: 'Активы в RUB показывают €0 при базе EUR',
    },
    en: 'Frankfurter/ECB has no RUB. Converted RUB→EUR went through a missing pair and became 0. The app needed a hosted RUB dataset (later NBG static files), not a live ECB lookup.',
    ru: 'У Frankfurter/ЕЦБ нет RUB. Пересчёт RUB→EUR шёл через отсутствующую пару и давал 0. Нужен свой набор RUB (позже статика НБГ), а не живой ЕЦБ.',
  },
  {
    issue: 22,
    title: {
      en: 'Tab favicon is clipped',
      ru: 'Фавикон во вкладке обрезан',
    },
    en: 'Tiny sizes were a center crop of the full mark, so the M was clipped. 64px icons needed padding like Turtle favicon-64.',
    ru: 'Маленькие размеры — центральный кроп полной марки, буква M обрезалась. Для 64px нужен отступ, как у Turtle favicon-64.',
  },
  {
    issue: 21,
    title: {
      en: 'Use light and dark My Money marks as favicons',
      ru: 'Светлый и тёмный знаки My Money как фавиконы',
    },
    en: 'Not a defect. The tab used a generic/Vite icon. Light/dark PNG marks and prefers-color-scheme were not wired.',
    ru: 'Не дефект. Во вкладке была иконка Vite/заглушка. Светлый/тёмный PNG и prefers-color-scheme не были подключены.',
  },
  {
    issue: 18,
    title: {
      en: 'Epic 17 — Accessibility and responsive QA pass',
      ru: 'Эпик 17 — доступность и адаптив',
    },
    en: 'Not a defect. Planned QA: skip link, chip aria-pressed, contrast, scrollable chip rows were not in the first shell.',
    ru: 'Не дефект. Запланированный QA: skip link, aria-pressed у чипов, контраст, прокрутка рядов чипов не входили в первый каркас.',
  },
  {
    issue: 17,
    title: {
      en: 'Epic 16 — Localization (English and Russian)',
      ru: 'Эпик 16 — локализация (EN и RU)',
    },
    en: 'Not a defect. Planned work. UI strings were English-only until a typed dictionary and Settings locale existed.',
    ru: 'Не дефект. Запланировано. Строки UI были только на английском, пока не появились типизированный словарь и locale в настройках.',
  },
  {
    issue: 16,
    title: {
      en: 'Epic 15 — PWA installability',
      ru: 'Эпик 15 — установка PWA',
    },
    en: 'Not a defect. Planned work. There was no manifest/service worker (later skipped in Capacitor). FX failures had no cache policy yet.',
    ru: 'Не дефект. Запланировано. Не было манифеста/service worker (в Capacitor позже пропускается). У падений FX ещё не было политики кэша.',
  },
  {
    issue: 15,
    title: {
      en: 'Epic 14 — CSV export and import',
      ru: 'Эпик 14 — CSV экспорт и импорт',
    },
    en: 'Not a defect. Planned work. JSON backup existed; there was no CSV mapping flow on More.',
    ru: 'Не дефект. Запланировано. JSON-бэкап был; на «Ещё» не было сценария сопоставления CSV.',
  },
  {
    issue: 14,
    title: {
      en: 'Epic 13 — GitHub Pages deployment',
      ru: 'Эпик 13 — деплой GitHub Pages',
    },
    en: 'Not a defect. Planned work. The app was local-only until CI deploy to Pages.',
    ru: 'Не дефект. Запланировано. Приложение было только локальным, пока не появился CI-деплой на Pages.',
  },
  {
    issue: 13,
    title: {
      en: 'Epic 12 — JSON export and import',
      ru: 'Эпик 12 — JSON экспорт и импорт',
    },
    en: 'Not a defect. Planned work. There was no versioned bundle restore into an empty book from Settings.',
    ru: 'Не дефект. Запланировано. Не было версионированного бандла и восстановления в пустую книгу из настроек.',
  },
  {
    issue: 12,
    title: {
      en: 'Epic 11 — History: net worth over time',
      ru: 'Эпик 11 — История: капитал во времени',
    },
    en: 'Not a defect. Planned work. Dashboard was a snapshot; there was no dated series with per-day FX.',
    ru: 'Не дефект. Запланировано. Сводка была срезом; не было ряда по датам с курсом на каждый день.',
  },
  {
    issue: 11,
    title: {
      en: 'Epic 10 — Allocation screen',
      ru: 'Эпик 10 — экран распределения',
    },
    en: 'Not a defect. Planned work. No /allocation route, donut, or signed legend.',
    ru: 'Не дефект. Запланировано. Не было маршрута /allocation, кольца и легенды со знаком.',
  },
  {
    issue: 10,
    title: {
      en: 'Epic 9 — Asset details',
      ru: 'Эпик 9 — карточка актива',
    },
    en: 'Not a defect. Planned work. No native/base toggle, per-asset chart, or in-place amount update.',
    ru: 'Не дефект. Запланировано. Не было переключения оригинал/база, графика по активу и обновления суммы на месте.',
  },
  {
    issue: 9,
    title: {
      en: 'Epic 8 — Quick update flow',
      ru: 'Эпик 8 — быстрое обновление',
    },
    en: 'Not a defect. Planned work. No native-amount update flow; unchanged rows would have rewritten snapshots without a dedicated screen.',
    ru: 'Не дефект. Запланировано. Не было потока обновления нативных сумм; без отдельного экрана неизменённые строки перезаписывали бы снимки.',
  },
  {
    issue: 8,
    title: {
      en: 'Epic 7 — Dashboard',
      ru: 'Эпик 7 — Сводка',
    },
    en: 'Not a defect. Planned work. Empty shell had no net worth, this-month change, chart, or class totals.',
    ru: 'Не дефект. Запланировано. В пустом каркасе не было капитала, изменения за месяц, графика и итогов по классам.',
  },
  {
    issue: 7,
    title: {
      en: 'Epic 6 — FX rates via Frankfurter',
      ru: 'Эпик 6 — курсы через Frankfurter',
    },
    en: 'Not a defect. Planned work. Converted totals had no cached historical quotes. RUB is outside the ECB set (later #23/#44).',
    ru: 'Не дефект. Запланировано. У пересчёта не было кэша исторических котировок. RUB нет в наборе ЕЦБ (позже #23/#44).',
  },
  {
    issue: 6,
    title: {
      en: 'Epic 5 — Onboarding: first assets to first net worth',
      ru: 'Эпик 5 — онбординг: первые активы к первому капиталу',
    },
    en: 'Not a defect. Planned work. No currency → first asset → Dashboard path, and no skip once a book exists.',
    ru: 'Не дефект. Запланировано. Не было пути валюта → первый актив → Сводка и пропуска, когда книга уже есть.',
  },
  {
    issue: 5,
    title: {
      en: 'Epic 4 — Assets: create, edit, archive, tracking',
      ru: 'Эпик 4 — активы: создание, правка, архив, учёт',
    },
    en: 'Not a defect. Planned work. No asset list, form, or archive that keeps snapshots.',
    ru: 'Не дефект. Запланировано. Не было списка активов, формы и архива с сохранением снимков.',
  },
  {
    issue: 4,
    title: {
      en: 'Epic 3 — Settings: base currency and preferences',
      ru: 'Эпик 3 — настройки: базовая валюта и предпочтения',
    },
    en: 'Not a defect. Planned work. Base currency was not persisted; changing it must not rewrite snapshots.',
    ru: 'Не дефект. Запланировано. Базовая валюта не хранилась; её смена не должна переписывать снимки.',
  },
  {
    issue: 3,
    title: {
      en: 'Epic 2 — Design system and app shell',
      ru: 'Эпик 2 — дизайн-система и каркас',
    },
    en: 'Not a defect. Planned work. No primitives, bottom nav, or empty section routes.',
    ru: 'Не дефект. Запланировано. Не было примитивов, нижней навигации и пустых маршрутов разделов.',
  },
  {
    issue: 2,
    title: {
      en: 'Epic 1 — Domain model and persistence',
      ru: 'Эпик 1 — домен и хранение',
    },
    en: 'Not a defect. Planned work. No Dexie book, snapshots, or pure netWorth/FX functions.',
    ru: 'Не дефект. Запланировано. Не было книги Dexie, снимков и чистых функций netWorth/FX.',
  },
  {
    issue: 1,
    title: {
      en: 'Epic 0 — Project scaffolding and tooling',
      ru: 'Эпик 0 — каркас проекта и инструменты',
    },
    en: 'Not a defect. Planned work. Empty Vite/React/TS/Tailwind/Vitest shell so later issues had a place to land.',
    ru: 'Не дефект. Запланировано. Пустой каркас Vite/React/TS/Tailwind/Vitest, чтобы следующие задачи было куда класть.',
  },
]
