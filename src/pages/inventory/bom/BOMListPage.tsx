import React, { useState } from "react";
import BOMProductDetail from "./components/BOMProductDetail";
import BOMFormModal from "./components/BOMFormModal";
import Modal from "../../../components/common/Modal";
// import BOMListView from "./components/BOMListView";

// Import BOMType from BOMProductDetail
import { BOMType, BOMRow } from "./components/BOMProductDetail";

const BOMListPage: React.FC = () => {
  const [bomList, setBomList] = useState<BOMType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);

  const handleAddBOM = (bom: BOMType) => {
    setBomList([...bomList, bom]);
    setShowModal(false);
  };

  const handleSelectBOM = (idx: number) => {
    setSelectedProductIndex(idx);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">BOM List</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowModal(true)}
        >
          New BOM
        </button>
      </div>
      {/* <BOMListView
        bomList={bomList}
        selectedIndex={selectedProductIndex}
        onSelect={handleSelectBOM}
      /> */}
      {selectedProductIndex !== null && (
        <BOMProductDetail bom={bomList[selectedProductIndex]} />
      )}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Bill of"
      >
        <BOMFormModal
          onAdd={handleAddBOM}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default BOMListPage;
