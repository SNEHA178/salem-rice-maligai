import React, { useState } from 'react';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Phone, MapPin, User as UserIcon } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { CartItem, User, Order } from '../../types';

interface CheckoutPageProps {
  cart: CartItem[];
  user: User | null;
  onSubmitOrder: (orderData: {
    customer: {
      userId?: string;
      name: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      pincode: string;
    };
    items: any[];
    pricingMode: 'RETAIL' | 'WHOLESALE' | 'retail' | 'wholesale' | 'MIXED' | string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: 'COD' | 'UPI_ON_DELIVERY';
    notes?: string;
  }) => Promise<Order>;
  onBackToCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cart,
  user,
  onSubmitOrder,
  onBackToCart,
  onOrderSuccess,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Salem');
  const [pincode, setPincode] = useState(user?.pincode || '636001');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI_ON_DELIVERY'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice =
      item.pricingMode === 'WHOLESALE' ? item.product.wholesalePrice : item.product.retailPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 1000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + deliveryFee;

  // Determine pricing mode summary
  const modes = new Set(cart.map(i => i.pricingMode));
  const overallMode = modes.size === 1 ? Array.from(modes)[0] : 'MIXED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please enter your full name, phone number, and delivery address.');
      return;
    }

    if (phone.trim().length < 10) {
      setFormError('Please enter a valid 10-digit mobile number for delivery verification.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Preserve exact prices at checkout time (Requirement #27)
      const orderItems = cart.map(item => {
        const unitPrice =
          item.pricingMode === 'WHOLESALE' ? item.product.wholesalePrice : item.product.retailPrice;
        return {
          productId: item.productId,
          name: item.product.name,
          image: item.product.image,
          unit: item.product.unit,
          pricingMode: item.pricingMode,
          price: unitPrice,
          quantity: item.quantity,
          subtotal: unitPrice * item.quantity,
        };
      });

      const placedOrder = await onSubmitOrder({
        customer: {
          userId: user?._id,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          city: city.trim() || 'Salem',
          pincode: pincode.trim() || '636001',
        },
        items: orderItems,
        pricingMode: overallMode,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      onOrderSuccess(placedOrder);
    } catch (err: any) {
      setFormError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="py-6 sm:py-10 max-w-5xl">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <button
          onClick={onBackToCart}
          className="hover:text-[#205A3B] transition flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </button>
        <span>/</span>
        <span className="text-[#16402A] font-bold">Checkout</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading mb-2">
        Delivery &amp; Order Checkout
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-8">
        Salem local family delivery • Pay with Cash or UPI upon doorstep arrival
      </p>

      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#16402A] font-heading flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#205A3B]" />
              <span>Customer Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Karthik Raman"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                Email Address (Optional for invoice)
              </label>
              <input
                type="email"
                placeholder="e.g., yourname@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#16402A] font-heading flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#205A3B]" />
              <span>Delivery Address</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                House / Shop / Street Address *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Door No, Building Name, Street / Bazaar Area, Landmark..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2B2B] mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ring bell twice, deliver to kitchen store room, or morning delivery"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] focus:border-[#205A3B] text-sm bg-[#FAF8F2] outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#16402A] font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#205A3B]" />
              <span>Payment Option</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-[#205A3B] bg-[#205A3B]/5 ring-1 ring-[#205A3B]'
                    : 'border-[#F0EBDD] bg-[#FAF8F2]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-[#205A3B]"
                />
                <div>
                  <p className="text-xs font-bold text-[#16402A]">Cash on Delivery</p>
                  <p className="text-[10px] text-gray-500">Pay cash upon delivery</p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === 'UPI_ON_DELIVERY'
                    ? 'border-[#205A3B] bg-[#205A3B]/5 ring-1 ring-[#205A3B]'
                    : 'border-[#F0EBDD] bg-[#FAF8F2]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('UPI_ON_DELIVERY')}
                  className="accent-[#205A3B]"
                />
                <div>
                  <p className="text-xs font-bold text-[#16402A]">UPI on Delivery</p>
                  <p className="text-[10px] text-gray-500">GPay / PhonePe / Paytm QR</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#F0EBDD] shadow-xs space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-[#16402A] font-heading pb-3 border-b border-[#F0EBDD]">
              Order Items ({cart.length})
            </h3>

            {/* Itemized preview */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map(item => {
                const isWholesale = item.pricingMode === 'WHOLESALE';
                const unitPrice = isWholesale
                  ? item.product.wholesalePrice
                  : item.product.retailPrice;
                const lineTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.productId}-${item.pricingMode}`}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-[#2B2B2B] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {item.quantity} {item.product.unit}s &bull; {item.pricingMode} @ ₹{unitPrice}
                      </p>
                    </div>
                    <span className="font-bold text-[#16402A] shrink-0">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#F0EBDD] space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-[#2B2B2B]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Salem Delivery</span>
                <span className="font-bold">
                  {deliveryFee === 0 ? <span className="text-emerald-700">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#F0EBDD] flex justify-between items-baseline text-sm">
                <span className="font-bold text-[#16402A]">Total Due</span>
                <span className="text-2xl font-black text-[#16402A]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              id="confirm-place-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#205A3B] hover:bg-[#16402A] disabled:bg-gray-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#DFBA5C]" />
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
              <Truck className="w-3.5 h-3.5 text-[#205A3B]" />
              <span>You will receive immediate order confirmation</span>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};
