// マスタデータ（正式版）

// 血管
export const vesselOptions = [
  '',
  'RCA',
  'LAD',
  'Cx',
];

// セグメントNo.
export const segmentNoOptions = [
  '',
  '#1',
  '#2',
  '#3',
  '#4PL',
  '#4PD',
  '#5',
  '#6',
  '#7',
  '#8',
  '#9',
  '#10',
  'D3',
  'Dx',
  'HL',
  '#11',
  '#12',
  '#13',
  '#14',
  '#15',
];

// 場所（Location）
export const locationOptions = [
  '',
  '(prox)',
  '(mid)',
  '(distal)',
  '(os)',
  '(just)',
  'bifur',
];

// 狭窄率
export const stenosisOptions = [
  '',
  '25%',
  '25-50%',
  '50%',
  '50-75%',
  '75%',
  '75-90%',
  '90%',
  '90-99%',
  '99%',
  '100%',
  'n.p',
];

// 性状（プラーク性状）
export const plaqueOptions = [
  '',
  '非石灰化プラーク',
  '混合プラーク',
  '石灰化プラーク',
  '石灰化プラークあり',
  '一部高度石灰化のため内腔評価困難です。',
  'モーションアーチファクトのため内腔評価困難です。',
];

// 特殊所見（ボタン表示 → 実際の記載）
export const specialOptions = [
  { key: 'PR', label: 'PR', fullText: 'Positive remodeling' },
  { key: 'MB', label: 'MB', fullText: 'Myocardial bridge' },
  { key: 'NRS', label: 'NRS', fullText: 'Napkin-ring sign' },
  { key: 'LAP', label: 'LAP', fullText: 'Low attenuation plaque' },
  { key: 'SC', label: 'SC', fullText: 'Spotty calcification' },
  { key: 'FLOW', label: 'flow+', fullText: '末梢のflow+' },
];

// その他セクションの定型文（プルダウン表示 → 実際の記載）
export const otherPresetOptions = [
  { key: '', label: '選択', fullText: '' },
  { key: 'PFO_SF_NEG', label: 'PFO SF(-)', fullText: '・心房間にスリット様の造影所見を認めます。PFOを疑います。' },
  { key: 'PFO_SF_POS', label: 'PFO SF(+)', fullText: '・心房間にスリット様の造影所見及びLA→RAシャントを認めます。PFOを疑います。' },
  { key: 'LA_DIVERTICULUM', label: 'LA憩室', fullText: '・LA前壁に憩室様構造を認めます。' },
  { key: 'LAAT_NEG', label: 'LAAT(-)', fullText: '・左心耳内において、動脈相・遅延相共に明らかな血栓像を認めません。' },
  { key: 'LAAT_EARLY', label: 'LAAT 早期陽性', fullText: '・動脈相で左心耳先端に造影欠損を認めますが、遅延相では造影されています。左心耳血栓は否定的と考えます。' },
  { key: 'INTRA_ATRIAL_NEG', label: '心房間短絡(-)', fullText: '・心房間に明らかな短絡所見を認めません。' },
];

// Stent所見（直接選択）
export const stentFindingOptions = [
  '',
  'stent内にISRを疑う明らかな所見を認めません。',
  'stent内に軽度ISRを疑う所見を認めます。',
  'stent内に中等度ISRを疑う所見を認めます。',
  'stent内に高度ISRを疑う所見を認めます。',
  'アーチファクトによりstent内の評価困難です。',
];
