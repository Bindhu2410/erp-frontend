import React, { useState, useEffect, useRef } from "react";
import {
  MdAdd,
  MdCreditCard,
  MdFileUpload,
  MdKeyboardVoice,
  MdUploadFile,
  MdCreate,
} from "react-icons/md";
import Modal from "./Modal";
import LeadForm from "../../pages/lead/LeadForm";

const CreateLeadButton = () => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const handleCreateLead = (option: string) => {
    console.log("Selected:", option);
    if (option === "New Form") {
      setShowLeadForm(true);
    }
    setShowCreateMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCreateMenu]);

  const menuItems = [
    { name: "New Form", icon: MdCreate },
    { name: "Card Capture", icon: MdCreditCard },
    { name: "Card Upload", icon: MdFileUpload },
    { name: "Voice Record", icon: MdKeyboardVoice },
    { name: "Bulk Upload", icon: MdUploadFile },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowCreateMenu((prev) => !prev)}
        className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
      >
        <MdAdd className="w-5 h-5 text-white" />
        <span className="font-medium">Create Lead</span>
      </button>

      {showCreateMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 py-2 border border-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleCreateLead(item.name)}
              className="flex items-center mx-auto w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <item.icon className="w-5 h-5 mr-5 text-gray-600" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}      <Modal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)}>
        <LeadForm 
          onClose={() => setShowLeadForm(false)}
          onSuccess={() => window.location.reload()} 
        />
      </Modal>
    </div>
  );
};

export default CreateLeadButton;
