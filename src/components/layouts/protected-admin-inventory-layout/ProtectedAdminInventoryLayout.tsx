import React from "react";
import InventoryLayout from "../inventory-layout/InventoryLayout";

import withAdminAuth from "../../auth/withAdminAuth";
import withAuth from "../../auth/withAuth";

// First apply regular authentication, then admin authentication, and finally wrap with inventory layout
const ProtectedAdminInventoryLayout = withAdminAuth(withAuth(InventoryLayout));

export default ProtectedAdminInventoryLayout;
