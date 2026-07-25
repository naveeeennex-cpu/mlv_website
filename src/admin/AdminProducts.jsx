import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from './useAdmin';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiCheck, FiPackage } from 'react-icons/fi';
import ImageUpload from './ImageUpload';
import { getPricing } from '../data/products';

// Allowed door-compatibility values (must match the catalogue-defined set).
const DOOR_MATERIALS = ['Wooden Door', 'Metal Door', 'Glass Door', 'uPVC Door'];
const DOOR_CONFIGS = ['Single Door', 'Double Door', 'Sliding Door'];

function PriceCell({ product, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(product.price);

  const save = async () => {
    if (val === product.price) { setEditing(false); return; }
    const res = await apiFetch('/api/admin/products', {
      method: 'PUT',
      body: { id: product.id, price: Number(val) },
    });
    if (res.ok) { toast.success('Price updated'); onSave(product.id, Number(val)); }
    else toast.error('Failed to update price');
    setEditing(false);
  };

  if (editing) return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400 text-xs">₹</span>
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-24 bg-white border border-[#1a5c2a] rounded px-2 py-1 text-gray-900 text-sm focus:outline-none"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
      />
      <button onClick={save} className="text-[#1a5c2a] hover:text-[#154d23]"><FiCheck size={14} /></button>
      <button onClick={() => { setVal(product.price); setEditing(false); }} className="text-gray-400 hover:text-gray-600"><FiX size={14} /></button>
    </div>
  );

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 group">
      <span className="text-gray-900 font-medium">₹{Number(product.price).toLocaleString('en-IN')}</span>
      <FiEdit2 size={12} className="text-gray-300 group-hover:text-[#1a5c2a] transition" />
    </button>
  );
}

// Inline editor for the struck-through "MRP" (the higher, crossed-out price).
function MrpCell({ product, onSave }) {
  const pricing = getPricing(product);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(pricing.strike);

  const save = async () => {
    const num = Number(val);
    if (!num || num === pricing.strike) { setEditing(false); return; }
    const mrp = `₹${num.toLocaleString('en-IN')}`;
    const res = await apiFetch('/api/admin/products', {
      method: 'PUT',
      body: { id: product.id, mrp },
    });
    if (res.ok) { toast.success('MRP updated'); onSave(product.id, mrp); }
    else toast.error('Failed to update MRP');
    setEditing(false);
  };

  if (editing) return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400 text-xs">₹</span>
      <input
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-24 bg-white border border-[#1a5c2a] rounded px-2 py-1 text-gray-900 text-sm focus:outline-none"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
      />
      <button onClick={save} className="text-[#1a5c2a] hover:text-[#154d23]"><FiCheck size={14} /></button>
      <button onClick={() => { setVal(pricing.strike); setEditing(false); }} className="text-gray-400 hover:text-gray-600"><FiX size={14} /></button>
    </div>
  );

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 group">
      <span className="text-gray-400 line-through">{pricing.strikeLabel}</span>
      {pricing.off > 0 && <span className="text-[10px] text-[#1a7a32] font-semibold bg-[#e7f6ec] px-1.5 py-0.5 rounded-full">{pricing.off}% off</span>}
      <FiEdit2 size={12} className="text-gray-300 group-hover:text-[#1a5c2a] transition" />
    </button>
  );
}

// Toggle a product between In stock / Out of stock (optimistic).
function StockCell({ product, onToggle }) {
  const inStock = product.in_stock !== false;
  const toggle = async () => {
    const next = !inStock;
    onToggle(product.id, next);
    const res = await apiFetch('/api/admin/products', { method: 'PUT', body: { id: product.id, in_stock: next } });
    if (!res.ok) { toast.error('Failed to update stock'); onToggle(product.id, inStock); }
  };
  return (
    <button
      onClick={toggle}
      title="Click to toggle stock"
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
        inStock
          ? 'bg-[#e7f6ec] text-[#1a7a32] border-[#bfe3cb] hover:bg-[#d6efde]'
          : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
      }`}
    >
      {inStock ? 'In stock' : 'Out of stock'}
    </button>
  );
}

// Category <select> options grouped by parent (optgroups).
function CategoryOptions({ categories, onlyGroup }) {
  const sortCat = (a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name);
  const groups = categories.filter(c => !c.parent_id).sort(sortCat);
  const subsOf = (gid) => categories.filter(c => c.parent_id === gid).sort(sortCat);
  const orphans = categories.filter(c => c.parent_id && !categories.some(g => g.id === c.parent_id));
  const shown = onlyGroup ? groups.filter(g => g.id === onlyGroup) : groups;

  return (
    <>
      {shown.map(g => {
        const subs = subsOf(g.id);
        if (subs.length === 0) return <option key={g.id} value={g.id}>{g.name}</option>;
        return (
          <optgroup key={g.id} label={g.name}>
            {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </optgroup>
        );
      })}
      {!onlyGroup && orphans.length > 0 && (
        <optgroup label="Other">
          {orphans.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </optgroup>
      )}
    </>
  );
}

function EditModal({ product, categories, onClose, onSave, onReloadCategories }) {
  const [newCat, setNewCat] = useState(null);
  const [creatingCat, setCreatingCat] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || '',
    code: product?.code || '',
    price: product?.price || '',
    mrp: product?.id ? String(getPricing(product).strike) : '',
    description: product?.description || '',
    features: (product?.features || []).join(', '),
    image: product?.image || '',
    category_id: product?.category_id || '',
    bundle_includes: product?.bundle_includes || '',
    door_material: Array.isArray(product?.door_material) ? product.door_material : [],
    door_configuration: Array.isArray(product?.door_configuration) ? product.door_configuration : [],
  });
  const [saving, setSaving] = useState(false);

  // Toggle a value in one of the door-compatibility arrays.
  const toggleDoor = (key, value) => setForm(f => ({
    ...f,
    [key]: f[key].includes(value) ? f[key].filter(v => v !== value) : [...f[key], value],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      price: Number(form.price),
      mrp: form.mrp ? `₹${Number(form.mrp).toLocaleString('en-IN')}` : undefined,
      features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      door_material: form.door_material,
      door_configuration: form.door_configuration,
    };
    if (product?.id) body.id = product.id;

    const res = await apiFetch('/api/admin/products', {
      method: product?.id ? 'PUT' : 'POST',
      body: product?.id ? body : { ...body, id: form.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() },
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(product?.id ? 'Product updated' : 'Product created');
      onSave(data);
    } else {
      toast.error('Failed to save product');
    }
    setSaving(false);
    onClose();
  };

  const createCategory = async () => {
    if (!newCat?.name.trim()) { toast.error('Enter a category name'); return; }
    setCreatingCat(true);
    const res = await apiFetch('/api/admin/categories', {
      method: 'POST',
      body: { name: newCat.name.trim(), parent_id: newCat.parent_id || null },
    });
    if (res.ok) {
      const data = await res.json();
      toast.success('Category created');
      if (onReloadCategories) await onReloadCategories();
      setForm(f => ({ ...f, category_id: data.id }));
      setNewCat(null);
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Failed to create category');
    }
    setCreatingCat(false);
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-xs text-gray-500 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
        {...extra}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-gray-900 font-semibold">{product?.id ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-gray-500 font-medium">Category</label>
              <button
                type="button"
                onClick={() => setNewCat(newCat ? null : { name: '', parent_id: '' })}
                className="text-[11px] text-[#1a5c2a] hover:underline flex items-center gap-1"
              >
                <FiPlus size={11} /> {newCat ? 'Cancel' : 'New category'}
              </button>
            </div>
            <select
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
            >
              <option value="">Select category</option>
              <CategoryOptions categories={categories} />
            </select>

            {newCat && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                <select
                  value={newCat.parent_id}
                  onChange={e => setNewCat(n => ({ ...n, parent_id: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
                >
                  <option value="">Main category (new top-level group)</option>
                  {categories.filter(c => !c.parent_id).map(g => (
                    <option key={g.id} value={g.id}>Sub-category of: {g.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    value={newCat.name}
                    onChange={e => setNewCat(n => ({ ...n, name: e.target.value }))}
                    placeholder="New category name"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a]"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createCategory(); } }}
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    disabled={creatingCat}
                    className="bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-medium px-3 rounded-lg disabled:opacity-50"
                  >
                    {creatingCat ? '…' : 'Create'}
                  </button>
                </div>
              </div>
            )}
          </div>
          {field('Product Name', 'name', 'text', { required: true })}
          {field('Model Code', 'code')}
          {field('Price (₹)', 'price', 'number', { required: true, min: 0 })}
          {field('MRP — struck-through price (₹)', 'mrp', 'number', { min: 0 })}
          <p className="-mt-2 text-[11px] text-gray-400">Shown crossed-out above the price on the site. Leave blank to auto-show +20%.</p>
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#1a5c2a] resize-none"
            />
          </div>
          {field('Features (comma separated)', 'features')}

          {/* Door compatibility — "Suitable For" shown on the product page */}
          <div className="rounded-lg border border-gray-200 p-3 space-y-3">
            <p className="text-xs text-gray-500 font-medium">Suitable For <span className="text-gray-400 font-normal">· shown on the product page</span></p>
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">Door Material</label>
              <div className="flex flex-wrap gap-1.5">
                {DOOR_MATERIALS.map(m => {
                  const on = form.door_material.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleDoor('door_material', m)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        on ? 'bg-[#1a5c2a] border-[#1a5c2a] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1a5c2a]/40'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">Door Configuration</label>
              <div className="flex flex-wrap gap-1.5">
                {DOOR_CONFIGS.map(cfg => {
                  const on = form.door_configuration.includes(cfg);
                  return (
                    <button
                      key={cfg}
                      type="button"
                      onClick={() => toggleDoor('door_configuration', cfg)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        on ? 'bg-[#1a5c2a] border-[#1a5c2a] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-[#1a5c2a]/40'
                      }`}
                    >
                      {cfg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <ImageUpload
            value={form.image}
            onChange={url => setForm(f => ({ ...f, image: url }))}
            folder="products"
            label="Product Image"
          />
          {field('Bundle Includes', 'bundle_includes')}
          <div className="flex gap-3 pt-2">
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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Fetch everything once; filtering is instant in the browser.
  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      apiFetch('/api/admin/products'),
      apiFetch('/api/admin/categories'),
    ]);
    setProducts(await pRes.json());
    setCategories(await cRes.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handlePriceUpdate = (id, price) => setProducts(ps => ps.map(p => p.id === id ? { ...p, price } : p));
  const handleMrpUpdate = (id, mrp) => setProducts(ps => ps.map(p => p.id === id ? { ...p, mrp } : p));
  const handleStockToggle = (id, inStock) => setProducts(ps => ps.map(p => p.id === id ? { ...p, in_stock: inStock } : p));

  const reloadCategories = useCallback(async () => {
    const r = await apiFetch('/api/admin/categories');
    setCategories(await r.json());
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await apiFetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); setProducts(ps => ps.filter(p => p.id !== id)); }
    else toast.error('Failed to delete');
  };

  const handleSave = () => { setEditProduct(null); setShowNew(false); load(); };

  // ── Category helpers ──
  const sortCat = (a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name);
  const groups = useMemo(() => categories.filter(c => !c.parent_id).sort(sortCat), [categories]);
  const parentOf = useCallback((id) => categories.find(c => c.id === id)?.parent_id, [categories]);
  const knownIds = useMemo(() => new Set(categories.map(c => c.id)), [categories]);

  // ── Filtering (search + group + sub) ──
  const term = search.trim().toLowerCase();
  const filtered = useMemo(() => products.filter(p => {
    if (term && !(p.name.toLowerCase().includes(term) || (p.code || '').toLowerCase().includes(term))) return false;
    if (activeSub && p.category_id !== activeSub) return false;
    if (activeGroup && p.category_id !== activeGroup && parentOf(p.category_id) !== activeGroup) return false;
    return true;
  }), [products, term, activeSub, activeGroup, parentOf]);

  const countForGroup = useCallback((gid) =>
    products.filter(p => p.category_id === gid || parentOf(p.category_id) === gid).length,
  [products, parentOf]);

  // ── Build display buckets (group → sub) from the filtered set ──
  const productsByCat = {};
  for (const p of filtered) {
    if (!productsByCat[p.category_id]) productsByCat[p.category_id] = [];
    productsByCat[p.category_id].push(p);
  }
  const buckets = [];
  for (const g of groups) {
    const subs = categories.filter(c => c.parent_id === g.id).sort(sortCat);
    if (subs.length) subs.forEach(s => buckets.push({ group: g.name, sub: s.name, catId: s.id }));
    else buckets.push({ group: g.name, sub: null, catId: g.id });
  }
  categories.filter(c => c.parent_id && !knownIds.has(c.parent_id))
    .forEach(c => buckets.push({ group: 'Other', sub: c.name, catId: c.id }));
  const uncategorized = filtered.filter(p => !knownIds.has(p.category_id));

  const clearFilters = () => { setSearch(''); setActiveGroup(''); setActiveSub(''); };
  const hasFilters = search || activeGroup || activeSub;

  const renderRow = (p) => (
    <tr key={p.id} className="border-b border-gray-50 hover:bg-[#1a5c2a]/[0.03] transition">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          {p.image ? (
            <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100" onError={e => e.target.style.display = 'none'} />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300"><FiPackage size={16} /></div>
          )}
          <div className="min-w-0">
            <div className="text-gray-900 font-medium leading-tight">{p.name}</div>
            {p.code && p.code !== p.name && <div className="text-gray-400 font-mono text-[11px] mt-0.5">{p.code}</div>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3"><PriceCell product={p} onSave={handlePriceUpdate} /></td>
      <td className="px-5 py-3"><MrpCell product={p} onSave={handleMrpUpdate} /></td>
      <td className="px-5 py-3"><StockCell product={p} onToggle={handleStockToggle} /></td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => setEditProduct(p)} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-[#1a5c2a] hover:bg-[#1a5c2a]/10 transition"><FiEdit2 size={15} /></button>
          <button onClick={() => handleDelete(p.id, p.name)} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><FiTrash2 size={15} /></button>
        </div>
      </td>
    </tr>
  );

  const tableRows = [];
  let lastGroup = null;
  for (const b of buckets) {
    const items = productsByCat[b.catId] || [];
    if (!items.length) continue;
    if (b.group !== lastGroup) {
      tableRows.push(
        <tr key={`grp-${b.group}`} className="bg-gray-900/[0.04]">
          <td colSpan={5} className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">{b.group}</td>
        </tr>
      );
      lastGroup = b.group;
    }
    if (b.sub) {
      tableRows.push(
        <tr key={`sub-${b.catId}`} className="bg-gray-50">
          <td colSpan={5} className="px-5 py-1.5 pl-9 text-xs font-medium text-gray-500">{b.sub} <span className="text-gray-300">· {items.length}</span></td>
        </tr>
      );
    }
    items.forEach(p => tableRows.push(renderRow(p)));
  }
  if (uncategorized.length) {
    tableRows.push(
      <tr key="grp-uncat" className="bg-gray-900/[0.04]">
        <td colSpan={5} className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">Uncategorized</td>
      </tr>
    );
    uncategorized.forEach(p => tableRows.push(renderRow(p)));
  }

  const pill = (active, label, count, onClick) => (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition border ${
        active
          ? 'bg-[#1a5c2a] border-[#1a5c2a] text-white'
          : 'bg-white border-gray-200 text-gray-600 hover:border-[#1a5c2a]/40 hover:text-gray-900'
      }`}
    >
      {label}{count != null && <span className={active ? 'text-white/70 ml-1' : 'text-gray-400 ml-1'}>{count}</span>}
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} of ${products.length} ${products.length === 1 ? 'product' : 'products'}`}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-[#1a5c2a] hover:bg-[#154d23] text-white text-sm font-semibold px-4 py-2 rounded-lg transition shrink-0"
        >
          <FiPlus size={15} /> Add Product
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or model code…"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX size={14} /></button>
            )}
          </div>
          <select
            value={activeSub}
            onChange={e => setActiveSub(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#1a5c2a] lg:w-64"
          >
            <option value="">All sub-categories{activeGroup ? ' in group' : ''}</option>
            <CategoryOptions categories={categories} onlyGroup={activeGroup || undefined} />
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
              <FiX size={14} /> Clear
            </button>
          )}
        </div>

        {/* Group pills */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {pill(!activeGroup, 'All', products.length, () => { setActiveGroup(''); setActiveSub(''); })}
          {groups.map(g => pill(activeGroup === g.id, g.name, countForGroup(g.id), () => { setActiveGroup(g.id); setActiveSub(''); }))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-sm py-10 text-center">Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Price</th>
                <th className="text-left px-5 py-3 font-medium">MRP (struck)</th>
                <th className="text-left px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableRows}
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    {hasFilters ? 'No products match these filters.' : 'No products yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(editProduct || showNew) && (
        <EditModal
          product={showNew ? null : editProduct}
          categories={categories}
          onClose={() => { setEditProduct(null); setShowNew(false); }}
          onSave={handleSave}
          onReloadCategories={reloadCategories}
        />
      )}
    </div>
  );
}
