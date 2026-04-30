import api from "./api";

export interface ClaimVoucherCards {
  newThisWeek: number;
  thisWeekTotalAmount: number;
  totalVouchersThisMonth: number;
  monthTotalAmount: number;
}

export interface ClaimVoucherCardsResponse {
  success: boolean;
  message?: string;
  data?: ClaimVoucherCards;
}

class ClaimVoucherCardsService {
  async getClaimVoucherCards(): Promise<ClaimVoucherCardsResponse> {
    try {
      const response = await api.get<ClaimVoucherCards>(
        "ClaimVoucherCards"
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("getClaimVoucherCards error:", error);

      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }
}

const claimVoucherCardsService = new ClaimVoucherCardsService();
export default claimVoucherCardsService;
export {};
