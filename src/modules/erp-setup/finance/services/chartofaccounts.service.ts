import { 
    IChartOfAccountCreate, 
    IChartOfAccountResponse, 
    IChartOfAccountListResponse, 
    IChartOfAccountDetailResponse 
} from '../interfaces/chartofaccounts.types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5104/api';

export const chartOfAccountsService = {
    async createAccount(accountData: IChartOfAccountCreate): Promise<IChartOfAccountDetailResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}CsChartOfAccounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData)
            });

            if (!response.ok) {
                throw new Error('Failed to create chart of account');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in createAccount:', error);
            throw error;
        }
    },

    async getAccounts(): Promise<IChartOfAccountListResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}CsChartOfAccounts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chart of accounts');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getAccounts:', error);
            throw error;
        }
    },

    async getAccountById(accountId: number): Promise<IChartOfAccountDetailResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}CsChartOfAccounts/${accountId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chart of account details');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in getAccountById:', error);
            throw error;
        }
    },

    async updateAccount(accountId: number, accountData: IChartOfAccountCreate): Promise<IChartOfAccountDetailResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}CsChartOfAccounts/${accountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData)
            });

            if (!response.ok) {
                throw new Error('Failed to update chart of account');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in updateAccount:', error);
            throw error;
        }
    },

    async deleteAccount(accountId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}CsChartOfAccounts/${accountId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete chart of account');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in deleteAccount:', error);
            throw error;
        }
    }
};
