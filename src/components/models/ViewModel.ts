export interface TableHeaders {
  label: string;
  value: string;
}

export interface FieldOption {
  label: string;
  value: string | number;
}
export type AddressField = {
  disabled: boolean | undefined;
  fieldName: string;
  id: string;
  type: string;
  required: boolean;
  options: string[];
  parentFldForVisible: string;
  parentFldValForVisible: string;
};
export type AddressFormData = {
  setAddressData?: React.Dispatch<React.SetStateAction<any[]>>;
  setModal: (isOpen: boolean) => void;
  addressData?: any;
  editData?: any;
  isEditMode?: boolean;
  sectionData: SectionData[];
  onAddSuccesss?: () => void;
  leadId?: string | undefined | null;
  oppId?: string;
  apiCall?: boolean;
  contactNames?: string[];
};

export interface Field {
  disabled?: boolean;
  fieldName: string;
  idName: string;
  id: string;
  type: "text" | "number" | "select" | "date" | "email" | "tel" | string;
  required: boolean;
  options?: FieldOption[];
  URL?: string;
  label: string;
  parentFldForVisible?: string;
  parentFldValForVisible?: string;
  isVisible?: boolean;
  addButton?: boolean;
  validation?: {
    pattern?: string;
    message?: string;
    min?: number;
    max?: number;
  };
}

export interface SectionData {
  title: string;
  fields: Field[];
  tableColumns?: TableHeaders[];
}

// export type Field = {
//   disabled: boolean | undefined;
//   fieldName: string;
//   idName: string;
//   id: string;
//   type: string;
//   required: boolean;
//   options: string[];
//   URL: string;
//   parentFldForVisible?: string;
//   parentFldValForVisible?: string;
//   isVisible?: boolean;
//   addButton?: boolean;
// };
export interface ContactFormData {
  setContactData?: React.Dispatch<React.SetStateAction<any[]>>;
  setModal: (isOpen: boolean) => void;
  contactData?: Record<string, any>;
  editData?: Record<string, any>;
  isEditMode?: boolean;
  onAddSuccess?: () => void;
  sectionData: SectionData[];
  leadId?: string;
  apiCall?: boolean;
  oppId?: string;
}

export type FormValidation = Record<string, string>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CommentView {
  userId: string;
  userEmail: string;
  viewedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id?: string;
    email: string;
    name?: string;
  };
  views: CommentView[];
  replies: Comment[];
}
