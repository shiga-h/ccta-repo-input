import { BasicInfo, FindingRow } from '@/types/form';

/**
 * 所見1行を文字列に変換
 * ルール:
 * - 性状あり + 特殊所見あり → 特殊所見は（）で括る: #1：25% 石灰化プラーク（PR,MB）
 * - 性状なし + 特殊所見あり → 各特殊所見名(+): #8：PR(+),MB(+)
 * - 空欄項目はスキップ
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
  
  // 場所
  if (finding.location) {
    parts.push(finding.location);
  }
  
  // 基本部分を連結（血管、No.、場所）
  let line = parts.join(' ');
  
  // 狭窄率・性状・特殊所見の処理
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
  
  // 性状あり + 特殊所見あり → 特殊所見は（）で括る（カンマ区切り）
  if (hasPlaque && hasSpecial) {
    if (hasStenosis) line += ' ';
    const specialStr = finding.special.join(',');
    line += `${finding.plaque}（${specialStr}）`;
  }
  // 性状のみ
  else if (hasPlaque && !hasSpecial) {
    if (hasStenosis) line += ' ';
    line += finding.plaque;
  }
  // 性状なし + 特殊所見あり → 各特殊所見名(+)をカンマ区切り
  else if (!hasPlaque && hasSpecial) {
    if (hasStenosis) line += ' ';
    const specialWithPlus = finding.special.map(s => `${s}(+)`).join(',');
    line += specialWithPlus;
  }
  
  return line;
}

/**
 * メール本文を生成
 */
export function buildBody(basicInfo: BasicInfo, findings: FindingRow[]): string {
  const lines: string[] = [];
  
  // ヘッダー
  lines.push(`＜冠動脈＞（担当技師：${basicInfo.analyst || ''}）`);
  
  // 石灰化スコア
  if (basicInfo.calciumScore) {
    lines.push(`石灰化スコア：${basicInfo.calciumScore}`);
  }
  
  // 所見行（空行なしで続ける）
  findings.forEach((finding) => {
    const formattedLine = formatFindingRow(finding);
    if (formattedLine) {
      lines.push(formattedLine);
    }
  });
  
  return lines.join('\r\n');
}

/**
 * Gmailアプリまたはmailtoでメールを開く
 */
export function openGmailOrMailto(
  recipients: string[],
  subject: string,
  body: string
): void {
  const to = recipients.join(',');
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  // Gmailアプリ用URL
  const gmailUrl = `googlegmail://co?to=${to}&subject=${encodedSubject}&body=${encodedBody}`;
  
  // mailto用URL
  const mailtoUrl = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  
  // iOS/Androidでは先にGmailを試す
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isIOS || isAndroid) {
    // Gmailアプリを開く試行
    const gmailWindow = window.open(gmailUrl, '_blank');
    
    // フォールバック
    setTimeout(() => {
      if (!gmailWindow || gmailWindow.closed) {
        window.location.href = mailtoUrl;
      }
    }, 500);
  } else {
    // PCではmailtoを使用
    window.location.href = mailtoUrl;
  }
}

