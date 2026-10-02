import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, FolderTree, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Category } from '../../types';

interface AdminCategoriesProps {
  categories: Category[];
  onAddCategory: (data: Partial<Category>) => Promise<void>;
  onUpdateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setTamilName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80');
    setActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setTamilName(cat.tamilName || '');
    setDescription(cat.description || '');
    setImage(cat.image);
    setActive(cat.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file.');
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
      setFormError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Category> = {
        name: name.trim(),
        tamilName: tamilName.trim() || undefined,
        description: description.trim() || undefined,
        image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
        active,
      };

      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id;
        if (!catId) {
          setFormError('Category ID is missing.');
          return;
        }
        await onUpdateCategory(catId, payload);
      } else {
        await onAddCategory(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#F0EBDD] shadow-xs">
        <div>
          <h3 className="font-extrabold text-base text-[#16402A] font-heading">
            Store Categories ({categories.length})
          </h3>
          <p className="text-xs text-gray-500">
            All active categories dynamically render in customer navigation and filter lists
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DFBA5C]" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map(cat => {
          const categoryId = cat._id || cat.id || '';
          return (
          <div
            key={categoryId}
            className="p-4 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#CFA13A]/60 transition shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-[#FAF8F2] border border-[#F0EBDD] mb-3">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#16402A] font-heading">{cat.name}</h4>
              {cat.tamilName && (
                <p className="font-tamil text-xs text-[#205A3B] mt-0.5">{cat.tamilName}</p>
              )}
              {cat.description && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-[#F0EBDD] flex items-center justify-between">
              <button
                onClick={() => onUpdateCategory(categoryId, { active: !cat.active })}
                className="text-[11px] font-bold text-gray-600 hover:text-[#205A3B]"
              >
                {cat.active ? 'Disable' : 'Enable'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-[#205A3B] hover:bg-[#FAF8F2]"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete category "${cat.name}"?`)) {
                      onDeleteCategory(categoryId);
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F0EBDD] overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 bg-[#FAF8F2] border-b border-[#F0EBDD] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#16402A] font-heading">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{formError}</div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rice Varieties, Dals & Pulses"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Tamil Name</label>
                <input
                  type="text"
                  placeholder="எ.கா. அரிசி வகைகள்"
                  value={tamilName}
                  onChange={e => setTamilName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden font-tamil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Category highlights..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Category Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#F0EBDD] text-xs bg-[#FAF8F2] outline-hidden"
                  />
                  <label className="px-3 py-1.5 rounded-xl border border-[#CFA13A] bg-[#F0EBDD] text-[11px] font-bold text-[#16402A] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    File
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-[#2B2B2B] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="accent-[#205A3B] w-4 h-4"
                />
                <span>Active in customer store navigation</span>
              </label>

              <div className="pt-4 border-t border-[#F0EBDD] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#205A3B] text-white font-bold text-xs transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
