import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { Order } from '../types';
import {
  ArrowLeft,
  Clock,
  ShoppingBag,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface OrdersPageProps {
  onNavigate?: (path: string) => void;
}

export const Orders: React.FC<OrdersPageProps> = ({ onNavigate = () => {} }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t, isTamil } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getOrders();
      setOrders(data || []);
      if (data && data.length > 0) {
        setExpandedOrderId(data[0]._id || data[0].id || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading, isAuthenticated]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  // Status step helper for timeline
  const getTimelineSteps = (status: string, rejectionReason?: string) => {
    const norm = String(status || 'PENDING').trim().toUpperCase().replace(/[\s-]+/g, '_');

    if (norm === 'CANCELLED') {
      return [
        { key: 'PENDING', label: isTamil ? 'ஆர்டர் பதிவு செய்யப்பட்டது' : 'Order Placed', completed: true, active: false, icon: CheckCircle2, failed: false },
        {
          key: 'CANCELLED',
          label: isTamil ? 'ஆர்டர் ரத்து செய்யப்பட்டது' : 'Order Cancelled',
          completed: false,
          active: true,
          failed: true,
          icon: XCircle,
          reason: rejectionReason || (isTamil ? 'கடையால் நிராகரிக்கப்பட்டது' : 'Order was not accepted / cancelled'),
        },
      ];
    }

    const steps = [
      { key: 'PENDING', label: isTamil ? 'ஆர்டர் பதிவு செய்யப்பட்டது' : 'Order Placed', icon: Clock },
      { key: 'CONFIRMED', label: isTamil ? 'ஆர்டர் ஏற்கப்பட்டது' : 'Order Accepted', icon: CheckCircle2 },
      { key: 'PROCESSING', label: isTamil ? 'தயாராகிறது' : 'Processing', icon: Package },
      { key: 'OUT_FOR_DELIVERY', label: isTamil ? 'டெலிவரிக்கு புறப்பட்டது' : 'Out for Delivery', icon: Truck },
      { key: 'DELIVERED', label: isTamil ? 'டெலிவரி செய்யப்பட்டது' : 'Delivered', icon: CheckCircle2 },
    ];

    const orderIndex = steps.findIndex(s => s.key === norm);
    const currentIndex = orderIndex > -1 ? orderIndex : 0;

    return steps.map((s, idx) => ({
      ...s,
      completed: idx < currentIndex,
      active: idx === currentIndex,
      failed: false,
    }));
  };

  // Unauthenticated State
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="w-full py-12 px-4">
        <PageContainer variant="narrow">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#F0EBDD] p-8 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#16402A] font-heading">
              {isTamil ? 'ஆர்டர்களை காண உள்நுழையவும்' : 'Sign in to view your orders'}
            </h2>
            <p className="text-xs text-[#5A5A5A]">
              Log into your Salem customer account to track active delivery dispatches and view historical receipts.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/login?redirect=/orders')}
                className="w-full py-3 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="w-full py-6 sm:py-10">
      <PageContainer variant="narrow">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205A3B] hover:text-[#16402A] cursor-pointer mb-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16402A] font-heading">
              {isTamil ? 'உங்கள் ஆர்டர்கள்' : 'Your Orders'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5A5A]">
              Real-time delivery progress and receipt details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl border border-[#F0EBDD] bg-white hover:bg-[#FAF8F2] text-[#205A3B] transition cursor-pointer"
            title="Refresh Orders"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#205A3B] mx-auto" />
            <p className="text-xs text-[#5A5A5A]">Fetching latest order status...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty Orders State */}
        {!loading && orders.length === 0 && (
          <div className="rounded-3xl bg-white border border-[#F0EBDD] p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center justify-center mx-auto text-[#205A3B]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#16402A] font-heading">
              No orders placed yet
            </h3>
            <p className="text-xs text-[#5A5A5A] max-w-sm mx-auto leading-relaxed">
              When you place an order for direct-mill Salem Ponni rice or daily provisions, live dispatch tracking will appear here.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="px-6 py-2.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-2 mx-auto shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => {
              const orderId = order._id || order.id || '';
              const isExpanded = expandedOrderId === orderId;
              const steps = getTimelineSteps(order.status, (order as any).rejectionReason);
              const orderStatusNorm = String(order.status || 'PENDING').trim().toUpperCase().replace(/[\s-]+/g, '_');
              const statusDisplay = orderStatusNorm === 'OUT_FOR_DELIVERY' ? 'OUT FOR DELIVERY' : (order.status || orderStatusNorm);

              return (
                <div
                  key={orderId}
                  className="rounded-3xl bg-white border border-[#F0EBDD] shadow-xs overflow-hidden transition"
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(orderId)}
                    className="p-5 sm:p-6 bg-[#FAF8F2]/60 border-b border-[#F0EBDD] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F2]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-[#16402A] font-heading">
                          Order #{order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            orderStatusNorm === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : orderStatusNorm === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : orderStatusNorm === 'OUT_FOR_DELIVERY'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : orderStatusNorm === 'PROCESSING'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : orderStatusNorm === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {statusDisplay}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A5A5A] mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-base sm:text-lg font-extrabold text-[#16402A]">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          {order.items?.length || 1} items &bull; {order.pricingMode || 'retail'}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Requirement #18: TIMELINE */}
                    <div>
                      <h4 className="text-xs font-bold text-[#16402A] font-heading mb-4 uppercase tracking-wider">
                        Delivery Progress Timeline
                      </h4>

                      <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-2">
                        {steps.map((step, idx) => {
                          const Icon = step.icon;
                          const isDone = step.completed;
                          const isCurrent = step.active;
                          const isFail = step.failed;

                          return (
                            <div key={idx} className="flex-1 flex sm:flex-col items-center gap-3 sm:gap-2 relative">
                              {/* Step circle */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                                  isFail
                                    ? 'bg-rose-600 text-white'
                                    : isDone || (isCurrent && step.key === 'DELIVERED')
                                    ? 'bg-emerald-600 text-white font-bold'
                                    : isCurrent
                                    ? 'bg-[#205A3B] text-white ring-4 ring-[#205A3B]/20 font-bold'
                                    : 'bg-white text-gray-300 border-2 border-dashed border-gray-300'
                                }`}
                              >
                                {isDone || (isCurrent && step.key === 'DELIVERED') ? (
                                  <span className="text-sm font-bold">&check;</span>
                                ) : isCurrent ? (
                                  <span className="text-xs font-bold">&bull;</span>
                                ) : (
                                  <span className="text-xs font-medium text-gray-400">&cir;</span>
                                )}
                              </div>

                              {/* Label */}
                              <div className="sm:text-center">
                                <p
                                  className={`text-xs font-bold flex items-center sm:justify-center gap-1 ${
                                    isFail
                                      ? 'text-rose-600'
                                      : isCurrent
                                      ? 'text-[#16402A]'
                                      : isDone
                                      ? 'text-emerald-700'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  <span>{isDone ? '✓ ' : isCurrent ? '▶ ' : '○ '}</span>
                                  <span>{step.label}</span>
                                </p>
                                {(step as any).reason && (
                                  <p className="text-[11px] text-rose-700 mt-0.5 font-medium">
                                    {(step as any).reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Estimated Delivery Banner (Requirement #6) */}
                    {(order as any).estimatedDeliveryDate && orderStatusNorm !== 'DELIVERED' && orderStatusNorm !== 'CANCELLED' && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] flex items-center gap-2.5 text-xs text-[#16402A]">
                        <Calendar className="w-4 h-4 text-[#205A3B] shrink-0" />
                        <div>
                          <span className="font-bold">Estimated Doorstep Delivery: </span>
                          <span className="font-semibold text-[#205A3B]">{(order as any).estimatedDeliveryDate}</span>
                        </div>
                      </div>
                    )}

                    {/* Expandable Order Details */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-[#F0EBDD] space-y-4">
                        {/* Ordered Items Table */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Purchased Products
                          </h5>
                          <div className="divide-y divide-[#F0EBDD] text-xs">
                            {order.items?.map((item: any, iIdx: number) => {
                              const itemName = typeof item.name === 'object'
                                ? (isTamil ? item.name.ta || item.name.en : item.name.en)
                                : item.name;
                              const unitPrice = item.unitPrice || item.price || 0;
                              const qty = item.quantity || 1;
                              const sub = item.subtotal || unitPrice * qty;

                              return (
                                <div key={iIdx} className="py-2.5 flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-bold text-[#2B2B2B]">{itemName}</p>
                                    <p className="text-[11px] text-[#5A5A5A]">
                                      {qty} {typeof item.unit === 'object' ? item.unit.en : item.unit || 'unit'} &times; {formatPrice(unitPrice)}
                                      <span className="ml-1 uppercase text-[10px] text-[#CFA13A] font-bold">
                                        ({item.pricingMode || order.pricingMode || 'retail'})
                                      </span>
                                    </p>
                                  </div>
                                  <span className="font-bold text-[#16402A]">
                                    {formatPrice(sub)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Price & Payment Breakdown */}
                          <div className="pt-3 border-t border-[#F0EBDD] space-y-1.5 text-xs bg-[#FAF8F2]/60 p-3.5 rounded-xl">
                            <div className="flex justify-between text-[#5A5A5A]">
                              <span>Subtotal</span>
                              <span className="font-semibold text-[#2B2B2B]">
                                {formatPrice(order.subtotal || (order.total - (order.deliveryFee || order.deliveryCharge || 0)))}
                              </span>
                            </div>
                            <div className="flex justify-between text-[#5A5A5A]">
                              <span>Delivery Charge</span>
                              <span className="font-semibold text-[#2B2B2B]">
                                {(order.deliveryFee || order.deliveryCharge) ? formatPrice(order.deliveryFee || order.deliveryCharge || 0) : 'Free Delivery'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[#5A5A5A]">
                              <span>Payment Method</span>
                              <span className="font-bold text-[#16402A]">
                                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod || 'Cash on Delivery (COD)'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[#16402A] pt-1.5 border-t border-[#F0EBDD] font-extrabold text-sm">
                              <span>Total Amount</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Destination */}
                        <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD] text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#16402A] mb-1">
                            <MapPin className="w-3.5 h-3.5 text-[#CFA13A]" />
                            <span>Destination Address</span>
                          </div>
                          <p className="font-semibold text-[#2B2B2B]">
                            {order.deliveryAddress?.fullName || order.customer?.name} ({order.deliveryAddress?.phone || order.customer?.phone})
                          </p>
                          <p className="text-[#5A5A5A]">
                            {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.area}, Salem - {order.deliveryAddress?.pincode}
                          </p>
                          {order.notes && (
                            <p className="text-[11px] text-gray-500 italic mt-1">
                              Note: &ldquo;{order.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default Orders;
