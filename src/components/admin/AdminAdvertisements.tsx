import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, Megaphone, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Advertisement, Category } from '../../types';

interface AdminAdvertisementsProps {
  advertisements: Advertisement[];
  categories: Category[];
  onAddAd: (data: Partial<Advertisement>) => Promise<void>;
  onUpdateAd: (id: string, data: Partial<Advertisement>) => Promise<void>;
  onDeleteAd: (id: string) => Promise<void>;
}

export const AdminAdvertisements: React.FC<AdminAdvertisementsProps> = ({
  advertisements,
  categories,
  onAddAd,
  onUpdateAd,
  onDeleteAd,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const [title, setTitle] = useState('');
  const [tamilTitle, setTamilTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('');
  const [linkCategory, setLinkCategory] = useState(categories[0]?.name || '');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditingAd(null);
    setTitle('');
    setTamilTitle('');
    setSubtitle('');
    setImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&auto=format&fit=crop&q=80');
    setBadge('Special Offer');
    setLinkCategory(categories[0]?.name || 'Rice Varieties');
    setActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setTamilTitle(ad.tamilTitle || '');
    setSubtitle(ad.subtitle || '');
    setImage(ad.image);
    setBadge(ad.badge || '');
    setLinkCategory(ad.linkCategory || '');
    setActive(ad.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Banner title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Advertisement> = {
        title: title.trim(),
        tamilTitle: tamilTitle.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&auto=format&fit=crop&q=80',
        badge: badge.trim() || undefined,
        linkCategory: linkCategory || undefined,
        active,
      };

      if (editingAd) {
        const adId = editingAd._id || editingAd.id;
        if (!adId) {
          setFormError('Advertisement ID is missing.');
          return;
        }
        await onUpdateAd(adId, payload);
      } else {
        await onAddAd(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save advertisement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#F0EBDD] shadow-xs">
        <div>
          <h3 className="font-extrabold text-base text-[#16402A] font-heading">
            Promotional Banners &amp; Advertisements ({advertisements.length})
          </h3>
          <p className="text-xs text-gray-500">
            Active banners display automatically in the customer home carousel
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DFBA5C]" />
          <span>Upload New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advertisements.map(ad => {
          const adId = ad._id || ad.id || '';
          return (
          <div
            key={adId}
            className="rounded-3xl bg-white border border-[#F0EBDD] overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-21/9 w-full bg-[#FAF8F2] overflow-hidden">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                  {ad.badge && (
                    <span className="self-start text-[10px] font-bold bg-[#CFA13A] text-[#16402A] px-2 py-0.5 rounded-full mb-1">
                      {ad.badge}
                    </span>
                  )}
                  <h4 className="text-white font-bold text-base font-heading leading-tight">{ad.title}</h4>
                  {ad.tamilTitle && (
                    <p className="text-[#DFBA5C] font-tamil text-xs font-semibold">{ad.tamilTitle}</p>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-1">
                {ad.subtitle && <p className="text-xs text-gray-600">{ad.subtitle}</p>}
                {ad.linkCategory && (
                  <p className="text-[11px] text-[#205A3B] font-semibold">
                    Links to Category: <strong>{ad.linkCategory}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-[#F0EBDD] mt-2">
              <button
                onClick={() => onUpdateAd(adId, { active: !ad.active })}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  ad.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {ad.active ? 'Live Banner' : 'Inactive'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(ad)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-[#205A3B]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete banner "${ad.title}"?`)) {
                      onDeleteAd(adId);
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Banner Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#F0EBDD] overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 bg-[#FAF8F2] border-b border-[#F0EBDD] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#16402A] font-heading">
                {editingAd ? 'Edit Banner' : 'Upload Promotional Banner'}
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
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Direct Salem Mill Ponni Rice"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Tamil Title</label>
                <input
                  type="text"
                  placeholder="எ.கா. சேலம் ஆலை நேரடி பொன்னி அரிசி"
                  value={tamilTitle}
                  onChange={e => setTamilTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs sm:text-sm bg-[#FAF8F2] outline-hidden font-tamil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  placeholder="e.g., Unbeatable wholesale prices for 25kg bags"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Offer, Harvest Season"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs bg-[#FAF8F2] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Link to Category</label>
                  <select
                    value={linkCategory}
                    onChange={e => setLinkCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] text-xs bg-[#FAF8F2] outline-hidden font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">Banner Image (Aspect Ratio 21:9)</label>
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
                    Upload
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
                <span>Active banner (shows in home carousel)</span>
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
                  className="px-6 py-2 rounded-xl bg-[#205A3B] text-white font-bold text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
