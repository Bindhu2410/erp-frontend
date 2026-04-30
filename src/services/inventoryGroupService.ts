import api from "./api";

export interface InventoryGroup {
  id: number;
  name: string;
}

export const getInventoryGroups = async (): Promise<InventoryGroup[]> => {
  const response = await api.get<InventoryGroup[]>("InventoryGroup");
  return response.data || [];
};
