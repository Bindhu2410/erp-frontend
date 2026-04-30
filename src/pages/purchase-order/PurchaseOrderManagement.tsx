import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import {
  FiList,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";
import {
  FaEye,
  FaBalanceScale,
} from "react-icons/fa";
import api from "../../services/api";

interface Option {
  value: string;
  label: string;
}

interface PurchaseOrder {
  id: string;
  customerPONumber: string;
  customer: string;
  contactPerson: string;
  orderId: string;
  uploadDate: string;
  uploadTime: string;
  totalAmount: number;
  status: string;
  revision: number;
  quotationId?: string;
  salesOrderId?: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const PurchaseOrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Open: "bg-blue-100 text-blue-800 border-blue-200",
      Closed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const statusIcons = {
      Open: FiClock,
      Closed: FiCheckCircle,
      Cancelled: FiAlertTriangle,
    };

    const Icon = statusIcons[status as keyof typeof statusIcons] || FiClock;
    const style = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const fetchPurchaseOrders = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await api.get("purchaseorder");
      console.log("Purchase Order Data:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const formattedData = response.data.map((record: any, index: number) => {
          const po = record.purchaseOrder || record;
          const quotationInfo = record.quotationInfo || {};
          const items = record.items || [];
          
          const totalAmount = items.reduce((sum: number, item: any) => {
            const itemTotal = item.accessoryItems?.reduce((itemSum: number, acc: any) => 
              itemSum + (acc.unitPrice * item.quantity), 0) || 0;
            return sum + itemTotal;
          }, 0);

          return {
            id: po.id || `po-${index}`,
            customerPONumber: po.poId || "N/A",
            customer: quotationInfo.customer_name || record.vendorName || "Unknown Customer",
            contactPerson: quotationInfo.contact_name || "N/A",
            orderId: po.salesOrderId || "N/A",
            uploadDate: po.dateCreated ? new Date(po.dateCreated).toLocaleDateString() : "N/A",
            quotationInternalId: po.quotationId,
            salesOrderDbId: po.salesOrderId || "N/A",
            uploadTime: po.dateCreated ? new Date(po.dateCreated).toLocaleTimeString() : "N/A",
            totalAmount: totalAmount,
            status: po.status || "Open",
            revision: 0,
            quotationId: quotationInfo.quotation_id || po.quotationId || "N/A",
            salesOrderId: po.salesOrderId || "N/A",
          };
        });
        
        setPurchaseOrders(formattedData);
        setTotal(formattedData.length);
      } else {
        setPurchaseOrders([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error("Error fetching Purchase Orders:", error);
      setPurchaseOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const columns = [
    {
      key: "customerPONumber",
      title: "PO Number",
      dataIndex: "customerPONumber",
    },
    {
      key: "customer",
      title: "Customer",
      dataIndex: "customer",
    },
    {
      key: "quotationId",
      title: "Quotation ID",
      dataIndex: "quotationId",
    },
    {
      key: "uploadDate",
      title: "Date Created",
      dataIndex: "uploadDate",
    },
    {
      key: "totalAmount",
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (record: PurchaseOrder) => (
        <span>₹{record.totalAmount.toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (record: PurchaseOrder) => getStatusBadge(record.status),
    },
  ];

  const Actions = [
    {
      label: <FaEye className="text-blue-600" />,
      onClick: (record: PurchaseOrder) => {
        navigate(`/po-view?id=${record.id}`);
      },
      type: "View",
      title: "View Details",
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FiList className="mr-2" />
            Purchase Orders
            <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
              {total} total
            </span>
          </h2>
        </div>
        <div className="p-6">
          <CommonTable
            columns={columns}
            data={purchaseOrders}
            loading={loading}
            total={total}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pagination={true}
            actions={Actions}
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderManagement;