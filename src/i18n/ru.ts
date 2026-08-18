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
    description:
      'Что у вас есть минус что вы должны, в базовой валюте.',
    netWorth: 'Чистый капитал',
    thisMonth: 'за этот месяц',
    emptyTitle: 'Пока нет активов',
    emptyDescription:
      'Добавьте то, чем владеете или что должны, чтобы увидеть первый чистый капитал.',
    fxMissing: (codes) =>
      `Нет справочного курса для ${codes} на дату снимка. Где курс есть, это оценка ЕЦБ, а не исполняемая котировка.`,
    fxConverted:
      'Пересчитано по справочным курсам ЕЦБ. Это оценки, а не исполняемые котировки.',
    allocation: 'Распределение',
  },
  assets: {
    title: 'Активы',
    filterAll: 'Все',
    filterArchived: 'Архив',
    emptyTitle: 'Пока нет активов',
    emptyArchivedTitle: 'В архиве пусто',
    emptyDescription:
      'Добавьте то, чем владеете или что должны. Данные остаются на этом устройстве.',
    noValue: 'Нет суммы',
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
    newAmountOptional: 'Новая сумма (необязательно)',
    nameRequired: 'Нужно название',
    enterCurrentAmount: 'Введите текущую сумму',
    amountMustBeNumber: 'Сумма должна быть числом',
    purchaseMustBeNumber: 'Стоимость покупки должна быть числом',
    addTitle: 'Добавить актив',
    saveAsset: 'Сохранить актив',
    saveDetails: 'Сохранить сведения',
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
    excludeFromNetWorth: 'Не учитывать в капитале',
    includeInNetWorth: 'Учитывать в капитале',
    notCountedInNetWorth: 'Не учитывается в капитале',
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
    overRange: (range) => `за ${range}`,
  },
  allocation: {
    title: 'Распределение',
    description:
      'Доля картины в базовой валюте. Обязательства — отрицательный сектор: график берёт размер, список показывает знак.',
    byClass: 'Класс',
    byCurrency: 'Валюта',
    byType: 'Тип',
    emptyTitle: 'Пока нечего делить',
    emptyDescription: 'Добавьте учитываемые активы, чтобы увидеть распределение.',
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
      'Базовая валюта — настройка отображения. Её смена не переписывает прошлые суммы.',
    baseCurrency: 'Базовая валюта',
    language: 'Язык',
    languageEn: 'English',
    languageRu: 'Русский',
    skipWelcomeHint:
      'Экран приветствия всё ещё ждёт первый актив. Пропустите его, чтобы пользоваться приложением пустым.',
    skipWelcome: 'Пропустить приветствие',
    allocation: 'Распределение',
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
      unmatchedAsset: (row, who) => `Строка ${row}${who}: нет подходящего актива.`,
      ambiguousAsset: (row, who) =>
        `Строка ${row}${who}: подходит больше одного актива.`,
    },
  },
  fx: {
    usingCachedRates:
      'Не удалось обновить справочные курсы. Показаны последние сохранённые.',
  },
}
