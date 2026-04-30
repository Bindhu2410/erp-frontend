import React, { useEffect, useState } from "react";
import businessChallengeConfig from "../pages/configs/lead/businessChallenges.json";
import CommonTable from "./CommonTable";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import BusinessChallengesForm from "./BusinessChallengesForm";
import Modal from "./common/Modal";
import { toast } from "react-toastify";

interface BusinessChallengeData {
  id: string;
  challenges: string;
  solution: string;
  productName: string[];
}

interface BusinessChallengeProps {
  initialData?: Record<string, any>;
  onSave?: (data: BusinessChallengeData[]) => void;
  stageid?: Record<string, any>;
  type?: string;
}

const BusinessChallenge: React.FC<BusinessChallengeProps> = ({
  initialData,
  onSave,
  stageid,
  type,
}) => {
  const [challenges, setChallenges] = useState<BusinessChallengeData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    if (initialData?.businessChallenge) {
      setChallenges(initialData.businessChallenge);
    }
  }, [initialData]);

  const columns = [
    { key: "challenges", title: "Challenges", dataIndex: "challenges" },
    { key: "solution", title: "Solution", dataIndex: "solution" },
    { 
      key: "productName", 
      title: "Product Name", 
      dataIndex: "productName",
      render: (products: string[]) => products?.join(", ") || ""
    },
  ];


  const handleAddChallenge = (data: Record<string, any>) => {
    console.log("Form data:", data);
    const newChallenge: BusinessChallengeData = {
      id: data.id || Date.now().toString(),
      challenges: data.challenges,
      solution: data.solution,
      productName: data.productName || [],
    };

    if (editIndex !== null) {
      setChallenges(prev =>
        prev.map((item, index) => (index === editIndex ? newChallenge : item))
      );
      toast.success("Challenge updated successfully.");
    } else {
      setChallenges(prev => [...prev, newChallenge]);
      toast.success("Challenge added successfully.");
    }

    setEditIndex(null);
    setIsModalOpen(false);
  };

   const handleEditClick = (record: BusinessChallengeData, index: number) => {
      setEditIndex(index);
      setFormInitialData(record);
      setIsModalOpen(true);
    };
  

  const handleDeleteClick =async (record: BusinessChallengeData,index: number) => {
     const id=record.id;
     try {
     const response = await fetch(`http://localhost:5104/api/SalesLeadsBusinessChallenge/${id}`, {
       method: "DELETE",
     });
     if (!response.ok) throw new Error("Failed to delete address");
     setChallenges((prev) => prev.filter((_, i) => i !== index));
     toast.success("Address deleted successfully.");
   } catch (error) {
     console.error(error);
     toast.error("Error deleting address.");
   }
   };
 
   const actions = [
     {
       label: "✏️",
       onClick: (record: BusinessChallengeData, index: number) => handleEditClick(record, index),
       type: "Edit",
     },
     {
       label: "🗑️",
       onClick: (record: BusinessChallengeData, index: number) => handleDeleteClick(record,index),
       type: "Delete",
     },
   ];

  

  const handleSaveAll = async () => {
    if (challenges.length === 0) {
      toast.warning("No business challenges to save");
      return;
    }

    try {
      await onSave?.(challenges);
      toast.success("Business challenges saved successfully!");
    } catch (error) {
      toast.error("Failed to save business challenges. Please try again.");
    }
  };

  return (
    <div className="bg-white px-2 shadow-md border-b">
      <div className="relative mb-3 border-b-2 border-gray-200">
        <div className="px-6 py-4 relative z-10 flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
            {businessChallengeConfig.title}
          </h2>
        </div>
      </div>
      <div>
        <div className="flex justify-end items-center">
          <div className="space-x-3">
            <button
              onClick={() => {
                setEditIndex(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add Challenge
            </button>
          </div>
        </div>

        <CommonTable
          columns={columns}
          data={challenges}
          total={challenges.length}
          currentPage={1}
          onPageChange={() => {}}
          actions={actions}
          pagination={false}
        />
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditIndex(null);
        }}
        type="min"
      >
        <BusinessChallengesForm
          onSave={handleAddChallenge}
          onClose={() => setIsModalOpen(false)}
          initialData={editIndex !== null ? challenges[editIndex] : {}}
          stageid={stageid}
          type={type} 
        />
      </Modal>

     
    </div>
  );
};

export default BusinessChallenge;
