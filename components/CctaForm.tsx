'use client';

import { useRef, useState, useEffect } from 'react';
import { useFormStore } from '@/store/formStore';
import {
  vesselOptions,
  segmentNoOptions,
  locationOptions,
  stenosisOptions,
  stentFindingOptions,
  plaqueOptions,
  specialOptions,
  otherPresetOptions,
} from '@/lib/masterData';
import { formatFindingRow } from '@/lib/format';
import { buildQrData } from '@/lib/qrcode';
import QrCodeDisplay from './QrCodeDisplay';
import HelpModal from './HelpModal';

// ── ユーティリティ ────────────────────────────────────────────────

function cls(...args: (string | false | undefined | null)[]) {
  return args.filter(Boolean).join(' ');
}

// ── サブコンポーネント ─────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-4 mb-1.5">
      {children}
    </p>
  );
}

/** 単一選択ボタングループ */
function SingleSelect({
  options,
  value,
  onChange,
  cols,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  const gridClass = cols ? `grid grid-cols-${cols} gap-1` : 'flex flex-wrap gap-1';
  return (
    <div className={gridClass}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          className={cls(
            'py-2 px-2 text-sm rounded-md border transition-colors min-h-[44px] leading-tight',
            cols !== undefined && 'w-full text-center',
            value === opt.value
              ? 'bg-blue-600 text-white border-blue-600 font-medium'
              : 'bg-white text-gray-700 border-gray-300 active:bg-gray-100'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** 複数選択ボタングループ */
function MultiSelect({
  options,
  values,
  onChange,
}: {
  options: { key: string; label: string }[];
  values: string[];
  onChange: (keys: string[]) => void;
}) {
  const toggle = (key: string) =>
    onChange(values.includes(key) ? values.filter((k) => k !== key) : [...values, key]);

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => toggle(opt.key)}
          className={cls(
            'py-2 px-3 text-sm rounded-md border transition-colors min-h-[44px]',
            values.includes(opt.key)
              ? 'bg-teal-600 text-white border-teal-600 font-medium'
              : 'bg-white text-gray-700 border-gray-300 active:bg-gray-100'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────────────────────

export default function CctaForm() {
  const {
    basicInfo,
    setBasicInfo,
    findings,
    addFinding,
    removeFinding,
    currentFinding,
    setCurrentFinding,
    resetCurrentFinding,
    otherSection,
    setOtherSection,
    clearAllExceptAnalyst,
  } = useFormStore();

  const [showQrCode, setShowQrCode] = useState(false);
  const [qrData, setQrData] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const calciumRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SR);
    }
  }, []);

  // 解析者 Enter → 石灰化スコアへフォーカス
  const handleAnalystKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calciumRef.current?.focus();
    }
  };

  // Web Speech API（フリー入力欄用）
  const toggleSpeech = () => {
    if (!speechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'ja-JP';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      setCurrentFinding({ freeText: currentFinding.freeText + e.results[0][0].transcript });
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  // 1行追加
  const handleAddFinding = () => {
    const hasInput =
      currentFinding.vessel ||
      currentFinding.segmentNo ||
      currentFinding.location ||
      currentFinding.stenosis ||
      currentFinding.plaque ||
      currentFinding.special.length > 0 ||
      (currentFinding.hasFreeText && currentFinding.freeText);
    if (hasInput) {
      addFinding(currentFinding);
      resetCurrentFinding();
    }
  };

  const previewLine = formatFindingRow({ id: '', ...currentFinding });
  const fullPreview = buildQrData(basicInfo, findings, otherSection);

  // string[] → { label, value }[] 変換
  const toOpts = (arr: string[]) =>
    arr.filter(Boolean).map((v) => ({ label: v, value: v }));

  return (
    <div className="pb-8">
      {/* ── ヘッダー（固定） ── */}
      <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
        <h1 className="font-bold text-gray-800 text-base">CT冠動脈解析レポート</h1>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center border border-gray-300 active:bg-gray-200"
          aria-label="ヘルプを開く"
        >
          ?
        </button>
      </div>

      {/* ── 基本情報 ── */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">解析者</label>
            <input
              type="text"
              value={basicInfo.analyst}
              onChange={(e) => setBasicInfo({ analyst: e.target.value })}
              onKeyDown={handleAnalystKeyDown}
              placeholder="例：志賀"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">石灰化スコア</label>
            <input
              ref={calciumRef}
              type="text"
              inputMode="decimal"
              value={basicInfo.calciumScore}
              onChange={(e) => setBasicInfo({ calciumScore: e.target.value })}
              placeholder="例：239.9"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <label
            className={cls(
              'flex-1 flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer text-sm',
              basicInfo.motionArtifact
                ? 'bg-orange-50 border-orange-400 text-orange-800'
                : 'bg-white border-gray-300 text-gray-600'
            )}
          >
            <input
              type="checkbox"
              checked={basicInfo.motionArtifact}
              onChange={(e) => setBasicInfo({ motionArtifact: e.target.checked })}
              className="w-4 h-4 flex-shrink-0"
            />
            高心拍MA
          </label>
          <label
            className={cls(
              'flex-1 flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer text-sm',
              basicInfo.noSignificantStenosis
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-white border-gray-300 text-gray-600'
            )}
          >
            <input
              type="checkbox"
              checked={basicInfo.noSignificantStenosis}
              onChange={(e) => setBasicInfo({ noSignificantStenosis: e.target.checked })}
              className="w-4 h-4 flex-shrink-0"
            />
            3枝NP
          </label>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('解析者以外の入力をすべてクリアしますか？')) {
                clearAllExceptAnalyst();
              }
            }}
            className="px-3 py-2 text-xs bg-yellow-50 border border-yellow-400 text-yellow-700 rounded-lg"
          >
            全クリア
          </button>
        </div>
      </div>

      {/* ── 血管所見入力 ── */}
      <div className="bg-white px-4 pt-2 pb-4 mt-2 border-y border-gray-100">

        {/* 血管 */}
        <SectionLabel>血管</SectionLabel>
        <SingleSelect
          options={toOpts(vesselOptions)}
          value={currentFinding.vessel}
          onChange={(v) => setCurrentFinding({ vessel: v })}
        />

        {/* No. */}
        <SectionLabel>No.</SectionLabel>
        <SingleSelect
          options={toOpts(segmentNoOptions)}
          value={currentFinding.segmentNo}
          onChange={(v) => setCurrentFinding({ segmentNo: v })}
          cols={5}
        />

        {/* Stent */}
        <div className="mt-4">
          <label
            className={cls(
              'inline-flex items-center gap-2 py-2 px-4 rounded-lg border cursor-pointer text-sm font-medium',
              currentFinding.isStent
                ? 'bg-purple-100 border-purple-500 text-purple-800'
                : 'bg-white border-gray-300 text-gray-700'
            )}
          >
            <input
              type="checkbox"
              checked={currentFinding.isStent}
              onChange={(e) =>
                setCurrentFinding({ isStent: e.target.checked, stenosis: '', plaque: '' })
              }
              className="w-4 h-4 text-purple-500"
            />
            Stent
          </label>
        </div>

        {/* location（Stent時は非表示） */}
        {!currentFinding.isStent && (
          <>
            <SectionLabel>location</SectionLabel>
            <SingleSelect
              options={toOpts(locationOptions)}
              value={currentFinding.location}
              onChange={(v) => setCurrentFinding({ location: v })}
            />
          </>
        )}

        {/* 狭窄率 / Stent所見 */}
        <SectionLabel>{currentFinding.isStent ? 'Stent所見' : '狭窄率'}</SectionLabel>
        {currentFinding.isStent ? (
          <SingleSelect
            options={stentFindingOptions}
            value={currentFinding.stenosis}
            onChange={(v) => setCurrentFinding({ stenosis: v })}
          />
        ) : (
          <SingleSelect
            options={toOpts(stenosisOptions)}
            value={currentFinding.stenosis}
            onChange={(v) => setCurrentFinding({ stenosis: v })}
          />
        )}

        {/* 性状（Stent時は非表示） */}
        {!currentFinding.isStent && (
          <>
            <SectionLabel>性状</SectionLabel>
            <SingleSelect
              options={plaqueOptions}
              value={currentFinding.plaque}
              onChange={(v) => setCurrentFinding({ plaque: v })}
            />
          </>
        )}

        {/* 特殊所見 */}
        <SectionLabel>特殊所見（複数可）</SectionLabel>
        <MultiSelect
          options={specialOptions}
          values={currentFinding.special}
          onChange={(keys) => setCurrentFinding({ special: keys })}
        />

        {/* フリー入力 */}
        <div className="mt-4">
          <label
            className={cls(
              'inline-flex items-center gap-2 py-2 px-4 rounded-lg border cursor-pointer text-sm',
              currentFinding.hasFreeText
                ? 'bg-gray-100 border-gray-400 text-gray-800'
                : 'bg-white border-gray-300 text-gray-600'
            )}
          >
            <input
              type="checkbox"
              checked={currentFinding.hasFreeText}
              onChange={(e) => setCurrentFinding({ hasFreeText: e.target.checked })}
              className="w-4 h-4"
            />
            フリー入力
          </label>
          {currentFinding.hasFreeText && (
            <div className="mt-2 flex gap-2">
              <textarea
                value={currentFinding.freeText}
                onChange={(e) => setCurrentFinding({ freeText: e.target.value })}
                placeholder="コメントを入力..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={cls(
                    'px-3 rounded-lg text-sm font-medium',
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-teal-500 text-white active:bg-teal-600'
                  )}
                >
                  🎤
                </button>
              )}
            </div>
          )}
        </div>

        {/* 入力中プレビュー */}
        {previewLine && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
            {previewLine}
          </div>
        )}

        {/* 1行追加 / 選択クリア */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAddFinding}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm active:bg-blue-700"
          >
            1行追加
          </button>
          <button
            type="button"
            onClick={resetCurrentFinding}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm active:bg-gray-300"
          >
            選択クリア
          </button>
        </div>
      </div>

      {/* ── 追加済み所見 ── */}
      {findings.length > 0 && (
        <div className="bg-white px-4 py-3 mt-2 border-y border-gray-100">
          <p className="text-xs text-gray-400 mb-2">追加済み（タップで削除）</p>
          <div className="space-y-1">
            {findings.map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  if (window.confirm('この所見を削除しますか？')) removeFinding(f.id);
                }}
                className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm cursor-pointer active:bg-red-50 active:border-red-200"
              >
                {formatFindingRow(f)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── その他 ── */}
      <div className="bg-white px-4 py-3 mt-2 border-y border-gray-100">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={otherSection.enabled}
            onChange={(e) => setOtherSection({ enabled: e.target.checked })}
            className="w-4 h-4 text-purple-500"
          />
          <span className={cls('font-semibold text-sm', otherSection.enabled ? 'text-purple-700' : 'text-gray-700')}>
            ＜その他＞
          </span>
        </label>

        {otherSection.enabled && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-1">
              {otherPresetOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    setOtherSection({
                      presetText: otherSection.presetText === opt.fullText ? '' : opt.fullText,
                    })
                  }
                  className={cls(
                    'py-2 px-3 text-sm rounded-lg border min-h-[44px] transition-colors',
                    otherSection.presetText === opt.fullText
                      ? 'bg-purple-600 text-white border-purple-600 font-medium'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-100'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {otherSection.presetText && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="flex-1 text-sm text-purple-800">{otherSection.presetText}</span>
                <button
                  type="button"
                  onClick={() => setOtherSection({ presetText: '' })}
                  className="text-purple-400 hover:text-purple-700 text-lg leading-none flex-shrink-0"
                  aria-label="定型文をクリア"
                >
                  ✕
                </button>
              </div>
            )}

            <textarea
              value={otherSection.freeText}
              onChange={(e) => setOtherSection({ freeText: e.target.value })}
              placeholder="その他の所見を入力..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm min-h-[70px]"
            />
          </div>
        )}
      </div>

      {/* ── プレビュー ── */}
      <div className="bg-white px-4 py-3 mt-2 border-y border-gray-100">
        <p className="text-xs text-gray-400 mb-2">プレビュー</p>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm whitespace-pre-line min-h-[80px] text-gray-800">
          {fullPreview || <span className="text-gray-400">入力内容がここに表示されます</span>}
        </div>
      </div>

      {/* ── QRコード生成 ── */}
      <div className="px-4 mt-4">
        <button
          type="button"
          onClick={() => {
            setQrData(buildQrData(basicInfo, findings, otherSection));
            setShowQrCode(true);
          }}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-md active:bg-blue-700"
        >
          QRコード生成
        </button>
      </div>

      {showQrCode && <QrCodeDisplay data={qrData} onClose={() => setShowQrCode(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
