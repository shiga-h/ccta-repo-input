'use client';

import { useFormStore } from '@/store/formStore';

export default function Settings() {
  const { autoSave, setAutoSave } = useFormStore();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">保存設定</h2>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">自動保存を有効にする</span>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          有効にすると、入力内容がブラウザに自動保存されます
        </p>
      </div>

      {/* 現在の設定表示 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-600 mb-2">現在の設定</h3>
        <div className="text-sm text-gray-700">
          <p>
            <strong>自動保存:</strong> {autoSave ? 'ON' : 'OFF'}
          </p>
        </div>
      </div>

      {/* 使い方 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">使い方</h3>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>入力画面で解析結果を入力</li>
          <li>「QRコード生成」ボタンをタップ</li>
          <li>電子カルテ端末でバーコードリーダーを使用</li>
          <li>Excelテンプレートにデータが自動入力</li>
        </ol>
      </div>
    </div>
  );
}
