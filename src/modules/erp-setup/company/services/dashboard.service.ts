const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5104/api';

export interface IDashboardStats {
  totalCompanies: number;
  completedSetups: number;
  inProgressSetups: number;
  pendingSetups: number;
  setupProgress: number;
}

export const dashboardService = {
    async getDashboardStats(): Promise<IDashboardStats> {
        try {
            // For now, we'll calculate from companies data
            // In future, this could be a dedicated dashboard API endpoint
            const response = await fetch(`${API_BASE_URL}/CsCompany`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            
            const data = await response.json();
            const companies = data.data || [];
            
            // Calculate basic stats
            const totalCompanies = companies.length;
            
            // For now, using simple calculations
            // In a real scenario, these would come from actual setup completion data
            const completedSetups = Math.floor(totalCompanies * 0.3); // 30% completed
            const inProgressSetups = Math.floor(totalCompanies * 0.4); // 40% in progress
            const pendingSetups = totalCompanies - completedSetups - inProgressSetups;
            const setupProgress = totalCompanies > 0 ? Math.round(((completedSetups + inProgressSetups * 0.5) / totalCompanies) * 100) : 0;
            
            return {
                totalCompanies,
                completedSetups,
                inProgressSetups,
                pendingSetups,
                setupProgress
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return default values on error
            return {
                totalCompanies: 0,
                completedSetups: 0,
                inProgressSetups: 0,
                pendingSetups: 0,
                setupProgress: 0
            };
        }
    }
};