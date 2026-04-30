import { TargetTableRow, TargetStatus } from "../../types/target";

const mockTargets: TargetTableRow[] = [
  {
    id: "1", targetId: "1", docId: "TD-00017",
    fromDate: "01/04/2025", toDate: "31/03/2026",
    territory: "CHENNAI, TIRUVALUR, KANCHIPUR", territoryId: "t1",
    zoneId: "z1", zoneName: "CHENNAI", employeeId: "e1", employeeName: "Pradeep J",
    status: "Active" as TargetStatus, createdDate: "2025-04-01",
    productName: "Diathermy", modelName: "E-Lite",
    qty: 5, targetAmount: 5000000, achievedAmount: 0, achievementPercentage: 0,
  },
  {
    id: "2", targetId: "1", docId: "TD-00017",
    fromDate: "01/04/2025", toDate: "31/03/2026",
    territory: "CHENNAI, TIRUVALUR, KANCHIPUR", territoryId: "t1",
    zoneId: "z1", zoneName: "CHENNAI", employeeId: "e1", employeeName: "Pradeep J",
    status: "Active" as TargetStatus, createdDate: "2025-04-01",
    productName: "Diathermy", modelName: "D + Lite",
    qty: 5, targetAmount: 5000000, achievedAmount: 0, achievementPercentage: 0,
  },
  {
    id: "3", targetId: "1", docId: "TD-00017",
    fromDate: "01/04/2025", toDate: "31/03/2026",
    territory: "CHENNAI, TIRUVALUR, KANCHIPUR", territoryId: "t1",
    zoneId: "z1", zoneName: "CHENNAI", employeeId: "e1", employeeName: "Pradeep J",
    status: "Active" as TargetStatus, createdDate: "2025-04-01",
    productName: "Diathermy", modelName: "L + Lite",
    qty: 2, targetAmount: 5000000, achievedAmount: 0, achievementPercentage: 0,
  },
  {
    id: "4", targetId: "1", docId: "TD-00017",
    fromDate: "01/04/2025", toDate: "31/03/2026",
    territory: "CHENNAI, TIRUVALUR, KANCHIPUR", territoryId: "t1",
    zoneId: "z1", zoneName: "CHENNAI", employeeId: "e1", employeeName: "Pradeep J",
    status: "Active" as TargetStatus, createdDate: "2025-04-01",
    productName: "TOUCH 5", modelName: "COMBI",
    qty: 5, targetAmount: 5000000, achievedAmount: 0, achievementPercentage: 0,
  },
  {
    id: "5", targetId: "1", docId: "TD-00017",
    fromDate: "01/04/2025", toDate: "31/03/2026",
    territory: "CHENNAI, TIRUVALUR, KANCHIPUR", territoryId: "t1",
    zoneId: "z1", zoneName: "CHENNAI", employeeId: "e1", employeeName: "Pradeep J",
    status: "Active" as TargetStatus, createdDate: "2025-04-01",
    productName: "TOUCH 5", modelName: "ALLGATURE",
    qty: 5, targetAmount: 5000000, achievedAmount: 0, achievementPercentage: 0,
  },
  {
    id: "6", targetId: "1", docId: "TD-00017",
    fromDate: "01/04/2025", toDate: "31/03/2026",
    territory: "CHENNAI, TIRUVALUR, KANCHIPUR", territoryId: "t1",
    zoneId: "z1", zoneName: "CHENNAI", employeeId: "e1", employeeName: "Pradeep J",
    status: "Active" as TargetStatus, createdDate: "2025-04-01",
    productName: "TOUCH 5", modelName: "PLASMA",
    qty: 1, targetAmount: 5000000, achievedAmount: 0, achievementPercentage: 0,
  },
];

export default mockTargets;
