import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { calculateExpectedDelivery } from '../utils/deliveryTime';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Lock,
  Phone,
  User as UserIcon,
  ShoppingBag,
  Loader2,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export interface CheckoutPageProps {
  onNavigate?: (path: string) => void;
}

export const Checkout: React.FC<CheckoutPageProps> = ({ onNavigate = () => {} }) => {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user, isAuthenticated, login, register } = useAuth();
  const { pricingMode } = usePricing();
  const { t, isTamil } = useLanguage();

  // Settings State
  const [storeSettings, setStoreSettings] = useState<any>({
    storeName: 'Salem Rice & Maligai',
    monSatOpen: '07:00',
    monSatClose: '21:30',
    sunOpen: '07:00',
    sunClose: '14:00',
    salemOnly: true,
    deliveryCharge: 0,
    freeDeliveryThreshold: 0,
    tomorrowDeliveryRule: true,
    shopStatus: 'OPEN',
    noticeEn: '',
    noticeTa: '',
  });

  // Delivery Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState(user?.address || '');
  const [area, setArea] = useState('Shevapet');
  const [pincode, setPincode] = useState(user?.pincode || '636002');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');

  // Authentication sub-tab state if guest
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Submission State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Restore placed order on direct refresh or via URL/sessionStorage parameter (Requirement #6)
  useEffect(() => {
    if (placedOrder) return;
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlOrderId = urlParams?.get('orderId');
    const storedOrderId = typeof window !== 'undefined' ? sessionStorage.getItem('lastPlacedOrderId') : null;
    const targetOrderId = urlOrderId || storedOrderId;

    if (targetOrderId && isAuthenticated) {
      let isMounted = true;
      setIsLoadingOrder(true);
      api.getOrderById(targetOrderId)
        .then(fetchedOrder => {
          if (isMounted && fetchedOrder && (fetchedOrder._id || fetchedOrder.orderNumber)) {
            setPlacedOrder(fetchedOrder);
          }
        })
        .catch(err => {
          console.warn('[ORDER SUCCESS] Could not restore order:', err);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('lastPlacedOrderId');
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingOrder(false);
          }
        });

      return () => { isMounted = false; };
    }
  }, [isAuthenticated, placedOrder]);

  // Fetch Settings on mount
  useEffect(() => {
    let isMounted = true;
    api.getSettings().then(settings => {
      if (isMounted && settings) {
        setStoreSettings(settings);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Update delivery form when user loads
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!phone) setPhone(user.phone || '');
      if (!addressLine) setAddressLine(user.address || '');
      if (user.pincode && pincode === '636002') setPincode(user.pincode);
    }
  }, [user]);

  // Calculations
  const calculatedSubtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);

  const deliveryCharge = Number(storeSettings?.deliveryCharge || 0);
  const freeThreshold = Number(storeSettings?.freeDeliveryThreshold || 0);
  const deliveryFee = (freeThreshold > 0 && calculatedSubtotal >= freeThreshold) ? 0 : deliveryCharge;
  const totalAmount = calculatedSubtotal + deliveryFee;

  // Authoritative Expected Delivery calculation (Requirements #19, #20, #21)
  const deliveryCalc = calculateExpectedDelivery(new Date(), storeSettings);
  const formattedDeliveryDate = isTamil ? deliveryCalc.displayCustomerTa : deliveryCalc.displayCustomer;

  // Shop Open / Closed and Hours Validation (Requirements #5 & #7)
  const isShopOpen = storeSettings?.shopStatus === 'OPEN';
  const shopNotice = isTamil ? (storeSettings?.noticeTa || storeSettings?.noticeEn) : storeSettings?.noticeEn;

  // Time check in Indian Standard Time (IST)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (3600000 * 5.5));
  const dayOfWeek = ist.getDay();
  const curTimeStr = `${String(ist.getHours()).padStart(2, '0')}:${String(ist.getMinutes()).padStart(2, '0')}`;
  
  let isWithinHours = true;
  if (dayOfWeek === 0) {
    if (curTimeStr < (storeSettings?.sunOpen || '07:00') || curTimeStr > (storeSettings?.sunClose || '14:00')) {
      isWithinHours = false;
    }
  } else {
    if (curTimeStr < (storeSettings?.monSatOpen || '07:00') || curTimeStr > (storeSettings?.monSatClose || '21:30')) {
      isWithinHours = false;
    }
  }

  // Salem Pincode Validation (Requirement #4)
  const cleanPincode = String(pincode || '').replace(/\D/g, '');
  const isSalemPincode = cleanPincode.startsWith('636') || (
    Array.isArray(storeSettings?.allowedPincodes) && storeSettings.allowedPincodes.includes(cleanPincode)
  );

  // In-checkout Quick Login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authTab === 'login') {
        const res = await login(authEmail.trim(), authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Login failed. Please check your credentials.');
        }
      } else {
        if (!authName.trim() || !authPhone.trim()) {
          setAuthError('Name and 10-digit mobile number are required.');
          setAuthLoading(false);
          return;
        }
        const res = await register({
          name: authName.trim(),
          phone: authPhone.trim(),
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
          address: 'Salem, Tamil Nadu',
        });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Place Order Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      setErrorMessage(isTamil ? 'ஆர்டர் செய்ய தயவுசெய்து உள்நுழையவும்.' : 'Please login to place your order.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!isShopOpen) {
      setErrorMessage(shopNotice || 'Orders are temporarily unavailable because the shop is closed.');
      return;
    }

    if (!isWithinHours) {
      setErrorMessage('Orders are currently closed. Please place your order during our shop hours (Mon-Sat 7:00 AM – 9:30 PM, Sun 7:00 AM – 2:00 PM).');
      return;
    }

    if (!isSalemPincode) {
      setErrorMessage('Sorry, orders are currently available only within Salem.');
      return;
    }

    // Wholesale minimum quantity validation
    for (const item of cartItems) {
      const mode = String(item.pricingMode || 'retail').toLowerCase();
      if (mode === 'wholesale') {
        const minWholesale = Number(item.wholesaleMinimumQuantity || (item as any).product?.wholesaleMinimumQuantity || 4);
        if (Number(item.quantity) < minWholesale) {
          setErrorMessage(`Wholesale quantity must be at least ${minWholesale}.`);
          return;
        }
      }
    }

    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || cleanPincode.length !== 6) {
      setErrorMessage('Please provide a complete Salem delivery address and valid 6-digit pincode.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          name: item.productName || item.name,
          unit: item.unit || 'unit',
          pricingMode: item.pricingMode || 'retail',
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity),
          subtotal: Number(item.unitPrice) * Number(item.quantity),
        })),
        deliveryAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          area: area.trim(),
          city: 'Salem',
          state: 'Tamil Nadu',
          pincode: cleanPincode,
          landmark: '',
        },
        notes: notes.trim(),
        paymentMethod: 'COD',
      };

      const result = await api.createOrder(orderPayload);
      if (result && (result._id || result.orderNumber)) {
        // [ORDER SUCCESS DEBUG] Safe development logging
        console.log(
          `[ORDER SUCCESS DEBUG]\nOrder ID: ${result._id || result.id || result.orderNumber}\nReturned order total: ${result.total}\nSubtotal: ${result.subtotal}\nDelivery charge: ${result.deliveryFee ?? result.deliveryCharge ?? 0}\nPayment method: ${result.paymentMethod}`
        );

        const orderId = result._id || result.id || result.orderNumber;
        if (typeof window !== 'undefined' && orderId) {
          try {
            sessionStorage.setItem('lastPlacedOrderId', orderId);
          } catch {}
          window.history.replaceState({}, '', `/checkout?orderId=${encodeURIComponent(orderId)}`);
        }

        setPlacedOrder(result);
        clearCart();
      } else {
        setErrorMessage('Failed to generate order confirmation. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please verify your address and retry.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Loading placed order state on direct refresh (Requirement #6)
  if (isLoadingOrder) {
    return (
      <div className="w-full py-16 px-4">
        <PageContainer variant="narrow">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-4 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#205A3B] animate-spin mx-auto" />
            <h3 className="text-base font-bold text-[#16402A]">Loading order confirmation...</h3>
            <p className="text-xs text-[#5A5A5A]">Retrieving your verified order details.</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Order Success Screen (Requirement #13, #18)
  if (placedOrder) {
    // Authoritative total directly from stored order (never depends on empty/cleared cart)
    const authoritativeTotal = Number(
      placedOrder.total ??
      placedOrder.totalAmount ??
      placedOrder.grandTotal ??
      0
    );

    const deliveryFeeValue = Number(placedOrder.deliveryFee ?? placedOrder.deliveryCharge ?? 0);
    const subtotalValue = placedOrder.subtotal !== undefined
      ? Number(placedOrder.subtotal)
      : Math.max(0, authoritativeTotal - deliveryFeeValue);

    const customerDisplayName =
      placedOrder.deliveryAddress?.fullName ||
      placedOrder.customer?.name ||
      fullName;

    const customerDisplayPhone =
      placedOrder.deliveryAddress?.phone ||
      placedOrder.customerPhone ||
      placedOrder.customer?.phone ||
      phone;

    const displayAddress = placedOrder.deliveryAddress
      ? `${placedOrder.deliveryAddress.addressLine}${placedOrder.deliveryAddress.area ? `, ${placedOrder.deliveryAddress.area}` : ''}, ${placedOrder.deliveryAddress.city || 'Salem'} - ${placedOrder.deliveryAddress.pincode}`
      : `${addressLine}${area ? `, ${area}` : ''}, Salem - ${cleanPincode}`;

    const orderExpectedDate = placedOrder.estimatedDeliveryDate || formattedDeliveryDate;

    return (
      <div className="w-full py-12 px-4">
        <PageContainer variant="narrow">
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-6 sm:p-10 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase border border-amber-200">
                Order Status: {placedOrder.status || 'PENDING'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading mt-3">
                {isTamil ? 'ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Order Placed Successfully!'}
              </h2>
              <p className="text-sm font-semibold text-[#CFA13A] mt-1 font-mono">
                Order #{placedOrder.orderNumber}
              </p>
            </div>

            {/* Delivery Timing Highlight (Requirements #19, #20, #21) */}
            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] text-left space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-[#16402A]">
                <Calendar className="w-4 h-4 text-[#205A3B]" />
                <span>{isTamil ? 'எதிர்பார்க்கப்படும் டெலிவரி:' : 'Expected Delivery:'}</span>
              </div>
              <p className="text-sm font-extrabold text-[#205A3B] pl-6">
                {orderExpectedDate}
              </p>
              <p className="text-xs text-[#5A5A5A] pl-6 leading-relaxed">
                {String(orderExpectedDate).toLowerCase().includes('today') || String(orderExpectedDate).includes('இன்று')
                  ? (isTamil
                      ? 'கடை இயங்கும் நேரத்திற்குள் பெறப்பட்டதால், இன்று சேலம் மில்லிலிருந்து விரைவாக டெலிவரி செய்யப்படும்.'
                      : 'Orders placed during open shop hours are scheduled for same-day delivery directly from our Salem mill.')
                  : (isTamil
                      ? 'கடை நிறைவுற்ற பின்னர் பெறப்பட்டதால், நாளை காலை கடை திறந்ததும் முதலில் டெலிவரி செய்யப்படும்.'
                      : 'Orders placed after shop closing hours will be delivered next morning as soon as our shop opens.')}
              </p>
            </div>

            {/* Authoritative Order Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-[#F0EBDD] text-left text-xs space-y-2">
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Customer</span>
                <span className="font-bold text-[#2B2B2B]">{customerDisplayName} ({customerDisplayPhone})</span>
              </div>
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Delivery Address</span>
                <span className="font-semibold text-[#2B2B2B] text-right max-w-xs">{displayAddress}</span>
              </div>
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Payment Method</span>
                <span className="font-bold text-[#16402A]">
                  {placedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : placedOrder.paymentMethod || 'Cash on Delivery (COD)'}
                </span>
              </div>
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2B2B2B]">
                  {formatPrice(subtotalValue)}
                </span>
              </div>
              <div className="flex justify-between text-[#5A5A5A]">
                <span>Delivery Charge</span>
                <span className="font-semibold text-[#2B2B2B]">
                  {deliveryFeeValue > 0 ? formatPrice(deliveryFeeValue) : 'Free Delivery'}
                </span>
              </div>
              <div className="flex justify-between text-[#5A5A5A] pt-2 border-t border-[#F0EBDD]">
                <span className="font-bold text-sm text-[#16402A]">Total Amount</span>
                <span className="font-extrabold text-base text-[#16402A]">{formatPrice(authoritativeTotal)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('lastPlacedOrderId');
                  }
                  onNavigate('/orders');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                {isTamil ? 'ஆர்டர் நிலையை கண்காணிக்க' : 'Track Order in My Orders'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('lastPlacedOrderId');
                  }
                  onNavigate('/products');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[#F0EBDD] text-[#205A3B] hover:bg-[#FAF8F2] font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                {t('returnToStore')}
              </button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="w-full py-12 px-4">
        <PageContainer variant="narrow">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#16402A] font-heading">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#5A5A5A]">
              Add authentic Salem rice varieties and daily grocery essentials to proceed with checkout.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="w-full py-2.5 rounded-xl bg-[#205A3B] text-white text-xs font-semibold hover:bg-[#16402A] transition cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="w-full py-6 sm:py-10">
      <PageContainer variant="default">
        {/* Navigation Breadcrumb */}
        <div className="space-y-1 mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/cart')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205A3B] hover:text-[#16402A] cursor-pointer mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading">
            Order Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A5A]">
            Direct mill delivery exclusively across Salem district.
          </p>
        </div>

        {/* Shop Closure / Notice Banner (Requirement #7) */}
        {!isShopOpen && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isTamil ? 'கடை தற்காலிகமாக மூடப்பட்டுள்ளது' : 'Shop Temporarily Closed'}
              </p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {shopNotice || (isTamil ? 'தற்போது புதிய ஆர்டர்கள் ஏற்கப்படவில்லை.' : 'Orders are temporarily unavailable because the shop is closed.')}
              </p>
            </div>
          </div>
        )}

        {/* Business Hours Warning (Requirement #5) */}
        {isShopOpen && !isWithinHours && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {isTamil ? 'ஆர்டர் நேரம் நிறைவடைந்தது' : 'Orders Currently Closed'}
              </p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {isTamil
                  ? 'கடை வேலை நேரங்களில் மட்டுமே ஆர்டர் செய்ய முடியும் (திங்கள்-சனி 7:00 AM – 9:30 PM, ஞாயிறு 7:00 AM – 2:00 PM).'
                  : 'Orders are currently closed. Please place your order during our shop hours (Mon-Sat 7:00 AM – 9:30 PM, Sun 7:00 AM – 2:00 PM).'}
              </p>
            </div>
          </div>
        )}

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Auth + Delivery Address Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* REQUIREMENT #2: CUSTOMER LOGIN GATE */}
            {!isAuthenticated ? (
              <div className="rounded-3xl bg-white border border-[#F0EBDD] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-[#F0EBDD] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#16402A] font-heading">
                      {isTamil ? 'ஆர்டர் செய்ய உள்நுழையவும்' : 'Please login to place your order'}
                    </h2>
                    <p className="text-xs text-[#5A5A5A]">
                      Your cart items and wholesale pricing selections are safely preserved.
                    </p>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Login / Register Toggle Tabs */}
                <div className="flex rounded-xl bg-[#FAF8F2] p-1 border border-[#F0EBDD]">
                  <button
                    type="button"
                    onClick={() => { setAuthTab('login'); setAuthError(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      authTab === 'login' ? 'bg-[#205A3B] text-white shadow-xs' : 'text-[#5A5A5A]'
                    }`}
                  >
                    {t('login')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthTab('register'); setAuthError(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      authTab === 'register' ? 'bg-[#205A3B] text-white shadow-xs' : 'text-[#5A5A5A]'
                    }`}
                  >
                    {t('register')}
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authTab === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={e => setAuthName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Mobile Phone (10 digits)</label>
                        <input
                          type="tel"
                          required
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                      {authTab === 'login' ? 'Email or Mobile Number' : 'Email Address'}
                    </label>
                    <input
                      type={authTab === 'login' ? 'text' : 'email'}
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder={authTab === 'login' ? 'customer@salemrice.com or 9876543210' : 'name@example.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>{authTab === 'login' ? 'Sign In & Continue Checkout' : 'Create Customer Account & Continue'}</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Logged In Customer Address Form */
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                {/* 1. Delivery Destination */}
                <div className="rounded-3xl bg-white border border-[#F0EBDD] p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EBDD] pb-3">
                    <div className="flex items-center gap-2 text-[#16402A] font-extrabold text-sm font-heading">
                      <MapPin className="w-4 h-4 text-[#CFA13A]" />
                      <span>1. Salem Delivery Address</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Salem Service Area
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Recipient full name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Contact Phone (10 digits) *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Delivery phone number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Door / Street Address *</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={e => setAddressLine(e.target.value)}
                      placeholder="Door no, building name, street name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Area / Locality *</label>
                      <select
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden cursor-pointer"
                      >
                        <option value="Shevapet">Shevapet</option>
                        <option value="Fairlands">Fairlands</option>
                        <option value="Suramangalam">Suramangalam</option>
                        <option value="Hasthampatti">Hasthampatti</option>
                        <option value="Ammapet">Ammapet</option>
                        <option value="Gugai">Gugai</option>
                        <option value="Alagapuram">Alagapuram</option>
                        <option value="Meyyanur">Meyyanur</option>
                        <option value="Kondalampatti">Kondalampatti</option>
                        <option value="Salem Town">Salem Town</option>
                        <option value="Other Salem Area">Other Salem Area</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">City *</label>
                      <input
                        type="text"
                        disabled
                        value="Salem"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-gray-100 text-xs text-[#5A5A5A] cursor-not-allowed font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">Salem Pincode *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        placeholder="636002"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#2B2B2B] focus:bg-white outline-hidden font-mono ${
                          !isSalemPincode && cleanPincode.length === 6
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-[#F0EBDD] bg-[#FAF8F2] focus:border-[#205A3B]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Non-Salem warning */}
                  {!isSalemPincode && cleanPincode.length === 6 && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Sorry, orders are currently available only within Salem.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Leave with security, or call before arrival"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs text-[#2B2B2B] focus:bg-white focus:border-[#205A3B] outline-hidden"
                    />
                  </div>
                </div>

                {/* 2. Payment Method — Cash on Delivery Only */}
                <div className="rounded-3xl bg-white border border-[#F0EBDD] p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[#16402A] font-extrabold text-sm font-heading border-b border-[#F0EBDD] pb-3">
                    <CreditCard className="w-4 h-4 text-[#CFA13A]" />
                    <span>2. Payment Method</span>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-[#205A3B] bg-[#205A3B]/5 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-[#205A3B] focus:ring-[#205A3B]"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#16402A]">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-[#5A5A5A] mt-0.5">Pay in cash when items are delivered to your doorstep</p>
                      </div>
                    </label>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#205A3B] text-white">
                      COD Only
                    </span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Authoritative Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white border border-[#F0EBDD] p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="font-extrabold text-base text-[#16402A] font-heading border-b border-[#F0EBDD] pb-3">
                Order Summary ({cartItems.length} items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
                {cartItems.map((item, idx) => {
                  const itemPrice = Number(item.unitPrice) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const itemSubtotal = itemPrice * itemQty;
                  return (
                    <div key={item.id || idx} className="flex justify-between items-start gap-2 pb-2 border-b border-[#F0EBDD]/60">
                      <div className="flex-1">
                        <p className="font-bold text-[#2B2B2B]">{item.productName || item.name}</p>
                        <p className="text-[11px] text-[#5A5A5A]">
                          {itemQty} {item.unit || 'unit'} &times; {formatPrice(itemPrice)}
                          <span className="ml-1.5 uppercase font-bold text-[10px] text-[#CFA13A]">
                            ({item.pricingMode || 'retail'})
                          </span>
                        </p>
                      </div>
                      <span className="font-bold text-[#16402A]">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal, Delivery Fee & Total Calculation */}
              <div className="pt-2 space-y-2 text-xs border-t border-[#F0EBDD]">
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#2B2B2B]">{formatPrice(calculatedSubtotal)}</span>
                </div>

                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Delivery Fee (Salem)</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'font-semibold text-[#2B2B2B]'}>
                    {deliveryFee === 0 ? 'FREE (Salem)' : formatPrice(deliveryFee)}
                  </span>
                </div>

                {/* Expected Delivery Date Highlight (Requirement #6) */}
                <div className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#16402A]">
                    <Clock className="w-3.5 h-3.5 text-[#205A3B]" />
                    <span>Estimated Delivery:</span>
                  </div>
                  <p className="text-xs font-extrabold text-[#205A3B]">
                    Tomorrow ({formattedDeliveryDate})
                  </p>
                  <p className="text-[10px] text-[#5A5A5A]">
                    Direct dispatch from Salem mill for peak grain freshness.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F0EBDD] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#16402A]">Final Total</span>
                  <span className="text-2xl font-extrabold text-[#16402A] font-heading">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Button */}
              {isAuthenticated ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isPlacingOrder || !isShopOpen || !isWithinHours || (!isSalemPincode && cleanPincode.length === 6)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Order...</span>
                    </>
                  ) : (
                    <span>Place Order ({formatPrice(totalAmount)})</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const authBox = document.querySelector('form');
                    authBox?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#CFA13A] hover:bg-[#DFBA5C] text-[#16402A] font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login Above to Complete Order</span>
                </button>
              )}

              <div className="pt-2 border-t border-[#F0EBDD] flex items-center gap-2 text-[11px] text-[#5A5A5A]">
                <ShieldCheck className="w-4 h-4 text-[#205A3B] shrink-0" />
                <span>Genuine weight verification &amp; certified grain hygiene.</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default Checkout;
