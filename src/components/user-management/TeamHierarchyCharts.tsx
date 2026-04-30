import React, { useEffect, useMemo, useState } from "react";
import { FiUsers, FiChevronDown, FiChevronRight, FiUser } from "react-icons/fi";
import { roleColors } from "./chartColors";

interface TeamMember {
  id: string;
  parentId?: string;
  name: string;
  role: string;
  team: string;
  avatar: string;
  email: string;
  subordinates?: number;
}

interface TeamHierarchyChartsProps {
  hierarchyData?: TeamMember[];
}

interface TreeNode {
  id: string;
  name: string;
  role: string;
  children: TreeNode[];
  directReports: number;
}

const buildFallbackColors = (count: number): string[] => {
  if (count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const hue = Math.round((360 / count) * index);
    return `hsl(${hue}, 55%, 76%)`;
  });
};

const TreeNodeComponent: React.FC<{
  node: TreeNode;
  onSelect: (nodeId: string) => void;
  selectedId: string;
  level: number;
}> = ({ node, onSelect, selectedId, level }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div key={node.id}>
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded transition-colors ${
          isSelected
            ? "bg-blue-100 border-l-4 border-blue-600"
            : "hover:bg-gray-50"
        }`}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) {
            setExpanded(!expanded);
          }
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center justify-center w-5 h-5"
          >
            {expanded ? (
              <FiChevronDown size={16} className="text-gray-600" />
            ) : (
              <FiChevronRight size={16} className="text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            backgroundColor: roleColors[node.role] || "hsl(210, 55%, 76%)",
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {node.name}
          </div>
          <div className="text-xs text-gray-600 truncate">{node.role}</div>
        </div>

        {node.directReports > 0 && (
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">
            {node.directReports}
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="border-l-2 border-gray-200 ml-4">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TeamHierarchyCharts: React.FC<TeamHierarchyChartsProps> = ({
  hierarchyData = [],
}) => {
  const roleFallbackColors = useMemo(() => buildFallbackColors(12), []);

  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [teamHeads, setTeamHeads] = useState<TreeNode[]>([]);

  // Build tree structure
  useMemo(() => {
    if (!hierarchyData || hierarchyData.length === 0) {
      setTeamHeads([]);
      return;
    }

    const memberMap = new Map<string, TeamMember>();
    const childrenMap = new Map<string, TeamMember[]>();
    const childIds = new Set<string>();

    hierarchyData.forEach((member) => {
      memberMap.set(member.id, member);
    });

    hierarchyData.forEach((member) => {
      if (member.parentId && member.parentId !== member.id && memberMap.has(member.parentId)) {
        const siblings = childrenMap.get(member.parentId) || [];
        siblings.push(member);
        childrenMap.set(member.parentId, siblings);
        childIds.add(member.id);
      }
    });

    const rootMembers = hierarchyData.filter(member => !childIds.has(member.id));
    
    // Fallback if circular dependency makes rootMembers empty
    if (rootMembers.length === 0 && hierarchyData.length > 0) {
      const roleOrder = ["Admin", "Managing Director", "General Manager", "Area Manager", "Territory Manager", "Sales Representative"];
      const sortedByRole = [...hierarchyData].sort((a, b) => {
        const idxA = roleOrder.indexOf(a.role);
        const idxB = roleOrder.indexOf(b.role);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
      rootMembers.push(sortedByRole[0]);
    }

    const visited = new Set<string>();
    const buildTreeNode = (member: TeamMember): TreeNode | null => {
      if (visited.has(member.id)) return null;
      visited.add(member.id);

      const children = childrenMap.get(member.id) || [];
      const childNodes: TreeNode[] = [];
      
      children.forEach(child => {
        const node = buildTreeNode(child);
        if (node) childNodes.push(node);
      });

      return {
        id: member.id,
        name: member.name,
        role: member.role,
        children: childNodes,
        directReports: children.length,
      };
    };

    const heads = rootMembers
      .map((member) => buildTreeNode(member))
      .filter((node): node is TreeNode => node !== null);
      
    setTeamHeads(heads);

    if (heads.length > 0 && !selectedNodeId) {
      setSelectedNodeId(heads[0].id);
    }
  }, [hierarchyData]);

  // Find selected node with its team
  const findNode = (nodes: TreeNode[], targetId: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      const found = findNode(node.children, targetId);
      if (found) return found;
    }
    return null;
  };

  const selectedNode = findNode(teamHeads, selectedNodeId);

  const teamHeadButtons = useMemo(() => {
    const collectHeads = (nodes: TreeNode[]): TreeNode[] => {
      const heads: TreeNode[] = [];
      for (const node of nodes) {
        heads.push(node);
        heads.push(...collectHeads(node.children));
      }
      return heads;
    };
    return collectHeads(teamHeads);
  }, [teamHeads]);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <FiUsers className="text-blue-600" size={20} />
          Team Organization Tree
        </h3>
      </div>

      <div className="p-5 min-h-screen flex flex-col overflow-auto">
        {teamHeads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            No hierarchy data available.
          </div>
        ) : (
          <>
            {/* Team Head Selection Buttons */}
            <div className="mb-4 pb-3 border-b border-gray-200">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Team Heads
              </div>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {teamHeads.map((head) => (
                  <button
                    key={head.id}
                    onClick={() => setSelectedNodeId(head.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                      head.id === selectedNodeId
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: roleColors[head.role] || "#9CA3AF" }}
                    />
                    {head.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
              {/* Tree View */}
              <div className="lg:col-span-1 border border-gray-200 rounded-lg bg-gray-50 p-3 overflow-y-auto">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  Hierarchy Tree
                </div>
                <div className="space-y-1">
                  {teamHeads.map((head) => (
                    <TreeNodeComponent
                      key={head.id}
                      node={head}
                      onSelect={setSelectedNodeId}
                      selectedId={selectedNodeId}
                      level={0}
                    />
                  ))}
                </div>
              </div>

              {/* Circle Visualization & Info */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {selectedNode && (
                  <>
                    {/* Selected Member Info */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                        Selected Member
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {selectedNode.name}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              roleColors[selectedNode.role] ||
                              "hsl(210, 55%, 76%)",
                          }}
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {selectedNode.role}
                        </span>
                      </div>
                      {selectedNode.directReports > 0 && (
                        <div className="mt-3 text-xs">
                          <span className="text-gray-600">
                            Direct Reports:{" "}
                          </span>
                          <span className="font-bold text-blue-700">
                            {selectedNode.directReports}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Grid Visualization */}
                    {selectedNode.directReports > 0 ? (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                          Direct Reports ({selectedNode.children.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max">
                          {selectedNode.children.map((child) => {
                            const childColor =
                              roleColors[child.role] ||
                              roleFallbackColors[
                                selectedNode.children.indexOf(child) %
                                  roleFallbackColors.length
                              ];

                            return (
                              <div
                                key={child.id}
                                onClick={() => setSelectedNodeId(child.id)}
                                className="border-2 rounded-lg p-3 transition-all cursor-pointer flex flex-col hover:shadow-2xl hover:ring-2 hover:ring-offset-2"
                                style={{
                                  borderColor: childColor,
                                  backgroundColor: childColor + "15",
                                }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.backgroundColor = childColor + "40";
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.borderColor = childColor;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.backgroundColor = childColor + "15";
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.borderColor = childColor;
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">
                                      {child.name}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">
                                      {child.role}
                                    </div>
                                  </div>
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                                    style={{ backgroundColor: childColor }}
                                  >
                                    <span className="text-xs font-bold text-white">
                                      {child.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .substring(0, 2)}
                                    </span>
                                  </div>
                                </div>

                                {child.directReports > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600">
                                      Reports under them:
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 mt-1">
                                      {child.directReports}
                                    </div>
                                  </div>
                                )}

                                {child.children.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 mb-2">
                                      Their team roles:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {child.children
                                        .slice(0, 4)
                                        .map((subChild) => (
                                          <div
                                            key={subChild.id}
                                            className="flex items-start gap-1.5 px-2 py-1 text-xs rounded bg-white border border-gray-300"
                                          >
                                            <span
                                              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                                              style={{
                                                backgroundColor: childColor,
                                              }}
                                            />
                                            <span className="text-gray-700 font-medium text-nowrap">
                                              {subChild.role}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                    {child.children.length > 4 && (
                                      <span className="text-xs text-gray-500 px-2 py-1 mt-1 inline-block">
                                        +{child.children.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <FiUser
                            size={32}
                            className="mx-auto mb-2 opacity-50"
                          />
                          <p className="text-sm">No direct reports</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TeamParentBubbleView: React.FC<{ hierarchyData: TeamMember[] }> = ({
  hierarchyData,
}) => {
  return <TeamHierarchyCharts hierarchyData={hierarchyData} />;
};

export default TeamHierarchyCharts;
