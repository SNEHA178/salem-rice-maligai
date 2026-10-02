import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Product, Category } from '../../types';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (data: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Rice Varieties');
  const [image, setImage] = useState('');
  const [retailPrice, setRetailPrice] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [wholesaleMinimumQuantity, setWholesaleMinimumQuantity] = useState<number | ''>(4);
  const [unit, setUnit] = useState('25kg bag');
  const [stock, setStock] = useState<number | ''>(50);
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setTamilName('');
    setCategory(categories[0]?.name || 'Rice Varieties');
    setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80');
    setRetailPrice('');
    setWholesalePrice('');
    setWholesaleMinimumQuantity(4);
    setUnit('25kg bag');
    setStock(50);
    setDescription('');
    setAvailable(true);
    setFeatured(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setTamilName(p.tamilName || '');
    setCategory(p.category);
    setImage(p.image);
    setRetailPrice(p.retailPrice);
    setWholesalePrice(p.wholesalePrice);
    setWholesaleMinimumQuantity(
      p.wholesaleMinimumQuantity !== undefined && p.wholesaleMinimumQuantity !== null
        ? p.wholesaleMinimumQuantity
        : 4
    );
    setUnit(p.unit);
    setStock(p.stock);
    setDescription(p.description);
    setAvailable(p.available);
    setFeatured(p.featured);
    setFormError('');
    setIsModalOpen(true);
  };

  // Image upload handler (converts to base64 data url for durable preview/storage)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image size exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    if (retailPrice === '' || Number(retailPrice) <= 0) {
      setFormError('Retail price is required and must be greater than 0.');
      return;
    }

    if (wholesalePrice === '' || Number(wholesalePrice) <= 0) {
      setFormError('Wholesale price is required and must be greater than 0.');
      return;
    }

    if (wholesaleMinimumQuantity !== '' && Number(wholesaleMinimumQuantity) < 1) {
      setFormError('Wholesale minimum quantity must be at least 1.');
      return;
    }

    if (Number(wholesalePrice) > Number(retailPrice)) {
      setFormError('Wholesale price should typically be less than or equal to Retail price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        tamilName: tamilName.trim() || undefined,
        category,
        image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        wholesaleMinimumQuantity: wholesaleMinimumQuantity === '' ? 4 : Number(wholesaleMinimumQuantity),
        unit: unit.trim() || 'unit',
        stock: Number(stock) || 0,
        description: description.trim(),
        available,
        featured,
      };

      if (editingProduct) {
        const prodId = editingProduct._id || editingProduct.id;
        if (!prodId) {
          setFormError('Product ID is missing.');
          return;
        }
        await onUpdateProduct(prodId, payload);
      } else {
        await onAddProduct(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tamilName && p.tamilName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Category Filter, and Add Product */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#F0EBDD] shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name or Tamil name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] outline-hidden"
            />
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] outline-hidden font-semibold"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          id="admin-add-product-btn"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DFBA5C]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#F0EBDD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F0EBDD] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#16402A] font-heading">
            Store Products ({filteredProducts.length})
          </h3>
          <span className="text-xs text-gray-500">
            Both Retail and Wholesale pricing enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F0EBDD] text-gray-500 font-bold bg-[#FAF8F2]/60">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">Unit / Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBDD]">
              {filteredProducts.map(p => {
                const prodId = p._id || p.id || '';
                return (
                <tr key={prodId} className="hover:bg-[#FAF8F2]/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-[#FAF8F2] border border-[#F0EBDD] shrink-0"
                      />
                      <div>
                        <p className="font-bold text-[#16402A] text-xs sm:text-sm">{p.name}</p>
                        {p.tamilName && (
                          <p className="font-tamil text-[11px] text-gray-500">{p.tamilName}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] text-[#205A3B] font-semibold border border-[#F0EBDD]">
                      {p.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-[#16402A]">
                    ₹{p.retailPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-[#CFA13A]">
                      ₹{p.wholesalePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Min Qty: <strong>{p.wholesaleMinimumQuantity !== undefined && p.wholesaleMinimumQuantity !== null ? p.wholesaleMinimumQuantity : 4}</strong>
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      (Diff: ₹{p.retailPrice - p.wholesalePrice})
                    </span>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    <p className="font-semibold">{p.unit}</p>
                    <p className="text-[10px] text-gray-400">Stock: {p.stock}</p>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => onUpdateProduct(prodId, { available: !p.available })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        p.available
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {p.available ? 'Active' : 'Inactive'}
                    </button>
                    {p.featured && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-[#DFBA5C]/30 text-[#16402A] text-[10px] font-bold">
                        Featured
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-[#205A3B] hover:bg-[#FAF8F2] transition cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                          onDeleteProduct(prodId);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal (Requirement #18, #23) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0EBDD] overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 bg-[#FAF8F2] border-b border-[#F0EBDD] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#16402A] font-heading">
                {editingProduct ? 'Edit Product' : 'Add New Rice / Grocery Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name and Tamil Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Salem Deluxe Ponni Rice (25kg)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    Tamil Name (தமிழ் பெயர்)
                  </label>
                  <input
                    type="text"
                    placeholder="எ.கா. சேலம் டீலக்ஸ் பொன்னி அரிசி"
                    value={tamilName}
                    onChange={e => setTamilName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden font-tamil"
                  />
                </div>
              </div>

              {/* Category and Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    Category (Dynamic) *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>
                        {c.name} {c.tamilName ? `(${c.tamilName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                    Packaging Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25kg bag, 1kg pack, 1 liter bottle"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden"
                  />
                </div>
              </div>

              {/* Pricing: Retail & Wholesale (Requirement #7, #18) */}
              <div className="p-4 rounded-2xl bg-[#F0EBDD]/40 border border-[#CFA13A]/40 space-y-3">
                <h4 className="text-xs font-bold text-[#16402A] uppercase tracking-wider">
                  Dual Pricing Configuration (Required)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                      Retail Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 1450"
                      value={retailPrice}
                      onChange={e => setRetailPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-white outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                      Wholesale Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 1380"
                      value={wholesalePrice}
                      onChange={e => setWholesalePrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-white outline-hidden font-bold text-[#CFA13A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                      Wholesale Min Qty *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="e.g. 4"
                      value={wholesaleMinimumQuantity}
                      onChange={e => setWholesaleMinimumQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-white outline-hidden font-bold text-[#16402A]"
                    />
                    <span className="text-[10px] text-gray-500 block mt-0.5">Min required for wholesale</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 100"
                      value={stock}
                      onChange={e => setStock(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-white outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload / URL (Requirement #23) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#2B2B2B]">
                  Product Image (Upload file or provide Image URL)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#FAF8F2] border border-[#F0EBDD] overflow-hidden shrink-0 flex items-center justify-center">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    <input
                      type="text"
                      placeholder="Image URL (https://...)"
                      value={image}
                      onChange={e => setImage(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#F0EBDD] text-xs bg-[#FAF8F2] outline-hidden"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFA13A]/50 bg-[#F0EBDD] hover:bg-[#FAF8F2] text-[11px] font-bold text-[#16402A] cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-[#205A3B]" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe grain quality, aging, aroma, and origin..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-xs bg-[#FAF8F2] outline-hidden"
                />
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#2B2B2B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={e => setAvailable(e.target.checked)}
                    className="accent-[#205A3B] w-4 h-4"
                  />
                  <span>Product is Available in Store (Active)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-[#2B2B2B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="accent-[#205A3B] w-4 h-4"
                  />
                  <span>Feature on Customer Home Page</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#F0EBDD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
