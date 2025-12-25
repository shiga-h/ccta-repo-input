'use client';

import { useState } from 'react';
import { useFormStore } from '@/store/formStore';

export default function Settings() {
  const { settings, setSettings, autoSave, setAutoSave } = useFormStore();
  const [recipientInput, setRecipientInput] = useState(
    settings.recipients.join(', ')
  );

  const handleSaveRecipients = () => {
    const recipients = recipientInput
      .split(/[,、\s]+/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
    setSettings({ recipients });
    alert('宛先を保存しました');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">メール設定</h2>
        
        {/* 宛先設定 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メール宛先
          </label>
          <textarea
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            placeholder="example@gmail.com, another@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            複数の宛先はカンマで区切ってください
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleSaveRecipients}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          宛先を保存
        </button>
      </div>

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
            <strong>宛先:</strong>{' '}
            {settings.recipients.length > 0
              ? settings.recipients.join(', ')
              : '未設定'}
          </p>
          <p>
            <strong>自動保存:</strong> {autoSave ? 'ON' : 'OFF'}
          </p>
        </div>
      </div>
    </div>
  );
}








