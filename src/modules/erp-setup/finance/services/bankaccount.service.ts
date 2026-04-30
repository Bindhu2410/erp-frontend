import { IBankAccountCreate, IBankAccountResponse, IBankAccountListResponse, IBankAccountDetailResponse } from '../interfaces/bankaccount.types';

// Ensure the API_BASE_URL doesn't have a trailing slash to avoid double slashes in URLs
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5104/api').replace(/\/+$/, '');

export interface IBankAccountService {
  createBankAccount(bankAccountData: IBankAccountCreate): Promise<IBankAccountDetailResponse>;
  getBankAccounts(): Promise<IBankAccountResponse[]>;
  getBankAccountById(bankAccountId: number): Promise<IBankAccountResponse>;
  updateBankAccount(bankAccountId: number, bankAccountData: IBankAccountCreate): Promise<IBankAccountDetailResponse>;
  deleteBankAccount(bankAccountId: number): Promise<any>;
}

export const bankAccountService: IBankAccountService = {
    async createBankAccount(bankAccountData: IBankAccountCreate): Promise<IBankAccountDetailResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBankAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bankAccountData)
            });

            if (!response.ok) {
                throw new Error('Failed to create bank account');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in createBankAccount:', error);
            throw error;
        }
    },

    async getBankAccounts(): Promise<IBankAccountResponse[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBankAccount/search`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bank accounts');
            }

            const responseData: IBankAccountListResponse = await response.json();
            const content = responseData.data;
            return Array.isArray(content) ? content : ((content as any)?.items || []);
        } catch (error) {
            console.error('Error in getBankAccounts:', error);
            throw error;
        }
    },

    async getBankAccountById(bankAccountId: number): Promise<IBankAccountResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBankAccount/${bankAccountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bank account details');
            }

            const responseData = await response.json();
            // Robust extraction: return .data if it exists, otherwise return the whole object
            return responseData.data !== undefined ? responseData.data : responseData;
        } catch (error) {
            console.error('Error in getBankAccountById:', error);
            throw error;
        }
    },

    async updateBankAccount(bankAccountId: number, bankAccountData: IBankAccountCreate): Promise<IBankAccountDetailResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBankAccount/${bankAccountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bankAccountData)
            });

            if (!response.ok) {
                throw new Error('Failed to update bank account');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in updateBankAccount:', error);
            throw error;
        }
    },

    async deleteBankAccount(bankAccountId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBankAccount/${bankAccountId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete bank account');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in deleteBankAccount:', error);
            throw error;
        }
    }
};
