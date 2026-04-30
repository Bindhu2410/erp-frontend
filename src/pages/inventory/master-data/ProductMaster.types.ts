export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  makeId: string;
  modelId: string;
  baseUomId: string;
  unitCost: number;
  status: "active" | "inactive";
}
