import { BasicInfo, FindingRow, OtherSection } from '@/types/form';
import { formatFindingRow } from './format';

const LF = "\n";

/**
 * QRコード用データを生成（レポートシステムのテキスト入力画面用）
 */
export function buildQrData(
  basicInfo: BasicInfo,
  findings: FindingRow[],
  otherSection?: OtherSection
): string {
  const lines: string[] = [];

  lines.push(`＜冠動脈＞（担当技師：${basicInfo.analyst || ''}）`);

  if (basicInfo.motionArtifact) {
    lines.push('高心拍によるモーションアーチファクトで画質poorです。');
  }

  if (basicInfo.calciumScore) {
    lines.push(`石灰化スコア：${basicInfo.calciumScore}`);
  }

  if (basicInfo.noSignificantStenosis) {
    lines.push('3枝ともに明らかな有意狭窄所見を認めません。');
  }

  findings.forEach((finding) => {
    const formattedLine = formatFindingRow(finding);
    if (formattedLine) {
      lines.push(formattedLine);
    }
  });

  if (otherSection?.enabled) {
    const hasOtherContent = otherSection.presetText || otherSection.freeText;
    if (hasOtherContent) {
      lines.push('＜その他＞');
      if (otherSection.presetText) lines.push(otherSection.presetText);
      if (otherSection.freeText) lines.push(otherSection.freeText);
    }
  }

  return lines.join(LF);
}

/**
 * UTF-8テキストをBase64エンコードする
 * QRコードにはASCII文字のみ埋め込まれるため、
 * バーコードリーダーのキーボードウェッジモードで確実に入力できる
 */
export function encodeToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  return btoa(binary);
}

/**
 * QRコードに埋め込むBase64文字列のサイズを返す
 * Base64はASCII1文字=1バイトなので length = バイト数
 */
export function getQrDataSize(text: string): number {
  return encodeToBase64(text).length;
}
