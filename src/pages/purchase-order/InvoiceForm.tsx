import React, { useState } from "react";
import { products as initialProducts } from "./productData";

interface InvoiceFormProps {
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose }) => {
  // State for products, selected items, and tax
  const [productList, setProductList] = useState(initialProducts);
  const [selectedProducts, setSelectedProducts] = useState<
    { id: number; selectedQty: number }[]
  >([]);
  const [tax, setTax] = useState(8.5);

  // Calculate subtotal
  const subtotal = selectedProducts.reduce((sum, sel) => {
    const prod = productList.find((p) => p.id === sel.id);
    return prod ? sum + prod.unitPrice * sel.selectedQty : sum;
  }, 0);

  // Calculate grand total
  const grandTotal = subtotal + subtotal * (tax / 100);

  // Handle product selection
  const handleSelectProduct = (id: number, checked: boolean) => {
    if (checked) {
      // Prevent duplicate selection
      if (!selectedProducts.some((p) => p.id === id)) {
        setSelectedProducts([...selectedProducts, { id, selectedQty: 1 }]);
      }
    } else {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    }
  };

  // Handle quantity change
  const handleQtyChange = (id: number, qty: number) => {
    const prod = productList.find((p) => p.id === id);
    let validQty = qty;
    if (prod) {
      if (qty > prod.quantity) validQty = prod.quantity;
      if (qty < 1) validQty = 1;
    }
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === id ? { ...p, selectedQty: validQty } : p
      )
    );
  };

  // Get remaining quantity for a product
  const getRemainingQty = (id: number) => {
    const prod = productList.find((p) => p.id === id);
    const selected = selectedProducts.find((p) => p.id === id);
    return prod ? prod.quantity - (selected ? selected.selectedQty : 0) : 0;
  };

  // Local handler for generating invoice
  const handleGenerate = () => {
    // Only pass selected products with selectedQty
    const invoiceProducts = selectedProducts
      .map((sel) => {
        const prod = productList.find((p) => p.id === sel.id);
        return prod ? { ...prod, selectedQty: sel.selectedQty } : null;
      })
      .filter(Boolean);
    alert("Invoice generated!\n" + JSON.stringify(invoiceProducts, null, 2));
  };

  // Local handler for saving draft
  const handleSaveDraft = () => {
    const draftProducts = selectedProducts
      .map((sel) => {
        const prod = productList.find((p) => p.id === sel.id);
        return prod ? { ...prod, selectedQty: sel.selectedQty } : null;
      })
      .filter(Boolean);
    alert("Draft saved!\n" + JSON.stringify(draftProducts, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
        <div className="modal-header bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-t-xl p-4 flex justify-between items-center">
          <h5 className="font-bold flex items-center">
            <i className="fas fa-file-invoice-dollar mr-2" />
            Create New Invoice
          </h5>
          <button className="text-white" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body p-6">
          <div className="mb-4">
            <label className="block font-semibold mb-1">Invoice Number</label>
            <input
              type="text"
              className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
              value="INV-004"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="mb-4">
              <label className="block font-semibold mb-1">Invoice Date</label>
              <input
                type="date"
                className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                required
                value={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Due Date</label>
              <input
                type="date"
                className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Payment Terms</label>
            <select
              className="form-select rounded-lg border-2 border-gray-200 p-2 w-full"
              required
            >
              <option value="net30">Net 30</option>
              <option value="net15">Net 15</option>
              <option value="due_on_receipt">Due on Receipt</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">
              Select Line Items
            </label>
            {/* Show remaining quantity for selected products above table */}
            {selectedProducts.length > 0 && (
              <div className="mb-2 text-sm text-gray-700">
                {selectedProducts.map((sel) => {
                  const prod = productList.find((p) => p.id === sel.id);
                  return prod ? (
                    <div key={sel.id}>
                      Remaining quantity for <b>{prod.name}</b>:{" "}
                      {getRemainingQty(sel.id)}
                    </div>
                  ) : null;
                })}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Select</th>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Qty</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map((prod) => {
                    const selected = selectedProducts.find(
                      (p) => p.id === prod.id
                    );
                    return (
                      <tr key={prod.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={!!selected}
                            onChange={(e) =>
                              handleSelectProduct(prod.id, e.target.checked)
                            }
                          />
                        </td>
                        <td>{prod.name}</td>
                        <td>
                          {selected ? (
                            <input
                              type="number"
                              min={1}
                              max={prod.quantity}
                              value={selected.selectedQty}
                              onChange={(e) => {
                                let val = Number(e.target.value);
                                if (val > prod.quantity) val = prod.quantity;
                                if (val < 1) val = 1;
                                handleQtyChange(prod.id, val);
                              }}
                              className="form-input rounded-lg border-2 border-gray-200 p-1 w-16"
                            />
                          ) : (
                            prod.quantity
                          )}
                        </td>
                        <td>${prod.unitPrice.toLocaleString()}</td>
                        <td>
                          $
                          {selected
                            ? (
                                prod.unitPrice * selected.selectedQty
                              ).toLocaleString()
                            : (prod.unitPrice * prod.quantity).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="mb-4">
              <label className="block font-semibold mb-1">Subtotal</label>
              <input
                type="text"
                className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                value={`$${subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Tax (%)</label>
              <input
                type="number"
                className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                value={tax}
                step="0.1"
                min={0}
                onChange={(e) => setTax(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Total</label>
              <input
                type="text"
                className="form-input rounded-lg border-2 border-gray-200 p-2 w-full"
                value={`$${grandTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                readOnly
              />
            </div>
          </div>
        </div>
        <div className="modal-footer flex justify-end gap-2 p-4">
          <button
            className="bg-gray-200 text-gray-700 rounded-full px-6 py-2 font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white rounded-full px-6 py-2 font-semibold"
            onClick={handleGenerate}
          >
            Generate Invoice
          </button>
          <button
            className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
