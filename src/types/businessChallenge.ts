export interface BusinessChallengeField {
  fieldName: string;
  id: string;
  type: string;
  required?: boolean;
  options?: any[];
  URL?: string;
}

export interface BusinessChallengeSection {
  title: string;
  fields: BusinessChallengeField[];
}

export interface BusinessChallengeConfig {
  title: string;
  fields: BusinessChallengeSection[];
}

export interface Field extends BusinessChallengeField {
  disabled?: boolean | string;
}

export interface BusinessChallengeFormProps {
  onSave: (data: Record<string, any>) => void;
  onClose: () => void;
  initialData?: Record<string, any>;
  stageid?: Record<string, any>;    
  type?: string;
}

export interface BusinessChallengeData {
  id: string;
  challenges: string;
  solution: string;
  productName: string[];
}