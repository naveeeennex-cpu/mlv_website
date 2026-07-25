import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiSave, FiPercent, FiArrowRight } from 'react-icons/fi';

export default function DiscountSettings() {
  const [stages, setStages] = useState({ discount_pct_1: '5', discount_pct_2: '8', discount_pct_3: '10' });
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/admin/config?key=discount_pct_1').then(r => r.json()).catch(() => ({ value: '5' })),
      apiFetch('/api/admin/config?key=discount_pct_2').then(r => r.json()).catch(() => ({ value: '8' })),
      apiFetch('/api/admin/config?key=discount_pct_3').then(r => r.json()).catch(() => ({ value: '10' })),
    ]).then(([d1, d2, d3]) => {
      const vals = {
        discount_pct_1: d1.value || '5',
        discount_pct_2: d2.value || '8',
        discount_pct_3: d3.value || '10',
      };
      setStages(vals);
      setSaved(vals);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const p1 = parseInt(stages.discount_pct_1);
    const p2 = parseInt(stages.discount_pct_2);
    const p3 = parseInt(stages.discount_pct_3);

    if (isNaN(p1) || isNaN(p2) || isNaN(p3) || p1 < 1 || p2 < 1 || p3 < 1) {
      toast.error('All discount values must be positive numbers'); return;
    }
    if (p1 >= p2 || p2 >= p3) {
      toast.error('Discounts must increase: Stage 1 < Stage 2 < Stage 3'); return;
    }
    if (p3 > 50) {
      toast.error('Max discount cannot exceed 50%'); return;
    }

    setSaving(true);
    await Promise.all([
      apiFetch('/api/admin/config', { method: 'PUT', body: { key: 'discount_pct_1', value: String(p1) } }),
      apiFetch('/api/admin/config', { method: 'PUT', body: { key: 'discount_pct_2', value: String(p2) } }),
      apiFetch('/api/admin/config', { method: 'PUT', body: { key: 'discount_pct_3', value: String(p3) } }),
    ]);
    const vals = { discount_pct_1: String(p1), discount_pct_2: String(p2), discount_pct_3: String(p3) };
    setSaved(vals);
    setStages(vals);
    toast.success('Discount stages saved — takes effect within 5 minutes');
    setSaving(false);
  };

  const isDirty = JSON.stringify(stages) !== JSON.stringify(saved);

  const stageConfig = [
    { key: 'discount_pct_1', label: 'First offer', desc: 'Offered when customer first pushes back on price' },
    { key: 'discount_pct_2', label: 'Second offer', desc: 'Offered if customer is still hesitant after first discount' },
    { key: 'discount_pct_3', label: 'Final / max offer', desc: 'Last resort — bot says this is the absolute maximum' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Discount Stages</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Priya offers discounts in 3 escalating steps when a customer hesitates on price.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Flow preview */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3 flex-wrap">
            <span className="text-gray-400">Price asked</span>
            <FiArrowRight size={11} className="text-gray-300" />
            <span className="font-semibold text-[#1a5c2a]">{stages.discount_pct_1}% off</span>
            <FiArrowRight size={11} className="text-gray-300" />
            <span className="font-semibold text-[#1a5c2a]">{stages.discount_pct_2}% off</span>
            <FiArrowRight size={11} className="text-gray-300" />
            <span className="font-semibold text-[#1a5c2a]">{stages.discount_pct_3}% off</span>
            <FiArrowRight size={11} className="text-gray-300" />
            <span className="text-gray-400">No more</span>
          </div>

          {/* Stage inputs */}
          <div className="space-y-3">
            {stageConfig.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-[#1a5c2a] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{s.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{s.desc}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={stages[s.key]}
                    onChange={e => setStages(prev => ({ ...prev, [s.key]: e.target.value }))}
                    className="w-14 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 text-sm font-semibold text-center focus:outline-none focus:border-[#1a5c2a]"
                  />
                  <FiPercent size={13} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {isDirty && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Unsaved changes
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            <FiSave size={14} /> {saving ? 'Saving…' : 'Save Stages'}
          </button>
        </>
      )}
    </div>
  );
}
