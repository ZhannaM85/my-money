import type { Dictionary } from './Dictionary'
import { ruPluralize } from './ruPluralize'

export const ru: Dictionary = {
  appName: 'My Money',
  common: {
    loading: 'Загрузка…',
    save: 'Сохранить',
    cancel: 'Отмена',
    add: 'Добавить',
    addAsset: 'Добавить актив',
    continue: 'Продолжить',
    skipForNow: 'Пропустить пока',
    skipToContent: 'К содержанию',
    estimated: (amount) => `оценка ${amount}`,
    native: (currency) => `в ${currency}`,
    owe: ' (долг)',
    aboutField: (name) => `О поле «${name}»`,
  },
  nav: {
    tabs: 'Разделы',
    dashboard: 'Сводка',
    assets: 'Активы',
    update: 'Обновить',
    history: 'История',
    more: 'Ещё',
  },
  dashboard: {
    title: 'Сводка',
    description: 'Что у вас есть минус что вы должны, в базовой валюте.',
    netWorth: 'Чистый капитал',
    thisMonth: 'за этот месяц',
    zoomRange: 'Диапазон графика',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    panEarlier: 'Раньше',
    panLater: 'Позже',
    asOfDate: 'На дату',
    asOfDateInvalid: 'Выберите сегодня или прошедшую дату',
    jumpToToday: 'Сегодня',
    addToComparison: 'Добавить к сравнению',
    navigateToComparison: 'Перейти к сравнению',
    comparisonTitle: 'Сравнение',
    comparisonDescription: 'Позиции на даты, которые вы добавили со Сводки.',
    comparisonNeedTwoDates: 'Добавьте хотя бы две даты со Сводки.',
    comparisonChangeHint:
      'В следующих столбцах — изменение относительно первой даты.',
    comparisonIncreased: (amount) => `Рост ${amount}`,
    comparisonDecreased: (amount) => `Снижение ${amount}`,
    removeFromComparison: (date) => `Убрать ${date}`,
    removeFromComparisonConfirm: (date) => `Убрать ${date} из сравнения?`,
    removeAllFromComparison: 'Убрать все даты',
    removeAllFromComparisonConfirm: 'Убрать все даты из сравнения?',
    positionsTotal: 'Итого',
    emptyTitle: 'Пока нет активов',
    emptyDescription:
      'Добавьте то, чем владеете или что должны, чтобы увидеть первый чистый капитал.',
    fxMissing: (codes) =>
      `Нет справочного курса для ${codes} на дату снимка. Где курс есть, это справочная оценка, а не исполняемая котировка.`,
    fxConverted:
      'Пересчитано по справочным курсам. Это оценки, а не исполняемые котировки.',
    allocation: 'Распределение',
    nativeHoldings: 'Суммы по валютам',
    originalChartHint:
      'Общий график доступен в режиме «В пересчёте». Выберите одну валюту, чтобы увидеть её историю в оригинале.',
    currencyFilterDisabledHint:
      'Фильтр валюты неактивен в режиме «В пересчёте». Базовую валюту меняйте в настройках.',
    conversionUnavailable: 'Конвертация недоступна',
    holdings: 'Позиции',
    hideFromPositions: 'Скрыть',
    showOnPositions: 'Показать',
    hideFromPositionsAria: (name) => `Скрыть ${name}`,
    showOnPositionsAria: (name) => `Показать ${name}`,
    amountChange: 'Из сумм',
    rateChange: 'Из курсов',
    updateRates: 'Обновить курсы',
    periodChangeHint:
      '«Из сумм» — что вы добавили или убавили, по последнему курсу. «Из курсов» — те же начальные остатки, если изменился справочный курс, в том числе доллары, которые уже были. Вместе это итог за период.',
    chartTooltip: 'Подсказка графика',
    chartTooltipShow: 'Показать',
    chartTooltipHide: 'Скрыть',
    noHoldingsOnDateTitle: 'На эту дату нет позиций',
    noHoldingsOnDateDescription:
      'На этот день и раньше ничего не записано. Выберите более позднюю дату или перейдите к сегодня.',
  },
  assets: {
    title: 'Активы',
    filterAll: 'Все',
    filterArchived: 'Скрытые',
    emptyTitle: 'Пока нет активов',
    emptyArchivedTitle: 'Нет скрытых активов',
    emptyDescription:
      'Добавьте то, чем владеете или что должны. Данные остаются на этом устройстве.',
    noValue: 'Нет суммы',
    sortLabel: 'Сортировка активов',
    sortCustom: 'Свой порядок',
    sortNameAsc: 'Имя А–Я',
    sortNameDesc: 'Имя Я–А',
    sortAmountAsc: 'Сумма: по возрастанию',
    sortAmountDesc: 'Сумма: по убыванию',
    reorderAria: (name) => `Изменить порядок: ${name}`,
    enterReorderMode: 'Порядок',
    rowMenuAria: (name) => `Действия: ${name}`,
  },
  asset: {
    classes: {
      money: 'Деньги',
      investments: 'Инвестиции',
      property: 'Имущество',
      valuables: 'Ценности',
      liabilities: 'Обязательства',
    },
    types: {
      bank: 'Банковский счёт',
      savings: 'Накопления',
      cash: 'Наличные',
      deposit: 'Вклад',
      debit_card: 'Дебетовая карта',
      brokerage: 'Брокерский счёт',
      stocks: 'Акции',
      etf: 'ETF',
      bonds: 'Облигации',
      crypto: 'Криптовалюта',
      other_investment: 'Другая инвестиция',
      apartment: 'Квартира',
      house: 'Дом',
      land: 'Земля',
      vehicle: 'Транспорт',
      jewelry: 'Украшения',
      watch: 'Часы',
      electronics: 'Электроника',
      collectible: 'Коллекция',
      other_valuable: 'Другая ценность',
      mortgage: 'Ипотека',
      personal_loan: 'Личный заём',
      credit_card: 'Кредитная карта',
      other_debt: 'Другой долг',
    },
    valuation: {
      account_balance: 'Остаток на счёте',
      my_estimate: 'Моя оценка',
      appraisal: 'Оценка специалиста',
      market_price: 'Рыночная цена',
      purchase_price: 'Цена покупки',
    },
    frequency: {
      weekly: 'Еженедельно',
      monthly: 'Ежемесячно',
      yearly: 'Ежегодно',
      manual: 'Только вручную',
    },
    tracking: {
      included: 'Учитывается',
      excluded: 'Не учитывается',
      archived: 'В архиве',
    },
    noValueYet: 'Ещё нет суммы',
    updatedToday: 'Обновлено сегодня',
    updatedYesterday: 'Обновлено вчера',
    updatedDaysAgo: (days) =>
      `Обновлено ${days} ${ruPluralize(days, 'день', 'дня', 'дней')} назад`,
    name: 'Название',
    class: 'Класс',
    type: 'Тип',
    currency: 'Валюта',
    institutionOptional: 'Учреждение (необязательно)',
    valuationLabel: 'Оценка',
    purchaseValueOptional: 'Стоимость покупки (необязательно)',
    updateFrequency: 'Как часто обновлять',
    trackingLabel: 'Учёт',
    currentAmount: 'Текущая сумма',
    snapshotDate: 'На дату',
    snapshotNote: 'Комментарий (необязательно)',
    snapshotDateInvalid: 'Выберите сегодня или прошедшую дату',
    duplicateSnapshotHint:
      'Снимок с этой датой и суммой уже есть. Можно всё равно сохранить ещё один.',
    newAmountOptional: 'Новая сумма (необязательно)',
    newAmountOptionalHint:
      'Необязательно. Если ввести сумму, «Сохранить сведения» также запишет снимок на выбранную дату (по умолчанию сегодня). Оставьте пустым, чтобы изменить только название и настройки.',
    updateThisAssetHint:
      'Сохраняет новый снимок на выбранную дату (по умолчанию сегодня). Старые строки истории не меняются.',
    nameRequired: 'Нужно название',
    enterCurrentAmount: 'Введите текущую сумму',
    amountMustBeNumber: 'Сумма должна быть числом',
    purchaseMustBeNumber: 'Стоимость покупки должна быть числом',
    addTitle: 'Добавить актив',
    saveAsset: 'Сохранить актив',
    saveDetails: 'Сохранить сведения',
    editDetails: 'Изменить сведения',
    notFound: 'Актив не найден',
    backToAssets: 'К списку активов',
    native: 'В валюте актива',
    currentValue: 'Текущая стоимость',
    inBaseCurrency: 'В базовой валюте',
    noSnapshotsYet: 'Снимков пока нет',
    sinceFirst: 'С первого снимка:',
    noRateOnDate: (currency, date) =>
      `Нет справочного курса для ${currency} на ${date}.`,
    updateThisAsset: 'Обновить этот актив',
    newAmount: 'Новая сумма',
    amountPlaceholder: 'Сумма',
    details: 'Сведения',
    archive: 'В архив',
    hide: 'Скрыть актив',
    restore: 'Вернуть в список',
    excludeFromNetWorth: 'Не учитывать в капитале',
    includeInNetWorth: 'Учитывать в капитале',
    notCountedInNetWorth: 'Не учитывается в капитале',
    hiddenFromLists: 'Скрыт из списков',
    deleteAsset: 'Удалить актив',
    deleteConfirm:
      'Удалить этот актив и всю его историю с этого устройства? Это нельзя отменить.',
    deleteSnapshot: 'Удалить запись',
    deleteSnapshotAria: (date) => `Удалить снимок от ${date}`,
    deleteSnapshotConfirm:
      'Удалить эту запись в истории? Актив останется. Это нельзя отменить.',
    editSnapshotAria: (date) => `Изменить снимок от ${date}`,
    editSnapshotAmount: 'Сумма снимка',
    quickAdd: 'Быстро добавить',
    presets: {
      bank: 'Банковский счёт',
      cash: 'Наличные',
      vehicle: 'Транспорт',
      apartment: 'Квартира',
      house: 'Дом',
      brokerage: 'Брокерский счёт',
    },
    ownershipShare: 'Ваша доля',
    ownershipShareInvalid: 'Введите долю, например 1/2 или 1/1',
    yourShare: (share) => `Ваша доля: ${share}`,
    suggestedNow: 'Пора обновить',
  },
  update: {
    title: 'Обновить',
    description:
      'Прошлая сумма, затем новое число или «Без изменений». Ежегодные и ручные активы остаются необязательными.',
    emptyTitle: 'Нечего обновлять',
    emptyDescription: 'Сначала добавьте учитываемый актив.',
    noChange: 'Без изменений',
    saveUpdates: 'Сохранить обновления',
    enterNumberFor: (name) => `Введите число для «${name}»`,
    needOneRow:
      'Отметьте «Без изменений» или введите сумму хотя бы для одного актива.',
    newAmountAria: (name) => `Новая сумма для ${name}`,
  },
  history: {
    title: 'История',
    description:
      'Чистый капитал во времени. Каждый день использует курс той даты, а не сегодняшний.',
    emptyTitle: 'Истории пока нет',
    emptyDescription: 'Снимки из обновлений становятся линией истории.',
    overRange: (range) =>
      range === 'Custom'
        ? 'за свой период'
        : range === 'All'
          ? 'за всё время'
          : `за ${range}`,
    sinceDate: (date) => `с ${date}`,
    holdingsOn: (date) => `Позиции на ${date}`,
    rangeWeek: 'Неделя',
    rangeMonth: 'Месяц',
    rangeYear: 'Год',
    rangeAll: 'Все',
    rangeCustom: 'Свой',
    rangeFrom: 'С',
    rangeTo: 'По',
  },
  allocation: {
    title: 'Распределение',
    description:
      'Доля картины в базовой валюте. Обязательства — отрицательный сектор: график берёт размер, список показывает знак.',
    descriptionOriginalCurrency:
      'Нативные суммы по валютам. Доли считаются скрытым пересчётом в рубли.',
    descriptionOriginalCompared: (currency) =>
      `Доли по классу и типу сравниваются в ${currency}. Откройте «Валюта» для нативных сумм или включите «В пересчёте» для одного итога.`,
    descriptionOriginalClassType:
      'Нативные суммы по классу или типу — каждая строка в своей валюте. Доли считаются скрытым пересчётом в рубли.',
    descriptionOriginalSingle: (currency) =>
      `Нативные суммы в ${currency}. Для смешанных валют включите «В пересчёте».`,
    originalClassTypeTitle: 'Выберите «Валюта» или «В пересчёте»',
    byClass: 'Класс',
    byCurrency: 'Валюта',
    byType: 'Тип',
    emptyTitle: 'Пока нечего делить',
    emptyDescription:
      'Добавьте учитываемые активы, чтобы увидеть распределение.',
  },
  onboarding: {
    welcomeTitle: 'Добро пожаловать',
    welcomeDescription: 'Знать, чем владеете. В одной валюте. Во времени.',
    firstAssetTitle: 'Первый актив',
    firstAssetDescription:
      'Добавьте то, чем владеете или что должны. Сумма станет первым снимком.',
    assetSavedTitle: 'Актив сохранён',
    assetSavedDescription: 'Добавьте ещё или посмотрите первый чистый капитал.',
    addAnother: 'Добавить ещё',
    seeNetWorth: 'Смотреть чистый капитал',
  },
  settings: {
    title: 'Ещё',
    description:
      'Одна базовая валюта пересчитывает итоги. «Показать все валюты» оставляет суммы в оригинале. Смена не переписывает прошлые суммы.',
    baseCurrency: 'Базовая валюта',
    showAllCurrencies: 'Показать все валюты',
    currencyDisplay: 'Показ активов',
    currencyDisplayBase: 'В пересчёте',
    currencyDisplayNative: 'В оригинале',
    showAllCurrenciesHint:
      'Итоги остаются в валюте каждого актива. Выберите одну валюту, чтобы пересчитать всё в неё.',
    language: 'Язык',
    languageEn: 'English',
    languageRu: 'Русский',
    skipWelcomeHint:
      'Экран приветствия всё ещё ждёт первый актив. Пропустите его, чтобы пользоваться приложением пустым.',
    skipWelcome: 'Пропустить приветствие',
    allocation: 'Распределение',
    appearance: 'Оформление',
    moodFresh: 'Свежее',
    moodLedger: 'Цветное',
    moodGreen: 'Зелёное',
    moodSoft: 'Спокойное',
    moodNeutral: 'Нейтральное',
    moodPastel: 'Пастель',
    versionBadgeLabel: (version) => `v${version}`,
    releaseNotesLabel: 'Что нового',
    rcaLabel: 'Корневые причины',
    rcaDescription:
      'Почему случилась каждая выпущенная задача. У запланированных эпиков это сказано прямо. Открытые нативные приложения (#19, #20) пока не в списке.',
    manualRatesTitle: 'Курсы на сегодня',
    manualRatesDescription:
      'Введите курсы вручную на сегодня, если справочный курс недоступен. Это переопределения и оценки, а не банковские котировки.',
    manualRatesEdit: 'Изменить курсы на сегодня',
    manualRatesHide: 'Скрыть редактор курсов',
    manualRatesHint: (date) =>
      `Курсы действуют только на ${date}. Оставьте строку пустой, чтобы пропустить валюту.`,
    manualRatesPair: (base, quote) => `1 ${base} = … ${quote}`,
    manualRatesSave: 'Сохранить курсы на сегодня',
    manualRatesClear: 'Очистить курсы на сегодня',
    manualRatesSaved:
      'Сохранено. Пересчитанные итоги будут использовать эти курсы на сегодня.',
    manualRatesActive: (count, date) =>
      `Активно ручных курсов на ${date}: ${count}.`,
    fxDebugTitle: 'Отладка FX',
    fxDebugDescription:
      'Журнал на телефоне для конвертации и нажатий «Скрыть»/«Показать» в распределении (#157). Включите, воспроизведите, сохраните .txt (или скопируйте). Ничего не отправляется само.',
    fxDebugEnable: 'Включить отладку FX',
    fxDebugDisable: 'Выключить отладку FX',
    fxDebugCopy: 'Копировать лог',
    fxDebugSave: 'Сохранить .txt',
    fxDebugClear: 'Очистить лог',
    fxDebugCopied: 'Лог скопирован.',
    fxDebugSaved: 'Лог сохранён как файл .txt.',
    fxDebugShared: 'Открыт экран «Поделиться».',
    fxDebugCopyFailed: 'Не удалось скопировать лог.',
    fxDebugSaveFailed: 'Не удалось сохранить лог.',
    fxDebugEmpty:
      'Пока нет событий. Откройте Сводку или нажмите актив в распределении при включённой отладке.',
    readPrivacyPolicyLabel: 'Политика конфиденциальности',
  },
  privacyPolicy: {
    title: 'Политика конфиденциальности',
    description: 'Как «Мои деньги» обрабатывают ваши данные',
    lastUpdatedLabel: (date) => `Обновлено: ${date}`,
    collectionHeading: 'Что мы собираем',
    collectionBody:
      'Приложение не собирает никакие данные автоматически. Всё в приложении введено вами: активы, обязательства, суммы, даты и настройки, а также то, что вы сами импортируете из резервной копии или CSV.',
    storageHeading: 'Где хранятся ваши данные',
    storageBody:
      'Все данные хранятся только на вашем устройстве, в хранилище этого браузера или приложения (IndexedDB). Нет ни аккаунта, ни серверов, ни облачной синхронизации — приложение никогда не видит ваши суммы.',
    networkHeading: 'Сеть',
    networkBody:
      'Единственный ожидаемый сетевой запрос — публичные справочные курсы валют (только коды валют и даты). Суммы, названия и активы никуда не отправляются. Если курсы недоступны, приложение держит последние сохранённые котировки.',
    sharingHeading: 'Передача третьим лицам',
    sharingBody:
      'Ваши данные никогда не продаются, не передаются и никуда не отправляются, кроме запроса курсов выше. В приложении нет ни аналитики, ни рекламы, ни какого-либо трекинга.',
    exportHeading: 'Экспорт данных',
    exportBody:
      'Единственный способ, которым ваши данные покидают устройство — если вы сами экспортируете их (JSON-копия или CSV) из раздела «Ещё». Дальнейшая судьба этого файла зависит только от вас.',
    childrenHeading: 'Дети',
    childrenBody:
      'Приложение не предназначено для детей и не собирает данные ни от кого сознательно, включая детей — автоматически не собирается ничего, независимо от возраста.',
    changesHeading: 'Изменения в этой политике',
    changesBody:
      'Если эта политика когда-либо изменится, обновление будет опубликовано на этой же странице.',
    contactHeading: 'Контакты',
    contactBody:
      'Вопросы по этой политике можно направить через страницу проекта на GitHub: https://github.com/ZhannaM85/my-money',
    backToSettingsLabel: 'Назад к «Ещё»',
  },
  backup: {
    title: 'Резервная копия',
    description:
      'JSON — формат резервной копии и контракт с iOS-приложением. Импорт восстанавливает только в пустую книгу.',
    exportJson: 'Экспорт JSON',
    importJson: 'Импорт JSON',
    importAria: 'Импорт JSON-копии',
    onlyEmpty: 'Импорт доступен, только когда в этой книге нет активов.',
    downloaded: 'Копия скачана.',
    shared: 'Открыт лист «Поделиться».',
    restored: 'Копия восстановлена.',
    exportFailed: 'Не удалось экспортировать копию.',
    importFailed: 'Не удалось импортировать этот файл.',
    bookNotEmpty:
      'Импорт восстанавливает только в пустую книгу. Сначала экспортируйте, если нужна копия того, что здесь.',
    invalidFile: 'Это не действительная резервная копия My Money.',
  },
  csv: {
    title: 'CSV',
    description:
      'Таблица снимков. JSON остаётся резервной копией. Импорт добавляет суммы к уже существующим активам; несовпавшие строки показываются, а не отбрасываются.',
    exportCsv: 'Экспорт CSV',
    importCsv: 'Импорт CSV',
    importAria: 'Импорт CSV',
    mapColumns: 'Сопоставить столбцы',
    selectColumn: 'Выберите столбец',
    columnN: (n) => `Столбец ${n}`,
    fields: {
      date: 'Дата',
      asset: 'Актив (название или id)',
      amount: 'Сумма',
      currency: 'Валюта',
    },
    ready: (ready, issues) =>
      issues === 0
        ? `Готово снимков: ${ready}.`
        : `Готово снимков: ${ready}, строк без совпадения или с ошибкой: ${issues}.`,
    importMapped: 'Импортировать сопоставленные строки',
    exported: 'CSV скачан.',
    shared: 'Открыт лист «Поделиться».',
    exportFailed: 'Не удалось экспортировать CSV.',
    importFailed: 'Не удалось импортировать этот файл.',
    invalidFile: 'Это не действительный CSV.',
    imported: (imported, skipped) =>
      skipped === 0
        ? `Импортировано снимков: ${imported}.`
        : `Импортировано снимков: ${imported}. Не удалось импортировать строк: ${skipped}.`,
    andMore: (n) => `И ещё ${n}.`,
    issue: {
      missingField: (row, who) =>
        `Строка ${row}${who}: нет даты, актива, суммы или валюты.`,
      invalidDate: (row, who) =>
        `Строка ${row}${who}: дата должна быть в формате ГГГГ-ММ-ДД.`,
      invalidAmount: (row, who) => `Строка ${row}${who}: сумма не число.`,
      unmatchedAsset: (row, who) =>
        `Строка ${row}${who}: нет подходящего актива.`,
      ambiguousAsset: (row, who) =>
        `Строка ${row}${who}: подходит больше одного актива.`,
    },
  },
  fx: {
    usingCachedRates:
      'Не удалось обновить справочные курсы. Показаны последние сохранённые.',
  },
  appUpdate: {
    availableText: 'Доступна новая версия.',
    reloadButton: 'Обновить',
    reloadingText: 'Обновление…',
  },
  offline: {
    offlineText:
      'Нет сети — ваши данные по-прежнему сохранены на этом устройстве.',
  },
}
