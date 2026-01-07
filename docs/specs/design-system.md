## Labio デザインシステム概要

Labio のプロダクト UI は、Next.js（App Router）＋ shadcn/ui ＋ Tailwind CSS ＋ phosphor-react を前提とする。  
ここでは **実装時に迷わない最低限のルール** に絞って定義する。

---

## カラー設計

- **ベースカラー（slate 系）**  
  Figma 変数 `slate/0〜900` を Tailwind / CSS 変数で共通利用する。
  - 背景:
    - ページ背景: `bg-slate-50`（= slate/50）
    - カード・パネル: `bg-white`（= slate/0）
    - 行 hover / 選択: `bg-slate-50` / `bg-slate-100`
  - 枠線:
    - 標準ボーダー: `border-slate-200`〜`border-slate-300`
    - 弱い仕切り線: `border-slate-100`
  - テキスト:
    - メイン: `text-slate-900`
    - セカンダリ: `text-slate-600`
    - 補足・ラベル: `text-slate-400`

- **アクセントカラー**
  - プライマリ（Indigo）: Figma `Color/Indigo`
    - ボタン・アクティブ状態: `bg-[#5769f6]` 前後
    - hover: 少し暗くした値（例: `#4558e5`）
  - 必要であれば Tailwind の `theme.extend.colors` に `primary` としてマッピングして使用:
    - 例: `bg-primary`, `text-primary`, `border-primary`

---

## タイポグラフィ

- ベースフォント: `Inter, -apple-system, system-ui, sans-serif`
- サイズ（よく使うもの）:
  - ページタイトル: `text-xl`〜`text-2xl` / `font-semibold`
  - セクションタイトル（例: "Activity"）: `text-sm`〜`text-base` / `font-medium` / `tracking-wide`
  - 行・セル内テキスト: `text-xs`（Figma の 12px 相当）
  - 補足テキスト: `text-xs` / `text-slate-400`

---

## コーナー（角丸）

- カード・パネル: `rounded-xl`
- Activity 行・インプット・小さめのボタン: `rounded-md`（6px 相当）
- バッジ・アバターなど丸みの強い要素: `rounded-full`

---

## アイコン

- **必須ルール**: アイコンはすべて `phosphor-react` を使用する。
  - 例:
    - タスク種別: `Cube`
    - 展開トグル: `CaretRight`
    - ステータス: `Circle` / `CircleHalf` など
    - 期日: `CalendarBlank`
    - ユーザー: `UserCircle`
    - 追加: `PlusCircle` / `Plus`
- 重さ（weight）はコンポーネントごとに固定する:
  - 行内の小アイコン: `weight="fill"` or `weight="bold"` をベースに統一

---

## ボタン（shadcn/ui ベース・必須ルール）

### 基本ルール

- **生の `<button>` は使わず、すべて `@/components/ui/button`（shadcn/ui）を経由する。**
- import 例:
  - `import { Button } from '@/components/ui/button';`
- 変種（variant）・サイズ（size）は **できるだけ shadcn 標準の値** に合わせる:
  - `variant`: `default | secondary | outline | ghost | link | destructive`
  - `size`: `default | sm | lg | icon`

### 代表パターン

- **プライマリボタン（例: "Add Activity"）**
  - コンポーネント:
    - `Button` + `variant="default"` + `size="sm" or "default"`
  - スタイル:
    - 背景: プライマリカラー（Indigo）
    - テキスト: `text-white`
    - 角丸: `rounded-lg`（Figma に合わせて `button` 側の className で調整可）
  - アイコン付き:
    - 左側に `phosphor-react` のアイコンを配置（例: `Plus`）
    - アイコンは `size={16〜20}` 程度、テキストとの間に `gap-2`

- **アイコンオンリーボタン（例: Assignee, Sidebar トグルなど）**
  - コンポーネント:
    - `Button` + `variant="ghost"` + `size="icon"`
  - スタイル:
    - 背景は基本 `transparent`、hover 時に `bg-slate-100`
    - border が必要な場合は `variant="outline"` を使うか `className` で上書き

- **フィルタ・ソートトリガー**
  - コンポーネント:
    - `Button` + `variant="outline"` + `size="icon"` or `size="sm"`
  - デザイン:
    - 丸めた角（`rounded-full` or `rounded-md`）
    - アイコンのみ or アイコン＋テキスト

---

## Activity 行コンポーネント（Activity/Item）

### コンポーネント構造

- `ActivityItem`
  - props（例）:
    - `id: string`（例: `"PINN-1"`）
    - `title: string`（例: `"タスクの例1"`）
    - `dueDate?: string`
    - `status?: 'todo' | 'in_progress' | 'done'`
    - `checked?: boolean`
    - `hasChildren?: boolean`
  - セル構成:
    - CheckboxCell: `ActivityCheckbox`（square-light / check-square-light 相当）
    - IdCell: `"PINN-1"` のようなテキスト
    - TypeCell: `Cube` アイコン（今は Task 固定）
    - ToggleCell: `CaretRight`（子 Activity があるときのみ表示）
    - StatusCell: `Circle` 系アイコン
    - TitleCell: タスク名（12px / 24px line-height）
    - AddSubActivityCell: `ActivityAddButton`（plus-circle-light/fill 相当）
    - DueDateCell: カレンダーアイコン＋日付（shadcn Button ベースに今後差し替え）
    - AssigneeCell: `UserCircle` アイコン入りの小さなボタン

### 行の状態

- `State=Default`:
  - 背景: `bg-white`
  - hover: `bg-slate-50`
- `State=Hover`:
  - 背景: `bg-slate-50`
- `State=Pressed / Selected`:
  - 背景: `bg-slate-50`（クリックして選択されている状態）
  - Checkbox: `check-square` の Indigo 塗りつぶし

行の状態は、**行コンポーネントの `checked` / `state` props から決まる**ようにし、  
呼び出し側（リスト側）が選択状態を管理する。

---

## 今後の拡張方針

- **ボタン系コンポーネントの統一**
  - 行内ボタン（DueDate, Assignee, Add など）は、順次 `shadcn/ui` の `Button` ベースに揃える。
  - 生 `<button>` が残っていたら、段階的に `Button` ラッパーにリプレイスする。

- **グローバルトークン**
  - `globals.css` または Tailwind の `theme.extend` に、Figma の `slate/*` と `Color/Indigo` をマッピングする。
  - 例: `--color-slate-50`, `--color-primary` などを定義し、必要に応じて `bg-[var(--color-primary)]` のように使用。

このドキュメントは「実装時に必ず参照する前提」の最小セットとして維持し、  
コンポーネントが増えてきたら、ボタン・フォーム・レイアウトなどを別ファイルに分割する。+

---

## メニュー / コマンド UI 指針

- **検索が必要なメニュー（例: フィルター、Assignee picker など）**
  - shadcn/ui の `Command` コンポーネントを標準として採用する。
  - `CommandGroup` でセクションを分け、グループ間には必ず `CommandSeparator` を表示して階層構造を明示する。
  - 検索付きメニュー内部のリスト部分と、画面上で表示する“選択済みバッジ（chip）”は切り離して実装する。バッジが不要なケースでも同じコマンドメニューを再利用できるようにする。

- **検索が不要なメニュー（例: プロジェクトヘッダーメニューなど）**
  - shadcn/ui の `DropdownMenu` ベースに統一し、項目の高さ・padding・アイコン位置を共通テンプレートで管理する。
  - `src/components/ui` 以下に共通ラッパーを用意し、各メニューコンポーネントはそこから import する。

- **共通要件**
  - メニュー／コマンドのトリガーは `Button` コンポーネントと組み合わせ、トリガーの見た目（サイズ・角丸）もドキュメントに記載したものに揃える。
  - 既存 UI（Filter メニューや CreateActivityModal 内の Assignee picker）は見た目を変えず、内部実装だけ徐々にこの方針へ移行する。
