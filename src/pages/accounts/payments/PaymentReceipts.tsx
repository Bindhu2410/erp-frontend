import React from "react";
import { Navigate } from "react-router-dom";

const PaymentReceipts: React.FC = () => {
  return <Navigate to="/accounts/payments" replace />;
};

export default PaymentReceipts;
