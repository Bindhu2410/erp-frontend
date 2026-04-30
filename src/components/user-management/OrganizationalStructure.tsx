import React from 'react';
import { FiUserCheck, FiUsers, FiUser } from 'react-icons/fi';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: string;
  avatar: string;
  email: string;
  subordinates?: number;
}

interface HierarchyLevel {
  level: number;
  members: TeamMember[];
}

interface OrganizationalStructureProps {
  hierarchyData: HierarchyLevel[];
}

const OrganizationalStructure: React.FC<OrganizationalStructureProps> = ({
  hierarchyData
}) => {
  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'Administrator': 'bg-red-500',
      'General Manager': 'bg-blue-500',
      'Territory Manager': 'bg-yellow-500',
      'Area Manager': 'bg-cyan-500',
      'Field Sales Agent': 'bg-green-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const getRoleIcon = (role: string) => {
    if (role === 'Administrator') return FiUserCheck;
    if (role.includes('Manager')) return FiUsers;
    return FiUser;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b">
        <h3 className="text-lg font-medium text-gray-900">Organizational Structure</h3>
      </div>
      <div className="p-6">
        <div className="relative">
          {hierarchyData.map((level, levelIndex) => (
            <div key={levelIndex} className={`relative ${levelIndex > 0 ? 'ml-8' : ''}`}>
              {/* Vertical connecting line */}
              {levelIndex > 0 && (
                <div 
                  className="absolute left-[-2rem] top-0 w-0.5 bg-blue-500"
                  style={{ height: '100%' }}
                ></div>
              )}
              
              {level.members.map((member, memberIndex) => {
                const RoleIcon = getRoleIcon(member.role);
                
                return (
                  <div key={member.id} className="relative mb-8">
                    {/* Horizontal connecting line */}
                    {levelIndex > 0 && (
                      <>
                        <div className="absolute left-[-2rem] top-6 w-6 h-0.5 bg-blue-500"></div>
                        {/* Connection dot */}
                        <div className="absolute left-[-2.3rem] top-5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                      </>
                    )}
                    
                    {/* Member Card */}
                    <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getRoleBadgeColor(member.role)} rounded-full flex items-center justify-center`}>
                            <RoleIcon size={12} className="text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getRoleBadgeColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{member.team}</p>
                          {member.subordinates && (
                            <div className="mt-2">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                {member.subordinates} {member.subordinates === 1 ? 'subordinate' : 'subordinates'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationalStructure;
