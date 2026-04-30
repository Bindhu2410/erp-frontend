import React from "react";
import { BomDetails, Component } from "../types";
import Modal from "../../demo-stock-status/components/Modal";

interface ViewBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  bomDetails: BomDetails;
}

const ViewBomModal: React.FC<ViewBomModalProps> = ({
  isOpen,
  onClose,
  bomDetails,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={`BOM Details - ${bomDetails.productName}`}
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      {/* BOM Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">BOM ID</p>
          <p className="font-semibold">{bomDetails.id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Product ID</p>
          <p className="font-semibold">{bomDetails.productId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="font-semibold">{bomDetails.description}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Version</p>
          <p className="font-semibold">{bomDetails.version}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold capitalize">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                bomDetails.status === "active"
                  ? "bg-green-100 text-green-600"
                  : bomDetails.status === "draft"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {bomDetails.status}
            </span>
          </p>
        </div>
      </div>

      {/* BOM Components Table */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Components ({bomDetails.componentCount})
        </h2>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bomDetails.components.map((component: Component) => (
                <tr key={component.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {component.itemCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {component.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {component.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {component.uom}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {component.comments || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewBomModal;
