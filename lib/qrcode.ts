import { BasicInfo, FindingRow, OtherSection } from '@/types/form';
import { formatFindingRow } from './format';

const CRLF = "\r\n";

/**
 * QRコード用データを生成（Excelの縦方向入力用）
 * バーコードリーダーのキーボードウェッジモードで読み取り、
 * Excelの選択セルから縦方向に連続入力される想定
 */
export function buildQrData(
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
  
  return lines.join(CRLF);
}

/**
 * QRコードデータのバイト数を計算
 * QRコードの容量制限チェック用
 */
export function getQrDataSize(data: string): number {
  return new Blob([data]).size;
}
