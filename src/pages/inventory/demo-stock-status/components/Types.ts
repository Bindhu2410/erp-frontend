export interface CostComponent {
  id: string;
  category: string;
  calculationMethod: "fixed" | "percentage";
  value: number;
  effectiveDate: string;
}

export interface Item {
  id: string;
  name: string;
  baseUom: string;
  itemType: string;
  trackingMethod: "lot" | "serial" | "none";
  demoEligible: boolean;
  status: "active" | "inactive";
  defaultSalePrice?: number;
  defaultPurchasePrice?: number;
  targetProfitMargin?: number;
  calculatedLandedCost?: number;
  description?: string;
  costComponents?: CostComponent[];
  notes?: string;
}
