export interface ContactField {
  fieldName: string;
  type: string;
  id: string;
  options?: string[];
  required?: boolean;
  name?: string;
}

export interface Contact {
  id: string;
  salutation?: string;
  contactName?: string;
  ownClinic?: string;
  clinicVisitingHours?: string[];
  jobTitle?: string;
  departmentName?: string;
  specialist?: string;
  degree?: string[];
  email?: string;
  mobileNo?: string;
  landLineNo?: string;
  visitingHours?: string[];
}

export interface ContactFormProps {
  onSave: (data: Record<string, any>) => void;
  onClose: () => void;
  initialData?: Record<string, any>;
  stageid?: string;  
  type?: string;
}