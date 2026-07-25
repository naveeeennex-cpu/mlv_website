import { useRef, useState } from 'react';
import { apiFetch } from './useAdmin';
import { FiUpload, FiX, FiImage, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MAX_MB = 4;

export default function ImageUpload({ value, onChange, folder = 'general', label = 'Image' }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`Image must be under ${MAX_MB}MB`); return; }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        body: { base64, filename: file.name, folder },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files) => {
    if (files?.[0]) uploadFile(files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const applyUrl = () => {
    if (urlInput.trim()) { onChange(urlInput.trim()); setUrlInput(''); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-gray-500 font-medium">{label}</label>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition ${mode === 'upload' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiUpload size={11} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition ${mode === 'url' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiLink size={11} /> URL
          </button>
        </div>
      </div>

      {/* Current image preview */}
      {value && (
        <div className="relative mb-2 inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-28 rounded-xl border border-gray-200 object-contain bg-gray-50"
            onError={e => e.target.style.opacity = '0.3'}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
          >
            <FiX size={10} />
          </button>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            dragOver ? 'border-[#1a5c2a] bg-green-50' : 'border-gray-200 hover:border-[#1a5c2a] hover:bg-gray-50'
          } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#1a5c2a] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FiImage size={22} className="text-gray-300" />
              <span className="text-xs text-gray-500">
                Drop image here or <span className="text-[#1a5c2a] font-medium">browse</span>
              </span>
              <span className="text-[10px] text-gray-400">PNG, JPG, WEBP · max {MAX_MB}MB</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyUrl())}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="px-3 py-2 bg-[#1a5c2a] text-white text-sm rounded-lg hover:bg-[#154d23] transition"
          >
            Use
          </button>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
