import React, { useState, useEffect, ChangeEvent } from "react";
import CommonTable from "../../components/CommonTable";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Modal from "../../components/common/Modal";
import CreateVendor from "./CreateVendor";
import api from "../../services/api";
import { Console } from "console";

const csvHeaders = [
  "Vendor Name",
  "GST No",
  "PAN No",
  "No. of Bills",
  "Status",
  "Is Registered",
  "Door No",
  "Area",
  "City",
  "State",
  "Pincode",
  "Bank Name",
  "Bank Branch",
  "Account Number",
  "IFSC Code",
].join(",");

// Sample data row for template
const sampleDataRow = [
  "Vendor ABC",
  "GST123456",
  "ABCDE1234F",
  "10",
  "active",
  "true",
  "123/A",
  "Main Street",
  "Chennai",
  "Tamil Nadu",
  "600001",
  "Bank Name",
  "Branch Name",
  "1234567890",
  "IFSC00001",
].join(",");

interface VendorData {
  id: string;
  vendorCode: string;
  vendorName: string;
  phone: string[];
  email: string[];
  doorNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber: string;
  isRegistered: boolean;
  panNumber: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  isActive: boolean;
}

// Interface for the form data structure (matching with CreateVendor component)
interface Address {
  doorNo: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

interface BankDetail {
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  ifscCode: string;
}

interface VendorFormData {
  vendorName: string;
  gstNo: string;
  panNo: string;
  noOfBills: string;

  isRegistered: boolean;
  address: Address;
  bankDetails: BankDetail[];
}

const VendorManagement: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VendorFormData>({
    vendorName: "",
    gstNo: "",
    panNo: "",
    noOfBills: "",

    isRegistered: true,
    address: {
      doorNo: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
    },
    bankDetails: [
      { bankName: "", bankBranch: "", accountNumber: "", ifscCode: "" },
    ],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalVendors, setTotalVendors] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorData | null>(null);
  const [modalTitle, setModalTitle] = useState("Create Vendor");
  const [sort, setSort] = useState<{
    field: string;
    order: "asc" | "desc" | "";
  }>({
    field: "",
    order: "",
  });
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );

  // Function to fetch all vendors from the API (without pagination)
  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Get all vendors from the API
      const response = await api.get("Supplier");

      if (response.data) {
        // Transform API response to match our interface
        const transformedData: VendorData[] = Array.isArray(response.data)
          ? response.data.map((vendor: any) => ({
              id: vendor.id?.toString() || "",
              vendorCode: vendor.vendorCode || "",
              vendorName: vendor.vendorName || "",
              phone: vendor.phone || [],
              email: Array.isArray(vendor.email)
                ? vendor.email
                : vendor.email
                ? [vendor.email]
                : [],
              doorNo: vendor.doorNo || "",
              street: vendor.street || "",
              area: vendor.area || "",
              city: vendor.city || "",
              state: vendor.state || "",
              country: vendor.country || "",
              pincode: vendor.pincode || "",
              gstNumber: vendor.gstNumber || "",
              isRegistered: vendor.isRegistered || false,
              panNumber: vendor.panNumber || "",
              bankName: vendor.bankName || "",
              bankAccountNumber: vendor.bankAccountNumber || "",
              ifscCode: vendor.ifscCode || "",
              accountHolderName: vendor.accountHolderName || "",
              isActive: vendor.isActive || false,
            }))
          : [];

        // Store all vendors in state
        setVendors(transformedData);
        console.log(transformedData, "*****");

        // Set total count
        setTotalVendors(transformedData.length);
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      // Fallback to empty array in case of API error
      setVendors([]);
      setTotalVendors(0);
    } finally {
      setLoading(false);
    }
  };

  // Get paginated data based on current page and page size
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return vendors.slice(startIndex, endIndex);
  };

  // Fetch vendor data from API on component mount
  useEffect(() => {
    if (isFirstLoad) {
      fetchVendors();
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  const downloadTemplate = () => {
    const template = csvHeaders + "\n" + sampleDataRow;
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n");

      // Skip header row and process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(",");
        if (row.length < 15) continue; // Skip incomplete rows

        const vendorData: VendorFormData = {
          vendorName: row[0] || "",
          gstNo: row[1] || "",
          panNo: row[2] || "",
          noOfBills: row[3] || "",

          isRegistered: row[5]?.toLowerCase() === "true",
          address: {
            doorNo: row[6] || "",
            area: row[7] || "",
            city: row[8] || "",
            state: row[9] || "",
            pincode: row[10] || "",
          },
          bankDetails: [
            {
              bankName: row[11] || "",
              bankBranch: row[12] || "",
              accountNumber: row[13] || "",
              ifscCode: row[14] || "",
            },
          ],
        };

        setFormData(vendorData);
        break; // Process only the first valid row for now
      }
    };
    reader.readAsText(file);
  };

  // Configure columns for the vendor table
  const columns = [
    {
      title: "Vendor Code",
      dataIndex: "vendorCode",
      key: "vendorCode",
      width: "10%",
    },
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      key: "vendorName",
      width: "15%",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (record: VendorData) => record.phone.join(", "),
      width: "15%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "15%",
      render: (record: VendorData) => {
        return Array.isArray(record.email)
          ? record.email.join(", ")
          : record.email || "";
      },
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: "10%",
    },
    {
      title: "GST No.",
      dataIndex: "gstNumber",
      key: "gstNumber",
      width: "10%",
    },
  ];

  const handlePageChange = (page: number, size: number = pageSize) => {
    setCurrentPage(page);
    setPageSize(size);
    // No need to fetch data again, just update the page
  };

  // Actions for the vendor table
  const actions = [
    {
      label: <FaEdit size={16} />,
      icon: <FaEdit size={16} />,
      onClick: (record: VendorData) => handleEditVendor(record.id),
      type: "edit",
    },
    {
      label: <FaTrash size={16} />,
      icon: <FaTrash size={16} />,
      onClick: (record: VendorData) => handleDeleteVendor(record.id),
      type: "delete",
    },
  ];

  const handleDeleteVendor = async (id: string) => {
    // Handle vendor deletion
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await api.delete(`Supplier/${id}`);
        alert("Vendor deleted successfully");

        // Refresh the data
        fetchVendors();
      } catch (error) {
        console.error("Error deleting vendor:", error);
        alert("Failed to delete vendor. Please try again.");
      }
    }
  };

  const handleAddVendor = () => {
    setEditingVendor(null);
    setModalTitle("Create Vendor");
    setIsModalOpen(true);
  };

  const handleEditVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`Supplier/${vendorId}`);
      if (response.data) {
        const vendor = response.data;
        setEditingVendor({
          id: vendor.id?.toString() || "",
          vendorCode: vendor.vendorCode || "",
          vendorName: vendor.vendorName || "",
          phone: vendor.phone || [],
          email: vendor.email || "",
          doorNo: vendor.doorNo || "",
          street: vendor.street || "",
          area: vendor.area || "",
          city: vendor.city || "",
          state: vendor.state || "",
          country: vendor.country || "",
          pincode: vendor.pincode || "",
          gstNumber: vendor.gstNumber || "",
          isRegistered: vendor.isRegistered || false,
          panNumber: vendor.panNumber || "",
          bankName: vendor.bankName || "",
          bankAccountNumber: vendor.bankAccountNumber || "",
          ifscCode: vendor.ifscCode || "",
          accountHolderName: vendor.accountHolderName || "",
          isActive: vendor.isActive || false,
        });
        setModalTitle("Edit Vendor");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      alert("Failed to load vendor details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleAddVendor}
          >
            Add New Vendor
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={downloadTemplate}
          >
            Download Template
          </button>
          <div className="mt-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csvFileInput"
            />
            <label
              htmlFor="csvFileInput"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 cursor-pointer"
            >
              Upload CSV
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <CommonTable
          columns={columns}
          data={getPaginatedData()} // Use paginated data instead of all vendors
          loading={loading}
          currentPage={currentPage}
          total={totalVendors}
          onPageChange={handlePageChange}
          actions={actions}
          sort={sort}
          setSort={setSort}
          showCheckboxes={false}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowKey="id"
          pagination={true}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <CreateVendor
          vendorData={
            editingVendor
              ? {
                  id: editingVendor.id,
                  vendorCode: editingVendor.vendorCode,
                  vendorName: editingVendor.vendorName,
                  phone: editingVendor.phone,
                  email: editingVendor.email,
                  gstNo: editingVendor.gstNumber,
                  panNo: editingVendor.panNumber,
                  isRegistered: editingVendor.isRegistered,
                  status: editingVendor.isActive ? "active" : "inactive",
                  address: {
                    doorNo: editingVendor.doorNo,
                    street: editingVendor.street,
                    area: editingVendor.area,
                    city: editingVendor.city,
                    state: editingVendor.state,
                    country: editingVendor.country,
                    pincode: editingVendor.pincode,
                  },
                  bankDetails: {
                    bankName: editingVendor.bankName,
                    accountHolderName: editingVendor.accountHolderName,
                    bankAccountNumber: editingVendor.bankAccountNumber,
                    ifscCode: editingVendor.ifscCode,
                  },
                }
              : undefined
          }
          onUpdate={() => fetchVendors()}
          onCreate={() => {
            fetchVendors();
            setCurrentPage(1); // Return to first page after creating a new vendor
          }}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default VendorManagement;
