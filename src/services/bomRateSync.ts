import api from './api';

export const bomRateSyncService = {
  syncRates: async () => {
    return await api.post('BomRateSync/sync', {});
  },
  
  getSyncStatus: async () => {
    return await api.get('BomRateSync/status');
  }
};

export default bomRateSyncService;