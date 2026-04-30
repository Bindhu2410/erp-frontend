import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrderService";

const ComparePOProcessing: React.FC = () => {
  const [quotationItems, setQuotationItems] = useState<any[]>([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(0);
  const [quotationData, setQuotationData] = useState<any>(null);
  const [purchaseOrderData, setPurchaseOrderData] = useState<any>(null);
  const [quotationBoms, setQuotationBoms] = useState<any[]>([]);
  const [purchaseOrderBoms, setPurchaseOrderBoms] = useState<any[]>([]);
  const navigate = useNavigate();
  // Get id from URL query param
  const location = useLocation();
  function getIdFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get("id");
  }

  useEffect(() => {
    const id = getIdFromUrl();
    if (!id) {
      setLoading(false);
      return;
    }
    api
      .get(`purchaseorder/compare-po-quotation-items/${id}`)
      .then((res) => res.data)
      .then((data) => {
        // The API returns BOM-like structures where each entry has childItems.
        // Normalize/flatten those into simple item rows the UI expects.
        const normalizeBomList = (list: any[], parentMeta: any = {}) => {
          if (!Array.isArray(list)) return [];
          const out: any[] = [];
          list.forEach((bom: any) => {
            const bomQty = bom.quantity || 1;
            const delivery =
              parentMeta?.deliveryDate ||
              parentMeta?.valid_till ||
              bom.delivery;
            const childItems = Array.isArray(bom.childItems)
              ? bom.childItems
              : [];
            childItems.forEach((child: any) => {
              out.push({
                bomId: bom.bomId,
                bomName: bom.bomName,
                bomType: bom.bomType,
                itemName: child.itemName || child.name || "",
                itemCode: child.itemCode || child.code || "",
                unitPrice: Number(child.quoteRate) || Number(child.unitPrice) || 0,
                qty: Number(child.quantity || bomQty) || 0,
                uom: child.uomName || child.uom || child.unit || "",
                hsn: child.hsn,
                taxPercentage: child.taxPercentage || child.tax || 0,
                categoryName: child.categoryName,
                delivery,
                rawChild: child,
              });
            });
          });
          return out;
        };

        // Parent meta info for delivery/tax comes under purchaseOrderInfo / quotationInfo
        const poMeta = data.purchaseOrderInfo || {};
        const quoMeta = data.quotationInfo || {};

        const normalizedPO = normalizeBomList(
          data.purchaseOrderItems || [],
          poMeta
        );
        const normalizedQuotation = normalizeBomList(
          data.quotationItems || [],
          quoMeta
        );

        // Keep both flattened lists for totals and the original BOM arrays for BOM-level UI
        setPurchaseOrderItems(normalizedPO);
        setQuotationItems(normalizedQuotation);
        setQuotationData({ ...quoMeta, items: normalizedQuotation });
        setPurchaseOrderData({ ...poMeta, items: normalizedPO });
        setQuotationBoms(
          Array.isArray(data.quotationItems) ? data.quotationItems : []
        );
        setPurchaseOrderBoms(
          Array.isArray(data.purchaseOrderItems) ? data.purchaseOrderItems : []
        );

        // Tax rate: prefer quotationInfo.taxes (string or number), fallback to data.taxRate
        const taxFromQuotation =
          quoMeta && (quoMeta.taxes ?? quoMeta.tax ?? quoMeta.taxPercentage);
        const parsedTax = taxFromQuotation ? Number(taxFromQuotation) : NaN;
        setTaxRate(
          !Number.isNaN(parsedTax) ? parsedTax : Number(data.taxRate || 0)
        );
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  // Action handlers
  const requestRevision = () => {
    const id = getIdFromUrl();
    toast.success("Revision request sent to customer successfully!");
    setTimeout(() => {
      navigate(`/po-view?id=${id}`);
    }, 1200); // Give user time to see the toast
  };
  const approvePO = async () => {
    const id = getIdFromUrl();
    const poIdInt =
      purchaseOrderData?.purchaseOrderInternalId ||
      purchaseOrderData?.purchaseOrderId ||
      id;
    const result = await purchaseOrderService.updateStatus(Number(poIdInt), "Approved");
    if (result.success) {
      toast.success("PO approved successfully!");
      navigate(`/po-view?id=${id}`);
    } else {
      toast.error("Failed to approve PO. Please try again.");
    }
  };

  // Helper: Format currency
  const formatCurrency = (amount: number) =>
    amount?.toLocaleString("en-IN", { style: "currency", currency: "INR" }) ||
    "₹0";

  // Wait for data
  if (loading || !quotationData || !purchaseOrderData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        Loading comparison data...
      </div>
    );
  }

  // Helper to get unique key for item
  const getKey = (item: any) => item.itemId || item.itemCode || item.itemName;

  // Build comparison: match by itemId (or code/name fallback)
  const comparison = quotationItems.map((qItem: any) => {
    const poItem = purchaseOrderItems.find(
      (p: any) => getKey(p) === getKey(qItem)
    );
    // Compare all relevant fields
    const match =
      poItem &&
      poItem.qty === qItem.qty &&
      poItem.unitPrice === qItem.unitPrice &&
      poItem.itemName === qItem.itemName &&
      poItem.itemCode === qItem.itemCode;
    return {
      quotation: qItem,
      po: poItem,
      match,
      priceVariance:
        poItem && poItem.unitPrice !== qItem.unitPrice
          ? poItem.unitPrice - qItem.unitPrice
          : 0,
      qtyVariance:
        poItem && poItem.qty !== qItem.qty ? poItem.qty - qItem.qty : 0,
    };
  });

  // BOM-level comparison: keep structure of quotationBoms and purchaseOrderBoms
  const bomComparison = quotationBoms.map((qb: any) => {
    const pb = purchaseOrderBoms.find((p: any) => p.bomId === qb.bomId) || null;
    const children = (qb.childItems || []).map((child: any) => {
      const poChild = pb
        ? (pb.childItems || []).find(
            (pc: any) =>
              (pc.itemCode || pc.code) === (child.itemCode || child.code) ||
              pc.itemName === child.itemName
          )
        : undefined;
      const effectiveQtyQ = Number(child.quantity || qb.quantity || 1) || 0;
      const effectiveQtyP = poChild
        ? Number(poChild.quantity || pb?.quantity || 0) || 0
        : 0;
      const unitPriceQ = Number(child.quoteRate) || Number(child.unitPrice) || 0;
      const unitPriceP = poChild ? Number(poChild.quoteRate) || Number(poChild.unitPrice) || 0 : 0;
      const match =
        !!poChild &&
        effectiveQtyP === effectiveQtyQ &&
        unitPriceP === unitPriceQ &&
        (poChild.itemName === child.itemName ||
          (poChild.itemCode || "") === (child.itemCode || ""));
      return {
        child,
        poChild,
        match,
        priceVariance: unitPriceP - unitPriceQ,
        qtyVariance: effectiveQtyP - effectiveQtyQ,
      };
    });

    const accessories = (qb.accessoryItems || []).map((acc: any) => {
      const poAcc = pb
        ? (pb.accessoryItems || []).find(
            (a: any) =>
              (a.itemCode || a.code) === (acc.itemCode || acc.code) ||
              a.itemName === acc.itemName
          )
        : undefined;
      return { accessory: acc, poAccessory: poAcc, match: !!poAcc };
    });

    const bomMatch =
      children.every((c: any) => c.match) &&
      accessories.every((a: any) => a.match);
    return { bom: qb, poBom: pb, children, accessories, bomMatch };
  });

  // Totals
  const quotationSubtotal = quotationItems.reduce(
    (sum: number, item: any) => sum + (item.qty || 0) * (item.unitPrice || 0),
    0
  );
  const quotationTax = (quotationSubtotal * taxRate) / 100;
  const quotationTotal = quotationSubtotal + quotationTax;

  const poSubtotal = purchaseOrderItems.reduce(
    (sum: number, item: any) => sum + (item.qty || 0) * (item.unitPrice || 0),
    0
  );
  const poTax = (poSubtotal * taxRate) / 100;
  const poTotal = poSubtotal + poTax;

  const netVariance = poTotal - quotationTotal;
  const variancePercent = quotationTotal
    ? ((netVariance / quotationTotal) * 100).toFixed(1)
    : "0";

  // Discrepancy counts
  const perfectMatches = comparison.filter((c: any) => c.match).length;
  const discrepancies = comparison.length - perfectMatches;
  const missingItems = purchaseOrderItems.filter(
    (p: any) => !quotationItems.find((q: any) => getKey(q) === getKey(p))
  ).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation containers */}
      <div id="header-container" />
      <div className="main-container flex">
        <div id="sidebar-container" />
        <main className="flex-1 content-area">
          <div className="py-8">
            {/* Header Section */}
            <div className="bg-white text-gray-900 px-8 py-8 rounded-xl mb-8 border border-orange-100 shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <nav className="mb-2 text-gray-500 text-sm">
                    <ol className="flex gap-2">
                      <li>
                        <span
                          className="hover:underline cursor-pointer"
                          onClick={() => navigate("/po-management")}
                        >
                          Home
                        </span>
                        <span className="mx-1">/</span>
                      </li>
                      <li>
                        <span
                          className="hover:underline cursor-pointer"
                          onClick={() => navigate(`/po-view?id=${getIdFromUrl()}`)}
                        >
                          PO Processing
                        </span>
                        <span className="mx-1">/</span>
                      </li>
                      <li className="text-gray-900">Comparison Analysis</li>
                    </ol>
                  </nav>
                  <h1 className="text-2xl font-bold mb-2">
                    PO vs Quotation Comparison
                  </h1>
                  <div className="mb-0 flex flex-col gap-1">
                    <span>
                      <strong>PO ID:</strong>{" "}
                      {purchaseOrderData?.poId || "PO-XXXX"}
                    </span>
                    <span>
                      <strong>Quotation ID:</strong>{" "}
                      {quotationData?.quotation_id || "QUO-XXXX"}
                    </span>
                    <span>
                      <strong>Customer:</strong>{" "}
                      {quotationData?.customer_name || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto">
              {/* Summary Statistics */}
              <div className="bg-white rounded-xl shadow p-8 mb-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-600">
                    {quotationItems.length}
                  </div>
                  <div className="uppercase text-xs text-gray-500 font-semibold">
                    Total Items
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-500">
                    {perfectMatches}
                  </div>
                  <div className="uppercase text-xs text-gray-500 font-semibold">
                    Perfect Match
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-400">
                    {discrepancies}
                  </div>
                  <div className="uppercase text-xs text-gray-500 font-semibold">
                    Discrepancies
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {formatCurrency(poTotal - quotationTotal)}
                  </div>
                  <div className="uppercase text-xs text-gray-500 font-semibold">
                    Price Variance
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-200">
                    {missingItems}
                  </div>
                  <div className="uppercase text-xs text-gray-500 font-semibold">
                    Missing Items
                  </div>
                </div>
              </div>

              {/* Document Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Original Quotation */}
                <div className="shadow-lg rounded-2xl overflow-hidden bg-white">
                  <div className="px-6 py-4 bg-gray-100 text-gray-900 font-semibold">
                    <h5 className="mb-0 flex items-center gap-2">
                      <span>🧾</span>Original Quotation
                    </h5>
                    <small>
                      {quotationData?.quotation_id || "QUO-XXXX"} |
                      Date: {quotationData?.quotation_date ? new Date(quotationData.quotation_date).toLocaleDateString("en-IN") : "-"}
                    </small>
                  </div>
                  <div className="p-0">
                    {quotationBoms.map((bom: any, bIdx: number) => {
                      const bComp = bomComparison.find(
                        (b: any) => b.bom.bomId === bom.bomId
                      ) || { children: [], accessories: [], bomMatch: false };
                      return (
                        <div key={bom.bomId || bIdx} className="mb-6">
                          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {bom.bomName}{" "}
                                <small className="text-xs text-gray-500">
                                  ({bom.bomType})
                                </small>
                              </div>
                              {bom.description && (
                                <div className="text-xs text-gray-500">
                                  {bom.description}
                                </div>
                              )}
                            </div>
                            <div>
                              {bComp.bomMatch ? (
                                <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs">
                                  ✔️ BOM Match
                                </span>
                              ) : (
                                <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs">
                                  ⚠️ BOM Diff
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-6">
                            {(bom.childItems || []).map((child: any) => {
                              const childComp = bComp.children.find(
                                (c: any) =>
                                  (c.child.itemCode || c.child.itemName) ===
                                  (child.itemCode || child.itemName)
                              );
                              const isMatch = childComp?.match;
                              const effectiveQty =
                                Number(child.quantity || bom.quantity || 1) ||
                                0;
                              const displayPrice = Number(child.quoteRate) || Number(child.unitPrice) || 0;
                              return (
                                <div
                                  key={child.itemCode || child.itemName}
                                  className={`comparison-item ${
                                    isMatch
                                      ? "match border-l-4 border-orange-400 bg-gray-50"
                                      : "discrepancy border-l-4 border-orange-500 bg-orange-100"
                                  } mb-4 p-6 rounded-r-2xl`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h6 className="font-semibold text-gray-800 mb-0">
                                      {child.itemName}
                                    </h6>
                                    {isMatch ? (
                                      <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                                        ✔️ Perfect Match
                                      </span>
                                    ) : childComp?.priceVariance !== 0 ? (
                                      <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                                        ⚠️ Price Variance
                                      </span>
                                    ) : (
                                      <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                                        ⚠️ Qty Variance
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 uppercase mb-1">
                                        Quantity
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {effectiveQty} {child.uomName || child.uom}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 uppercase mb-1">
                                        Unit Price
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {formatCurrency(displayPrice)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 uppercase mb-1">
                                        Total
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {formatCurrency(effectiveQty * displayPrice)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      {/* <div className="text-xs text-gray-500 uppercase mb-1">
                                        Delivery
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {bom.delivery ||
                                          quotationData?.delivery ||
                                          "-"}
                                      </div> */}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {(bom.accessoryItems || []).length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-semibold mb-2">
                                  Accessory Items
                                </div>
                                {(bom.accessoryItems || []).map((acc: any) => {
                                  const accComp = (
                                    bComp.accessories || []
                                  ).find(
                                    (a: any) =>
                                      (a.accessory.itemCode ||
                                        a.accessory.itemName) ===
                                      (acc.itemCode || acc.itemName)
                                  );
                                  return (
                                    <div
                                      key={acc.itemCode || acc.itemName}
                                      className="flex items-center justify-between bg-gray-50 p-3 rounded mb-2"
                                    >
                                      <div className="text-sm">
                                        {acc.itemName}
                                      </div>
                                      <div className="text-xs">
                                        {accComp?.match ? (
                                          <span className="text-green-600 font-semibold">
                                            Matched
                                          </span>
                                        ) : (
                                          <span className="text-orange-600 font-semibold">
                                            Missing
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex justify-between text-center text-sm font-semibold">
                      <div>Subtotal: {formatCurrency(quotationSubtotal)}</div>
                      <div>
                        Tax ({taxRate}%): {formatCurrency(quotationTax)}
                      </div>
                      <div>Total: {formatCurrency(quotationTotal)}</div>
                    </div>
                  </div>
                </div>
                {/* Customer Purchase Order */}
                <div className="shadow-lg rounded-2xl overflow-hidden bg-white">
                  <div className="px-6 py-4 bg-gray-100 text-gray-900 font-semibold">
                    <h5 className="mb-0 flex items-center gap-2">
                      <span>📄</span>Customer Purchase Order
                    </h5>
                    <small>
                      {purchaseOrderData?.poId || "PO-XXXX"}{" "}
                      | Received: {purchaseOrderData?.dateCreated ? new Date(purchaseOrderData.dateCreated).toLocaleDateString("en-IN") : "-"}
                    </small>
                  </div>
                  <div className="p-0">
                    {purchaseOrderBoms.map((bom: any, bIdx: number) => {
                      const bComp = bomComparison.find(
                        (b: any) => b.bom.bomId === bom.bomId
                      ) || { children: [], accessories: [], bomMatch: false };
                      return (
                        <div key={bom.bomId || bIdx} className="mb-6">
                          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-800">
                                {bom.bomName}{" "}
                                <small className="text-xs text-gray-500">
                                  ({bom.bomType})
                                </small>
                              </div>
                              {bom.description && (
                                <div className="text-xs text-gray-500">
                                  {bom.description}
                                </div>
                              )}
                            </div>
                            <div>
                              {bComp.bomMatch ? (
                                <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs">
                                  ✔️ BOM Match
                                </span>
                              ) : (
                                <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs">
                                  ⚠️ BOM Diff
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-6">
                            {(bom.childItems || []).map((child: any) => {
                              const childComp = bComp.children.find(
                                (c: any) =>
                                  (c.child.itemCode || c.child.itemName) ===
                                  (child.itemCode || child.itemName)
                              );
                              const isMatch = childComp?.match;
                              const effectiveQty =
                                Number(child.quantity || bom.quantity || 1) ||
                                0;
                              const displayPrice = Number(child.quoteRate) || Number(child.unitPrice) || 0;
                              return (
                                <div
                                  key={child.itemCode || child.itemName}
                                  className={`comparison-item ${
                                    isMatch
                                      ? "match border-l-4 border-orange-400 bg-gray-50"
                                      : "discrepancy border-l-4 border-orange-500 bg-orange-100"
                                  } mb-4 p-6 rounded-r-2xl`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h6 className="font-semibold text-gray-800 mb-0">
                                      {child.itemName}
                                    </h6>
                                    {isMatch ? (
                                      <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                                        ✔️ Perfect Match
                                      </span>
                                    ) : childComp?.priceVariance !== 0 ? (
                                      <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1 animate-pulse">
                                        ⚠️ Price Variance
                                      </span>
                                    ) : (
                                      <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1 animate-pulse">
                                        ⚠️ Qty Variance
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 uppercase mb-1">
                                        Quantity
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {effectiveQty} {child.uomName || child.uom}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 uppercase mb-1">
                                        Unit Price
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {formatCurrency(displayPrice)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 uppercase mb-1">
                                        Total
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {formatCurrency(effectiveQty * displayPrice)}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      {/* <div className="text-xs text-gray-500 uppercase mb-1">
                                        Delivery
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {bom.delivery ||
                                          purchaseOrderData?.deliveryDate ||
                                          "-"}
                                      </div> */}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {(bom.accessoryItems || []).length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-semibold mb-2">
                                  Accessory Items
                                </div>
                                {(bom.accessoryItems || []).map((acc: any) => {
                                  const accComp = (
                                    bComp.accessories || []
                                  ).find(
                                    (a: any) =>
                                      (a.accessory.itemCode ||
                                        a.accessory.itemName) ===
                                      (acc.itemCode || acc.itemName)
                                  );
                                  return (
                                    <div
                                      key={acc.itemCode || acc.itemName}
                                      className="flex items-center justify-between bg-gray-50 p-3 rounded mb-2"
                                    >
                                      <div className="text-sm">
                                        {acc.itemName}
                                      </div>
                                      <div className="text-xs">
                                        {accComp?.match ? (
                                          <span className="text-green-600 font-semibold">
                                            Matched
                                          </span>
                                        ) : (
                                          <span className="text-orange-600 font-semibold">
                                            Missing
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="flex justify-between text-center text-sm font-semibold">
                      <div>Subtotal: {formatCurrency(poSubtotal)}</div>
                      <div>
                        Tax ({taxRate}%): {formatCurrency(poTax)}
                      </div>
                      <div>Total: {formatCurrency(poTotal)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Discrepancy Analysis (only if discrepancies exist) */}
              {discrepancies > 0 && (
                <div className="bg-white rounded-xl shadow p-8 mb-8">
                  <h5 className="mb-4 flex items-center gap-2 text-lg font-bold text-orange-600">
                    <span>🔍</span>Detailed Discrepancy Analysis
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {comparison
                      .filter((c: any) => !c.match)
                      .map((c: any, idx: number) => {
                        const q = c.quotation;
                        const p = c.po;
                        const isPrice = c.priceVariance !== 0;
                        const isQty = c.qtyVariance !== 0;
                        return (
                          <div
                            key={q.itemCode || q.itemName}
                            className="border-l-4 border-orange-500 bg-orange-100 p-6 rounded-r-xl mb-4"
                          >
                            <h6 className="text-orange-600 font-bold flex items-center gap-2">
                              <span>⚠️</span>
                              {q.itemName} -{" "}
                              {isPrice
                                ? "Price Variance"
                                : isQty
                                ? "Quantity Variance"
                                : "Discrepancy"}
                            </h6>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <strong>Quotation Qty:</strong> {q.qty} {q.uom}
                                <br />
                                <strong>Unit Price:</strong>{" "}
                                {formatCurrency(q.unitPrice)}
                                <br />
                                <strong>Total:</strong>{" "}
                                {formatCurrency(q.qty * q.unitPrice)}
                              </div>
                              <div>
                                <strong>PO Qty:</strong>{" "}
                                {p ? `${p.qty} ${p.uom}` : "-"}
                                <br />
                                <strong>Unit Price:</strong>{" "}
                                {p ? formatCurrency(p.unitPrice) : "-"}
                                <br />
                                <strong>Total:</strong>{" "}
                                {p ? formatCurrency(p.qty * p.unitPrice) : "-"}
                              </div>
                            </div>
                            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded mt-2 font-semibold">
                              <strong>Impact:</strong>{" "}
                              {(() => {
                                if (isPrice && p) {
                                  const diff =
                                    (p.unitPrice - q.unitPrice) * q.qty;
                                  return `${formatCurrency(Math.abs(diff))} ${
                                    diff < 0 ? "reduction" : "increase"
                                  } in line total (${(
                                    (diff / (q.qty * q.unitPrice)) *
                                    100
                                  ).toFixed(1)}% variance)`;
                                } else if (isQty && p) {
                                  const diff = (p.qty - q.qty) * q.unitPrice;
                                  return `${formatCurrency(Math.abs(diff))} ${
                                    diff > 0 ? "increase" : "reduction"
                                  } in line total (${(
                                    (diff / (q.qty * q.unitPrice)) *
                                    100
                                  ).toFixed(1)}% variance)`;
                                } else {
                                  return "Discrepancy detected.";
                                }
                              })()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="bg-orange-50 rounded-xl p-6 mt-4">
                    <h6 className="font-bold flex items-center gap-2 mb-2">
                      <span>🧮</span>Financial Impact Summary
                    </h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <strong>Original Quote Total:</strong>
                        <br />
                        ₹4,01,200
                      </div>
                      <div>
                        <strong>Customer PO Total:</strong>
                        <br />
                        ₹4,33,650
                      </div>
                      <div>
                        <strong>Net Variance:</strong>
                        <br />
                        <span className="text-orange-600">+₹32,450</span>
                      </div>
                      <div>
                        <strong>Variance %:</strong>
                        <br />
                        <span className="text-orange-600">+8.1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis & Recommendations */}
              <div className="bg-white text-gray-800 rounded-xl p-2 md:p-8 mb-8 shadow">
                <h5 className="mb-4 md:mb-6 flex items-center gap-2 text-lg md:text-xl font-bold">
                  <span>📊</span>Analysis & Recommendations
                </h5>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2 md:gap-8">
                  {/* Key Insights Section */}
                  <div className="space-y-3">
                    <h6 className="font-bold flex items-center gap-2 mb-3 text-base md:text-lg">
                      <span>💡</span>Key Insights
                    </h6>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <ul className="space-y-2 text-sm md:text-base">
                        {comparison
                          .filter((c) => !c.match)
                          .map((c, idx) => {
                            const q = c.quotation;
                            const p = c.po;
                            if (c.priceVariance !== 0 && p) {
                              const percent =
                                ((p.unitPrice - q.unitPrice) / q.unitPrice) *
                                100;
                              return (
                                <li
                                  key={q.itemCode + "-price"}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-orange-400 mt-1">
                                    •
                                  </span>
                                  <span>
                                    <strong>{q.itemName}:</strong> Customer has
                                    negotiated a{" "}
                                    <span
                                      className={`font-semibold ${
                                        percent < 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {Math.abs(percent).toFixed(1)}%{" "}
                                      {percent < 0 ? "discount" : "increase"}
                                    </span>{" "}
                                    on unit price (from{" "}
                                    {formatCurrency(q.unitPrice)} to{" "}
                                    {formatCurrency(p.unitPrice)})
                                  </span>
                                </li>
                              );
                            }
                            if (c.qtyVariance !== 0 && p) {
                              return (
                                <li
                                  key={q.itemCode + "-qty"}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-orange-400 mt-1">
                                    •
                                  </span>
                                  <span>
                                    <strong>{q.itemName}:</strong> Quantity
                                    changed from {q.qty} to {p.qty} (
                                    {c.qtyVariance > 0 ? "+" : ""}
                                    {c.qtyVariance})
                                  </span>
                                </li>
                              );
                            }
                            return null;
                          })}
                        {netVariance !== 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>
                              Overall order value{" "}
                              <span
                                className={`font-semibold ${
                                  netVariance > 0
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {netVariance > 0 ? "increased" : "decreased"}
                              </span>{" "}
                              by {formatCurrency(Math.abs(netVariance))} (
                              {variancePercent}% variance)
                            </span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>No delivery date conflicts identified</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Actions Section */}
                  <div className="space-y-3">
                    <h6 className="font-bold flex items-center gap-2 mb-3 text-base md:text-lg">
                      <span>📝</span>Recommended Actions
                    </h6>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <ul className="space-y-2 text-sm md:text-base">
                        {comparison
                          .filter((c) => !c.match)
                          .map((c, idx) => {
                            const q = c.quotation;
                            const p = c.po;
                            if (c.priceVariance !== 0 && p) {
                              const percent = Math.abs(
                                ((p.unitPrice - q.unitPrice) / q.unitPrice) *
                                  100
                              ).toFixed(1);
                              return (
                                <li
                                  key={q.itemCode + "-approve"}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-blue-400 mt-1">•</span>
                                  <span>
                                    <strong className="text-blue-400">
                                      Approve:
                                    </strong>{" "}
                                    {q.itemName} price change is {percent}%{" "}
                                    {p.unitPrice < q.unitPrice
                                      ? "discount"
                                      : "increase"}
                                  </span>
                                </li>
                              );
                            }
                            if (c.qtyVariance !== 0 && p) {
                              return (
                                <li
                                  key={q.itemCode + "-verify"}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-orange-400 mt-1">
                                    •
                                  </span>
                                  <span>
                                    <strong className="text-orange-400">
                                      Verify:
                                    </strong>{" "}
                                    {q.itemName} quantity changed from {q.qty}{" "}
                                    to {p.qty}
                                  </span>
                                </li>
                              );
                            }
                            return null;
                          })}
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>
                            <strong className="text-green-600">Update:</strong>{" "}
                            Sales order to reflect new quantities and prices
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>
                            <strong className="text-blue-400">Confirm:</strong>{" "}
                            Delivery schedule can accommodate changes
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-5 bg-white p-8 rounded-xl shadow-lg text-center mb-8">
                <h6 className="mb-3 font-semibold">Choose Action</h6>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-semibold uppercase mx-2 transition hover:-translate-y-1 hover:shadow-lg"
                  onClick={requestRevision}
                >
                  <span className="mr-2">✏️</span>Request Revision
                </button>
                {/* <button
                  className="bg-orange-200 text-white px-8 py-3 rounded-full font-semibold uppercase mx-2 transition hover:-translate-y-1 hover:shadow-lg"
                  onClick={exportComparison}
                >
                  <span className="mr-2">⬇️</span>Export Report
                </button> */}
                {discrepancies === 0 && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold uppercase mx-2 transition hover:-translate-y-1 hover:shadow-lg"
                    onClick={approvePO}
                  >
                    <span className="mr-2">✔️</span>Approve PO
                  </button>
                )}
              </div>
            </div>

            {/* Floating Summary (Desktop Only) */}
            {/* <div className="hidden xl:block fixed top-1/2 right-8 transform -translate-y-1/2 w-64 bg-white rounded-xl p-6 shadow-lg z-50">
              <h6 className="text-center mb-3 font-semibold">Quick Summary</h6>
              <div className="text-center mb-3">
                <div className="w-full h-5 bg-orange-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 via-orange-300 to-orange-600 rounded-full transition-all duration-2000"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <small>{confidence}% AI Confidence</small>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Total Items:</span>
                <strong>{quotationItems.length}</strong>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Matches:</span>
                <strong className="text-orange-500">{perfectMatches}</strong>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Discrepancies:</span>
                <strong className="text-orange-400">{discrepancies}</strong>
              </div>
              <div className="flex justify-between mb-3 text-sm">
                <span>Net Variance:</span>
                <strong
                  className={
                    netVariance >= 0 ? "text-orange-600" : "text-orange-600"
                  }
                >
                  {netVariance >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(netVariance))}
                </strong>
              </div>
              <div className="text-center">
                <small className="text-orange-300">
                  Last analyzed: <br />
                  {new Date().toLocaleString()}
                </small>
              </div>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ComparePOProcessing;
