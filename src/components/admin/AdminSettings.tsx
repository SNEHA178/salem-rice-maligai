import React, { useState, useEffect } from 'react';
import {
  Database,
  Store,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Phone,
  MapPin,
  Building,
  Calendar,
  Loader2,
} from 'lucide-react';
import { DbStatus } from '../../types';
import { api } from '../../services/api';

interface AdminSettingsProps {
  dbStatus?: DbStatus;
  onRefreshData: () => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ dbStatus, onRefreshData }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 1. STORE INFORMATION
  const [storeName, setStoreName] = useState('Salem Rice & Maligai');
  const [phone, setPhone] = useState('8973203053');
  const [altPhone, setAltPhone] = useState('9876543210');
  const [address, setAddress] = useState('Shevapet Main Bazaar, Salem - 636002, Tamil Nadu');

  // 2. BUSINESS HOURS
  const [monSatOpen, setMonSatOpen] = useState('07:00');
  const [monSatClose, setMonSatClose] = useState('21:30');
  const [sunOpen, setSunOpen] = useState('07:00');
  const [sunClose, setSunClose] = useState('14:00');

  // 3. DELIVERY SETTINGS
  const [salemOnly, setSalemOnly] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(0);
  const [tomorrowDeliveryRule, setTomorrowDeliveryRule] = useState(true);

  // 4. SHOP AVAILABILITY / NOTICE
  const [shopStatus, setShopStatus] = useState<'OPEN' | 'CLOSED' | 'TEMPORARILY_UNAVAILABLE'>('OPEN');
  const [noticeEn, setNoticeEn] = useState('');
  const [noticeTa, setNoticeTa] = useState('');
  const [reopenDate, setReopenDate] = useState('');

  // Database re-sync
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getSettings().then(s => {
      if (isMounted && s) {
        if (s.storeName) setStoreName(s.storeName);
        if (s.phone) setPhone(s.phone);
        if (s.altPhone) setAltPhone(s.altPhone);
        if (s.address) setAddress(s.address);
        if (s.monSatOpen) setMonSatOpen(s.monSatOpen);
        if (s.monSatClose) setMonSatClose(s.monSatClose);
        if (s.sunOpen) setSunOpen(s.sunOpen);
        if (s.sunClose) setSunClose(s.sunClose);
        if (s.salemOnly !== undefined) setSalemOnly(Boolean(s.salemOnly));
        if (s.deliveryCharge !== undefined) setDeliveryCharge(Number(s.deliveryCharge));
        if (s.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(Number(s.freeDeliveryThreshold));
        if (s.tomorrowDeliveryRule !== undefined) setTomorrowDeliveryRule(Boolean(s.tomorrowDeliveryRule));
        if (s.shopStatus) setShopStatus(s.shopStatus);
        if (s.noticeEn) setNoticeEn(s.noticeEn);
        if (s.noticeTa) setNoticeTa(s.noticeTa);
        if (s.reopenDate) setReopenDate(s.reopenDate);
      }
    }).catch(() => {}).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const payload = {
        storeName: storeName.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim(),
        address: address.trim(),
        monSatOpen,
        monSatClose,
        sunOpen,
        sunClose,
        salemOnly,
        deliveryCharge: Number(deliveryCharge) || 0,
        freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
        tomorrowDeliveryRule,
        shopStatus,
        noticeEn: noticeEn.trim(),
        noticeTa: noticeTa.trim(),
        reopenDate: reopenDate.trim(),
      };

      const updated = await api.updateSettings(payload);
      if (updated) {
        if (updated.storeName) setStoreName(updated.storeName);
        if (updated.phone) setPhone(updated.phone);
        if (updated.altPhone) setAltPhone(updated.altPhone);
        if (updated.address) setAddress(updated.address);
        if (updated.monSatOpen) setMonSatOpen(updated.monSatOpen);
        if (updated.monSatClose) setMonSatClose(updated.monSatClose);
        if (updated.sunOpen) setSunOpen(updated.sunOpen);
        if (updated.sunClose) setSunClose(updated.sunClose);
        if (updated.salemOnly !== undefined) setSalemOnly(Boolean(updated.salemOnly));
        if (updated.deliveryCharge !== undefined) setDeliveryCharge(Number(updated.deliveryCharge));
        if (updated.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(Number(updated.freeDeliveryThreshold));
        if (updated.tomorrowDeliveryRule !== undefined) setTomorrowDeliveryRule(Boolean(updated.tomorrowDeliveryRule));
        if (updated.shopStatus) setShopStatus(updated.shopStatus);
        if (updated.noticeEn !== undefined) setNoticeEn(updated.noticeEn);
        if (updated.noticeTa !== undefined) setNoticeTa(updated.noticeTa);
        if (updated.reopenDate !== undefined) setReopenDate(updated.reopenDate);
      }
      await onRefreshData().catch(() => {});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage('');
    try {
      await onRefreshData();
      setRefreshMessage('Catalog, orders, and database status re-synchronized successfully.');
    } catch (err: any) {
      setRefreshMessage(err.message || 'Error refreshing store data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#205A3B] mx-auto" />
        <p className="text-xs text-gray-500">Loading store settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#16402A] font-heading">
            Store &amp; Operations Settings
          </h3>
          <p className="text-xs text-gray-500">
            Configure business hours, Salem service perimeter, delivery timing, and shop availability notices.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#205A3B] hover:bg-[#16402A] text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#DFBA5C]" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Store settings and notices updated successfully in database.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* SECTION 1: STORE INFORMATION */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EBDD]">
          <Store className="w-5 h-5 text-[#205A3B]" />
          <h4 className="font-extrabold text-sm text-[#16402A] font-heading">
            1. Store Information
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Primary Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Alternative Phone</label>
            <input
              type="tel"
              value={altPhone}
              onChange={e => setAltPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Store Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: BUSINESS & ORDERING HOURS (Requirement #5) */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EBDD]">
          <Clock className="w-5 h-5 text-[#CFA13A]" />
          <div>
            <h4 className="font-extrabold text-sm text-[#16402A] font-heading">
              2. Business &amp; Ordering Hours
            </h4>
            <p className="text-[11px] text-gray-500">
              Orders placed outside these shop hours will be blocked with a friendly explanation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-3">
            <span className="text-xs font-extrabold text-[#16402A] block">
              Monday – Saturday (Standard Schedule)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Opening Time</label>
                <input
                  type="time"
                  required
                  value={monSatOpen}
                  onChange={e => setMonSatOpen(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Closing Time</label>
                <input
                  type="time"
                  required
                  value={monSatClose}
                  onChange={e => setMonSatClose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] bg-white text-xs font-bold"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">Default: 7:00 AM – 9:30 PM (21:30)</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-3">
            <span className="text-xs font-extrabold text-[#16402A] block">
              Sunday (Half-Day Schedule)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Opening Time</label>
                <input
                  type="time"
                  required
                  value={sunOpen}
                  onChange={e => setSunOpen(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Closing Time</label>
                <input
                  type="time"
                  required
                  value={sunClose}
                  onChange={e => setSunClose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0EBDD] bg-white text-xs font-bold"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">Default: 7:00 AM – 2:00 PM (14:00)</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: DELIVERY SETTINGS (Requirements #4 & #6) */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EBDD]">
          <Truck className="w-5 h-5 text-[#205A3B]" />
          <div>
            <h4 className="font-extrabold text-sm text-[#16402A] font-heading">
              3. Delivery Rules &amp; Timing
            </h4>
            <p className="text-[11px] text-gray-500">
              Salem service perimeter, delivery fees, and tomorrow delivery guarantee.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] cursor-pointer">
            <input
              type="checkbox"
              checked={salemOnly}
              onChange={e => setSalemOnly(e.target.checked)}
              className="mt-0.5 rounded text-[#205A3B] focus:ring-[#205A3B]"
            />
            <div>
              <span className="text-xs font-bold text-[#16402A] block">
                Salem-Only Service Perimeter Enforcement
              </span>
              <span className="text-[11px] text-gray-600 block mt-0.5">
                Restricts customer order checkout to Salem addresses (Pincodes starting with 636xxx). Customers outside Salem will receive a clear notice.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] cursor-pointer">
            <input
              type="checkbox"
              checked={tomorrowDeliveryRule}
              onChange={e => setTomorrowDeliveryRule(e.target.checked)}
              className="mt-0.5 rounded text-[#205A3B] focus:ring-[#205A3B]"
            />
            <div>
              <span className="text-xs font-bold text-[#16402A] block">
                Tomorrow Delivery Business Rule (&ldquo;Orders placed today are delivered tomorrow&rdquo;)
              </span>
              <span className="text-[11px] text-gray-600 block mt-0.5">
                Automatically calculates and displays expected tomorrow delivery date on checkout and receipts.
              </span>
            </div>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge}
                onChange={e => setDeliveryCharge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs font-bold text-[#16402A]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Set ₹0 for 100% Free Salem doorstep delivery</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                min={0}
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs font-bold text-[#16402A]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Orders above this amount receive free delivery (0 = disabled)</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SHOP AVAILABILITY / OUT OF STATION NOTICE (Requirement #7) */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EBDD]">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <h4 className="font-extrabold text-sm text-[#16402A] font-heading">
              4. Shop Availability &amp; Temporary Closure Notice
            </h4>
            <p className="text-[11px] text-gray-500">
              When closed, customers can still browse products, but order placement is safely paused with a notice.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-2">Shop Operational Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer text-xs font-bold transition ${
                  shopStatus === 'OPEN'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-[#F0EBDD] bg-[#FAF8F2] text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="shopStatus"
                  value="OPEN"
                  checked={shopStatus === 'OPEN'}
                  onChange={() => setShopStatus('OPEN')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>OPEN (Accepting Orders)</span>
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer text-xs font-bold transition ${
                  shopStatus === 'TEMPORARILY_UNAVAILABLE'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-[#F0EBDD] bg-[#FAF8F2] text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="shopStatus"
                  value="TEMPORARILY_UNAVAILABLE"
                  checked={shopStatus === 'TEMPORARILY_UNAVAILABLE'}
                  onChange={() => setShopStatus('TEMPORARILY_UNAVAILABLE')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>TEMPORARILY UNAVAILABLE</span>
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer text-xs font-bold transition ${
                  shopStatus === 'CLOSED'
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-[#F0EBDD] bg-[#FAF8F2] text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="shopStatus"
                  value="CLOSED"
                  checked={shopStatus === 'CLOSED'}
                  onChange={() => setShopStatus('CLOSED')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>CLOSED (Out of Station)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                Customer-Facing Notice (English)
              </label>
              <textarea
                rows={2}
                value={noticeEn}
                onChange={e => setNoticeEn(e.target.value)}
                placeholder="e.g. Shop temporarily closed for Pongal harvest holiday. Orders will resume on Monday."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs focus:bg-white focus:border-[#205A3B] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                Customer-Facing Notice (Tamil)
              </label>
              <textarea
                rows={2}
                value={noticeTa}
                onChange={e => setNoticeTa(e.target.value)}
                placeholder="e.g. கடை தற்காலிகமாக மூடப்பட்டுள்ளது. திங்கட்கிழமை முதல் ஆர்டர்கள் மீண்டும் ஏற்கப்படும்."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs focus:bg-white focus:border-[#205A3B] outline-hidden font-tamil"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
              Expected Reopening Date / Information
            </label>
            <input
              type="text"
              value={reopenDate}
              onChange={e => setReopenDate(e.target.value)}
              placeholder="e.g. Monday 7:00 AM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs focus:bg-white focus:border-[#205A3B] outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: DATABASE & INFRASTRUCTURE SYNC */}
      <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBDD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#205A3B] flex items-center justify-center border border-[#F0EBDD]">
              <Database className="w-5 h-5 text-[#CFA13A]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#16402A]">Database Storage Engine</h4>
              <p className="text-xs text-gray-500">
                {dbStatus?.type === 'mongodb_atlas' ? 'MongoDB Atlas' : 'Resilient Local Storage Engine'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CFA13A]/50 bg-[#F0EBDD] hover:bg-[#FAF8F2] text-xs font-bold text-[#16402A] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Catalog'}</span>
          </button>
        </div>

        {refreshMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            {refreshMessage}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#205A3B] hover:bg-[#16402A] text-white font-extrabold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default AdminSettings;
