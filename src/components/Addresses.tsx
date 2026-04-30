import React, { useEffect, useState } from "react";
import AddressForm from "./AddressForm";
import { AddressFormData } from "../types/address";
import addressConfigjson from "../pages/configs/lead/addresses.json";
import CommonTable from "./CommonTable";
import { toast } from "react-toastify";
import Modal from "./common/Modal";
import api from "../services/api";

interface AddressesProps {
  onSave?: (addresses: AddressFormData[]) => void;
  data?: AddressFormData[];
  stageid?: string;
  type?: string;
}

const Addresses: React.FC<AddressesProps> = ({
  onSave,
  data = [],
  stageid,
  type,
}) => {
  const [addresses, setAddresses] = useState<AddressFormData[]>(data || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formInitialData, setFormInitialData] = useState<Record<
    string,
    any
  > | null>(null);

  const handleEdit = (data: Record<string, any>) => {
    const updatedAddress: AddressFormData = {
      id: data.id,
      type: data.type,
      contactName: data.contactName,
      pincode: data.pincode,
      pincodeId: data.pincodeId,
      area: data.area,
      areaId: data.areaId,
      territory: data.territory,
      territoryId: data.territoryId,
      city: data.city,
      cityId: data.cityId,
      district: data.district,
      districtId: data.districtId,
      state: data.state,
      stateId: data.stateId,
      doorNo: data.doorNo,
      street: data.street,
      landmark: data.landmark,
      address1: data.address1,
      address2: data.address2,
    };
    setAddresses((prev) =>
      prev.map((addr, index) => (index === editIndex ? updatedAddress : addr))
    );
    setEditIndex(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (record: AddressFormData, index: number) => {
    setEditIndex(index);
    setFormInitialData(record);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get(`SalesAddress/lead/${stageid}`);
        setAddresses(response.data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        // toast.error("Failed to fetch addresses.");
      }
    };
    fetchAddresses();
  }, []);

  const handleDeleteClick = async (record: AddressFormData, index: number) => {
    const id: any = record.id;
    console.log("Deleting address with ID:", id?.id);
    try {
      const response = await fetch(
        `http://localhost:5104/api/SalesAddress/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete address");
      setAddresses((prev) => prev.filter((_, i) => i !== index));
      toast.success("Address deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting address.");
    }
  };

  const actions = [
    {
      label: "✏️",
      onClick: (record: AddressFormData, index: number) =>
        handleEditClick(record, index),
      type: "Edit",
    },
    {
      label: "🗑️",
      onClick: (record: AddressFormData, index: number) =>
        handleDeleteClick(record, index),
      type: "Delete",
    },
  ];

  const columns = addressConfigjson.fields.map((field: any) => ({
    key: field.id || field.idName,
    title: field.fieldName,
    dataIndex: field.id || field.idName,
  }));

  const handleAddAddress = (data: Record<string, any>) => {
    const newAddress: AddressFormData = {
      id: data.id || Date.now().toString(),
      type: data.type,
      contactName: data.contactName,
      pincode: data.pincode,
      pincodeId: data.pincodeId,
      area: data.area,
      areaId: data.areaId,
      territory: data.territory,
      territoryId: data.territoryId,
      city: data.city,
      cityId: data.cityId,
      district: data.district,
      districtId: data.districtId,
      state: data.state,
      stateId: data.stateId,
      doorNo: data.doorNo,
      street: data.street,
      landmark: data.landmark,
      address1: data.address1,
      address2: data.address2,
    };
    setAddresses((prev) => [...prev, newAddress]);
    setFormInitialData(null);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white px-2 shadow-md border-b">
      <div className="relative mb-3 border-b-2 border-gray-200">
        <div className="px-6 py-4 relative z-10 flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
            {addressConfigjson.title}
          </h2>
        </div>
      </div>

      <div>
        <div className="flex justify-end items-center mb-4">
          <div className="space-x-3">
            <button
              onClick={() => {
                setFormInitialData(null);
                setEditIndex(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add Address
            </button>
          </div>
        </div>

        <CommonTable
          columns={columns}
          data={addresses}
          total={addresses.length}
          currentPage={1}
          onPageChange={() => {}}
          actions={actions}
          pagination={false}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="min"
        title="Address"
      >
        <AddressForm
          initialData={formInitialData || {}}
          onSave={editIndex !== null ? handleEdit : handleAddAddress}
          onClose={() => setIsModalOpen(false)}
          stageid={stageid}
          type={type}
        />
      </Modal>
    </div>
  );
};

export default Addresses;
