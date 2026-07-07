# MyFirewoodStocker - Visual Firewood Inventory Stocker

MyFirewoodStocker is a modern, visual, and intuitive inventory management tool designed for individuals to track and organize their firewood stock units. It features a stunning glassmorphic wood-and-forest theme and runs entirely in your local browser with LocalStorage auto-saving and JSON data portability.

MyFirewoodStockerは、個人が自宅の薪棚の在庫を視覚的に管理・整理するための、モダンで直感的な在庫管理ツールです。温かみのあるウッド・フォレスト調のプレミアムなダークテーマUIを採用し、LocalStorageによる自動保存、JSON形式でのデータ保存・復元、および樹種や乾燥期間に応じた視覚的な管理機能を備えています。

---

## 🪵 Key Features / 主な機能

* **Multi-Rack Management / 複数薪棚の登録・管理**:
  * Create and configure multiple shelving units (e.g., "Backyard Rack A", "South Wall Rack").
  * 複数の薪棚（「裏庭のA棚」「南側の棚」など）を自由に登録・管理できます。
  * Specify custom column and row counts (grids) for each rack.
  * 各薪棚の上下段数（行数）および前後列数を自由に指定して格子状の棚を生成できます。
  * Retain physical slot sizes (height, width, depth) as metadata.
  * 各棚の標準的なサイズ（高さ・横幅・奥行）をメタデータとしてしっかりと保持します。

* **Visual Firewood Plotting / 薪の配置と視覚的プロット**:
  * Add or remove firewood bundle characteristics (species, dry start date, custom notes) directly in grid slots.
  * グリッド内のスロットをクリックするだけで、薪（樹種、乾燥開始日、詳細メモ）を直感的に配置・削除できます。
  * **Species Color Coding**: Custom color coding (e.g., Brown for Oak, Red for Cherry, Green for Pine) to quickly spot your wood types.
  * **樹種別の色分け**: 樹種に応じて自動的に色分け（例: クヌギ・ナラは茶系、スギ・ヒノキは緑系、サクラは赤系）して描画します。
  * **Dryness Transparency Effect**: Calculates dryness period based on the calendar and reflects it via badge status and opacity.
  * **乾燥度合の不透明度表現**: 乾燥開始日からの経過月数を自動計算し、乾燥状態（未乾燥、乾燥中、乾燥完了など）をバッジと不透明度で表現します。

* **Real-time Volume Calculation (㎥) / リアルタイム体積集計**:
  * Automatically calculates wood stock volume in cubic meters (㎥) based on slot sizes.
  * 配置された薪のスロット寸法から、ストック体積を立方メートル（㎥）単位で自動計算します。
  * Displays real-time breakdown of volume by species and dryness, both for the active unit and the grand total.
  * 選択中の棚および全棚の合計について、樹種別・乾燥度別のストック体積がリアルタイムで集計表示されます。

* **Custom Labels (Settings) / 樹種・乾燥度の名称カスタマイズ**:
  * Edit species category names and dryness labels on the fly.
  * サイドバーの「管理＆設定」パネルから、樹種名や乾燥度の名称表示をクリックするだけでいつでも自由に変更できます。
  * Changes sync instantly across grids, status badges, and selection forms.
  * 変更内容はグリッドの表示、セルバッジ、配置用フォームの選択肢に即座に同期・反映されます。

* **Data Portability / データの保存と読み込み (JSON)**:
  * Export your entire database to a local JSON file.
  * 作成した在庫データをJSON形式でいつでもファイル保存（ダウンロード）できます。
  * Load and restore past JSON files easily via the toolbar's import feature.
  * 保存したJSONファイルは、ツールバーの「インポート」からいつでも安全に復元できます。

---

## 🚀 Getting Started / 使い方

### For General Users / 一般ユーザー向け（かんたん起動）

1. **Start the application / アプリの起動**:
   * Double-click the **`start-dev.bat`** file in the root folder.
   * フォルダ直下にある **`start-dev.bat`** をダブルクリックします。
2. **Access in browser / ブラウザで開く**:
   * Open your browser and navigate to `http://localhost:5175`.
   * 自動的に開発サーバーが立ち上がります。ブラウザで [http://localhost:5175](http://localhost:5175) を開いてください。
3. **Use the App / 在庫の管理**:
   * Create a new shelving unit, or load the sample data to start tracking your firewood stock.
   * 「新しい薪棚を作成する」から始めるか、「サンプルデータ」をロードして在庫管理を開始します。

### For Developers / 開発者向け

To set up the project locally for development:

1. **Install dependencies / 依存関係のインストール**:
   ```bash
   npm install
   ```
2. **Start dev server / 開発サーバーの起動**:
   ```bash
   npm run dev
   ```
3. **Build for production / 本番ビルドの作成**:
   ```bash
   npm run build
   ```

---

## 🛠 Tech Stack / 技術スタック

* **Core**: React 19, TypeScript, Vite
* **Styling**: Vanilla CSS (Custom properties / Variables, Glassmorphism design system)
* **Icons**: Lucide React

---

## 📄 License / ライセンス

This project is open-sourced under the [MIT License](LICENSE).
このプロジェクトはMITライセンスのもとで公開されています。
