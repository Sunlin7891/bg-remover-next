'use client';

import { useState, useCallback } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setError(null);
      setResultUrl(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleProcess = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // 替换成你的 API 地址
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || '处理失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🎨 一键抠图
        </h1>
        <p className="text-center text-gray-600 text-sm mb-8">
          上传图片，自动移除背景，支持 PNG 透明输出
        </p>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
          className="border-2 border-dashed border-primary-500 rounded-xl p-8 text-center cursor-pointer hover:border-primary-600 hover:bg-primary-50 transition-all"
        >
          <div className="text-5xl mb-4">📷</div>
          <div className="text-primary-500 font-medium">点击或拖拽上传图片</div>
          <div className="text-gray-400 text-sm mt-2">支持 JPG、PNG 格式，最大 5MB</div>
        </div>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        {/* Preview */}
        {previewUrl && (
          <div className="mt-6">
            <img src={previewUrl} alt="预览" className="w-full rounded-lg shadow-md" />
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={!selectedFile || loading}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '处理中...' : '开始抠图'}
        </button>

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-gray-600">正在处理中...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="mt-6 text-center">
            <img
              src={resultUrl}
              alt="结果"
              className="w-full rounded-lg shadow-md"
              style={{
                background: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACB0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAABNSURBVDjLY2AYBaNgKLgJQ0xM7H8gH8gwNjZ+DaQtLS0/MDIy/gHi/0D8F8SYO3fuP1D9SwiDkZGR4T8Q/wfi/0D8H8j4D2b8B7N+gBj/waz/YMb/GIwCAAw5E/WK936uAAAAAElFTkSuQmCC') repeat`
              }}
            />
            <a
              href={resultUrl}
              download="no-bg.png"
              className="inline-block mt-4 py-2 px-6 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
            >
              ⬇️ 下载图片
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
