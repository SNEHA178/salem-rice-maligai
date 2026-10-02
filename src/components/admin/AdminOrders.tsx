import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  Calendar,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatOrderTimeIST, formatOrderDateTimeIST } from '../../utils/deliveryTime';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: OrderStatus, rejectionReason?: string) => Promise<void>;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateOrderStatus }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Reject modal state
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: { label: string; value: string }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const norm = (s: string) => String(s || '').trim().toUpperCase().replace(/[\s-]+/g, '_');

  const formatStatusLabel = (status: string) => {
    const n = norm(status);
    switch (n) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'PROCESSING':
        return 'Processing';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(o => {
    const s = norm(o.status);
    const matchesStatus = filterStatus === 'ALL' || s === norm(filterStatus);
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customer?.phone && o.customer.phone.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    setIsSubmitting(true);
    try {
      await onUpdateOrderStatus(rejectModalOrder._id || rejectModalOrder.id || '', 'CANCELLED', rejectReason.trim() || undefined);
      setRejectModalOrder(null);
      setRejectReason('');
      if (selectedOrder && (selectedOrder._id === rejectModalOrder._id || selectedOrder.id === rejectModalOrder.id)) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'CANCELLED' as any, rejectionReason: rejectReason } : null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#F0EBDD] shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, customer name, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-[#FAF8F2] border border-[#F0EBDD] focus:border-[#205A3B] outline-hidden"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-[#FAF8F2] border border-[#F0EBDD] font-bold outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            {statuses.map(s => (
              <option key={s.value} value={s.value}>
                {s.label} ({orders.filter(o => norm(o.status) === s.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F0EBDD] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F0EBDD] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#16402A] font-heading">
            Store Orders ({filteredOrders.length})
          </h3>
          <span className="text-xs text-gray-500">
            Accept, prepare, and dispatch orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F0EBDD] text-gray-500 font-bold bg-[#FAF8F2]/60">
                <th className="py-3 px-4">Order ID &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Pricing Mode</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-center">Action</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBDD]">
              {filteredOrders.map(order => {
                const orderId = order._id || order.id || '';
                const s = norm(order.status);
                return (
                  <tr key={orderId} className="hover:bg-[#FAF8F2]/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-[#16402A] text-sm">#{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400">
                        {order.createdAt ? formatOrderDateTimeIST(order.createdAt) : 'Recent'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#2B2B2B]">{order.customer?.name}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#205A3B]" />
                        <span>{order.customer?.phone}</span>
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#F0EBDD] text-[#16402A]">
                        {order.pricingMode || 'retail'}
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        {order.items?.length || 1} products
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-extrabold text-[#16402A] text-sm">
                        ₹{Number(order.total || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-500">{order.paymentMethod || 'COD'}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          s === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : s === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : s === 'OUT_FOR_DELIVERY'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : s === 'PROCESSING'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : s === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>

                    {/* Order Workflow Actions */}
                    <td className="py-3 px-4 text-center">
                      {s === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateOrderStatus(orderId, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                          >
                            Accept Order
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModalOrder(order);
                              setRejectReason('');
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : s === 'CONFIRMED' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(orderId, 'PROCESSING')}
                          className="px-2.5 py-1 rounded-lg bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Mark Processing &rarr;
                        </button>
                      ) : s === 'PROCESSING' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(orderId, 'OUT_FOR_DELIVERY')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Out for Delivery &rarr;
                        </button>
                      ) : s === 'OUT_FOR_DELIVERY' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(orderId, 'DELIVERED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Mark Delivered &check;
                        </button>
                      ) : s === 'DELIVERED' ? (
                        <span className="text-[11px] text-emerald-700 font-bold">Delivered</span>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-bold">Cancelled</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-[#F0EBDD] hover:bg-[#FAF8F2] text-[#16402A] font-bold text-xs border border-[#CFA13A]/40 transition cursor-pointer"
                      >
                        View Items
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Order Reason Modal (Requirement #17) */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#F0EBDD] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#16402A] font-heading">
                  Reject / Cancel Order #{rejectModalOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Customer: {rejectModalOrder.customer?.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to decline this order? The customer will receive an immediate cancellation notification, and reserved stock will be automatically restored.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#2B2B2B] mb-1">
                Optional Reason for Rejection
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Delivery address outside service perimeter, or item stock shortage"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0EBDD] bg-[#FAF8F2] text-xs outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Order Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal with Real Line Items & Customer Details (Requirement #16) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0EBDD] overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 bg-[#FAF8F2] border-b border-[#F0EBDD] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#16402A] font-heading">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#F0EBDD]">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Customer Information
                  </span>
                  <p className="font-bold text-sm text-[#16402A] mt-1">{selectedOrder.customer?.name}</p>
                  <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[#205A3B]" />
                    <span>{selectedOrder.customer?.phone}</span>
                  </p>
                  {selectedOrder.customer?.email && (
                    <p className="text-gray-500 text-xs">{selectedOrder.customer.email}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Salem Delivery Address
                  </span>
                  <p className="font-semibold text-[#2B2B2B] mt-1">
                    {selectedOrder.deliveryAddress?.fullName || selectedOrder.customer?.name}
                  </p>
                  <p className="text-gray-600 mt-0.5">
                    {selectedOrder.deliveryAddress?.addressLine}, {selectedOrder.deliveryAddress?.area}, Salem - {selectedOrder.deliveryAddress?.pincode}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-gray-500 text-xs italic mt-1">
                      Note: &ldquo;{selectedOrder.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Order Time, Expected Delivery, & Current Status (Requirement #22) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#F0EBDD] flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-[#205A3B] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Time</span>
                    <p className="font-extrabold text-xs text-[#16402A]">
                      {selectedOrder.createdAt ? formatOrderTimeIST(selectedOrder.createdAt) : 'N/A'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#F0EBDD] flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#CFA13A] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Expected Delivery</span>
                    <p className="font-bold text-xs text-[#16402A]">
                      {(selectedOrder as any).estimatedDeliveryDate || 'Tomorrow morning'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#F0EBDD] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        norm(selectedOrder.status) === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : norm(selectedOrder.status) === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : norm(selectedOrder.status) === 'OUT_FOR_DELIVERY'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : norm(selectedOrder.status) === 'PROCESSING'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : norm(selectedOrder.status) === 'CONFIRMED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {formatStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="mt-2">
                    {norm(selectedOrder.status) === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            const oId = selectedOrder._id || selectedOrder.id || '';
                            await onUpdateOrderStatus(oId, 'CONFIRMED');
                            setSelectedOrder(prev => prev ? { ...prev, status: 'CONFIRMED' as any } : null);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition text-center"
                        >
                          Accept Order
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalOrder(selectedOrder);
                            setRejectReason('');
                          }}
                          className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition text-center"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {norm(selectedOrder.status) === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const oId = selectedOrder._id || selectedOrder.id || '';
                          await onUpdateOrderStatus(oId, 'PROCESSING');
                          setSelectedOrder(prev => prev ? { ...prev, status: 'PROCESSING' as any } : null);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#205A3B] hover:bg-[#16402A] text-white font-bold text-xs cursor-pointer shadow-xs transition"
                      >
                        Mark Processing &rarr;
                      </button>
                    )}
                    {norm(selectedOrder.status) === 'PROCESSING' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const oId = selectedOrder._id || selectedOrder.id || '';
                          await onUpdateOrderStatus(oId, 'OUT_FOR_DELIVERY');
                          setSelectedOrder(prev => prev ? { ...prev, status: 'OUT_FOR_DELIVERY' as any } : null);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                      >
                        Out for Delivery &rarr;
                      </button>
                    )}
                    {norm(selectedOrder.status) === 'OUT_FOR_DELIVERY' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const oId = selectedOrder._id || selectedOrder.id || '';
                          await onUpdateOrderStatus(oId, 'DELIVERED');
                          setSelectedOrder(prev => prev ? { ...prev, status: 'DELIVERED' as any } : null);
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                      >
                        Mark Delivered &check;
                      </button>
                    )}
                    {norm(selectedOrder.status) === 'DELIVERED' && (
                      <span className="text-[11px] font-bold text-emerald-700">Delivered</span>
                    )}
                    {norm(selectedOrder.status) === 'CANCELLED' && (
                      <span className="text-[11px] font-bold text-rose-600">Cancelled</span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedOrder as any).rejectionReason && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <span className="font-bold">Cancellation Reason: </span>
                  <span>{(selectedOrder as any).rejectionReason}</span>
                </div>
              )}

              {/* Order Items List */}
              <div>
                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Line Items ({selectedOrder.items?.length || 1})
                </h4>
                <div className="rounded-2xl border border-[#F0EBDD] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F2] border-b border-[#F0EBDD] text-gray-500 font-bold">
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBDD]">
                      {selectedOrder.items?.map((item: any, idx: number) => {
                        const name = typeof item.name === 'object' ? item.name.en : item.name;
                        const unitPrice = item.unitPrice || item.price || 0;
                        const qty = item.quantity || 1;
                        const sub = item.subtotal || unitPrice * qty;

                        return (
                          <tr key={idx}>
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-[#2B2B2B]">{name}</p>
                              <span className="text-[10px] text-gray-400 uppercase">
                                {item.pricingMode || selectedOrder.pricingMode || 'retail'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">{qty}</td>
                            <td className="py-2.5 px-3 text-right font-medium">₹{unitPrice}</td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-[#16402A]">
                              ₹{sub.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#F0EBDD] bg-[#FAF8F2]/60 font-bold">
                        <td colSpan={3} className="py-2.5 px-3 text-right text-gray-600">
                          Final Order Total:
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm font-extrabold text-[#16402A]">
                          ₹{Number(selectedOrder.total || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
