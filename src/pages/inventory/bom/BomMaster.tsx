import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import GenericInventoryTable, { type RowAction } from "../../../components/table/GenericInventoryTable";
import { BomDetails } from "./types";
import api from "../../../services/api";
import AddBomModal from "./components/AddBomModal";

interface FormattedBom {
  id: number | string;
  bomId: string;
  bomName: string;
  bomType: string;
  childItems: string;
  _raw: any;
}

const BomMaster: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [boms, setBoms] = useState<FormattedBom[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBomData, setSelectedBomData] = useState<any>(null);
  const [selectedBomId, setSelectedBomId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewBomData, setViewBomData] = useState<any>(null);

  const columns = [
    { key: "bomId", label: "BOM ID", sortable: true },
    { key: "bomName", label: "BOM Name", sortable: true },
    { key: "bomType", label: "BOM Type", sortable: true },
    { key: "childItems", label: "Child Items", sortable: false },
  ];

  const fetchBomData = async () => {
    try {
      const response = await api.get("BillOfMaterial");
      if (Array.isArray(response.data)) {
        const formatted: FormattedBom[] = response.data.map((item: any) => ({
          id: item.id,
          bomId: item.bomId || "-",
          bomName: item.bomName || "-",
          bomType: item.bomType || "-",
          childItems:
            item.childItems && item.childItems.length > 0
              ? item.childItems.length > 3
                ? `${item.childItems.slice(0, 3).map((c: any) => c.itemName).join(", ")} +${item.childItems.length - 3} more`
                : item.childItems.map((c: any) => c.itemName).join(", ")
              : "-",
          _raw: item,
        }));
        setBoms(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch BOM data:", err);
      toast.error("Failed to fetch BOM data");
    }
  };

  useEffect(() => {
    fetchBomData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const mode = params.get("mode");
    if (!id || !mode) return;

    api.get(`BillOfMaterial/${id}`).then((res) => {
      const data = res.data;
      if (mode === "view") {
        setViewBomData(data);
        setIsViewModalOpen(true);
      } else if (mode === "edit") {
        setSelectedBomId(id);
        setSelectedBomData(data);
        setIsAddModalOpen(true);
      }
    }).catch((err) => {
      console.error("Failed to fetch BOM by id:", err);
      toast.error("Failed to load BOM data");
    });
  }, [location.search]);

  const handleViewBom = (row: FormattedBom) => {
    navigate(`${location.pathname}?id=${row.id}&mode=view`);
  };

  const handleEditBom = (row: FormattedBom) => {
    navigate(`${location.pathname}?id=${row.id}&mode=edit`);
  };

  const handleDeleteBom = async (row: FormattedBom) => {
    const result = await Swal.fire({
      title: "Delete BOM",
      html: `Are you sure you want to delete <strong>"${row.bomName}"</strong>? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`BillOfMaterial/${row.id}`);
      toast.success("BOM deleted successfully");
      fetchBomData();
    } catch (err) {
      console.error("Error deleting BOM:", err);
      toast.error("Failed to delete BOM");
    }
  };

  const rowActions: RowAction[] = [
    {
      label: "View",
      icon: "view",
      color: "text-blue-600 hover:text-blue-900",
      onClick: (row) => handleViewBom(row),
    },
    {
      label: "Edit",
      icon: "edit",
      color: "text-amber-600 hover:text-amber-900",
      onClick: (row) => handleEditBom(row),
    },
    {
      label: "Delete",
      icon: "delete",
      color: "text-red-600 hover:text-red-900",
      onClick: (row) => handleDeleteBom(row),
    },
  ];

  return (
    <>


      <GenericInventoryTable
        title="BOM Master"
        columns={columns}
        data={boms}
        onAddNew={() => {
          setSelectedBomId(null);
          setSelectedBomData(null);
          setIsAddModalOpen(true);
        }}
        showImport={false}
        showExport={false}
        showAddNew={true}
        itemsPerPage={10}
        actions={rowActions}
        showActions={true}
      />

      {isViewModalOpen && viewBomData && (
        <AddBomModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setViewBomData(null); navigate(location.pathname); }}
          onSave={() => {}}
          mode="view"
          initialData={{
            ...viewBomData,
            name: viewBomData.bomName,
            type: viewBomData.bomType,
          }}
        />
      )}

      {isAddModalOpen && (
        <AddBomModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedBomId(null);
            setSelectedBomData(null);
            navigate(location.pathname);
          }}
          onSave={() => {
            setIsAddModalOpen(false);
            setSelectedBomId(null);
            setSelectedBomData(null);
            navigate(location.pathname);
            fetchBomData();
          }}
          mode={selectedBomId ? "edit" : "add"}
          initialData={
            selectedBomData
              ? {
                  ...selectedBomData,
                  name: selectedBomData.bomName,
                  type: selectedBomData.bomType,
                  effectiveFrom: selectedBomData.effectiveFrom,
                  effectiveTo: selectedBomData.effectiveTo,
                  quoteTitleId: selectedBomData.quoteTitleId,
                  tcTemplateId: selectedBomData.tcTemplateId,
                  make: selectedBomData.make,
                }
              : undefined
          }
        />
      )}
    </>
  );
};

export default BomMaster;
