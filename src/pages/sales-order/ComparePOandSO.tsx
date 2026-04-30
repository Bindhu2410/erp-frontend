import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import Loader from "../../components/common/Loader";

interface Match {
  field: string;
  soValue: any;
  poValue: any;
  semanticMatch: boolean;
  confidence: number;
}

interface Discrepancy {
  field: string;
  soValue: any;
  poValue: any;
  discrepancyType: string;
  semanticMatch: boolean;
  confidence: number;
}

interface SemanticAnalysis {
  overallSimilarity: number;
  keyDifferences: string[];
}

interface Summary {
  totalItems: number;
  matchingItems: number;
  matchPercentage: number;
}

interface Data {
  summary: Summary;
  matches: Match[];
  discrepancies: Discrepancy[];
  semanticAnalysis: SemanticAnalysis;
}

interface ComparisonProps {
  poData?: any;
  soData?: any;
  loading?: boolean;
}

const SOVsPOComparison: React.FC<ComparisonProps> = ({
  poData,
  soData,
  loading,
}) => {
  const [data, setData] = useState<Data | null>(null);
  const originalSO = soData?.salesOrder;
  const comparedPO = poData?.purchaseOrder || {};
  const [overriddenFields, setOverriddenFields] = useState<
    Record<string, boolean>
  >({});
  const [loadPo, setLoading] = useState(false);
  useEffect(() => {
    const fetchcomparisonDocument = async () => {
      const payload = {
        salesOrder: originalSO,
        purchaseOrder: comparedPO,
      };
      setLoading(true);
      try {
        const response = await axios.post(
          `https://compare-po-so-function-862697878862.asia-south1.run.app`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response.data, "AIJSOnData");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching comparison data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (poData && soData) fetchcomparisonDocument();
  }, [poData, soData]);
  const toggleFieldMatch = (field: string) => {
    const currentStatus = overriddenFields[field];
    const newStatus = currentStatus === undefined ? false : !currentStatus;

    if (
      window.confirm(
        `Are you sure you want to ${
          newStatus ? "mark as matching" : "mark as not matching"
        } this field?`
      )
    ) {
      setOverriddenFields((prev) => ({
        ...prev,
        [field]: newStatus,
      }));
    }
  };
  const getMatch = (field: string): Match | undefined => {
    return data?.matches?.find((match) => match.field === field);
  };

  const getDiscrepancy = (field: string): Discrepancy | undefined => {
    return data?.discrepancies?.find((d) => d.field === field);
  };

  const getFieldValue = (
    field: string
  ): { soValue: any; poValue: any; isMatch: boolean } => {
    const match = getMatch(field);
    if (match) {
      return {
        soValue: match.soValue,
        poValue: match.poValue,
        isMatch: match.semanticMatch,
      };
    }

    const discrepancy = getDiscrepancy(field);
    if (discrepancy) {
      return {
        soValue: discrepancy.soValue,
        poValue: discrepancy.poValue,
        isMatch: discrepancy.semanticMatch,
      };
    }

    return {
      soValue: undefined,
      poValue: undefined,
      isMatch: false,
    };
  };

  function splitCamelCase(text: string) {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (str) => str.toUpperCase());
  }

  const renderValue = (value: any, isMatch: boolean, field?: string) => {
    if (value === undefined || value === null) return null;

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-2">
          {value.map((item, index) => (
            <li key={index} className="flex items-center">
              {isMatch ? (
                <FaCheck size={14} className="mr-1 text-green-600 flex-none" />
              ) : (
                <FaTimes className="mr-1 text-red-600 flex-none" />
              )}
              {typeof item === "object" ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <ul className="space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <li key={key}>
              <span className="font-medium capitalize">{key}:</span>{" "}
              {String(val)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <span className={`flex items-center ${!isMatch ? "text-red-600" : ""}`}>
        {isMatch ? (
          <FaCheck size={14} className="mr-1 text-green-600 flex-none" />
        ) : (
          <FaTimes className="mr-1 text-red-600 flex-none" />
        )}
        {String(value)}
      </span>
    );
  };

  const renderTermsAndConditions = (type: any) => {
    const termsMatch = getMatch("termsAndConditions");
    if (!termsMatch) return null;

    const soTerms =
      typeof termsMatch.soValue === "string"
        ? JSON.parse(termsMatch.soValue)
        : termsMatch.soValue;
    const poTerms =
      typeof termsMatch.poValue === "string"
        ? JSON.parse(termsMatch.poValue)
        : termsMatch.poValue;

    const isOverridden = overriddenFields.hasOwnProperty("termsAndConditions");
    const displayMatch = isOverridden
      ? overriddenFields["termsAndConditions"]
      : termsMatch.semanticMatch;
    return (
      <div className="mb-4">
        <div className="flex items-center font-medium">
          {displayMatch ? (
            <FaCheck
              size={14}
              className="mr-1 text-green-600 flex-none"
              onClick={() => toggleFieldMatch("termsAndConditions")}
            />
          ) : (
            <FaTimes
              className="mr-1 text-red-600 flex-none"
              onClick={() => toggleFieldMatch("termsAndConditions")}
            />
          )}
          <h4 className="font-semibold mb-2">Terms and Conditions</h4>
        </div>

        <ul className="ml-6 mt-2 space-y-3">
          {Object.keys(soTerms).map((key) => {
            const termField = `termsAndConditions.${key}`;
            const termMatch = getMatch(termField);
            const termDiscrepancy = getDiscrepancy(termField);
            const isTermMatch =
              termMatch !== undefined ||
              (termDiscrepancy === undefined && termsMatch.semanticMatch);

            return (
              <li key={key} className="flex flex-col">
                <div className="flex items-center">
                  {isTermMatch ? (
                    <FaCheck className="mr-1 text-green-600 flex-none" />
                  ) : (
                    <FaTimes className="mr-1 text-red-600 flex-none" />
                  )}
                  <span className="font-medium capitalize">
                    {splitCamelCase(key)}:
                  </span>
                </div>

                <div className="pl-6">
                  {type === "so" ? (
                    <div className="border-r pr-4">
                      <p className="text-md">{soTerms[key]}</p>
                    </div>
                  ) : (
                    <div>
                      <p
                        className={`text-md ${
                          !isTermMatch ? "text-red-600" : ""
                        }`}
                      >
                        {poTerms[key]}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const getItemIndices = () => {
    const itemFields = [
      ...(data?.matches || []),
      ...(data?.discrepancies || []),
    ].filter((f) => f.field.startsWith("items["));

    const indices = new Set<number>();
    itemFields.forEach((f) => {
      const match = f.field.match(/items\[(\d+)\]/);
      if (match) indices.add(parseInt(match[1]));
    });
    return Array.from(indices);
  };

  const getItemFields = (index: number) => {
    const prefix = `items[${index}]`;
    return {
      description: getFieldValue(`${prefix}.description`),
      qty: getFieldValue(`${prefix}.qty`),
      rate: getFieldValue(`${prefix}.rate`),
      consumables: getFieldValue(`${prefix}.accessories.consumables`),
      vesselSealing: getFieldValue(`${prefix}.accessories.vesselSealing`),
    };
  };

  const renderItemDetails = (index: number) => {
    console.log(index, "index");
    const fields = getItemFields(index);
    const sno = index + 1;

    return (
      <tr key={index} className="border-b border-gray-200">
        <td className="px-2 py-2 align-top">{sno}</td>
        <td className="px-2 py-2">
          {renderValue(
            fields.description.soValue,
            fields.description.isMatch
          )}
          <div className="ml-6 mt-2 text-sm space-y-2">
            {fields.consumables.soValue && (
              <>
                <div className="font-medium">Consumables:</div>
                {renderValue(
                  fields.consumables.soValue,
                  fields.consumables.isMatch
                )}
              </>
            )}
            {fields.vesselSealing.soValue && (
              <>
                <div className="font-medium">Vessel Sealing:</div>
                {renderValue(
                  fields.vesselSealing.soValue,
                  fields.vesselSealing.isMatch
                )}
              </>
            )}
          </div>
        </td>
        <td className="px-2 align-top  whitespace-nowrap py-2">
          {renderValue(fields.qty.soValue, fields.qty.isMatch)}
        </td>
        <td className="px-2 align-top py-2">
          {renderValue(fields.rate.soValue, fields.rate.isMatch)}
        </td>
      </tr>
    );
  };

  const renderPOItemDetails = (index: number) => {
    console.log(index, "index");
    const fields = getItemFields(index);
    const sno = index + 1;

    return (
      <tr key={index} className="border-b border-gray-200">
        <td className="px-2 py-2 align-top">{sno}</td>
        <td className="px-2 py-2">
          {renderValue(fields.description.poValue, fields.description.isMatch)}
          <div className="ml-6 mt-2 text-sm space-y-2">
            {fields.consumables.poValue && (
              <>
                <div className="font-medium">Consumables:</div>
                {renderValue(
                  fields.consumables.poValue,
                  fields.consumables.isMatch
                )}
              </>
            )}
            {fields.vesselSealing.poValue && (
              <>
                <div className="font-medium">Vessel Sealing:</div>
                {renderValue(
                  fields.vesselSealing.poValue,
                  fields.vesselSealing.isMatch
                )}
              </>
            )}
          </div>
        </td>
        <td className="px-2 align-top whitespace-nowrap py-2">
          {renderValue(fields.qty.poValue, fields.qty.isMatch)}
        </td>
        <td className="px-2 align-top py-2">
          {renderValue(fields.rate.poValue, fields.rate.isMatch)}
        </td>
      </tr>
    );
  };

  return (
    <div className=" bg-gray-50  py-8 ">
      {!data ? (
        <div className="flex items-center  justify-center">
          {loading || loadPo ? (
            <div className="text-gray-500  text-lg">
              <Loader />
            </div>
          ) : (
            <div className="text-gray-500 text-lg">
              Purchase Order not Found
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-6xl min-h-screen mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-blue-500 p-6">
            <h2 className="text-2xl font-bold text-blue-600">
              Sales Order vs Purchase Order
            </h2>
            <div className="text-sm">
              <div className="flex items-center">
                <FaCheck size={14} className="mr-1 text-green-600 flex-none" />
                <span>
                  Reference No.:{" "}
                  {
                    getFieldValue("reference")
                      .soValue?.toString()
                      .split(" dated")[0]
                  }
                </span>
              </div>
              <div className="flex items-center">
                <FaCheck size={14} className="mr-1 text-green-600 flex-none" />
                <span>Dated: {getFieldValue("date").soValue}</span>
              </div>
            </div>
          </div>

          {/* Comparison Sections */}
          <div className="flex flex-col md:flex-row gap-6 p-2">
            {/* Sales Order Section */}
            <div className="flex-1 border border-gray-200 rounded-lg p-2">
              <h3 className="text-xl font-semibold mb-4">Sales Order</h3>
              <div className="mb-6">
                {renderValue(
                  getFieldValue("to.company").soValue,
                  getFieldValue("to.company").isMatch
                )}
                {renderValue(
                  getFieldValue("to.address").soValue,
                  getFieldValue("to.address").isMatch
                )}
              </div>

              <table className="w-full mb-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">S.No</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Qty</th>
                    <th className="px-4 py-2 text-left">Rate</th>
                  </tr>
                </thead>
                <tbody>{getItemIndices().map(renderItemDetails)}</tbody>
              </table>

              {renderTermsAndConditions("so")}
            </div>

            {/* Purchase Order Section */}
            <div className="flex-1 border border-gray-200 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">Purchase Order</h3>
              <div className="mb-6">
                {renderValue(
                  getFieldValue("to.company").poValue,
                  getFieldValue("to.company").isMatch
                )}
                {renderValue(
                  getFieldValue("to.address").poValue,
                  getFieldValue("to.address").isMatch
                )}
              </div>

              <table className="w-full mb-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">S.No</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Qty</th>
                    <th className="px-4 py-2 text-left">Rate</th>
                  </tr>
                </thead>
                <tbody>{getItemIndices().map(renderPOItemDetails)}</tbody>
              </table>

              {renderTermsAndConditions("PO")}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div>
              <p className="font-medium">Key Differences:</p>
              <ul className="list-disc pl-2 space-y-1">
                {data.semanticAnalysis.keyDifferences.map((diff, index) => (
                  <li key={index} className="text-red-500">
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOVsPOComparison;
