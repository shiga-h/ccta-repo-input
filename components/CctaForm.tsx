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

  // QRコード表示の状態
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrData, setQrData] = useState('');

  // 音声認識の状態
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 音声認識のサポートチェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // 音声入力の開始/停止
  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert('お使いのブラウザは音声入力に対応していません。');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentFinding({ 
        freeText: currentFinding.freeText + transcript 
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
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

  // 特殊所見のチェックボックス変更
  const handleSpecialChange = (key: string, checked: boolean) => {
    if (checked) {
      setCurrentFinding({ special: [...currentFinding.special, key] });
    } else {
      setCurrentFinding({ special: currentFinding.special.filter(s => s !== key) });
    }
  };

  // 選択クリア
  const handleClearSelection = () => {
    resetCurrentFinding();
  };

  // 全てクリア
  const handleClearAll = () => {
    if (window.confirm('解析者以外の入力を全てクリアしますか？')) {
      clearAllExceptAnalyst();
    }
  };

  // QRコード生成
  const handleGenerateQrCode = () => {
    const data = buildQrData(basicInfo, findings, otherSection);
    setQrData(data);
    setShowQrCode(true);
  };

  // プレビューテキストを生成
  const previewText = buildQrData(basicInfo, findings, otherSection);

  // その他セクションのプルダウン変更時
  const handleOtherPresetChange = (key: string) => {
    const option = otherPresetOptions.find(opt => opt.key === key);
    setOtherSection({ presetText: option?.fullText || '' });
  };

  return (
    <div className="space-y-4">
      {/* 基本情報セクション */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">基本情報</h2>
        <div className="space-y-3">
          {/* 解析者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              解析者
            </label>
            <input
              type="text"
              value={basicInfo.analyst}
              onChange={(e) => setBasicInfo({ analyst: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：志賀"
            />
          </div>

          {/* 石灰化スコア */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              石灰化スコア
            </label>
            <input
              type="number"
              step="0.1"
              value={basicInfo.calciumScore}
              onChange={(e) => setBasicInfo({ calciumScore: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：239.9"
            />
          </div>
        </div>

        {/* 定型文挿入ボタン */}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            定型文挿入
          </label>
          <div className="flex flex-col gap-2">
            <label
              className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                basicInfo.motionArtifact
                  ? 'bg-orange-100 border-orange-400 text-orange-800'
                  : 'bg-white border-gray-300 hover:border-orange-400'
              }`}
            >
              <input
                type="checkbox"
                checked={basicInfo.motionArtifact}
                onChange={(e) => setBasicInfo({ motionArtifact: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded"
              />
              <span className="text-sm">高心拍によるモーションアーチファクトで画質poorです。</span>
            </label>
            <label
              className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                basicInfo.noSignificantStenosis
                  ? 'bg-green-100 border-green-400 text-green-800'
                  : 'bg-white border-gray-300 hover:border-green-400'
              }`}
            >
              <input
                type="checkbox"
                checked={basicInfo.noSignificantStenosis}
                onChange={(e) => setBasicInfo({ noSignificantStenosis: e.target.checked })}
                className="w-4 h-4 text-green-500 rounded"
              />
              <span className="text-sm">3枝ともに明らかな有意狭窄所見を認めません。</span>
            </label>
          </div>
        </div>

        {/* 全てクリアボタン */}
        <button
          type="button"
          onClick={handleClearAll}
          className="mt-4 w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
        >
          全てクリア
        </button>
      </div>

      {/* 血管所見入力セクション */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">血管所見入力</h2>
        
        {/* 血管とNo. */}
        <div className="grid grid-cols-2 gap-3">
          {/* 血管 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              血管
            </label>
            <select
              value={currentFinding.vessel}
              onChange={(e) => setCurrentFinding({ vessel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {vesselOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '選択'}
                </option>
              ))}
            </select>
          </div>

          {/* No. */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No.
            </label>
            <select
              value={currentFinding.segmentNo}
              onChange={(e) => setCurrentFinding({ segmentNo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {segmentNoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '選択'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stentチェック */}
        <div className="mt-3">
          <label
            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
              currentFinding.isStent
                ? 'bg-purple-100 border-purple-400 text-purple-800'
                : 'bg-white border-gray-300 hover:border-purple-400'
            }`}
          >
            <input
              type="checkbox"
              checked={currentFinding.isStent}
              onChange={(e) => setCurrentFinding({ isStent: e.target.checked, stenosis: '' })}
              className="w-4 h-4 text-purple-500 rounded"
            />
            <span className="text-sm font-medium">Stent</span>
          </label>
        </div>

        {/* location と 狭窄率 */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* location（Stentでない場合のみ表示） */}
          {!currentFinding.isStent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                location
              </label>
              <select
                value={currentFinding.location}
                onChange={(e) => setCurrentFinding({ location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {locationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || '選択'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 狭窄率 / Stent所見 */}
          <div className={currentFinding.isStent ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {currentFinding.isStent ? 'Stent所見' : '狭窄率'}
            </label>
            <select
              value={currentFinding.stenosis}
              onChange={(e) => setCurrentFinding({ stenosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {(currentFinding.isStent ? stentFindingOptions : stenosisOptions).map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '選択'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 性状（Stentでない場合のみ表示） */}
        {!currentFinding.isStent && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性状
            </label>
            <select
              value={currentFinding.plaque}
              onChange={(e) => setCurrentFinding({ plaque: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {plaqueOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '選択'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 特殊所見（複数選択）- Stentでない場合のみ表示 */}
        {!currentFinding.isStent && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              特殊所見（複数選択可）
            </label>
            <div className="flex flex-wrap gap-2">
              {specialOptions.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                    currentFinding.special.includes(opt.key)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={currentFinding.special.includes(opt.key)}
                    onChange={(e) => handleSpecialChange(opt.key, e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* フリー入力 */}
        <div className="mt-3">
          <label
            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
              currentFinding.hasFreeText
                ? 'bg-teal-100 border-teal-400 text-teal-800'
                : 'bg-white border-gray-300 hover:border-teal-400'
            }`}
          >
            <input
              type="checkbox"
              checked={currentFinding.hasFreeText}
              onChange={(e) => setCurrentFinding({ hasFreeText: e.target.checked })}
              className="w-4 h-4 text-teal-500 rounded"
            />
            <span className="text-sm font-medium">フリー入力を追加</span>
          </label>

          {currentFinding.hasFreeText && (
            <div className="mt-2">
              <div className="flex gap-2">
                <textarea
                  value={currentFinding.freeText}
                  onChange={(e) => setCurrentFinding({ freeText: e.target.value })}
                  placeholder="フリーコメントを入力..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[60px]"
                />
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`px-3 py-2 rounded-md font-medium transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                  >
                    🎤
                  </button>
                )}
              </div>
              {isListening && (
                <p className="text-sm text-red-500 mt-1">🔴 音声入力中...</p>
              )}
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleAddFinding}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            1行追加
          </button>
          <button
            type="button"
            onClick={handleClearSelection}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium"
          >
            選択クリア
          </button>
        </div>

        {/* 入力中プレビュー */}
        {(currentFinding.vessel ||
          currentFinding.segmentNo ||
          currentFinding.location ||
          currentFinding.stenosis ||
          currentFinding.plaque ||
          currentFinding.special.length > 0 ||
          (currentFinding.hasFreeText && currentFinding.freeText)) && (
          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
            <span className="text-sm text-blue-700">
              入力中: {formatFindingRow({ id: '', ...currentFinding })}
            </span>
          </div>
        )}
      </div>

      {/* その他セクション */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label
          className={`flex items-center gap-2 cursor-pointer ${
            otherSection.enabled ? 'text-purple-700' : 'text-gray-700'
          }`}
        >
          <input
            type="checkbox"
            checked={otherSection.enabled}
            onChange={(e) => setOtherSection({ enabled: e.target.checked })}
            className="w-4 h-4 text-purple-500 rounded"
          />
          <span className="text-lg font-semibold">＜その他＞を追加</span>
        </label>

        {otherSection.enabled && (
          <div className="mt-3 space-y-3">
            {/* プルダウンから定型文選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                定型文から選択
              </label>
              <select
                onChange={(e) => handleOtherPresetChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {otherPresetOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 選択された定型文の表示 */}
            {otherSection.presetText && (
              <div className="flex items-start gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                <span className="flex-1 text-sm text-purple-700">{otherSection.presetText}</span>
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

            {/* 手入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手入力
              </label>
              <textarea
                value={otherSection.freeText}
                onChange={(e) => setOtherSection({ freeText: e.target.value })}
                placeholder="その他の所見を入力..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* プレビューセクション */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">プレビュー</h2>
        <div className="preview-area bg-gray-50 p-3 rounded border border-gray-200 min-h-[150px] text-sm">
          {previewText || <span className="text-gray-400">入力内容がここに表示されます</span>}
        </div>

        {/* 追加済みの所見（削除可能） */}
        {findings.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-medium text-gray-600 mb-2">追加済み所見（タップで削除）</h3>
            <div className="space-y-1">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  onClick={() => {
                    if (window.confirm('この所見を削除しますか？')) {
                      removeFinding(finding.id);
                    }
                  }}
                  className="p-2 bg-gray-100 rounded text-sm cursor-pointer hover:bg-red-100 transition-colors"
                >
                  {formatFindingRow(finding)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QRコード生成ボタン */}
      <div className="bg-white p-4 rounded-lg shadow">
        <button
          type="button"
          onClick={handleGenerateQrCode}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xl"
        >
          QRコード生成
        </button>
      </div>

      {/* QRコード表示モーダル */}
      {showQrCode && (
        <QrCodeDisplay
          data={qrData}
          onClose={() => setShowQrCode(false)}
        />
      )}
    </div>
  );
}
