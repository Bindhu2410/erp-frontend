export interface Field {
  fieldName: string;
  type: string;
  idName?: string;
  id?: string;
  options?: string[];
  required?: boolean;
  disabled?: string | boolean;
  parentFldForVisible?: string;
  URL?: string;
}

export interface AddressFormProps {
  onSave: (data: Record<string, any>) => void;
  onClose: () => void;
  initialData?: Record<string, any>;
  stageid?: string;
  type?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: string;
  hideClose?: boolean;
  title?: string;
  setLeadStatus?: (status: string) => void; // Optional prop to set lead status
}

export interface AddressFormData {
  id?: string;
  type: string; // Address Type
  contactName: string;
  pincode?: string;
  pincodeId?: number;
  area?: string;
  areaId?: number;
  territory?: string;
  territoryId?: number;
  city?: string;
  cityId?: number;
  district?: string;
  districtId?: number;
  state?: string;
  stateId?: number;
  doorNo?: string;
  street?: string;
  landmark?: string;
  address1?: string; // Combined address field
  address2?: string; // Additional address info
}
