import React, { useState } from 'react';
import { Users, Search, Phone, MapPin, Building2, ShieldCheck, Mail } from 'lucide-react';
import { User, Order } from '../../types';

interface AdminCustomersProps {
  customers: User[];
  orders: Order[];
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers, orders }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.businessName && c.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#F0EBDD] shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name, phone, business..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-[#FAF8F2] border border-[#F0EBDD] outline-hidden"
          />
        </div>

        <span className="text-xs font-bold text-[#16402A]">
          Registered Customers: {customers.length}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#F0EBDD] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F0EBDD] text-gray-500 font-bold bg-[#FAF8F2]/60">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone &amp; Email</th>
                <th className="py-3 px-4">Business / Wholesale</th>
                <th className="py-3 px-4">Delivery Address</th>
                <th className="py-3 px-4">Order History</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBDD]">
              {filteredCustomers.map(customer => {
                const customerOrders = orders.filter(
                  o => o.customer.phone === customer.phone || o.customer.userId === customer._id
                );
                const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);

                return (
                  <tr key={customer._id} className="hover:bg-[#FAF8F2]/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#16402A] text-sm">{customer.name}</p>
                      <p className="text-[10px] text-gray-400">
                        Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#2B2B2B] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#205A3B]" />
                        <span>{customer.phone}</span>
                      </p>
                      {customer.email && (
                        <p className="text-gray-500 text-[11px]">{customer.email}</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {customer.businessName ? (
                        <div>
                          <p className="font-bold text-[#205A3B] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#CFA13A]" />
                            <span>{customer.businessName}</span>
                          </p>
                          <span className="text-[10px] font-bold text-[#CFA13A] uppercase">
                            Wholesale Buyer
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">Retail Household</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                      {customer.address ? (
                        <span>
                          {customer.address}, {customer.city}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not entered yet</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#16402A]">{customerOrders.length} orders</p>
                      <p className="text-[10px] text-gray-500">
                        Spent: ₹{totalSpent.toLocaleString('en-IN')}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          customer.role === 'ADMIN'
                            ? 'bg-[#16402A] text-[#DFBA5C]'
                            : 'bg-[#F0EBDD] text-[#16402A]'
                        }`}
                      >
                        {customer.role}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
