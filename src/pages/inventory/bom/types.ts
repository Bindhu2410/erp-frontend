export interface BomItem {
  id: number;
  bomId: string;
  bomName: string;
  bomType: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  quoteTitleId?: number;
  tcTemplateId?: number;
  make?: string;
  childItems: any[];
  // Keep any other fields that might be in the API response
  productId?: string;
  productName?: string;
  description?: string;
  version?: string;
  componentCount?: number;
  lastUpdated?: string;
  status?: "active" | "draft" | "inactive";
}

export interface Component {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  uom: string;
  comments?: string;
}

export interface BomDetails extends Omit<BomItem, "id"> {
  id: string | number;
  name: string;
  components: Component[];
  type: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  quoteTitleId?: number;
  tcTemplateId?: number;
  make?: string;
}

export interface FilterState {
  searchTerm: string;
  product: string;
  status: string;
  category: string;
}
