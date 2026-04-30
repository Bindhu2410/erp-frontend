import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrderService";

interface PurchaseOrder {
  id: number;
  poId: string;
  status: string;
  customerId?: number;
  quotationId?: number;
  salesOrderId?: string;
  dateCreated: string;
  totalAmount?: number;
  customerName?: string;
  vendorName?: string;
  items?: any[];
}

const PurchaseOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const response = await purchaseOrderService.getPurchaseOrders();
        if (response.success && Array.isArray(response.data)) {
          const formattedData = response.data.map((record: any) => {
            const po = record.purchaseOrder || record;
            const quotationInfo = record.quotationInfo || {};
            const items = record.items || [];
            
            // Calculate total from items
            const totalAmount = items.reduce((sum: number, item: any) => {
              const itemTotal = item.accessoryItems?.reduce((itemSum: number, acc: any) => 
                itemSum + (acc.unitPrice * item.quantity), 0) || 0;
              return sum + itemTotal;
            }, 0);

            return {
              id: po.id,
              poId: po.poId,
              status: po.status,
              customerId: po.customerId,
              quotationId: po.quotationId,
              salesOrderId: po.salesOrderId,
              dateCreated: po.dateCreated,
              totalAmount: totalAmount,
              customerName: quotationInfo.customer_name,
              vendorName: record.vendorName,
              items: items
            };
          });
          setPurchaseOrders(formattedData);
        } else {
          setError(response.message || "Failed to fetch purchase orders");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch purchase orders");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Draft: "bg-gray-100 text-gray-800",
      Received: "bg-blue-100 text-blue-800",
      "Under Review": "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    
    const style = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <button
          onClick={() => navigate("/po-create")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create PO
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PO ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {po.poId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {po.customerName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(po.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(po.dateCreated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {po.totalAmount ? `₹${po.totalAmount.toLocaleString()}` : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/po-view?id=${po.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/po-edit/${po.id}`)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {purchaseOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No purchase orders found
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderListPage;