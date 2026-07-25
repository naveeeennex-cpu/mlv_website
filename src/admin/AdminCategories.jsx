import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiFolder, FiChevronRight } from 'react-icons/fi';

function CatModal({ cat, groups, fixedParent, onClose, onSave }) {
  const [form, setForm] = useState({
    name: cat?.name || '',
    description: cat?.description || '',
    parent_id: cat?.parent_id ?? (fixedParent || ''),
    sort_order: cat?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const body = {
      name: form.name.trim(),
      description: form.description,
      parent_id: form.parent_id || null,
      sort_order: Number(form.sort_order) || 0,
    };
    if (cat?.id) body.id = cat.id;
    const res = await apiFetch('/api/admin/categories', {
      method: cat?.id ? 'PUT' : 'POST',
      body,
    });
    if (res.ok) {
      toast.success(cat?.id ? 'Category updated' : 'Category created');
      onSave();
      onClose();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to save');
    }
    setSaving(false);
  };

  const isNew = !cat?.id;
  const title = cat?.id ? 'Edit Category' : (form.parent_id ? 'New Sub-category' : 'New Group');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900 font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">Parent group</label>
            <select
              value={form.parent_id}
              onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
              disabled={isNew && !!fixedParent}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a] disabled:opacity-60"
            >
              <option value="">— None (top-level group)</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#1a5c2a] hover:bg-[#154d23] text-white font-semibold rounded-lg py-2 text-sm transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { cat?, fixedParent? } | null

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch('/api/admin/categories');
    setCats(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const del = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const res = await apiFetch(`/api/admin/categories?id=${encodeURIComponent(c.id)}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); load(); }
    else { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete'); }
  };

  const sortCat = (a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name);
  const groups = cats.filter(c => !c.parent_id).sort(sortCat);
  const subsOf = (gid) => cats.filter(c => c.parent_id === gid).sort(sortCat);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Groups and sub-categories — these drive the website catalog and the product form</p>
        </div>
        <button onClick={() => setModal({})} className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          <FiPlus size={15} /> Add Group
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="space-y-4">
          {groups.map(g => (
            <div key={g.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FiFolder className="text-[#1a5c2a]" size={16} />
                  <span className="font-semibold text-gray-900">{g.name}</span>
                  <span className="text-xs text-gray-400">({subsOf(g.id).length})</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setModal({ fixedParent: g.id })} className="text-xs text-[#1a5c2a] hover:underline flex items-center gap-1"><FiPlus size={12} /> Sub-category</button>
                  <button onClick={() => setModal({ cat: g })} className="text-gray-400 hover:text-[#1a5c2a]"><FiEdit2 size={14} /></button>
                  <button onClick={() => del(g)} className="text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {subsOf(g.id).map(s => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-2.5 pl-10">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <FiChevronRight size={12} className="text-gray-300" />
                      {s.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModal({ cat: s })} className="text-gray-400 hover:text-[#1a5c2a]"><FiEdit2 size={14} /></button>
                      <button onClick={() => del(s)} className="text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {subsOf(g.id).length === 0 && (
                  <div className="px-5 py-3 pl-10 text-xs text-gray-400">No sub-categories yet.</div>
                )}
              </div>
            </div>
          ))}
          {groups.length === 0 && <p className="text-gray-400 text-sm">No categories yet. Add a group to start.</p>}
        </div>
      )}

      {modal && (
        <CatModal
          cat={modal.cat}
          fixedParent={modal.fixedParent}
          groups={groups}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
