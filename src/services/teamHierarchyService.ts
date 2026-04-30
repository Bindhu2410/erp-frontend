import api from './api';

export interface TeamPayload {
  UserId: number;
  ParentUserId: number;
  RoleId: number;
  Region: string;
  AssignedBy: number;
}

const teamHierarchyService = {
  getHierarchy: async () => {
    return api.get('UmTeamHierarchy');
  },
  addOrUpdateTeam: async (payload: TeamPayload) => {
    return api.post('UmTeamHierarchy/add-or-update', payload);
  }
};

export default teamHierarchyService;