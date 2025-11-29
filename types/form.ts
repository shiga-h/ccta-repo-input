// 基本情報の型
export interface BasicInfo {
  analyst: string;        // 解析者
  caseId: string;         // 症例識別コード
  calciumScore: string;   // 石灰化スコア
}

// 血管所見1行の型
export interface FindingRow {
  id: string;             // 一意のID
  vessel: string;         // 血管（RCA, LAD, Cx など）
  segmentNo: string;      // No.（#1〜#15）
  location: string;       // 場所（prox, mid など）
  stenosis: string;       // 狭窄率（25%, 50% など）
  plaque: string;         // 性状（石灰化プラーク など）
  special: string;        // 特殊所見（PR, MB など）
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
  special: string;
}

