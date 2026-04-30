export interface UOM {
  id: string;
  code: string;
  name: string;
  type: string;
  baseUOM?: string;
  conversionFactor?: number;
  status: "active" | "inactive";
  description?: string;
}
