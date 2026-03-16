import { BasicInfo, FindingRow, OtherSection } from '@/types/form';
import { formatFindingRow } from './format';
import Encoding from 'encoding-japanese';

const LF = "\n";

/**
 * QRコード用データを生成（レポートシステムのテキスト入力画面用）
 * バーコードリーダーのキーボードウェッジモードで読み取り、
 * テキストエリアに連続入力される想定
 * 
 * 改行コード（CRLF）からLFに変更:
 * - CRLFの\r（復帰文字）がバーコードリーダーで誤認識される可能性があるため
 * - LFのみにすることで、テキスト入力画面でも正しく改行される
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
  
  return lines.join(LF);
}

/**
 * QRコードデータのバイト数を計算（UTF-8）
 * 後方互換用
 */
export function getQrDataSize(data: string): number {
  return new Blob([data]).size;
}

/**
 * UTF-8文字列をShift-JISのnumber[]に変換
 * qrcode ライブラリの byte mode セグメントに渡す用
 *
 * 変換理由:
 * - 電子カルテ端末（Windows/Shift-JIS環境）のバーコードリーダーは
 *   Shift-JISのバイト列をキーボード入力としてエミュレートする
 * - QRコード内のデータをShift-JISバイト列にしておくことで
 *   読み取り時に日本語が正しく入力される
 */
export function toShiftJisArray(text: string): Uint8Array {
  const unicodeArray = Encoding.stringToCode(text);
  const sjisNumbers = Encoding.convert(unicodeArray, {
    to: 'SJIS',
    from: 'UNICODE',
  }) as number[];
  return new Uint8Array(sjisNumbers);
}

/**
 * Shift-JIS変換後のバイト数を返す
 * QRコード容量チェック用（UTF-8より小さくなる場合が多い）
 */
export function getQrDataSizeShiftJis(data: string): number {
  return toShiftJisArray(data).length;
}
