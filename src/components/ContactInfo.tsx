import React, { useEffect, useState } from "react";
import contactInfojson from "../pages/configs/lead/contactInfo.json";
import ContactForm from "./ContactForm";
import { Contact } from "../types/contact";
import CommonTable from "./CommonTable";
import Modal from "./common/Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";

interface ContactInfoProps {
  initialData?: Record<string, any>;
  onSave?: (data: Contact[]) => void;
  data?: Contact[];
  stageid?: string;
  type?: string;
  leadId?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  initialData = {},
  onSave,
  data = [],
  stageid,
  type,
  leadId,
}) => {
  const [contacts, setContacts] = useState<Contact[]>(data || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formInitialData, setFormInitialData] = useState<Record<string, any>>(
    {}
  );

  const columns = contactInfojson.fields.map((field: any) => ({
    key: field.id,
    title: field.fieldName,
    dataIndex: field.id,
  }));

  const handleAddContact = (data: Record<string, any>) => {
    const newContact: Contact = {
      id: data.id,
      salutation: data.salutation,
      contactName: data.contactName,
      ownClinic: data.ownClinic,
      clinicVisitingHours: data.clinicVisitingHours,
      jobTitle: data.jobTitle,
      departmentName: data.departmentName,
      specialist: data.specialist,
      degree: data.degree,
      email: data.email,
      mobileNo: data.mobileNo,
      landLineNo: data.landLineNo,
      visitingHours: data.visitingHours,
    };

    if (editIndex !== null) {
      setContacts((prev) =>
        prev.map((item, idx) => (idx === editIndex ? newContact : item))
      );
      toast.success("Contact updated successfully!");
      setEditIndex(null);
    } else {
      setContacts((prev) => [...prev, newContact]);
      toast.success("Contact added successfully!");
    }

    setFormInitialData({});
    setIsModalOpen(false);
  };

  const handleEditClick = (record: Contact, index: number) => {
    setEditIndex(index);
    setFormInitialData(record);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get(
          `SalesContact/lead/${leadId}`,
          {},
          "opportunities"
        );

        setContacts((response.data || []).filter((c: any) => !c.isDefault));
      } catch (error) {
        console.error("Error fetching contacts:", error);
        // toast.error("Failed to fetch contacts. Please try again later.");
      }
    };
    fetchContacts();
  }, [leadId]);

  const handleDeleteClick = async (record: Contact, index: number) => {
    const id = record.id;

    if (!id || (typeof id !== "string" && typeof id !== "number")) {
      toast.error("Invalid contact ID.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5104/api/SalesContact/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete contact");

      setContacts((prev) => prev.filter((_, i) => i !== index));
      toast.success("Contact deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting address.");
    }
  };

  const handleSaveContacts = async () => {
    if (contacts.length === 0) {
      alert("No contacts to save");
      return;
    }
    try {
      onSave?.(contacts);
      toast.success("Contacts saved successfully!");
    } catch (error) {
      toast.error("Failed to save contacts. Please try again.");
    }
  };

  const actions = [
    {
      label: "✏️",
      onClick: (record: Contact, index: number) =>
        handleEditClick(record, index),
      type: "Edit",
    },
    {
      label: "🗑️",
      onClick: (record: Contact, index: number) =>
        handleDeleteClick(record, index),
      type: "Delete",
    },
  ];

  return (
    <div className="bg-white px-2 shadow-md border-b">
      <div className="relative mb-3 border-b-2 border-gray-200">
        <div className="px-6 py-4 relative z-10 flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
            Contact Information
          </h2>
        </div>
      </div>

      <div>
        <div className="flex justify-end items-center">
          <div className="space-x-3">
            <button
              onClick={() => {
                setEditIndex(null);
                setFormInitialData({});
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add Contact
            </button>
          </div>
        </div>

        <CommonTable
          columns={columns}
          data={contacts}
          total={contacts.length}
          currentPage={1}
          onPageChange={() => {}}
          actions={actions}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="min"
        title="Contact Information"
      >
        <ContactForm
          onSave={handleAddContact}
          onClose={() => {
            setEditIndex(null);
            setFormInitialData({});
            setIsModalOpen(false);
          }}
          initialData={formInitialData}
          stageid={stageid}
          type={type}
        />
      </Modal>
    </div>
  );
};

export default ContactInfo;
