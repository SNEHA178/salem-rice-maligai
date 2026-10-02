import { Router, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Settings } from '../models/Settings';
import { Notification } from '../models/Notification';
import { dbManager } from '../db';
import { isDbConnected } from '../config/db';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/authMiddleware';
import { calculateExpectedDelivery } from '../utils/deliveryTime';

export const orderRouter = Router();

// Permitted Order Status Transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
};

// GET /api/orders - Authenticated user orders (Customer: own only, Admin: all with filters)
orderRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const role = req.user?.role;
    const { status, search, limit } = req.query;

    if (isDbConnected()) {
      const filter: any = {};

      if (role !== 'ADMIN') {
        filter['customer.userId'] = userId;
      } else {
        if (status && status !== 'all' && status !== 'ALL') {
          filter.status = String(status).toUpperCase();
        }
        if (search && typeof search === 'string' && search.trim()) {
          const term = search.trim();
          filter.$or = [
            { orderNumber: new RegExp(term, 'i') },
            { 'customer.name': new RegExp(term, 'i') },
            { 'customer.phone': new RegExp(term, 'i') },
            { 'deliveryAddress.fullName': new RegExp(term, 'i') },
          ];
        }
      }

      const query = Order.find(filter).sort({ createdAt: -1 });
      if (limit) {
        query.limit(Number(limit));
      }
      const orders = await query;
      return res.json(orders);
    } else {
      const allOrders = await dbManager.getOrders();
      let filtered = allOrders;

      if (role !== 'ADMIN') {
        filtered = filtered.filter(o => o.customer?.userId === userId);
      } else {
        if (status && status !== 'all' && status !== 'ALL') {
          filtered = filtered.filter(o => String(o.status).toUpperCase() === String(status).toUpperCase());
        }
        if (search && typeof search === 'string' && search.trim()) {
          const s = search.trim().toLowerCase();
          filtered = filtered.filter(o =>
            (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
            (o.customer?.name && o.customer.name.toLowerCase().includes(s)) ||
            (o.customer?.phone && o.customer.phone.includes(s))
          );
        }
      }

      return res.json(filtered);
    }
  } catch (error: any) {
    console.error('[Orders API] Fetch error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to retrieve orders.' });
  }
});

// GET /api/orders/:id - Customer own order or Admin
orderRouter.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    const role = req.user?.role;

    let order: any = null;

    if (isDbConnected()) {
      if (id.startsWith('SRM-')) {
        order = await Order.findOne({ orderNumber: id });
      } else {
        order = await Order.findById(id).catch(() => null) || await Order.findOne({ orderNumber: id });
      }
    } else {
      order = await dbManager.getOrderById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Role ownership check: Customers can ONLY see their own orders
    if (role !== 'ADMIN' && String(order.customer?.userId || '') !== String(userId || '')) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
});

// POST /api/orders - Real customer order creation with backend stock validation and price snapshotting
orderRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userRole = req.user?.role;
    const userName = req.user?.name || 'Customer';
    const userPhone = req.user?.phone || '';
    const userEmail = req.user?.email || '';

    const { items: clientItems, deliveryAddress, notes, customerPhone } = req.body;

    // Load store settings
    let storeSettings: any = null;
    if (isDbConnected()) {
      storeSettings = await Settings.findOne();
    } else {
      storeSettings = await dbManager.getSettings();
    }
    if (!storeSettings) {
      storeSettings = {
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
      };
    }

    // 1. Check Shop Availability (Requirement #7)
    if (storeSettings.shopStatus && storeSettings.shopStatus !== 'OPEN') {
      const msg = storeSettings.noticeEn || 'Orders are temporarily unavailable because the shop is closed.';
      return res.status(400).json({
        success: false,
        message: msg,
        shopStatus: storeSettings.shopStatus,
        noticeEn: storeSettings.noticeEn,
        noticeTa: storeSettings.noticeTa,
      });
    }

    // 2. Check Business Hours in Indian Standard Time (Requirement #5)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (3600000 * 5.5));
    const dayOfWeek = istTime.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const curHour = String(istTime.getHours()).padStart(2, '0');
    const curMin = String(istTime.getMinutes()).padStart(2, '0');
    const curTimeStr = `${curHour}:${curMin}`;

    let isWithinHours = true;
    if (dayOfWeek === 0) {
      // Sunday: 7:00 AM – 2:00 PM
      const sunOpen = storeSettings.sunOpen || '07:00';
      const sunClose = storeSettings.sunClose || '14:00';
      if (curTimeStr < sunOpen || curTimeStr > sunClose) isWithinHours = false;
    } else {
      // Monday – Saturday: 7:00 AM – 9:30 PM
      const monSatOpen = storeSettings.monSatOpen || '07:00';
      const monSatClose = storeSettings.monSatClose || '21:30';
      if (curTimeStr < monSatOpen || curTimeStr > monSatClose) isWithinHours = false;
    }

    if (!isWithinHours) {
      return res.status(400).json({
        success: false,
        message: 'Orders are currently closed. Please place your order during our shop hours (Mon-Sat 7:00 AM – 9:30 PM, Sun 7:00 AM – 2:00 PM).',
      });
    }

    // 3. Validate Cart items presence
    if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add products before checking out.',
      });
    }

    // 4. Validate Delivery Address presence
    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.addressLine || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'A complete delivery address is required.',
      });
    }

    // 5. Validate Salem-Only Delivery Area
    const cleanPincode = String(deliveryAddress.pincode || '').replace(/\D/g, '');
    const cleanCity = String(deliveryAddress.city || '').trim().toLowerCase();

    const allowedPincodes = Array.isArray(storeSettings.allowedPincodes) && storeSettings.allowedPincodes.length > 0
      ? storeSettings.allowedPincodes
      : ['636001', '636002', '636003', '636004', '636005', '636006', '636007', '636008', '636009', '636010', '636011', '636012', '636015', '636016', '636017', '636020', '636030', '636038', '636140'];

    const isPincodeSalem = cleanPincode.startsWith('636') || allowedPincodes.includes(cleanPincode);
    const isCitySalem = cleanCity === '' || cleanCity.includes('salem') || cleanCity.includes('சேலம்');

    if (!isPincodeSalem || !isCitySalem) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, orders are currently available only within Salem.',
      });
    }

    // 6. Validate Payment Method: Cash on Delivery (COD) Only
    const rawPaymentMethod = String(req.body.paymentMethod || 'COD').trim().toUpperCase();
    if (rawPaymentMethod !== 'COD' && rawPaymentMethod !== 'CASH ON DELIVERY') {
      return res.status(400).json({
        success: false,
        message: 'Currently, only Cash on Delivery (COD) is supported.',
      });
    }

    // 7. Process each line item with backend database verification
    const orderItems: any[] = [];
    let calculatedSubtotal = 0;
    const stockUpdates: { productId: string; deductQty: number; productDoc?: any }[] = [];

    for (const item of clientItems) {
      const pid = item.productId || item.id || item._id;
      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const requestedMode = String(item.pricingMode || 'retail').trim().toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';

      if (!pid) {
        return res.status(400).json({ success: false, message: 'Invalid product in order.' });
      }

      let product: any = null;
      if (isDbConnected()) {
        product = await Product.findById(pid);
      } else {
        product = await dbManager.getProductById(pid);
      }

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product is no longer available in the store catalog.`,
        });
      }

      // Check product active availability
      if (product.available === false) {
        const prodName = typeof product.name === 'object' ? product.name.en : product.name;
        return res.status(400).json({
          success: false,
          message: `"${prodName}" is currently unavailable.`,
        });
      }

      // Check stock availability
      const currentStock = typeof product.stock === 'number' ? product.stock : 50;
      if (currentStock < requestedQty) {
        const prodName = typeof product.name === 'object' ? product.name.en : product.name;
        return res.status(400).json({
          success: false,
          message: `Only ${currentStock} units left for "${prodName}". You requested ${requestedQty}.`,
        });
      }

      // Authoritative Wholesale minimum quantity check
      const minWholesale = Number(
        product.wholesaleMinimumQuantity !== undefined &&
        product.wholesaleMinimumQuantity !== null &&
        product.wholesaleMinimumQuantity !== ''
          ? product.wholesaleMinimumQuantity
          : 4
      );

      if (requestedMode === 'wholesale' && requestedQty < minWholesale) {
        return res.status(400).json({
          success: false,
          message: `Wholesale quantity must be at least ${minWholesale}.`,
        });
      }

      // Determine backend authorized unit price (never trust client price)
      const unitPrice = requestedMode === 'wholesale'
        ? Number(product.wholesalePrice !== undefined && product.wholesalePrice !== null ? product.wholesalePrice : product.retailPrice)
        : Number(product.retailPrice || 0);

      const lineSubtotal = unitPrice * requestedQty;
      calculatedSubtotal += lineSubtotal;

      // Extract bilingual product name snapshot
      const snapshotName = typeof product.name === 'object'
        ? { en: product.name.en || '', ta: product.name.ta || product.name.en || '' }
        : { en: product.name || '', ta: product.tamilName || product.name || '' };

      const snapshotUnit = typeof product.unit === 'object'
        ? { en: product.unit.en || 'kg', ta: product.unit.ta || 'கிலோ' }
        : { en: product.unit || 'kg', ta: product.unit === 'kg' ? 'கிலோ' : product.unit || 'கிலோ' };

      orderItems.push({
        productId: pid,
        name: snapshotName,
        image: product.image || '',
        unit: snapshotUnit,
        pricingMode: requestedMode,
        unitPrice,
        price: unitPrice,
        quantity: requestedQty,
        subtotal: lineSubtotal,
      });

      stockUpdates.push({ productId: pid, deductQty: requestedQty, productDoc: product });
    }

    // 4. Delivery charge & Total calculations using dynamic settings
    const deliveryCharge = Number(storeSettings.deliveryCharge || 0);
    const freeThresh = Number(storeSettings.freeDeliveryThreshold || 0);
    const deliveryFee = (freeThresh > 0 && calculatedSubtotal >= freeThresh) ? 0 : deliveryCharge;
    const total = calculatedSubtotal + deliveryFee;

    // 5. Generate human-readable order number & calculate Expected Delivery (Requirements #19, #20)
    const orderNumber = `SRM-${Date.now().toString().slice(-6)}`;
    const deliveryCalc = calculateExpectedDelivery(new Date(), storeSettings);
    const estimatedDeliveryDate = deliveryCalc.displayCustomer;

    // 6. Deduct stock safely
    if (isDbConnected()) {
      for (const update of stockUpdates) {
        await Product.findByIdAndUpdate(update.productId, {
          $inc: { stock: -update.deductQty },
        });
      }
    } else {
      for (const update of stockUpdates) {
        const current = update.productDoc.stock || 50;
        await dbManager.updateProduct(update.productId, {
          stock: Math.max(0, current - update.deductQty),
        });
      }
    }

    // 7. Determine overall order pricing mode
    const hasWholesale = orderItems.some(i => i.pricingMode === 'wholesale');
    const hasRetail = orderItems.some(i => i.pricingMode === 'retail');
    const orderPricingMode = (hasWholesale && hasRetail ? 'MIXED' : (hasWholesale ? 'wholesale' : 'retail')) as any;

    // 8. Create Order document
    const orderData = {
      orderNumber,
      customer: {
        userId,
        name: deliveryAddress.fullName || userName,
        phone: deliveryAddress.phone || userPhone || customerPhone || '8973203053',
        email: userEmail,
        address: `${deliveryAddress.addressLine || ''}, ${deliveryAddress.area || ''}`.trim(),
        city: deliveryAddress.city || 'Salem',
        pincode: deliveryAddress.pincode || '636002',
      },
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        addressLine: deliveryAddress.addressLine,
        area: deliveryAddress.area,
        city: deliveryAddress.city || 'Salem',
        state: deliveryAddress.state || 'Tamil Nadu',
        pincode: deliveryAddress.pincode,
        landmark: deliveryAddress.landmark || '',
      },
      customerPhone: deliveryAddress.phone || userPhone,
      items: orderItems,
      pricingMode: orderPricingMode,
      subtotal: calculatedSubtotal,
      deliveryCharge,
      deliveryFee,
      total,
      status: 'PENDING' as any,
      estimatedDeliveryDate,
      rejectionReason: '',
      notes: notes || '',
      paymentMethod: 'COD' as const,
      paymentStatus: 'PENDING',
      stockRestored: false,
    };

    let createdOrder: any = null;
    if (isDbConnected()) {
      createdOrder = await Order.create(orderData);
    } else {
      createdOrder = await dbManager.addOrder(orderData);
    }

    // 9. Create ADMIN Notification (Requirement #19)
    const adminNotif = {
      target: 'ADMIN',
      orderId: createdOrder._id ? createdOrder._id.toString() : createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      type: 'NEW_ORDER',
      title: 'New Order Received',
      message: `Order #${createdOrder.orderNumber} has been placed by ${createdOrder.customer?.name} (₹${createdOrder.total}).`,
    };
    if (isDbConnected()) {
      await Notification.create(adminNotif).catch(() => {});
    } else {
      await dbManager.addNotification(adminNotif).catch(() => {});
    }

    return res.status(201).json(createdOrder);
  } catch (error: any) {
    console.error('[Orders API] Order creation failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
    });
  }
});

// PATCH or PUT /api/orders/:id/status - Admin only status update with transition safety and customer notification
const updateOrderStatusHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, rejectionReason } = req.body;

    if (!targetStatus) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const normalizeStatus = (s: string): string => {
      return String(s || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
    };

    const cleanStatus = normalizeStatus(targetStatus);

    let order: any = null;
    if (isDbConnected()) {
      order = await Order.findById(id);
    } else {
      order = await dbManager.getOrderById(id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = normalizeStatus(order.status || 'PENDING');

    // Check if status is already the same
    if (currentStatus === cleanStatus) {
      return res.json(order);
    }

    // Terminal statuses cannot transition further
    if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Order #${order.orderNumber} is already ${currentStatus.toLowerCase()} and cannot be modified.`,
      });
    }

    // Validate status format against canonical enum
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${cleanStatus}. Permitted statuses: ${validStatuses.join(', ')}.`,
      });
    }

    // Enforce explicit status transitions (Requirement #4)
    if (!VALID_TRANSITIONS[currentStatus]?.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: cannot change order status from ${currentStatus} to ${cleanStatus}. Permitted next status: ${VALID_TRANSITIONS[currentStatus]?.join(', ') || 'None'}.`,
      });
    }

    // If transitioning to CANCELLED and stock hasn't been restored yet, restore product quantities!
    if (cleanStatus === 'CANCELLED' && !order.stockRestored && order.items && order.items.length) {
      for (const item of order.items) {
        if (item.productId && item.quantity) {
          if (isDbConnected()) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: item.quantity },
            });
          } else {
            const p = await dbManager.getProductById(item.productId);
            if (p) {
              await dbManager.updateProduct(item.productId, {
                stock: (p.stock || 0) + item.quantity,
              });
            }
          }
        }
      }
      order.stockRestored = true;
    }

    order.status = cleanStatus;
    if (cleanStatus === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    if (cleanStatus === 'CANCELLED' && rejectionReason) {
      order.rejectionReason = String(rejectionReason).trim();
    }

    let updatedOrder: any = null;
    if (isDbConnected()) {
      await order.save();
      updatedOrder = order;
    } else {
      updatedOrder = await dbManager.updateOrderStatus(id, cleanStatus as any);
      if (cleanStatus === 'DELIVERED' && updatedOrder) {
        updatedOrder.paymentStatus = 'PAID';
      }
      if (rejectionReason && updatedOrder) {
        updatedOrder.rejectionReason = String(rejectionReason).trim();
      }
    }

    // 10. Create CUSTOMER Notification (Requirement #20)
    const statusTitles: Record<string, { en: string; ta: string }> = {
      CONFIRMED: { en: 'Order Accepted', ta: 'ஆர்டர் ஏற்கப்பட்டது' },
      PROCESSING: { en: 'Order Being Prepared', ta: 'ஆர்டர் தயாராகிறது' },
      OUT_FOR_DELIVERY: { en: 'Out for Delivery', ta: 'டெலிவரிக்கு புறப்பட்டது' },
      DELIVERED: { en: 'Order Delivered', ta: 'ஆர்டர் டெலிவரி செய்யப்பட்டது' },
      CANCELLED: { en: 'Order Cancelled', ta: 'ஆர்டர் ரத்து செய்யப்பட்டது' },
    };

    const reasonText = rejectionReason ? ` Reason: ${rejectionReason}` : '';
    const reasonTextTa = rejectionReason ? ` காரணம்: ${rejectionReason}` : '';

    const statusMsgs: Record<string, { en: string; ta: string }> = {
      CONFIRMED: {
        en: 'Your order has been accepted by Salem Rice & Maligai.',
        ta: 'உங்கள் ஆர்டர் சேலம் அரிசி & மளிகையால் ஏற்றுக்கொள்ளப்பட்டது.',
      },
      PROCESSING: {
        en: 'Your order is being prepared for dispatch.',
        ta: 'உங்கள் ஆர்டர் டெலிவரிக்கு தயார் செய்யப்படுகிறது.',
      },
      OUT_FOR_DELIVERY: {
        en: `Your order #${order.orderNumber} is out for delivery to your Salem doorstep.`,
        ta: `உங்கள் ஆர்டர் #${order.orderNumber} டெலிவரிக்கு புறப்பட்டுள்ளது.`,
      },
      DELIVERED: {
        en: 'Your order has been safely delivered. Thank you for shopping with us!',
        ta: 'உங்கள் ஆர்டர் வெற்றிகரமாக டெலிவரி செய்யப்பட்டது. நன்றி!',
      },
      CANCELLED: {
        en: `Your order was not accepted / has been cancelled.${reasonText}`,
        ta: `உங்கள் ஆர்டர் ரத்து செய்யப்பட்டது.${reasonTextTa}`,
      },
    };

    const custNotif = {
      target: 'CUSTOMER',
      userId: order.customer?.userId,
      orderId: order._id ? order._id.toString() : order.id,
      orderNumber: order.orderNumber,
      type: 'ORDER_STATUS_CHANGED',
      title: statusTitles[cleanStatus] || { en: `Order ${cleanStatus}`, ta: `ஆர்டர் ${cleanStatus}` },
      message: statusMsgs[cleanStatus] || { en: `Order #${order.orderNumber} status is now ${cleanStatus}`, ta: `ஆர்டர் #${order.orderNumber} ${cleanStatus}` },
    };

    if (isDbConnected()) {
      await Notification.create(custNotif).catch(() => {});
    } else {
      await dbManager.addNotification(custNotif).catch(() => {});
    }

    return res.json(updatedOrder);
  } catch (error: any) {
    console.error(`[API ERROR]\nMETHOD: PATCH/PUT\nURL: /api/orders/${req.params.id}/status\nSTATUS: 500\nMESSAGE: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

orderRouter.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatusHandler);
orderRouter.put('/:id/status', requireAuth, requireAdmin, updateOrderStatusHandler);

export default orderRouter;
