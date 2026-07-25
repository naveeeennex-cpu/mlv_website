import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import DiscountSettings from './DiscountSettings';

const DEFAULT_PROMPT = `You are an AI assistant for MLV Enterprises, an authorized Yale smart lock dealer in Chennai, India.
Your job is to help customers discover the right Yale smart lock or security product for their needs.
- Be friendly, concise, and helpful in Tamil-English (Tanglish) or English based on customer preference.
- Recommend products based on budget, door type, and security needs.
- Guide customers through booking a demo or service appointment.
- Always mention warranty, installation support, and after-sales service as MLV strengths.
- When asked about price, give the MRP and mention that special offers may apply.`;

export default function AdminPrompt() {
  const [prompt, setPrompt] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/api/admin/config?key=ai_prompt')
      .then(r => r.json())
      .then(d => { setPrompt(d.value || DEFAULT_PROMPT); setSaved(d.value || DEFAULT_PROMPT); })
      .catch(() => { setPrompt(DEFAULT_PROMPT); setSaved(DEFAULT_PROMPT); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await apiFetch('/api/admin/config', {
      method: 'PUT',
      body: { key: 'ai_prompt', value: prompt },
    });
    if (res.ok) {
      setSaved(prompt);
      toast.success('AI prompt saved — takes effect on next WhatsApp conversation');
    } else {
      toast.error('Failed to save prompt');
    }
    setSaving(false);
  };

  const isDirty = prompt !== saved;

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">AI Prompt</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controls how the WhatsApp AI assistant responds to customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrompt(DEFAULT_PROMPT)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition hover:bg-gray-50"
          >
            <FiRefreshCw size={13} /> Reset default
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            <FiSave size={14} /> {saving ? 'Saving…' : 'Save Prompt'}
          </button>
        </div>
      </div>

      {/* Two-column layout: prompt on left, discount card on right */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left — prompt editor */}
        <div className="flex-1 min-w-0">
          {isDirty && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
              Unsaved changes
            </div>
          )}

          {loading ? (
            <div className="text-gray-400 text-sm">Loading…</div>
          ) : (
            <>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={18}
                className="w-full bg-white border border-gray-200 focus:border-[#1a5c2a] rounded-xl px-5 py-4 text-gray-900 text-sm font-mono resize-none focus:outline-none leading-relaxed shadow-sm"
                placeholder="Enter the AI system prompt…"
              />
              <p className="text-xs text-gray-400 mt-2">{prompt.length} characters</p>
            </>
          )}

          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Tips for writing a good prompt</h3>
            <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
              <li>Mention the business name and what it sells in the first line</li>
              <li>Specify the language preference (English, Tamil, Tanglish)</li>
              <li>List the types of questions the bot should handle</li>
              <li>Mention what to do when a customer asks for price or booking</li>
              <li>Keep it under 500 words for best AI performance</li>
            </ul>
          </div>
        </div>

        {/* Right — discount stages */}
        <div className="w-full xl:w-80 flex-shrink-0">
          <DiscountSettings />
        </div>

      </div>
    </div>
  );
}
