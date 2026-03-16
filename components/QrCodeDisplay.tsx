'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { encodeToBase64, getQrDataSize } from '@/lib/qrcode';

interface QrCodeDisplayProps {
  data: string;
  onClose: () => void;
}

export default function QrCodeDisplay({ data, onClose }: QrCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showData, setShowData] = useState(false);

  // Base64エンコード済み文字列をQRコードに埋め込む
  // ASCII文字のみになるためバーコードリーダーで確実に入力可能
  const qrValue = encodeToBase64(data);
  const dataSize = getQrDataSize(data);
  const maxSize = 2953; // QRコード Version 40, エラー訂正レベルL の最大バイト数

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = data;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 my-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">QRコード</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <QRCodeSVG
              value={qrValue}
              size={256}
              level="L"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mb-2">
          <p>① バーコードリーダーでスキャン</p>
          <p>② decoder.html でデコード → コピー</p>
          <p>③ 電子カルテに貼り付け</p>
        </div>

        <div className="text-center text-xs text-gray-400 mb-4">
          データサイズ: {dataSize} bytes / {maxSize} bytes
        </div>

        {dataSize > maxSize && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm mb-4">
            警告: データサイズがQRコードの上限を超えています。所見を減らしてください。
          </div>
        )}

        {/* テキストコピーボタン（テスト用） */}
        <button
          onClick={handleCopy}
          className={`w-full py-4 px-6 rounded-md font-medium text-lg mb-2 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {copied ? 'コピーしました！' : 'テキストをコピー（テスト用）'}
        </button>

        {/* データ表示トグル */}
        <button
          onClick={() => setShowData(!showData)}
          className="w-full py-2 px-6 rounded-md font-medium mb-2 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          {showData ? 'データを隠す' : 'データを表示（確認用）'}
        </button>

        {showData && (
          <div className="bg-gray-100 p-3 rounded-md mb-4 max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all">
              {data}
            </pre>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-gray-600 text-white py-4 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-lg"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
