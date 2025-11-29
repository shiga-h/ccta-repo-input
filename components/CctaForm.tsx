'use client';

import { useFormStore } from '@/store/formStore';
import {
  vesselOptions,
  segmentNoOptions,
  locationOptions,
  stenosisOptions,
  plaqueOptions,
  specialOptions,
} from '@/lib/masterData';
import { formatFindingRow, buildBody, openGmailOrMailto } from '@/lib/email';

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
    settings,
    clearAllExceptAnalyst,
  } = useFormStore();

  // 1行追加
  const handleAddFinding = () => {
    // 何か入力があれば追加
    const hasInput =
      currentFinding.vessel ||
      currentFinding.segmentNo ||
      currentFinding.location ||
      currentFinding.stenosis ||
      currentFinding.plaque ||
      currentFinding.special;

    if (hasInput) {
      addFinding(currentFinding);
      resetCurrentFinding();
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

  // メール作成
  const handleCreateMail = () => {
    if (settings.recipients.length === 0) {
      alert('宛先が設定されていません。設定画面で宛先を設定してください。');
      return;
    }

    const subject = basicInfo.caseId || 'CCTA所見';
    const body = buildBody(basicInfo, findings);
    openGmailOrMailto(settings.recipients, subject, body);
  };

  // プレビューテキストを生成
  const previewText = buildBody(basicInfo, findings);

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

          {/* 症例識別コード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              症例識別コード
            </label>
            <input
              type="text"
              value={basicInfo.caseId}
              onChange={(e) => setBasicInfo({ caseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* location */}
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

          {/* 狭窄率 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              狭窄率
            </label>
            <select
              value={currentFinding.stenosis}
              onChange={(e) => setCurrentFinding({ stenosis: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {stenosisOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '選択'}
                </option>
              ))}
            </select>
          </div>

          {/* 性状 */}
          <div>
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

          {/* 特殊所見 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              特殊所見
            </label>
            <select
              value={currentFinding.special}
              onChange={(e) => setCurrentFinding({ special: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {specialOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || '選択'}
                </option>
              ))}
            </select>
          </div>
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
          currentFinding.special) && (
          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
            <span className="text-sm text-blue-700">
              入力中: {formatFindingRow({ id: '', ...currentFinding })}
            </span>
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

      {/* メール作成ボタン */}
      <div className="bg-white p-4 rounded-lg shadow">
        <button
          type="button"
          onClick={handleCreateMail}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-lg"
        >
          Gmailで作成
        </button>
      </div>
    </div>
  );
}

