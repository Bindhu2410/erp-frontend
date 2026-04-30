export interface InterestedProduct {
  id: string;
  productName: string;
  productId: string;
  categoryName: string;
  itemId: number;
  quantity: number;
  makeName: string;
  modelName: string;
  uom: string;
  unitPrice: number;
  amount: number;
  notes: string;
}

export interface InterestedProductField {
  fieldName: string;
  id: string;
  type: string;
  required?: boolean;
  URL?: string;
}

export interface InterestedProductFormProps {
  onSave: (data: Record<string, any>) => void;
  onClose: () => void;
  config?: Record<string, any>;
  initialData?: Record<string, any>;
  stageid?: string;
  type?: string;
}
