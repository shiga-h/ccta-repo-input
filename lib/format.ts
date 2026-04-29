import { FindingRow } from '@/types/form';
import { specialOptions } from './masterData';

/**
 * 特殊所見のキーからフルテキストを取得
 */
function getSpecialFullText(key: string): string {
  const option = specialOptions.find(opt => opt.key === key);
  return option ? option.fullText : key;
}

/**
 * 所見1行を文字列に変換
 * ルール:
 * - Stentチェックあり → No.の後にstent、狭窄率に応じたテキストを表示
 * - 性状あり + 特殊所見あり → 特殊所見は（）で括る
 * - 性状なし + 特殊所見あり → 各特殊所見名(+)をカンマ区切り
 * - フリーテキストあり → 最後に追加
 */
export function formatFindingRow(finding: FindingRow): string {
  const parts: string[] = [];
  
  // 血管名
  if (finding.vessel) {
    parts.push(finding.vessel);
  }
  
  // セグメントNo.
  if (finding.segmentNo) {
    parts.push(finding.segmentNo);
  }
  
  // Stentの場合
  if (finding.isStent) {
    parts.push('stent');
  }
  
  // 場所（Stentでない場合のみ）
  if (finding.location && !finding.isStent) {
    parts.push(finding.location);
  }
  
  // 基本部分を連結
  let line = parts.join(' ');
  
  // Stentの場合は選択テキストをそのまま使用
  if (finding.isStent && finding.stenosis) {
    if (line) line += '：';
    line += finding.stenosis;
  } else {
    // 通常の狭窄率・性状・特殊所見の処理
    const hasPlaque = !!finding.plaque;
    const hasSpecial = finding.special && finding.special.length > 0;
    const hasStenosis = !!finding.stenosis;
    
    // 区切り（：）を追加する条件
    if (line && (hasStenosis || hasPlaque || hasSpecial)) {
      line += '：';
    }
    
    // 狭窄率
    if (hasStenosis) {
      line += finding.stenosis;
    }
    
    // 性状あり + 特殊所見あり → 特殊所見は（）で括る（カンマ区切り、フルテキスト）
    if (hasPlaque && hasSpecial) {
      if (hasStenosis) line += ' ';
      const specialFullTexts = finding.special.map(s => getSpecialFullText(s));
      const specialStr = specialFullTexts.join(',');
      line += `${finding.plaque}（${specialStr}）`;
    }
    // 性状のみ
    else if (hasPlaque && !hasSpecial) {
      if (hasStenosis) line += ' ';
      line += finding.plaque;
    }
    // 性状なし + 特殊所見あり → 各特殊所見フルテキスト(+)をカンマ区切り
    else if (!hasPlaque && hasSpecial) {
      if (hasStenosis) line += ' ';
      const specialWithPlus = finding.special.map(s => `${getSpecialFullText(s)}(+)`).join(',');
      line += specialWithPlus;
    }
  }
  
  // フリーテキストがある場合
  if (finding.hasFreeText && finding.freeText) {
    if (line) {
      line += ' ' + finding.freeText;
    } else {
      line = finding.freeText;
    }
  }
  
  return line;
}
