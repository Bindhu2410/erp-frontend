import React, { useEffect, useState } from "react";
import InterestedProductForm from "./InterestedProductForm";
import { InterestedProduct } from "../types/interestedProduct";
import axios from "axios";
import api from "../services/api";

interface InterestedProductsProps {
  config?: Record<string, any>;
  onSave?: (data: InterestedProduct[]) => void;
  data?: InterestedProduct[];
  stageid?: string;
  stage?: string;
}

const InterestedProducts: React.FC<InterestedProductsProps> = ({
  config = {},
  onSave,
  data,
  stageid,
  stage,
}) => {
  const [products, setProducts] = useState<InterestedProduct[]>(data ?? []);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5104/api/SalesItems/by-stage/${stage}/${stageid}`
      );
      // Map API response to InterestedProduct interface
      const mapped = response.data.map((item: any) => ({
        id: String(item.id),
        productName: item.itemName || "",
        productId: item.itemCode || "",
        categoryName: item.category || "",
        itemId: item.itemId || 0,
        quantity: item.qty || 0,
        makeName: item.make || "",
        modelName: item.model || "",
        uom: item.uom || "",
        unitPrice: item.unitPrice || 0,
        amount: item.amount || 0,
        notes: item.notes || "",
      }));
      setProducts(mapped);
    } catch (error) {
      // Optionally handle error
    }
  };

  // Save selected products to API one by one and refresh list

  const handleClose = () => {
    // Handle close if needed
  };

  return (
    <InterestedProductForm
      onClose={handleClose}
      config={config}
      stageid={stageid}
      type={stage}
    />
  );
};

export default InterestedProducts;
