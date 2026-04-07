'use client';

import { useState, useCallback, useRef } from 'react';
import LoginButton from '@/components/LoginButton';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Remove Background
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            100% Automatically and Free
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Upload Area */}
          {!previewUrl && !resultUrl && (
            <div className="p-16">
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDragLeave={(e) => { e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); handleDrop(e); }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-20 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-2xl font-semibold text-gray-700 mb-2">
                  Upload Image
                </p>
                <p className="text-gray-500">
                  or drop file here
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  Supports: JPG, PNG • Max 5MB
                </p>
              </div>
            </div>
          )}

          {/* Preview & Process */}
          {previewUrl && !resultUrl && (
            <div className="p-12">
              <div className="mb-8">
                <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-contain rounded-xl" />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Processing...' : 'Remove Background'}
                </button>
              </div>
              {error && (
                <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-center">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {resultUrl && (
            <div className="p-12">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-center font-medium text-gray-600 mb-3">Original</p>
                  {previewUrl && <img src={previewUrl} alt="Original" className="w-full rounded-xl border" />}
                </div>
                <div>
                  <p className="text-center font-medium text-gray-600 mb-3">Removed</p>
                  <img
                    src={resultUrl}
                    alt="Result"
                    className="w-full rounded-xl border"
                    style={{
                      background: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACB0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAABNSURBVDjLY2AYBaNgKLgJQ0xM7H8gH8gwNjZ+DaQtLS0/MDIy/gHi/0D8F8SYO3fuP1D9SwiDkZGR4T8Q/wfi/0D8H8j4D2b8B7N+gBj/waz/YMb/GIwCAAw5E/WK936uAAAAAElFTkSuQmCC') repeat`
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Start Over
                </button>
                <a
                  href={resultUrl}
                  download="no-bg.png"
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Download HD
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-3">⚡</div>
            <div className="font-semibold text-gray-800">Fast</div>
            <div className="text-gray-500 text-sm mt-1">Process in seconds</div>
          </div>
          <div>
            <div className="text-4xl mb-3">🔒</div>
            <div className="font-semibold text-gray-800">Secure</div>
            <div className="text-gray-500 text-sm mt-1">Files are deleted</div>
          </div>
          <div>
            <div className="text-4xl mb-3">💎</div>
            <div className="font-semibold text-gray-800">High Quality</div>
            <div className="text-gray-500 text-sm mt-1">AI-powered removal</div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-10 text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="text-2xl font-semibold text-gray-800 mb-2">Removing Background...</div>
            <div className="text-gray-500">This won&apos;t take long</div>
          </div>
        </div>
      )}
    </main>
  );
}
