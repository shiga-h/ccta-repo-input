'use client';

import { plaqueOptions, stentFindingOptions, specialOptions, otherPresetOptions } from '@/lib/masterData';

interface HelpModalProps {
  onClose: () => void;
}

interface LabelRow {
  label: string;
  fullText: string;
  color: string;
}

function LabelTable({ rows }: { rows: LabelRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-3 items-start">
          <span className={`inline-block ${row.color} px-2 py-1 rounded text-sm font-medium whitespace-nowrap flex-shrink-0`}>
            {row.label}
          </span>
          <span className="text-sm text-gray-700 pt-1">{row.fullText}</span>
        </div>
      ))}
    </div>
  );
}

export default function HelpModal({ onClose }: HelpModalProps) {
  const plaqueRows: LabelRow[] = plaqueOptions
    .filter((opt) => opt.label !== opt.value)
    .map((opt) => ({ label: opt.label, fullText: opt.value, color: 'bg-blue-100 text-blue-700' }));

  const stentRows: LabelRow[] = stentFindingOptions.map((opt) => ({
    label: opt.label,
    fullText: opt.value,
    color: 'bg-purple-100 text-purple-700',
  }));

  const specialRows: LabelRow[] = specialOptions.map((opt) => ({
    label: opt.label,
    fullText: opt.fullText,
    color: 'bg-green-100 text-green-700',
  }));

  const otherRows: LabelRow[] = otherPresetOptions.map((opt) => ({
    label: opt.label,
    fullText: opt.fullText,
    color: 'bg-orange-100 text-orange-700',
  }));

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-h-[85vh] overflow-y-auto rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-bold text-gray-800">ヘルプ</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* 使い方 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">使い方</h3>
            <ol className="text-sm space-y-2 text-gray-700">
              <li>① 解析者・石灰化スコアを入力（解析者 Enter → 石灰化スコアへ移動）</li>
              <li>② 血管・No.・location・狭窄率・性状・特殊所見をタップして選択</li>
              <li>③ 「1行追加」で所見リストに追加</li>
              <li>④ 追加済み所見はタップで削除可能</li>
              <li>⑤ すべての所見入力後「QRコード生成」</li>
              <li>⑥ QRをバーコードリーダーでスキャン → decoder.html でデコード → 電子カルテへ貼り付け</li>
            </ol>
          </section>

          {/* 性状ラベル */}
          {plaqueRows.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">性状ボタン</h3>
              <LabelTable rows={plaqueRows} />
            </section>
          )}

          {/* Stent所見ラベル */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Stent所見ボタン</h3>
            <LabelTable rows={stentRows} />
          </section>

          {/* 特殊所見ラベル */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">特殊所見ボタン</h3>
            <LabelTable rows={specialRows} />
          </section>

          {/* その他定型文 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">その他定型文ボタン</h3>
            <LabelTable rows={otherRows} />
          </section>
        </div>
      </div>
    </div>
  );
}
