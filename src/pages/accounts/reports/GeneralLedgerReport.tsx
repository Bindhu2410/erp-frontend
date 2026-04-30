import React from "react";
import { Navigate } from "react-router-dom";

const GeneralLedgerReport: React.FC = () => {
  return <Navigate to="/accounts/general-ledger" replace />;
};


export default GeneralLedgerReport;
