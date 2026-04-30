// Test different API endpoints to find the correct one
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5104';

export const apiTestService = {
    async testEndpoints() {
        const endpoints = [
            '/api/CsCompany',
            '/CsCompany', 
            '/api/companies',
            '/companies',
            '/api/Company',
            '/Company'
        ];

        console.log('Testing API endpoints...');
        
        for (const endpoint of endpoints) {
            try {
                const url = `${API_BASE_URL}${endpoint}`;
                console.log(`Testing: ${url}`);
                
                const response = await fetch(url);
                console.log(`${endpoint}: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Working endpoint found: ${endpoint}`);
                    console.log('Response data:', data);
                    return { endpoint, data };
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error}`);
            }
        }
        
        console.log('❌ No working endpoints found');
        return null;
    }
};