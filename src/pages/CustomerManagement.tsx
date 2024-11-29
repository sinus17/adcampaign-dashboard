import React, { useState } from 'react';
import { FaPlus, FaEllipsisVertical, FaWhatsapp, FaTrash } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { Customer } from '../types/customer';

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="py-1" role="menu">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          role="menuitem"
        >
          <FaTrash className="w-4 h-4" />
          Delete Customer
        </button>
      </div>
    </div>
  );
};

function CustomerManagement() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data: customers = [], refetch } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const savedCustomers = localStorage.getItem('customers');
      return savedCustomers ? JSON.parse(savedCustomers) : [];
    }
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      await refetch();
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete customer');
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Customer Management</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
            <FaPlus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/50">
            <tr>
              <th className="px-6 py-3">Kontakt</th>
              <th className="px-6 py-3">Telefon</th>
              <th className="px-6 py-3">WhatsApp Group</th>
              <th className="px-6 py-3">Reports</th>
              <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-white/20 hover:bg-white/50">
                  <td className="px-6 py-4 font-medium">{customer.kontakt}</td>
                  <td className="px-6 py-4">{customer.telefon}</td>
                  <td className="px-6 py-4">
                    {customer.whatsappGroupLink ? (
                      <a
                        href={customer.whatsappGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        Open Group
                      </a>
                    ) : (
                      <span className="text-gray-400">No group link</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{customer.reportsCount}</td>
                  <td className="px-6 py-4 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === customer.id ? null : customer.id);
                      }}
                      className="p-2 hover:bg-white/50 rounded-full"
                    >
                      <FaEllipsisVertical className="w-4 h-4" />
                    </button>
                    <ActionMenu
                      isOpen={activeMenu === customer.id}
                      onClose={() => setActiveMenu(null)}
                      onDelete={() => handleDeleteCustomer(customer.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-white/20">
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No customers found. Customers will be automatically synced when added in Monday.com.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerManagement;