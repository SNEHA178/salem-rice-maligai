import React from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, Phone, MapPin, ArrowRight } from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { Order, OrderStatus } from '../../types';

interface OrdersPageProps {
  orders: Order[];
  confirmedOrder?: Order | null;
  onContinueShopping: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  confirmedOrder,
  onContinueShopping,
}) => {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    Pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Confirmed: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    Processing: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    'Out for Delivery': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Cancelled: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    PROCESSING: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
    OUT_FOR_DELIVERY: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  };

  return (
    <PageContainer className="py-6 sm:py-10 space-y-6">
      {/* 1. If an order was just confirmed, show attractive order confirmation banner (Requirement #13) */}
      {confirmedOrder && (
        <div
          id="order-confirmation-success-card"
          className="p-6 sm:p-8 rounded-3xl bg-[#16402A] text-white border border-[#CFA13A]/40 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#CFA13A] text-[#16402A] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#DFBA5C]">
                Order Confirmed
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                Thank you for choosing Salem Rice &amp; Maligai!
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-200 max-w-xl">
            Your order <strong>#{confirmedOrder.orderNumber}</strong> has been received by our store team.
            We are preparing the items with authentic mill quality.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs">
            <div className="bg-[#205A3B] px-3.5 py-2 rounded-xl border border-[#CFA13A]/30">
              <span className="text-gray-300 block text-[10px]">Order Number</span>
              <span className="font-bold text-white text-sm">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="bg-[#205A3B] px-3.5 py-2 rounded-xl border border-[#CFA13A]/30">
              <span className="text-gray-300 block text-[10px]">Total Amount Due</span>
              <span className="font-bold text-[#DFBA5C] text-sm">
                ₹{confirmedOrder.total.toLocaleString('en-IN')} ({confirmedOrder.paymentMethod})
              </span>
            </div>
            <div className="bg-[#205A3B] px-3.5 py-2 rounded-xl border border-[#CFA13A]/30">
              <span className="text-gray-300 block text-[10px]">Delivery To</span>
              <span className="font-bold text-white text-sm truncate max-w-[200px]">
                {confirmedOrder.customer.address}, {confirmedOrder.customer.city}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Order History List (Requirement #14) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#16402A] font-heading">
            Order History
          </h2>
          <p className="text-xs text-gray-500">
            Track status and details of your previous orders
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="text-xs sm:text-sm font-bold text-[#205A3B] hover:text-[#16402A] transition"
        >
          Shop More &rarr;
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#F0EBDD] shadow-xs">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#16402A]">No orders placed yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-6">
            When you checkout Ponni rice or groceries, your historical orders and status tracking will appear here.
          </p>
          <button
            onClick={onContinueShopping}
            className="px-6 py-2.5 rounded-xl bg-[#205A3B] hover:bg-[#16402A] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusConfig = statusColors[order.status] || statusColors.Pending;
            const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-[#F0EBDD] hover:border-[#CFA13A]/50 transition shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBDD]">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-[#16402A]">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[10px] font-semibold bg-[#F0EBDD] text-[#16402A] px-2 py-0.5 rounded-md">
                      {order.pricingMode} MODE
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {dateFormatted}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover bg-[#FAF8F2] border border-[#F0EBDD]"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#2B2B2B] truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500">
                            Qty: {item.quantity} {item.unit} &bull; {item.pricingMode} @ ₹{item.price}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-[#16402A] shrink-0">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="pt-3 border-t border-[#F0EBDD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#205A3B]" />
                    <span className="truncate max-w-sm">
                      {order.customer.address}, {order.customer.city}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 self-end sm:self-auto">
                    <span className="text-gray-500">Total:</span>
                    <span className="text-lg font-extrabold text-[#16402A]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({order.paymentMethod})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
