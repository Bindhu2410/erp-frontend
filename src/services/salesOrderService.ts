import api from "./api";

export interface SalesOrderDropdown {
  id: number;
  orderId: string;
}

export const getSalesOrders = async (): Promise<SalesOrderDropdown[]> => {
  // This endpoint returns a single sales order by PO, so we need to fetch all or use a grid/list endpoint in production.
  // For demo, fetch a few by known PO ids (replace with real logic as needed)
  const ids = [23, 24, 25, 26, 27]; // Example PO ids
  const results: SalesOrderDropdown[] = [];
  for (const id of ids) {
    try {
      const response = await api.get<any>(`SalesOrder/by-po/${id}`);
      if (response.data && response.data.salesOrder) {
        results.push({
          id: response.data.salesOrder.id,
          orderId: response.data.salesOrder.orderId,
        });
      }
    } catch {}
  }
  return results;
};
