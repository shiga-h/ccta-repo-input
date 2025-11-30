// 基本情報の型
export interface BasicInfo {
  analyst: string;        // 解析者
  caseId: string;         // 症例識別コード
  calciumScore: string;   // 石灰化スコア
  motionArtifact: boolean; // 高心拍によるモーションアーチファクト
  noSignificantStenosis: boolean; // 3枝ともに明らかな有意狭窄所見を認めません
}

// その他セクションの型
export interface OtherSection {
  enabled: boolean;       // その他セクションを表示するか
  presetText: string;     // プルダウンから選択した定型文
  freeText: string;       // 手入力テキスト
}

// 血管所見1行の型
export interface FindingRow {
  id: string;             // 一意のID
  vessel: string;         // 血管（RCA, LAD, Cx など）
  segmentNo: string;      // No.（#1〜#15）
  location: string;       // 場所（prox, mid など）
  stenosis: string;       // 狭窄率（25%, 50% など）
  plaque: string;         // 性状（石灰化プラーク など）
  special: string[];      // 特殊所見（複数選択可：PR, MB など）
}

// 設定の型
export interface Settings {
  recipients: string[];   // メール宛先
}

// フォーム全体の状態
export interface FormState {
  basicInfo: BasicInfo;
  findings: FindingRow[];
  settings: Settings;
  autoSave: boolean;
}

// 現在入力中の所見
export interface CurrentFinding {
  vessel: string;
  segmentNo: string;
  location: string;
  stenosis: string;
  plaque: string;
  special: string[];      // 特殊所見（複数選択可）
}

