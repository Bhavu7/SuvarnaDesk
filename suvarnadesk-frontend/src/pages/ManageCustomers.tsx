import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdPeople,
  MdSearch,
  MdDelete,
  MdDownload,
  MdRefresh,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdReceipt,
  MdCalendarToday,
  MdAttachMoney,
} from "react-icons/md";
import { showToast } from "../components/CustomToast";
import apiClient from "../api/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  huid?: string;
  totalInvoices: number;
  totalAmount: number;
  firstPurchase: string;
  lastPurchase: string;
  invoices: Invoice[];
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  grandTotal: number;
  lineItems: LineItem[];
  customerSnapshot: {
    name: string;
    email: string;
    phone: string;
    address: string;
    huid?: string;
  };
  totals: {
    subtotal: number;
    CGSTPercent: number;
    CGSTAmount: number;
    SGSTPercent: number;
    SGSTAmount: number;
    totalGST: number;
    grandTotal: number;
  };
  shopSettings?: {
    shopName: string;
    gstNumber?: string;
  };
}

interface LineItem {
  itemType: string;
  purity: string;
  description: string;
  weight: {
    value: number;
    unit: string;
  };
  ratePerGram: number;
  labourChargeAmount: number;
  makingChargesTotal: number;
  otherCharges: number;
  itemTotal: number;
}

export default function ManageCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null
  );

  // Fetch customers and their invoices
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log("Fetching invoices from API...");

      const response = await apiClient.get("/invoices");
      console.log("API Response:", response.data);

      const invoices: Invoice[] = response.data || [];
      console.log("Invoices found:", invoices.length);

      // Group invoices by customer
      const customerMap = new Map<string, Customer>();

      invoices.forEach((invoice) => {
        const customerData = invoice.customerSnapshot;
        const customerKey =
          `${customerData.phone}-${customerData.email}`.toLowerCase();

        if (!customerMap.has(customerKey)) {
          customerMap.set(customerKey, {
            _id: customerKey, // Use customerKey as unique ID
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            huid: customerData.huid,
            totalInvoices: 0,
            totalAmount: 0,
            firstPurchase: invoice.date,
            lastPurchase: invoice.date,
            invoices: [],
          });
        }

        const customer = customerMap.get(customerKey)!;
        customer.totalInvoices += 1;
        customer.totalAmount += invoice.totals.grandTotal;
        customer.invoices.push(invoice);

        // Update first and last purchase dates
        if (new Date(invoice.date) < new Date(customer.firstPurchase)) {
          customer.firstPurchase = invoice.date;
        }
        if (new Date(invoice.date) > new Date(customer.lastPurchase)) {
          customer.lastPurchase = invoice.date;
        }
      });

      const customersArray = Array.from(customerMap.values());
      console.log("Customers grouped:", customersArray.length);
      setCustomers(customersArray);
      setFilteredCustomers(customersArray);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      showToast.error(
        "Failed to load customers: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.address &&
            customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  // Delete customer and all their invoices
  const deleteCustomer = async (customerId: string) => {
    try {
      // Find the customer
      const customer = customers.find((c) => c._id === customerId);
      if (!customer) {
        showToast.error("Customer not found");
        return;
      }

      // Delete all invoices for this customer
      const deletePromises = customer.invoices.map((invoice) =>
        apiClient.delete(`/invoices/${invoice._id}`)
      );

      await Promise.all(deletePromises);

      showToast.success(
        "Customer and all associated invoices deleted successfully"
      );
      setDeleteConfirm(null);
      fetchCustomers(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      showToast.error(
        "Failed to delete customer: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Download single invoice as text file
  const downloadInvoice = async (invoice: Invoice) => {
    try {
      setDownloadingInvoice(invoice._id);

      const invoiceText = `
INVOICE: ${invoice.invoiceNumber}
Date: ${formatDate(invoice.date)}
Customer: ${invoice.customerSnapshot.name}
Phone: ${invoice.customerSnapshot.phone}
Email: ${invoice.customerSnapshot.email || "N/A"}
Address: ${invoice.customerSnapshot.address || "N/A"}
HUID: ${invoice.customerSnapshot.huid || "N/A"}

ITEMS:
${invoice.lineItems
  .map(
    (item, index) => `
${index + 1}. ${item.itemType.toUpperCase()} ${item.purity}
   Description: ${item.description}
   Weight: ${item.weight.value} ${item.weight.unit}
   Rate: ₹${item.ratePerGram}/g
   Labour Charges: ₹${item.labourChargeAmount}
   Other Charges: ₹${item.otherCharges}
   Item Total: ₹${item.itemTotal}
`
  )
  .join("")}

SUMMARY:
Subtotal: ₹${invoice.totals.subtotal.toFixed(2)}
CGST (${invoice.totals.CGSTPercent}%): ₹${invoice.totals.CGSTAmount.toFixed(2)}
SGST (${invoice.totals.SGSTPercent}%): ₹${invoice.totals.SGSTAmount.toFixed(2)}
Total GST: ₹${invoice.totals.totalGST.toFixed(2)}
Grand Total: ₹${invoice.totals.grandTotal.toFixed(2)}

${invoice.shopSettings?.shopName || "JEWELRY COMMERCIAL INVOICE"}
${
  invoice.shopSettings?.gstNumber
    ? `GST: ${invoice.shopSettings.gstNumber}`
    : ""
}
Generated on: ${new Date().toLocaleDateString()}
      `.trim();

      const blob = new Blob([invoiceText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${
        invoice.invoiceNumber
      }_${invoice.customerSnapshot.name.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast.success(`Invoice ${invoice.invoiceNumber} downloaded`);
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      showToast.error(
        "Failed to download invoice: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state with proper LoadingSpinner usage
  if (loading) {
    return <LoadingSpinner text="Loading customers..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-6 bg-gray-50"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MdPeople className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Manage Customers
              </h1>
              <p className="text-gray-600">
                View and manage all your customers and their invoices
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={fetchCustomers}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <MdRefresh className="text-lg" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdPeople className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {customers.length}
                </div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdReceipt className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {customers.reduce(
                    (total, customer) => total + customer.totalInvoices,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MdAttachMoney className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    customers.reduce(
                      (total, customer) => total + customer.totalAmount,
                      0
                    )
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MdCalendarToday className="text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {customers.length > 0
                    ? formatDate(
                        customers.reduce(
                          (latest, customer) =>
                            new Date(customer.lastPurchase) > new Date(latest)
                              ? customer.lastPurchase
                              : latest,
                          customers[0].lastPurchase
                        )
                      )
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Last Purchase</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 mb-6 bg-white border border-gray-200 rounded-xl">
          <div className="relative">
            <MdSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search customers by name, phone, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Customers Count */}
        <div className="mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <MdPeople className="mx-auto mb-4 text-4xl text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                {customers.length === 0
                  ? "No customers found"
                  : "No matching customers"}
              </h3>
              <p className="mb-4 text-gray-600">
                {customers.length === 0
                  ? "No customers have been added yet. Create your first invoice to add customers."
                  : "No customers match your search criteria. Try different search terms."}
              </p>
              {customers.length === 0 && (
                <button
                  onClick={() => (window.location.href = "/billing")}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Create First Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                      Invoices
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                      Total Spent
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                      Last Purchase
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <motion.tr
                      key={customer._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <MdPerson className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {customer.huid && (
                              <div className="text-sm text-gray-500">
                                HUID: {customer.huid}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MdEmail className="text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {customer.email || "No email"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdPhone className="text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {customer.phone}
                            </span>
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-2">
                              <MdLocationOn className="text-gray-400" />
                              <span className="max-w-xs text-sm text-gray-600 truncate">
                                {customer.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Invoices */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MdReceipt className="text-gray-400" />
                          <span className="font-medium">
                            {customer.totalInvoices}
                          </span>
                          <span className="text-sm text-gray-600">
                            invoice(s)
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Since {formatDate(customer.firstPurchase)}
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(customer.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg:{" "}
                          {formatCurrency(
                            customer.totalAmount / customer.totalInvoices
                          )}
                        </div>
                      </td>

                      {/* Last Purchase */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(customer.lastPurchase)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Download Invoices Dropdown */}
                          <div className="relative group">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                            >
                              <MdDownload className="text-lg" />
                              Download
                            </motion.button>
                            <div className="absolute left-0 z-50 hidden mt-1 bg-white border border-gray-200 rounded-lg shadow-lg group-hover:block min-w-48 top-full">
                              {customer.invoices.map((invoice) => (
                                <button
                                  key={invoice._id}
                                  onClick={() => downloadInvoice(invoice)}
                                  disabled={downloadingInvoice === invoice._id}
                                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {downloadingInvoice === invoice._id
                                    ? "Downloading..."
                                    : invoice.invoiceNumber}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteConfirm(customer._id)}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                          >
                            <MdDelete className="text-lg" />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-white rounded-lg shadow-xl w-96"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this customer and all their
              invoices? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCustomer(deleteConfirm)}
                className="flex-1 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
