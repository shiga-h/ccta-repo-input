import { BasicInfo, FindingRow, OtherSection } from '@/types/form';
import { specialOptions, stentStenosisTextMap } from './masterData';

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
  
  // Stentの場合は専用のテキストを使用
  if (finding.isStent && finding.stenosis) {
    const stentText = stentStenosisTextMap[finding.stenosis];
    if (stentText) {
      if (line) line += '：';
      line += stentText;
    }
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

/**
 * メール本文を生成
 */
export function buildBody(
  basicInfo: BasicInfo,
  findings: FindingRow[],
  otherSection?: OtherSection
): string {
  const lines: string[] = [];
  
  // ヘッダー
  lines.push(`＜冠動脈＞（担当技師：${basicInfo.analyst || ''}）`);
  
  // 高心拍によるモーションアーチファクト
  if (basicInfo.motionArtifact) {
    lines.push('高心拍によるモーションアーチファクトで画質poorです。');
  }
  
  // 石灰化スコア
  if (basicInfo.calciumScore) {
    lines.push(`石灰化スコア：${basicInfo.calciumScore}`);
  }
  
  // 3枝ともに明らかな有意狭窄所見を認めません
  if (basicInfo.noSignificantStenosis) {
    lines.push('3枝ともに明らかな有意狭窄所見を認めません。');
  }
  
  // 所見行（空行なしで続ける）
  findings.forEach((finding) => {
    const formattedLine = formatFindingRow(finding);
    if (formattedLine) {
      lines.push(formattedLine);
    }
  });
  
  // その他セクション
  if (otherSection?.enabled) {
    const hasOtherContent = otherSection.presetText || otherSection.freeText;
    if (hasOtherContent) {
      lines.push('＜その他＞');
      if (otherSection.presetText) {
        lines.push(otherSection.presetText);
      }
      if (otherSection.freeText) {
        lines.push(otherSection.freeText);
      }
    }
  }
  
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
