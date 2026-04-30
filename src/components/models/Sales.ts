export type SalesPriority = "low" | "medium" | "high";

export interface SalesCard {
  id: string;
  title: string;
  company: string;
  amount: number;
  contactName: string;
  contactEmail: string;
  priority: SalesPriority;
  lastUpdated: string;
  dueDate?: string;
  notes?: string;
  avatar?: string;
}

export interface SalesColumn {
  id: string;
  title: string;
  cards: SalesCard[];
}

export type SalesBoard = SalesColumn[];
