import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Layers, 
  Settings, 
  Info,
  FileCheck,
  Package,
  Wrench,
  Sparkles,
  Edit2,
  Check,
  X,
  Database,
  RefreshCw
} from 'lucide-react';
import { 
  loadStockerData, 
  saveStockerData, 
  addShelvingUnit, 
  setFirewoodAt, 
  validateAndParseImportJSON, 
  updateShelvingUnitName,
  updateStockerSettings,
  DEFAULT_STOCKER_DATA,
  DEFAULT_SETTINGS
} from './utils/storage';
import type { StockerData, ShelvingUnit, Firewood, Slot, StockerSettings } from './types/stocker';

function App() {
  const [data, setData] = useState<StockerData>(DEFAULT_STOCKER_DATA);
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  
  // 新しい棚の作成用状態
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitRows, setNewUnitRows] = useState<number | ''>(3);
  const [newUnitCols, setNewUnitCols] = useState<number | ''>(4);
  const [newUnitHeight, setNewUnitHeight] = useState<number | ''>(50);
  const [newUnitWidth, setNewUnitWidth] = useState<number | ''>(80);
  const [newUnitDepth, setNewUnitDepth] = useState<number | ''>(40);

  // 薪棚名のインライン編集用状態
  const [isEditingUnitName, setIsEditingUnitName] = useState(false);
  const [editedUnitName, setEditedUnitName] = useState('');

  // カスタムラベル（設定）編集用状態
  const [editingLabelKey, setEditingLabelKey] = useState<string | null>(null);
  const [editedLabelValue, setEditedLabelValue] = useState('');

  // 薪の配置用状態 (モーダル)
  const [selectedSlot, setSelectedSlot] = useState<{ row: number; col: number } | null>(null);
  const [woodSpecies, setWoodSpecies] = useState('クヌギ');
  const [woodDryStart, setWoodDryStart] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [woodNotes, setWoodNotes] = useState('');

  // 視覚表現トグル状態
  const [showDrynessEffect, setShowDrynessEffect] = useState(true);
  const [showSpeciesColor, setShowSpeciesColor] = useState(true);

  // 初回ロード
  useEffect(() => {
    const loaded = loadStockerData();
    setData(loaded);
    if (loaded.shelvingUnits.length > 0) {
      setActiveUnitId(loaded.shelvingUnits[0].id);
    }
  }, []);

  // データ保存
  const updateData = (newData: StockerData) => {
    setData(newData);
    saveStockerData(newData);
  };

  const activeUnit = data.shelvingUnits.find(u => u.id === activeUnitId) || null;
  const settings = data.settings || DEFAULT_SETTINGS;

  // 新規薪棚の追加
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    const rows = newUnitRows === '' ? 3 : newUnitRows;
    const cols = newUnitCols === '' ? 4 : newUnitCols;
    const height = newUnitHeight === '' ? 50 : newUnitHeight;
    const width = newUnitWidth === '' ? 80 : newUnitWidth;
    const depth = newUnitDepth === '' ? 40 : newUnitDepth;

    const newData = addShelvingUnit(data, newUnitName, rows, cols, {
      height,
      width,
      depth
    });
    
    updateData(newData);
    
    // 新しく追加した棚をアクティブにする
    const newUnit = newData.shelvingUnits[newData.shelvingUnits.length - 1];
    setActiveUnitId(newUnit.id);
    
    // フォームリセット
    setNewUnitName('');
    setNewUnitRows(3);
    setNewUnitCols(4);
    setNewUnitHeight(50);
    setNewUnitWidth(80);
    setNewUnitDepth(40);
    setShowAddUnitModal(false);
  };

  // 棚名の編集開始
  const startEditingUnitName = () => {
    if (!activeUnit) return;
    setEditedUnitName(activeUnit.name);
    setIsEditingUnitName(true);
  };

  // 棚名の保存
  const handleSaveUnitName = () => {
    if (!activeUnit || !editedUnitName.trim()) return;
    const newData = updateShelvingUnitName(data, activeUnit.id, editedUnitName);
    updateData(newData);
    setIsEditingUnitName(false);
  };

  // ラベル（設定）の編集開始
  const startEditingLabel = (key: string, currentValue: string) => {
    setEditingLabelKey(key);
    setEditedLabelValue(currentValue);
  };

  // ラベル（設定）の保存
  const handleSaveLabel = (type: 'species' | 'dryness', subKey: string) => {
    if (!editedLabelValue.trim()) return;
    
    const newSettings = { ...settings };
    if (type === 'species') {
      newSettings.speciesLabels = {
        ...newSettings.speciesLabels,
        [subKey]: editedLabelValue
      };
    } else {
      newSettings.drynessLabels = {
        ...newSettings.drynessLabels,
        [subKey]: editedLabelValue
      };
    }

    const newData = updateStockerSettings(data, newSettings);
    updateData(newData);
    setEditingLabelKey(null);
  };

  // スロットクリック時の処理
  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot({ row: slot.row, col: slot.col });
    if (slot.firewood) {
      setWoodSpecies(slot.firewood.species);
      setWoodDryStart(slot.firewood.dryStartDate);
      setWoodNotes(slot.firewood.notes || '');
    } else {
      // 登録されている樹種カテゴリから最初のものなどをプレデフォルトにする
      setWoodSpecies('クヌギ');
      setWoodDryStart(new Date().toISOString().split('T')[0]);
      setWoodNotes('');
    }
  };

  // 薪の配置
  const handleSaveFirewood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit || !selectedSlot) return;

    const newFirewood: Firewood = {
      id: activeUnit.slots.find(s => s.row === selectedSlot.row && s.col === selectedSlot.col)?.firewood?.id || `wood-${Date.now()}`,
      species: woodSpecies,
      dryStartDate: woodDryStart,
      notes: woodNotes || undefined
    };

    const newData = setFirewoodAt(data, activeUnit.id, selectedSlot.row, selectedSlot.col, newFirewood);
    updateData(newData);
    setSelectedSlot(null);
  };

  // 薪の削除
  const handleDeleteFirewood = () => {
    if (!activeUnit || !selectedSlot) return;
    const newData = setFirewoodAt(data, activeUnit.id, selectedSlot.row, selectedSlot.col, null);
    updateData(newData);
    setSelectedSlot(null);
  };

  // JSONインポート
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = validateAndParseImportJSON(event.target?.result as string);
        updateData(parsed);
        if (parsed.shelvingUnits.length > 0) {
          setActiveUnitId(parsed.shelvingUnits[0].id);
        }
        alert('データを正常にインポートしました！');
      } catch (err) {
        alert('JSONファイルの読み込みに失敗しました。正しいフォーマットのファイルを選択してください。');
      }
    };
    reader.readAsText(file);
  };

  // JSONエクスポート (Blob方式)
  const handleExportJSON = () => {
    if (data.shelvingUnits.length === 0) {
      alert('エクスポートするデータがありません。先に薪棚を作成してください。');
      return;
    }
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = `firewood_stock_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = exportFileDefaultName;
    document.body.appendChild(linkElement);
    linkElement.click();
    
    // クリーンアップ
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  // サンプルデータをロードする（お試し用）
  const handleLoadSample = () => {
    if (data.shelvingUnits.length > 0 && !window.confirm('現在のデータが上書きされます。よろしいですか？')) {
      return;
    }
    
    const sample: StockerData = {
      version: '1.0.0',
      shelvingUnits: [
        {
          id: 'unit-sample-1',
          name: '裏庭のA棚',
          rowsCount: 3,
          colsCount: 5,
          slotDefaultSize: { height: 60, width: 90, depth: 45 },
          slots: [
            { row: 0, col: 0, firewood: { id: 'w1', species: 'クヌギ', dryStartDate: '2025-05-10', notes: '極上広葉樹' } },
            { row: 0, col: 1, firewood: { id: 'w2', species: 'ナラ', dryStartDate: '2025-10-15' } },
            { row: 0, col: 2, firewood: null },
            { row: 0, col: 3, firewood: { id: 'w3', species: 'サクラ', dryStartDate: '2026-02-20', notes: '薫製用によさそう' } },
            { row: 0, col: 4, firewood: null },
            { row: 1, col: 0, firewood: { id: 'w4', species: 'スギ', dryStartDate: '2026-06-01', notes: '焚き付け用' } },
            { row: 1, col: 1, firewood: null },
            { row: 1, col: 2, firewood: { id: 'w5', species: 'クヌギ', dryStartDate: '2025-04-05' } },
            { row: 1, col: 3, firewood: null },
            { row: 1, col: 4, firewood: null },
            { row: 2, col: 0, firewood: null },
            { row: 2, col: 1, firewood: null },
            { row: 2, col: 2, firewood: null },
            { row: 2, col: 3, firewood: null },
            { row: 2, col: 4, firewood: null }
          ]
        }
      ],
      settings: DEFAULT_SETTINGS
    };
    
    updateData(sample);
    setActiveUnitId(sample.shelvingUnits[0].id);
  };

  // 棚の削除
  const handleDeleteUnit = (unitId: string) => {
    if (!window.confirm('この薪棚を削除しますか？(配置されたデータもすべて削除されます)')) return;
    const newData = {
      ...data,
      shelvingUnits: data.shelvingUnits.filter(u => u.id !== unitId)
    };
    updateData(newData);
    if (newData.shelvingUnits.length > 0) {
      setActiveUnitId(newData.shelvingUnits[0].id);
    } else {
      setActiveUnitId('');
    }
  };

  // 樹種によるカラー設定取得
  const getSpeciesColor = (species: string): string => {
    const s = species.toLowerCase();
    // ユーザーの編集した名称設定から逆引き、またはデフォルトのマッピング
    if (s.includes('クヌギ') || s.includes('ナラ') || s.includes('コナラ') || s.includes('カシ') || s.includes('オーク')) {
      return 'var(--color-oak)'; // 高級広葉樹（茶系）
    }
    if (s.includes('サクラ') || s.includes('チェリー')) {
      return 'var(--color-cherry)'; // サクラ（赤ピンク系）
    }
    if (s.includes('ケヤキ') || s.includes('カエデ') || s.includes('メープル') || s.includes('タモ') || s.includes('広葉樹')) {
      return 'var(--color-hardwood)'; // その他硬木（黄土系）
    }
    if (s.includes('スギ') || s.includes('ヒノキ') || s.includes('マツ') || s.includes('カラマツ') || s.includes('コニファー') || s.includes('針葉樹')) {
      return 'var(--color-softwood)'; // 針葉樹（緑系）
    }
    return 'var(--color-other)'; // その他（グレー系）
  };

  // 樹種のカテゴリキー判定 (集計およびカスタム表示用)
  const getSpeciesCategoryKey = (species: string): 'oak' | 'cherry' | 'hardwood' | 'softwood' | 'other' => {
    const s = species.toLowerCase();
    if (s.includes('クヌギ') || s.includes('ナラ') || s.includes('コナラ') || s.includes('カシ') || s.includes('オーク')) {
      return 'oak';
    }
    if (s.includes('サクラ') || s.includes('チェリー')) {
      return 'cherry';
    }
    if (s.includes('ケヤキ') || s.includes('カエデ') || s.includes('メープル') || s.includes('タモ') || s.includes('広葉樹')) {
      return 'hardwood';
    }
    if (s.includes('スギ') || s.includes('ヒノキ') || s.includes('マツ') || s.includes('カラマツ') || s.includes('コニファー') || s.includes('針葉樹')) {
      return 'softwood';
    }
    return 'other';
  };

  // 乾燥度合のカテゴリキー判定
  const getDrynessCategoryKey = (months: number): 'fresh' | 'medium' | 'ready' | 'seasoned' => {
    if (months < 6) return 'fresh';
    if (months < 12) return 'medium';
    if (months < 18) return 'ready';
    return 'seasoned';
  };

  // 乾燥度合表示用ステータス取得
  const getDryStatus = (months: number) => {
    const key = getDrynessCategoryKey(months);
    const label = settings.drynessLabels[key];
    
    let className = 'dry-fresh';
    let opacity = 0.5;

    switch (key) {
      case 'fresh':
        className = 'dry-fresh';
        opacity = 0.5;
        break;
      case 'medium':
        className = 'dry-medium';
        opacity = 0.75;
        break;
      case 'ready':
        className = 'dry-ready';
        opacity = 1.0;
        break;
      case 'seasoned':
        className = 'dry-seasoned';
        opacity = 1.0;
        break;
    }

    return { label, class: className, opacity };
  };

  // 乾燥月数取得
  const getDryMonths = (startDateStr: string): number => {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.4); // おおよその月数
  };

  // スロットの体積計算 (㎥)
  const getSlotVolumeM3 = (slot: Slot, defaultSize: { height: number; width: number; depth: number }): number => {
    const size = slot.size || defaultSize;
    // cm単位のサイズをメートル単位に直して掛け算
    return (size.height * size.width * size.depth) / 1000000;
  };

  // 各薪棚ごとの乾燥完了・極上乾燥の体積集計
  const getUnitDryVolume = (unit: ShelvingUnit) => {
    let readyVol = 0;
    let seasonedVol = 0;
    unit.slots.forEach(slot => {
      if (slot.firewood) {
        const vol = getSlotVolumeM3(slot, unit.slotDefaultSize);
        const dMonths = getDryMonths(slot.firewood.dryStartDate);
        const dKey = getDrynessCategoryKey(dMonths);
        if (dKey === 'ready') readyVol += vol;
        if (dKey === 'seasoned') seasonedVol += vol;
      }
    });
    return {
      ready: readyVol,
      seasoned: seasonedVol,
      total: readyVol + seasonedVol
    };
  };

  // --- ストック体積集計の計算 ---
  const activeUnitVolBySpecies = { oak: 0, cherry: 0, hardwood: 0, softwood: 0, other: 0 };
  const activeUnitVolByDryness = { fresh: 0, medium: 0, ready: 0, seasoned: 0 };
  const totalVolBySpecies = { oak: 0, cherry: 0, hardwood: 0, softwood: 0, other: 0 };
  const totalVolByDryness = { fresh: 0, medium: 0, ready: 0, seasoned: 0 };

  // 全棚の集計
  data.shelvingUnits.forEach(unit => {
    unit.slots.forEach(slot => {
      if (slot.firewood) {
        const vol = getSlotVolumeM3(slot, unit.slotDefaultSize);
        const sKey = getSpeciesCategoryKey(slot.firewood.species);
        const dMonths = getDryMonths(slot.firewood.dryStartDate);
        const dKey = getDrynessCategoryKey(dMonths);

        totalVolBySpecies[sKey] += vol;
        totalVolByDryness[dKey] += vol;

        // 選択中の棚の場合
        if (unit.id === activeUnitId) {
          activeUnitVolBySpecies[sKey] += vol;
          activeUnitVolByDryness[dKey] += vol;
        }
      }
    });
  });

  // グリッドを二次元配列として取得 (表示用)
  const getGrid = (unit: ShelvingUnit) => {
    const grid: Slot[][] = Array.from({ length: unit.rowsCount }, () => []);
    unit.slots.forEach(slot => {
      if (slot.row < unit.rowsCount && slot.col < unit.colsCount) {
        grid[slot.row][slot.col] = slot;
      }
    });
    return [...grid].reverse(); // 描画時は上段からループ
  };

  return (
    <div className="app-container">
      {/* ヘッダー */}
      <header className="app-header">
        <div className="header-brand">
          <Sparkles className="brand-icon" />
          <h1>MyFirewoodStocker</h1>
          <span className="badge-mode">Local Edition</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleLoadSample}>
            <RefreshCw size={16} /> サンプル読込
          </button>
          <label className="btn btn-secondary cursor-pointer">
            <Upload size={16} /> インポート
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button className="btn btn-primary" onClick={handleExportJSON}>
            <Download size={16} /> 保存 (JSON)
          </button>
        </div>
      </header>

      <div className="app-content">
        {/* 左サイドバー */}
        <aside className="app-sidebar-left">
          {/* 薪棚リスト */}
          <div className="panel panel-nav">
            <div className="panel-header">
              <h2><Layers size={18} /> 薪棚リスト</h2>
              <button className="btn-icon" onClick={() => setShowAddUnitModal(true)} title="薪棚を追加">
                <Plus size={18} />
              </button>
            </div>
            <div className="unit-list">
              {data.shelvingUnits.length === 0 ? (
                <p className="empty-text">登録された棚がありません。右上の＋から追加してください。</p>
              ) : (
                data.shelvingUnits.map((unit) => {
                  const dryVol = getUnitDryVolume(unit);
                  return (
                    <div 
                      key={unit.id} 
                      className={`unit-item ${unit.id === activeUnitId ? 'active' : ''}`}
                      onClick={() => {
                        setActiveUnitId(unit.id);
                        setIsEditingUnitName(false); // 棚切り替え時は編集を閉じる
                      }}
                    >
                      <div className="unit-info">
                        <span className="unit-name">{unit.name}</span>
                        <span className="unit-size">{unit.colsCount}列 × {unit.rowsCount}段</span>
                        <span className="unit-dry-vol">
                          乾燥済: {dryVol.total.toFixed(2)} ㎥ (完了:{dryVol.ready.toFixed(2)} / 極上:{dryVol.seasoned.toFixed(2)})
                        </span>
                      </div>
                      <button 
                        className="btn-delete-unit" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUnit(unit.id);
                        }}
                        title="薪棚を削除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 表示設定トグル */}
          <div className="panel panel-settings">
            <div className="panel-header">
              <h2><Settings size={18} /> 表示設定</h2>
            </div>
            <div className="settings-options">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showSpeciesColor} 
                  onChange={(e) => setShowSpeciesColor(e.target.checked)} 
                />
                <span>樹種による色分け</span>
              </label>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={showDrynessEffect} 
                  onChange={(e) => setShowDrynessEffect(e.target.checked)} 
                />
                <span>乾燥期間に応じた不透明度表現</span>
              </label>
            </div>
          </div>

        </aside>

        {/* メイングリッド表示 */}
        <main className="app-main">
          {activeUnit ? (
            <div className="stocker-panel">
              <div className="stocker-meta">
                <div className="meta-left">
                  
                  {/* 棚名のインライン編集 */}
                  {isEditingUnitName ? (
                    <div className="inline-title-edit-group">
                      <input 
                        type="text"
                        className="title-edit-input"
                        value={editedUnitName}
                        onChange={(e) => setEditedUnitName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveUnitName();
                          if (e.key === 'Escape') setIsEditingUnitName(false);
                        }}
                        autoFocus
                      />
                      <button className="btn-save-title" onClick={handleSaveUnitName}>
                        <Check size={16} /> 保存
                      </button>
                      <button className="btn-cancel-title" onClick={() => setIsEditingUnitName(false)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="title-display-group">
                      <h2>{activeUnit.name}</h2>
                      <button className="btn-edit-title" onClick={startEditingUnitName} title="薪棚の名前を変更">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}

                  <span className="meta-dim">
                    スロット寸法: {activeUnit.slotDefaultSize.width}w × {activeUnit.slotDefaultSize.height}h × {activeUnit.slotDefaultSize.depth}d (cm) 
                    (スロット体積: {((activeUnit.slotDefaultSize.width * activeUnit.slotDefaultSize.height * activeUnit.slotDefaultSize.depth) / 1000000).toFixed(3)} ㎥)
                  </span>
                </div>
                
                <div className="meta-right">
                  {/* 総ストック体積 (㎥) */}
                  <div className="stock-summary-total">
                    <span className="label">この棚のストック量:</span>
                    <span className="vol-value">
                      {Object.values(activeUnitVolBySpecies).reduce((a, b) => a + b, 0).toFixed(2)} ㎥
                    </span>
                    <span className="total-label-sub">
                      (全棚合計: {Object.values(totalVolBySpecies).reduce((a, b) => a + b, 0).toFixed(2)} ㎥)
                    </span>
                  </div>
                  
                  <span className="stocker-summary-badge">
                    総スロット: {activeUnit.slots.length} | 
                    使用中: {activeUnit.slots.filter(s => s.firewood).length} | 
                    空き: {activeUnit.slots.filter(s => !s.firewood).length}
                  </span>
                </div>
              </div>

              {/* 薪棚木枠グリッド */}
              <div className="wood-rack-outer">
                <div className="wood-rack-grid" style={{
                  gridTemplateRows: `repeat(${activeUnit.rowsCount}, 1fr)`,
                  gridTemplateColumns: `repeat(${activeUnit.colsCount}, 1fr)`
                }}>
                  {getGrid(activeUnit).map((rowSlots, rIndex) => {
                    const rowNum = activeUnit.rowsCount - 1 - rIndex; // 下からカウントする実際の行番号
                    return rowSlots.map((slot) => {
                      const isWoodPlaced = !!slot.firewood;
                      const dryMonths = isWoodPlaced ? getDryMonths(slot.firewood!.dryStartDate) : 0;
                      const dryStatus = isWoodPlaced ? getDryStatus(dryMonths) : null;
                      const speciesColor = isWoodPlaced ? getSpeciesColor(slot.firewood!.species) : '';

                      // 不透明度エフェクト適用
                      const opacity = isWoodPlaced && showDrynessEffect ? dryStatus?.opacity : 1.0;

                      return (
                        <div 
                          key={`${rowNum}-${slot.col}`} 
                          className={`grid-cell ${isWoodPlaced ? 'has-wood' : 'empty'}`}
                          style={{
                            borderColor: 'var(--panel-border)',
                            backgroundColor: isWoodPlaced && showSpeciesColor ? speciesColor : undefined,
                            opacity: opacity
                          }}
                          onClick={() => handleSlotClick(slot)}
                        >
                          <div className="cell-coordinates">
                            {rowNum + 1}段 - {slot.col + 1}列
                          </div>
                          
                          {isWoodPlaced && slot.firewood ? (
                            <div className="wood-details">
                              <span className="wood-species">{slot.firewood.species}</span>
                              <span className={`dry-badge ${dryStatus?.class}`}>
                                {dryStatus?.label}
                              </span>
                              {slot.firewood.notes && (
                                <span className="wood-notes-indicator" title={slot.firewood.notes}>
                                  ※メモあり
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="empty-indicator">
                              <Plus size={14} className="add-icon" />
                              <span>空スロット</span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-stocker-state">
              <Package size={64} className="empty-icon" />
              <h2>管理中の薪棚がありません</h2>
              <p>左側のメニューから薪棚を追加するか、サンプルデータを読み込んでください。</p>
              <div className="empty-actions">
                <button className="btn btn-primary" onClick={() => setShowAddUnitModal(true)}>
                  <Plus size={16} /> 新しい薪棚を作成する
                </button>
                <button className="btn btn-secondary" onClick={handleLoadSample}>
                  <RefreshCw size={16} /> サンプルデータを読み込む
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 右サイドバー (管理＆設定) */}
        <aside className="app-sidebar-right">
          <div className="panel panel-legend">
            <div className="panel-header">
              <h2><Database size={18} /> 管理＆設定</h2>
            </div>
            <div className="legend-content">
              
              {/* 樹種設定とストック量 */}
              <h3>樹種設定＆ストック量</h3>
              <ul className="legend-list">
                {([
                  { key: 'oak', color: 'var(--color-oak)' },
                  { key: 'cherry', color: 'var(--color-cherry)' },
                  { key: 'hardwood', color: 'var(--color-hardwood)' },
                  { key: 'softwood', color: 'var(--color-softwood)' },
                  { key: 'other', color: 'var(--color-other)' }
                ] as const).map(({ key, color }) => {
                  const label = settings.speciesLabels[key];
                  const activeVol = activeUnitVolBySpecies[key].toFixed(2);
                  const totalVol = totalVolBySpecies[key].toFixed(2);

                  return (
                    <li key={key} className="legend-setting-item">
                      <span className="legend-dot" style={{ backgroundColor: color }}></span>
                      
                      {editingLabelKey === `species-${key}` ? (
                        <div className="edit-label-input-group">
                          <input 
                            type="text" 
                            className="input-label-edit" 
                            value={editedLabelValue} 
                            onChange={(e) => setEditedLabelValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLabel('species', key);
                              if (e.key === 'Escape') setEditingLabelKey(null);
                            }}
                            autoFocus
                          />
                          <button className="btn-save-label" onClick={() => handleSaveLabel('species', key)}>
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="legend-label-row">
                          <span className="legend-label-text" title="クリックして編集" onClick={() => startEditingLabel(`species-${key}`, label)}>
                            {label}
                            <Edit2 size={10} className="edit-icon-inline" />
                          </span>
                          <span className="vol-badge">
                            {activeVol} ㎥ <span className="vol-total-sub">(総: {totalVol} ㎥)</span>
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* 乾燥度設定とストック量 */}
              <h3>乾燥度設定＆ストック量</h3>
              <ul className="legend-list">
                {([
                  { key: 'fresh', class: 'dry-fresh' },
                  { key: 'medium', class: 'dry-medium' },
                  { key: 'ready', class: 'dry-ready' },
                  { key: 'seasoned', class: 'dry-seasoned' }
                ] as const).map(({ key, class: statusClass }) => {
                  const label = settings.drynessLabels[key];
                  const activeVol = activeUnitVolByDryness[key].toFixed(2);
                  const totalVol = totalVolByDryness[key].toFixed(2);

                  return (
                    <li key={key} className="legend-setting-item">
                      <span className={`legend-status-badge ${statusClass}`}>
                        {editingLabelKey === `dryness-${key}` ? '編集中' : label.split(' ')[0]}
                      </span>

                      {editingLabelKey === `dryness-${key}` ? (
                        <div className="edit-label-input-group">
                          <input 
                            type="text" 
                            className="input-label-edit" 
                            value={editedLabelValue} 
                            onChange={(e) => setEditedLabelValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLabel('dryness', key);
                              if (e.key === 'Escape') setEditingLabelKey(null);
                            }}
                            autoFocus
                          />
                          <button className="btn-save-label" onClick={() => handleSaveLabel('dryness', key)}>
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="legend-label-row">
                          <span className="legend-label-text" title="クリックして編集" onClick={() => startEditingLabel(`dryness-${key}`, label)}>
                            {label}
                            <Edit2 size={10} className="edit-icon-inline" />
                          </span>
                          <span className="vol-badge">
                            {activeVol} ㎥ <span className="vol-total-sub">(総: {totalVol} ㎥)</span>
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

            </div>
          </div>
        </aside>
      </div>

      {/* 薪棚追加モーダル */}
      {showAddUnitModal && (
        <div className="modal-overlay" onClick={() => setShowAddUnitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>新しい薪棚の作成</h2>
              <button className="btn-close" onClick={() => setShowAddUnitModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUnit}>
              <div className="form-group">
                <label>棚の名前</label>
                <input 
                  type="text" 
                  value={newUnitName} 
                  onChange={(e) => setNewUnitName(e.target.value)} 
                  placeholder="例: 薪棚A, 南側の棚" 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>上下段数 (行数)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={newUnitRows} 
                    onChange={(e) => setNewUnitRows(e.target.value === '' ? '' : Number(e.target.value))} 
                    onBlur={() => {
                      if (newUnitRows === '' || newUnitRows < 1) setNewUnitRows(3);
                    }}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>前後列数 (列数)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={newUnitCols} 
                    onChange={(e) => setNewUnitCols(e.target.value === '' ? '' : Number(e.target.value))} 
                    onBlur={() => {
                      if (newUnitCols === '' || newUnitCols < 1) setNewUnitCols(4);
                    }}
                    required 
                  />
                </div>
              </div>

              <h3 className="section-title"><Wrench size={14} /> スロットの標準寸法 (メタデータ)</h3>
              <div className="form-row-three">
                <div className="form-group">
                  <label>高さ (cm)</label>
                  <input 
                    type="number" 
                    value={newUnitHeight} 
                    onChange={(e) => setNewUnitHeight(e.target.value === '' ? '' : Number(e.target.value))} 
                    onBlur={() => {
                      if (newUnitHeight === '' || newUnitHeight < 1) setNewUnitHeight(50);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>幅 (cm)</label>
                  <input 
                    type="number" 
                    value={newUnitWidth} 
                    onChange={(e) => setNewUnitWidth(e.target.value === '' ? '' : Number(e.target.value))} 
                    onBlur={() => {
                      if (newUnitWidth === '' || newUnitWidth < 1) setNewUnitWidth(80);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>奥行 (cm)</label>
                  <input 
                    type="number" 
                    value={newUnitDepth} 
                    onChange={(e) => setNewUnitDepth(e.target.value === '' ? '' : Number(e.target.value))} 
                    onBlur={() => {
                      if (newUnitDepth === '' || newUnitDepth < 1) setNewUnitDepth(40);
                    }}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUnitModal(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  作成する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 薪配置ダイアログ */}
      {selectedSlot && activeUnit && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>薪の配置設定 ({selectedSlot.row + 1}段 - {selectedSlot.col + 1}列)</h2>
              <button className="btn-close" onClick={() => setSelectedSlot(null)}>×</button>
            </div>
            <form onSubmit={handleSaveFirewood}>
              <div className="form-group">
                <label>樹種</label>
                <select value={woodSpecies} onChange={(e) => setWoodSpecies(e.target.value)}>
                  {/* 設定されたカスタムラベルをドロップダウンに反映 */}
                  <option value="クヌギ">{settings.speciesLabels.oak} (クヌギ等)</option>
                  <option value="ナラ">{settings.speciesLabels.oak} (ナラ等)</option>
                  <option value="サクラ">{settings.speciesLabels.cherry} (サクラ等)</option>
                  <option value="ケヤキ">{settings.speciesLabels.hardwood} (ケヤキ等)</option>
                  <option value="スギ">{settings.speciesLabels.softwood} (スギ等)</option>
                  <option value="ヒノキ">{settings.speciesLabels.softwood} (ヒノキ等)</option>
                  <option value="その他">{settings.speciesLabels.other}</option>
                </select>
              </div>

              <div className="form-group">
                <label>乾燥開始日</label>
                <input 
                  type="date" 
                  value={woodDryStart} 
                  onChange={(e) => setWoodDryStart(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>メモ・特記事項</label>
                <textarea 
                  value={woodNotes} 
                  onChange={(e) => setWoodNotes(e.target.value)} 
                  placeholder="例: 太割り、乾燥開始時含水率35%" 
                  rows={3}
                />
              </div>

              <div className="modal-actions-space">
                {activeUnit.slots.find(s => s.row === selectedSlot.row && s.col === selectedSlot.col)?.firewood ? (
                  <button type="button" className="btn btn-danger" onClick={handleDeleteFirewood}>
                    <Trash2 size={16} /> この場所を空にする
                  </button>
                ) : <div />}
                
                <div className="modal-actions-right">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>
                    キャンセル
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FileCheck size={16} /> 保存する
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
