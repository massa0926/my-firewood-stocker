import type { StockerData, ShelvingUnit, Firewood, Slot, StockerSettings } from '../types/stocker';

const LOCAL_STORAGE_KEY = 'my_firewood_stocker_data';

// デフォルトのラベル設定
export const DEFAULT_SETTINGS: StockerSettings = {
  speciesLabels: {
    oak: 'クヌギ・ナラ系',
    cherry: 'サクラ系',
    hardwood: 'その他広葉樹',
    softwood: '針葉樹',
    other: 'その他'
  },
  drynessLabels: {
    fresh: '未乾燥 (<6ヶ月)',
    medium: '乾燥中 (6~12ヶ月)',
    ready: '乾燥完了 (12~18ヶ月)',
    seasoned: '極上乾燥 (18ヶ月~)'
  }
};

// デフォルトの空の初期データ
export const DEFAULT_STOCKER_DATA: StockerData = {
  version: '1.0.0',
  shelvingUnits: [],
  settings: DEFAULT_SETTINGS
};

/**
 * LocalStorageからデータを読み込む
 */
export function loadStockerData(): StockerData {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) return DEFAULT_STOCKER_DATA;
    
    // パースと最低限の整合性検証
    const parsed = JSON.parse(savedData) as StockerData;
    if (parsed && Array.isArray(parsed.shelvingUnits)) {
      // 古いセーブデータに settings が無ければデフォルト値を付与
      if (!parsed.settings) {
        parsed.settings = DEFAULT_SETTINGS;
      }
      return parsed;
    }
    return DEFAULT_STOCKER_DATA;
  } catch (error) {
    console.error('LocalStorageからの読み込みに失敗しました。', error);
    return DEFAULT_STOCKER_DATA;
  }
}

/**
 * LocalStorageにデータを保存する
 */
export function saveStockerData(data: StockerData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('LocalStorageへの保存に失敗しました。', error);
  }
}

/**
 * 新しい薪棚を追加する（イミュータブルな純粋関数）
 */
export function addShelvingUnit(
  data: StockerData,
  name: string,
  rowsCount: number,
  colsCount: number,
  defaultSize: { height: number; width: number; depth: number }
): StockerData {
  const newUnitId = `unit-${Date.now()}`;
  
  // 指定された段・列に合わせて空のスロット配列を初期化
  const slots: Slot[] = [];
  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < colsCount; c++) {
      slots.push({
        row: r,
        col: c,
        firewood: null
      });
    }
  }

  const newUnit: ShelvingUnit = {
    id: newUnitId,
    name,
    rowsCount,
    colsCount,
    slotDefaultSize: defaultSize,
    slots
  };

  return {
    ...data,
    shelvingUnits: [...data.shelvingUnits, newUnit]
  };
}

/**
 * 特定の薪棚の特定の場所に薪を配置または削除する（イミュータブルな純粋関数）
 * firewood に null を指定すると削除（空にする）動作になります。
 */
export function setFirewoodAt(
  data: StockerData,
  unitId: string,
  row: number,
  col: number,
  firewood: Firewood | null
): StockerData {
  return {
    ...data,
    shelvingUnits: data.shelvingUnits.map((unit) => {
      if (unit.id !== unitId) return unit;

      return {
        ...unit,
        slots: unit.slots.map((slot) => {
          if (slot.row === row && slot.col === col) {
            return { ...slot, firewood };
          }
          return slot;
        })
      };
    })
  };
}

/**
 * インポートしたJSON文字列の検証およびパース
 */
export function validateAndParseImportJSON(jsonStr: string): StockerData {
  const parsed = JSON.parse(jsonStr) as StockerData;
  if (!parsed || !Array.isArray(parsed.shelvingUnits)) {
    throw new Error('無効なデータ形式です。');
  }
  if (!parsed.settings) {
    parsed.settings = DEFAULT_SETTINGS;
  }
  return parsed;
}

/**
 * 薪棚の名前を更新する（イミュータブルな純粋関数）
 */
export function updateShelvingUnitName(
  data: StockerData,
  unitId: string,
  newName: string
): StockerData {
  return {
    ...data,
    shelvingUnits: data.shelvingUnits.map((unit) => {
      if (unit.id !== unitId) return unit;
      return { ...unit, name: newName };
    })
  };
}

/**
 * カスタムラベル設定を更新する（イミュータブルな純粋関数）
 */
export function updateStockerSettings(
  data: StockerData,
  newSettings: StockerSettings
): StockerData {
  return {
    ...data,
    settings: newSettings
  };
}
