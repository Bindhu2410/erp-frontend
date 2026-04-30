import React, { useState } from "react";
import { BomDetails, Component } from "../types";
import Modal from "../../demo-stock-status/components/Modal";

// Check if Modal component exists in current directory, otherwise import from demoStockStatus

interface EditBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  bomDetails: BomDetails;
  onSave: (updatedBom: BomDetails) => void;
}

const EditBomModal: React.FC<EditBomModalProps> = ({
  isOpen,
  onClose,
  bomDetails,
  onSave,
}) => {
  const [editedBom, setEditedBom] = useState<BomDetails>({ ...bomDetails });
  const [components, setComponents] = useState<Component[]>([
    ...bomDetails.components,
  ]);

  const handleBomChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedBom({ ...editedBom, [name]: value });
  };

  const handleComponentChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], [name]: value };

    // If quantity is changed, ensure it's a number
    if (name === "quantity") {
      updatedComponents[index].quantity = parseFloat(value) || 0;
    }

    setComponents(updatedComponents);
  };

  const handleAddComponent = () => {
    const newComponent: Component = {
      id: `COMP${String(Date.now()).slice(-6)}`, // Generate a temporary ID
      itemCode: "",
      description: "",
      quantity: 1,
      uom: "EA",
      comments: "",
    };
    setComponents([...components, newComponent]);
  };

  const handleRemoveComponent = (index: number) => {
    const updatedComponents = [...components];
    updatedComponents.splice(index, 1);
    setComponents(updatedComponents);
  };

  const handleSubmit = () => {
    // Update the component count
    const updatedBom: BomDetails = {
      ...editedBom,
      componentCount: components.length,
      components: components,
      lastUpdated: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    };

    onSave(updatedBom);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={`Edit BOM - ${bomDetails.productName}`}
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BOM ID
          </label>
          <input
            type="text"
            name="id"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            value={editedBom.id}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product ID
          </label>
          <input
            type="text"
            name="productId"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            value={editedBom.productId}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={editedBom.productName}
            onChange={handleBomChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Version
          </label>
          <input
            type="text"
            name="version"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={editedBom.version}
            onChange={handleBomChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={editedBom.description}
            onChange={handleBomChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={editedBom.status}
            onChange={handleBomChange}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Components Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Components</h2>
          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-md flex items-center gap-2"
            onClick={handleAddComponent}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Add Component
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {components.map((component, index) => (
                <tr key={component.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="text"
                      name="itemCode"
                      className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={component.itemCode}
                      onChange={(e) => handleComponentChange(index, e)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      name="description"
                      className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={component.description}
                      onChange={(e) => handleComponentChange(index, e)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      step="0.01"
                      className="w-20 border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={component.quantity}
                      onChange={(e) => handleComponentChange(index, e)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      name="uom"
                      className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={component.uom}
                      onChange={(e) => handleComponentChange(index, e)}
                    >
                      <option value="EA">EA</option>
                      <option value="PCS">PCS</option>
                      <option value="SET">SET</option>
                      <option value="KG">KG</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      name="comments"
                      className="w-full border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={component.comments || ""}
                      onChange={(e) => handleComponentChange(index, e)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveComponent(index)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        ></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none"
          onClick={handleSubmit}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EditBomModal;
