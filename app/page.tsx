'use client';

import { useState } from 'react';
import CctaForm from '@/components/CctaForm';
import Settings from '@/components/Settings';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            CCTA所見入力
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {showSettings ? '戻る' : '設定'}
          </button>
        </div>

        {/* メインコンテンツ */}
        {showSettings ? <Settings /> : <CctaForm />}
      </div>
    </main>
  );
}








