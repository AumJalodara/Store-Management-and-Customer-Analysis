import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Pencil, Trash2, Package, X, AlertTriangle } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import SectionCard from '../components/SectionCard';
import { TableSkeleton } from '../components/Skeleton';
import { ToastContainer } from '../components/Toast';
import { fmtRupee } from '../utils/format';

const EMPTY_FORM = {
  name: '', category_id: '', brand: '', price: '',
  discounted_price: '', seasonal_flag: false, reorder_level: 10, unit: '',
};

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ mode, product, onClose, onSaved, toast }) {
  const [form, setForm]     = useState(product
    ? { ...product, seasonal_flag: !!product.seasonal_flag }
    : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name  = 'Product name is required';
    if (!form.price || form.price <= 0) e.price = 'Valid price is required';
    if (form.brand && !/^[a-zA-Z]+$/.test(form.brand)) e.brand = 'Brand must contain only letters';
    return e;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'brand') {
      finalValue = finalValue.replace(/[^a-zA-Z]/g, '');
    }
    setForm(f => ({ ...f, [name]: finalValue }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (mode === 'add') {
        await api.addProduct(form);
        toast.success(`"${form.name}" added successfully!`);
      } else {
        await api.updateProduct(product.id, form);
        toast.success(`"${form.name}" updated successfully!`);
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.details || err.message;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50 transition-all
    ${errors[field] ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package size={16} className="text-orange-500" />
            </div>
            <h2 className="font-display font-bold text-gray-900">
              {mode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Samsung Galaxy S24" className={inputCls('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Brand + Category in row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                placeholder="e.g. Samsung" className={inputCls('brand')} />
              {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category ID</label>
              <input name="category_id" type="number" value={form.category_id} onChange={handleChange}
                placeholder="e.g. 1" className={inputCls('category_id')} />
            </div>
          </div>

          {/* Price + Discounted Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Price (₹) <span className="text-red-400">*</span>
              </label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange}
                placeholder="e.g. 999.00" className={inputCls('price')} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Discounted Price (₹)</label>
              <input name="discounted_price" type="number" step="0.01" min="0" value={form.discounted_price} onChange={handleChange}
                placeholder="e.g. 849.00" className={inputCls('discounted_price')} />
            </div>
          </div>

          {/* Reorder level + Seasonal */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reorder Level</label>
              <input name="reorder_level" type="number" min="0" value={form.reorder_level} onChange={handleChange}
                placeholder="e.g. 10" className={inputCls('reorder_level')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">UNIT</label>
              <input name="unit" value={form.unit || ''} onChange={handleChange}
                placeholder="e.g. pcs, kg, litre" className={inputCls('unit')} />
            </div>
            <div className="pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${form.seasonal_flag ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                    ${form.seasonal_flag ? 'translate-x-5' : 'translate-x-1'}`} />
                  <input type="checkbox" name="seasonal_flag" checked={form.seasonal_flag}
                    onChange={handleChange} className="sr-only" />
                </div>
                <span className="text-sm font-medium text-gray-700">Seasonal</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} type="button"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center gap-2 transition-all disabled:opacity-60">
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : mode === 'add' ? 'Add Product' : 'Save Changes'
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
function DeleteModal({ product, onClose, onDeleted, toast }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteProduct(product.id);
      toast.success(`"${product.name}" deleted.`);
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900">Delete Product</h3>
            <p className="text-xs text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong className="text-gray-900">"{product.name}"</strong>?
          This will also remove all inventory and batch records for this product.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {deleting
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Trash2 size={14} /> Delete</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Products Page ────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { isManager, isAdmin } = useAuth();
  const { toasts, removeToast, toast } = useToast();

  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);   // null | { mode:'add'|'edit', product? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey]     = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const { data, loading } = useFetch(api.products, [refreshKey]);

  const filtered = (data || []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <AnimatePresence>
        {modal && (
          <ProductModal
            key="product-modal"
            mode={modal.mode}
            product={modal.product}
            onClose={() => setModal(null)}
            onSaved={refresh}
            toast={toast}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            key="delete-modal"
            product={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={refresh}
            toast={toast}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8 pb-10">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Products</h1>
            <p className="text-gray-500 mt-1.5 text-sm font-medium">Manage and monitor your store's inventory catalog.</p>
          </div>
          {isManager && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setModal({ mode: 'add' })}
              className="btn-primary"
            >
              <Plus size={18} /> Add New Product
            </motion.button>
          )}
        </motion.div>

        <SectionCard title="Product Catalog" subtitle={`${filtered.length} total items found`} accent="#f97316" delay={0.1}>
          <div className="mb-6 relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 bg-gray-50/50 transition-all font-medium"
              placeholder="Search products by name, brand or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? <TableSkeleton rows={8} /> : (
            <div className="overflow-x-auto -mx-2">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Pricing</th>
                    <th className="text-center">Stock Info</th>
                    {isManager && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={40} className="text-gray-200" />
                        <p className="text-gray-400 font-medium">No products match your search</p>
                      </div>
                    </td></tr>
                  )}
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                    >
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm shadow-orange-500/5">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-none mb-1">{p.name}</p>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">SKU: {p.id.toString().padStart(6,'0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-medium text-gray-600">{p.brand || '—'}</td>
                      <td>
                        <span className="badge badge-blue">
                          {p.category_name || 'General'}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-bold">{fmtRupee(p.discounted_price || p.price)}</span>
                          <span className="text-[11px] text-gray-400 line-through font-medium">{fmtRupee(p.price)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-extrabold ${p.total_quantity <= p.reorder_level ? 'text-red-500' : 'text-green-600'}`}>
                            {p.total_quantity} units
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Level: {p.reorder_level}</span>
                        </div>
                      </td>
                      {isManager && (
                        <td>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setModal({ mode: 'edit', product: p })}
                              className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-all active:scale-90"
                              title="Edit product"
                            >
                              <Pencil size={15} />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-all active:scale-90"
                                title="Delete product"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
