/**
 * 薪の特性情報
 */
export interface Firewood {
  id: string;             // 薪（または薪束）の一意のID
  species: string;        // 樹種 (例: "クヌギ", "ナラ", "サクラ", "スギ" など)
  dryStartDate: string;   // 乾燥開始日 (ISO 8601形式: YYYY-MM-DD)
  notes?: string;         // メモ・備考
  displayName?: string;   // 表示名 (任意)
}

/**
 * 薪棚の特定スロット（グリッドのセル）の定義
 */
export interface Slot {
  row: number;            // 段（インデックス、下段から0, 1, 2...）
  col: number;            // 列（インデックス、左から0, 1, 2...）
  firewood: Firewood | null; // 配置された薪（空の場合はnull）
  // スロット固有のサイズメタデータ（棚全体のデフォルト値をオーバーライド可能）
  size?: {
    height: number;       // 高さ (cm)
    width: number;        // 横幅 (cm)
    depth: number;        // 奥行 (cm)
  };
}

/**
 * 薪棚（個々の棚）
 */
export interface ShelvingUnit {
  id: string;             // 薪棚の一意のID
  name: string;           // 薪棚の名前 (例: "薪棚A", "薪棚B")
  rowsCount: number;      // 上下段数
  colsCount: number;      // 前後列数
  // 棚全体のサイズメタデータ
  slotDefaultSize: {
    height: number;       // 各スロットのデフォルト高さ (cm)
    width: number;        // 各スロットのデフォルト横幅 (cm)
    depth: number;        // 各スロットのデフォルト奥行 (cm)
  };
  slots: Slot[];          // スロットの配列 (rowsCount * colsCount 分の要素)
}

/**
 * アプリケーション全体のデータ構造
 */
export interface StockerSettings {
  speciesLabels: {
    oak: string;      // デフォルト: "クヌギ・ナラ系"
    cherry: string;   // デフォルト: "サクラ系"
    hardwood: string; // デフォルト: "その他広葉樹"
    softwood: string; // デフォルト: "針葉樹"
    other: string;    // デフォルト: "その他"
  };
  drynessLabels: {
    fresh: string;    // デフォルト: "未乾燥 (<6ヶ月)"
    medium: string;   // デフォルト: "乾燥中 (6~12ヶ月)"
    ready: string;    // デフォルト: "乾燥完了 (12~18ヶ月)"
    seasoned: string; // デフォルト: "極上乾燥 (18ヶ月~)"
  };
}

export interface StockerData {
  version: string;        // データフォーマット of data
  shelvingUnits: ShelvingUnit[];
  settings?: StockerSettings; // アプリケーションの設定（カスタムラベル定義）
}
