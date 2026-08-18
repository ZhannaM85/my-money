export interface ReleaseNote {
  /** Incrementing counter, oldest entry = 1. Never reused or renumbered. */
  version: number
  issue: number
  date: string
  en: string
  ru: string
}

/** User-facing changelog, most-recent-first. Add a row when an issue ships. */
export const releaseNotes: ReleaseNote[] = [
  {
    version: 16,
    issue: 38,
    date: '2026-08-18T10:15:00+03:00',
    en: 'The offline banner now appears in iPhone Safari when airplane mode is on, not only when the browser reports offline.',
    ru: 'Баннер «нет сети» теперь появляется в Safari на iPhone при включённом режиме полёта, а не только когда браузер сам сообщает об отсутствии сети.',
  },
  {
    version: 15,
    issue: 37,
    date: '2026-08-18T10:10:00+03:00',
    en: 'Installed copies check more often for a new deploy and bypass a stuck service-worker cache, so Reload can actually load the new version.',
    ru: 'Установленное приложение чаще проверяет новую версию и обходит застрявший кэш service worker, чтобы «Обновить» действительно загрузило новую сборку.',
  },
  {
    version: 14,
    issue: 36,
    date: '2026-08-18T10:00:00+03:00',
    en: 'Settings now shows the app version and a short changelog, so you can see which build you are on.',
    ru: 'В настройках теперь видны версия приложения и краткий список изменений — так понятно, какая сборка установлена.',
  },
  {
    version: 13,
    issue: 35,
    date: '2026-08-18T09:37:26+03:00',
    en: 'The app can keep working after a refresh while you are offline, with a banner when there is no network.',
    ru: 'Приложение может продолжить работу после обновления страницы без сети и показывает баннер, когда интернета нет.',
  },
  {
    version: 12,
    issue: 34,
    date: '2026-08-18T09:35:33+03:00',
    en: 'When a new version is deployed, a banner can offer Reload so you are not stuck on an old build.',
    ru: 'Когда выходит новая версия, баннер предлагает обновить страницу, чтобы не остаться на старой сборке.',
  },
  {
    version: 11,
    issue: 26,
    date: '2026-08-18T09:23:35+03:00',
    en: 'Added a colorful appearance, with the original green theme still available.',
    ru: 'Добавлен цветной внешний вид; прежняя зелёная тема по-прежнему доступна.',
  },
  {
    version: 10,
    issue: 28,
    date: '2026-08-18T09:22:21+03:00',
    en: 'Jointly owned assets can record your share (for example 1/2); net worth uses that share.',
    ru: 'Для совместных активов можно указать долю (например 1/2); в чистую стоимость входит только ваша часть.',
  },
  {
    version: 9,
    issue: 27,
    date: '2026-08-18T09:20:17+03:00',
    en: 'Vehicle is easier to add from the quick-add chips when creating an asset.',
    ru: 'Транспорт проще добавить через быстрые кнопки при создании актива.',
  },
  {
    version: 8,
    issue: 23,
    date: '2026-08-18T08:59:42+03:00',
    en: 'RUB amounts convert when the base currency is euro, using the Bank of Russia rate.',
    ru: 'Суммы в рублях пересчитываются, если базовая валюта евро, по курсу Банка России.',
  },
  {
    version: 7,
    issue: 32,
    date: '2026-08-18T08:59:01+03:00',
    en: 'You can permanently delete an asset and its history after confirmation.',
    ru: 'Актив и его историю можно навсегда удалить после подтверждения.',
  },
  {
    version: 6,
    issue: 31,
    date: '2026-08-18T08:58:08+03:00',
    en: 'Hide and restore an asset from the list without deleting it.',
    ru: 'Актив можно скрыть из списка и вернуть обратно, не удаляя его.',
  },
  {
    version: 5,
    issue: 30,
    date: '2026-08-18T08:57:11+03:00',
    en: 'Exclude an asset from net worth while keeping it visible.',
    ru: 'Актив можно не учитывать в чистой стоимости, оставив его в списке.',
  },
  {
    version: 4,
    issue: 33,
    date: '2026-08-18T08:54:55+03:00',
    en: 'Money fields format with grouping and decimals for your language.',
    ru: 'Поля сумм форматируются с разрядами и копейками под выбранный язык.',
  },
  {
    version: 3,
    issue: 29,
    date: '2026-08-18T08:51:17+03:00',
    en: 'Amounts with a comma decimal (like 16155,11) are accepted.',
    ru: 'Суммы с запятой в дробной части (например 16155,11) принимаются.',
  },
  {
    version: 2,
    issue: 25,
    date: '2026-08-18T08:48:09+03:00',
    en: 'The tab bar hides while the iPhone keyboard is open so it does not float mid-screen.',
    ru: 'Панель вкладок скрывается, пока открыта клавиатура iPhone, и не зависает посреди экрана.',
  },
  {
    version: 1,
    issue: 24,
    date: '2026-08-18T08:47:17+03:00',
    en: 'The tab bar clears the iPhone home indicator instead of sitting flush on it.',
    ru: 'Панель вкладок больше не прилипает к индикатору Home на iPhone.',
  },
]
