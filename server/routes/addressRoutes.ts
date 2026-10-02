import { Router, Response } from 'express';
import { User } from '../models/User';
import { isDbConnected } from '../config/db';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

export const addressRouter = Router();

// Validation helper for Indian mobile and pincode
function validateAddressData(body: any) {
  const errors: string[] = [];
  const { fullName, phone, addressLine, area, pincode } = body;

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    errors.push('Full name is required.');
  }

  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    errors.push('Valid 10-digit phone number is required.');
  }

  if (!addressLine || typeof addressLine !== 'string' || !addressLine.trim()) {
    errors.push('Address line is required.');
  }

  if (!area || typeof area !== 'string' || !area.trim()) {
    errors.push('Area / locality is required.');
  }

  const cleanPincode = String(pincode || '').replace(/\D/g, '');
  if (!cleanPincode || cleanPincode.length !== 6) {
    errors.push('Valid 6-digit Indian pincode is required (e.g. 636002).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      fullName: String(fullName || '').trim(),
      phone: cleanPhone.slice(-10),
      addressLine: String(addressLine || '').trim(),
      area: String(area || '').trim(),
      city: String(body.city || 'Salem').trim(),
      state: String(body.state || 'Tamil Nadu').trim(),
      pincode: cleanPincode,
      landmark: String(body.landmark || '').trim(),
      isDefault: Boolean(body.isDefault),
    },
  };
}

// In-memory fallback if MongoDB connection is pending
const localAddressesMap = new Map<string, any[]>();

// GET /api/addresses - Customer's saved addresses
addressRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      let addresses = user.addresses || [];

      // If user has no addresses yet, seed from their profile if address is provided
      if (addresses.length === 0 && user.address && user.phone) {
        const defaultAddr = {
          fullName: user.name || 'Valued Customer',
          phone: user.phone || '8973203053',
          addressLine: user.address || 'Shevapet',
          area: 'Shevapet Market',
          city: user.city || 'Salem',
          state: 'Tamil Nadu',
          pincode: user.pincode || '636002',
          landmark: 'Near Bazaar',
          isDefault: true,
        };
        user.addresses = [defaultAddr as any];
        await user.save();
        addresses = user.addresses;
      }

      return res.json(addresses);
    } else {
      let addrs = localAddressesMap.get(userId);
      if (!addrs || addrs.length === 0) {
        addrs = [
          {
            _id: `addr_${Date.now()}`,
            fullName: req.user?.name || 'Salem Customer',
            phone: req.user?.phone || '8973203053',
            addressLine: (req.user as any)?.address || '14/2 Bazaar Street, Shevapet',
            area: 'Shevapet',
            city: 'Salem',
            state: 'Tamil Nadu',
            pincode: '636002',
            landmark: 'Near Amman Kovil',
            isDefault: true,
          },
        ];
        localAddressesMap.set(userId, addrs);
      }
      return res.json(addrs);
    }
  } catch (error: any) {
    console.error('[Addresses API] Fetch error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve addresses.' });
  }
});

// POST /api/addresses - Create new delivery address
addressRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { isValid, errors, data } = validateAddressData(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (!user.addresses) {
        user.addresses = [];
      }

      if (data.isDefault) {
        user.addresses.forEach((a: any) => {
          a.isDefault = false;
        });
      } else if (user.addresses.length === 0) {
        data.isDefault = true;
      }

      user.addresses.push(data as any);
      await user.save();

      const created = user.addresses[user.addresses.length - 1];
      return res.status(201).json(created);
    } else {
      const addrs = localAddressesMap.get(userId) || [];
      if (data.isDefault) {
        addrs.forEach(a => {
          a.isDefault = false;
        });
      } else if (addrs.length === 0) {
        data.isDefault = true;
      }
      const newAddr = {
        _id: `addr_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addrs.push(newAddr);
      localAddressesMap.set(userId, addrs);
      return res.status(201).json(newAddr);
    }
  } catch (error: any) {
    console.error('[Addresses API] Create error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

// PUT /api/addresses/:id - Update delivery address
addressRouter.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const { id } = req.params;

    const { isValid, errors, data } = validateAddressData(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user || !user.addresses) {
        return res.status(404).json({ success: false, message: 'Address not found.' });
      }

      const target = user.addresses.id(id);
      if (!target) {
        return res.status(404).json({ success: false, message: 'Address not found.' });
      }

      if (data.isDefault) {
        user.addresses.forEach((a: any) => {
          a.isDefault = false;
        });
      }

      Object.assign(target, data);
      await user.save();
      return res.json(target);
    } else {
      const addrs = localAddressesMap.get(userId) || [];
      const index = addrs.findIndex(a => a._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Address not found.' });
      }

      if (data.isDefault) {
        addrs.forEach(a => {
          a.isDefault = false;
        });
      }

      addrs[index] = { ...addrs[index], ...data, updatedAt: new Date() };
      localAddressesMap.set(userId, addrs);
      return res.json(addrs[index]);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

// DELETE /api/addresses/:id - Delete delivery address
addressRouter.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const { id } = req.params;

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user || !user.addresses) {
        return res.status(404).json({ success: false, message: 'Address not found.' });
      }

      const addrIndex = user.addresses.findIndex((a: any) => a._id.toString() === id);
      if (addrIndex === -1) {
        return res.status(404).json({ success: false, message: 'Address not found.' });
      }

      user.addresses.splice(addrIndex, 1);
      await user.save();
      return res.json({ success: true, message: 'Address removed successfully.' });
    } else {
      const addrs = localAddressesMap.get(userId) || [];
      const filtered = addrs.filter(a => a._id !== id);
      localAddressesMap.set(userId, filtered);
      return res.json({ success: true, message: 'Address removed successfully.' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

export default addressRouter;
