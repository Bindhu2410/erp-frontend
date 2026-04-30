import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCalendar as Calendar,
  FaList as List,
  FaSearch as Search,
  FaFilter as Filter,
  FaChevronRight as ChevronRight,
} from "react-icons/fa";
import api from "../../../services/api";
import { useUser } from "../../../context/UserContext";

interface BookedDate {
  from: string;
  to: string;
  demoId: number;
  demoName: string;
}

interface AvailabilityItem {
  itemid: number;
  itemname: string;
  itemcode: string;
  bookeddates: BookedDate[];
}

interface DemoProduct {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  availableQty: number;
  totalQty: number;
  location: string;
  lastServiceDate: string;
  condition: string;
  nextAvailableDate: string;
  availableFrom?: string;
  availableTo?: string;
  image?: string;
}

interface DemoRequest {
  id: string;
  customerName: string;
  productRequired: string;
  requestedDate: string;
  startDate?: string;
  endDate?: string;
  demoType: string;
  status: string;
  priority: string;
}

const CheckDemoProductAvailability: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [demoProducts, setDemoProducts] = useState<DemoProduct[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Initialize selectedDate to today's date in ISO format
  const getTodayISO = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityItem[]>([]);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const { user } = useUser();

  // Get product filter from query params
  const productIdParam = searchParams.get("productId");
  const productCodeParam = searchParams.get("productCode");
  const itemIdParam = searchParams.get("itemId");
  const demoIdParam = searchParams.get("demoId");
  const actionParam = searchParams.get("action");


  // Fetch demo products from API (ItemMaster filtered by groupName = 'Demo')
  useEffect(() => {
    const fetchDemoProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("ItemMaster");
        // Filter for groupName === 'Demo'
        const filtered = (response.data || []).filter((item: any) => item.groupName === "Demo");
        // Map to DemoProduct interface
        const mapped: DemoProduct[] = filtered.map((item: any, idx: number) => ({
          id: item.itemId?.toString() || `demo-${idx}`,
          productName: item.itemName || "",
          productCode: item.itemCode || "",
          category: item.category || "",
          availableQty: item.availableQty ?? 0,
          totalQty: item.totalQty ?? 0,
          location: item.location || "",
          lastServiceDate: item.lastServiceDate || "",
          condition: item.condition || "",
          nextAvailableDate: item.nextAvailableDate || "",
          availableFrom: item.availableFrom || undefined,
          availableTo: item.availableTo || undefined,
          image: item.image || "📦",
        }));
        setDemoProducts(mapped);
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(mapped.map((p) => p.category)));
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching demo products:", err);
        setDemoProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDemoProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productCodeParam]);

  const sampleDemoRequests: DemoRequest[] = [
    {
      id: "REQ-001",
      customerName: "City Hospital",
      productRequired: "Ultrasound Machine Model A",
      requestedDate: "2025-11-28",
      // support multi-day demos
      startDate: "2025-11-28",
      endDate: "2025-11-29",
      demoType: "In-person",
      status: "Pending",
      priority: "High",
    },
    {
      id: "REQ-002",
      customerName: "Health Clinic ABC",
      productRequired: "ECG Monitor Premium",
      requestedDate: "2025-11-29",
      startDate: "2025-11-29",
      endDate: "2025-11-29",
      demoType: "Virtual",
      status: "Pending",
      priority: "Medium",
    },
    {
      id: "REQ-003",
      customerName: "Diagnostic Center XYZ",
      productRequired: "Digital Thermometer",
      requestedDate: "2025-11-26",
      startDate: "2025-11-26",
      endDate: "2025-11-26",
      demoType: "In-person",
      status: "Scheduled",
      priority: "High",
    },
  ];

  // Helper: get days for calendar month
  const getMonthDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return { days, firstDayWeekday: firstDay.getDay() };
  };

  const formatISO = (d: Date) => d.toISOString().split("T")[0];

  const isDateInRange = (dateStr: string, start: string, end: string) => {
    const d = new Date(dateStr);
    const s = new Date(start);
    const e = new Date(end);
    return d >= s && d <= e;
  };

  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const prevMonth = () => {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const fetchAvailability = useCallback(async (month: Date) => {
    if (!itemIdParam) return;
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    const lastDay = new Date(year, month.getMonth() + 1, 0).getDate();
    try {
      const res = await api.post("DemoCalendar/availability", {
        itemId: Number(itemIdParam),
        day: 1,
        month: monthNum,
        year,
        toDay: lastDay,
        toMonth: monthNum,
        toYear: year,
      });
      setAvailabilityData(res.data || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setAvailabilityData([]);
    }
  }, [itemIdParam]);

  useEffect(() => {
    fetchAvailability(calendarMonth);
  }, [calendarMonth, fetchAvailability]);

  const isDateBooked = (iso: string): { booked: boolean; itemName: string } => {
    for (const item of availabilityData) {
      for (const bd of item.bookeddates) {
        if (iso >= bd.from.split("T")[0] && iso <= bd.to.split("T")[0]) {
          return { booked: true, itemName: item.itemname };
        }
      }
    }
    return { booked: false, itemName: "" };
  };



  // Filter products based on search and category
  const filteredProducts = demoProducts.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Requests scheduled for the selected date (supports multi-day requests)
  const selectedScheduled = demoRequests.filter((r) =>
    r.startDate && r.endDate
      ? isDateInRange(selectedDate, r.startDate, r.endDate)
      : r.requestedDate === selectedDate
  );

  // Products available for the selected date
  const selectedAvailable = demoProducts.filter((p) =>
    p.availableFrom && p.availableTo
      ? isDateInRange(selectedDate, p.availableFrom, p.availableTo)
      : p.nextAvailableDate === selectedDate
  );

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio === 1) return "text-green-600 bg-green-50";
    if (ratio > 0.5) return "text-blue-600 bg-blue-50";
    if (ratio > 0) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Fair":
        return "bg-yellow-100 text-yellow-800";
      case "Maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectProduct = (product: DemoProduct) => {
    console.log("Selected product:", product);
  };

  const handleApproveDemo = async () => {
    if (!demoIdParam) return;
    setApproveLoading(true);
    try {
      await api.put(`DemoRequest/${demoIdParam}/status`, {
        Status: "Approved",
        Notes: "Demo request approved after availability check",
      });
      setApproved(true);
      setTimeout(() => navigate("/inventory/demo/requests"), 1500);
    } catch (err) {
      console.error("Approve failed", err);
      alert("Failed to approve demo request");
    } finally {
      setApproveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Approve Banner */}
        {actionParam === "approve" && demoIdParam && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-800">Availability Check Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                Review the calendar below to verify availability, then click Approve to confirm.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/inventory/demo/requests")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveDemo}
                disabled={approveLoading || approved}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-60"
              >
                {approved ? "Approved ✓" : approveLoading ? "Approving..." : "Approve Demo"}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Check Demo Product Availability
              </h1>
              <p className="text-gray-600 mt-2">
                View available demo products and schedule demonstrations
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <List size={18} />
                List View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar size={18} />
                Calendar View
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by product name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Filter size={20} className="text-gray-500 mt-2" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Demo Schedule
                </h2>

                {/* Mini Calendar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="px-2 py-1 rounded hover:bg-gray-100"
                        aria-label="Previous month"
                      >
                        ◀
                      </button>
                      <div className="text-lg font-medium">
                        {calendarMonth.toLocaleString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <button
                        onClick={nextMonth}
                        className="px-2 py-1 rounded hover:bg-gray-100"
                        aria-label="Next month"
                      >
                        ▶
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Selected: {selectedDate}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <div
                          key={d}
                          className="text-center text-xs font-semibold text-gray-600 py-1"
                        >
                          {d}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1 mt-2">
                    {(() => {
                      const { days, firstDayWeekday } =
                        getMonthDays(calendarMonth);
                      const blanks = Array.from({ length: firstDayWeekday });
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const todayISO = formatISO(today);

                      return (
                        <>
                          {blanks.map((_, i) => (
                            <div
                              key={`b-${i}`}
                              className="h-20 border rounded bg-gray-50"
                            />
                          ))}
                          {days.map((day) => {
                            const iso = formatISO(day);
                            // Only show present and future dates
                            const isPastDate = day < today;

                            const { booked, itemName } = isDateBooked(iso);

                            const isSelected = selectedDate === iso;
                            const isToday = iso === todayISO;

                            return (
                              <div
                                key={iso}
                                onClick={() =>
                                  !isPastDate && setSelectedDate(iso)
                                }
                                className={`h-20 p-1 border rounded flex flex-col justify-between ${
                                  isPastDate
                                    ? "bg-gray-100 cursor-not-allowed opacity-50 border-gray-200"
                                    : booked
                                    ? "bg-red-50 border-red-300 cursor-pointer"
                                    : isSelected
                                    ? "ring-2 ring-blue-300 bg-blue-50 cursor-pointer"
                                    : isToday
                                    ? "ring-2 ring-green-300 bg-green-50 border-green-300 cursor-pointer"
                                    : "bg-white cursor-pointer"
                                } `}
                              >
                                <div className="flex justify-between items-start">
                                  <div
                                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                      isPastDate
                                        ? "text-gray-400"
                                        : isToday
                                        ? "bg-green-600 text-white"
                                        : ""
                                    }`}
                                  >
                                    {day.getDate()}
                                  </div>
                                  {booked && (
                                    <span className="text-red-500 text-xs">●</span>
                                  )}
                                </div>
                                {booked && (
                                  <div className="flex-1 overflow-hidden">
                                    <div
                                      title={`${itemName} - Booked`}
                                      className="px-1 py-0.5 rounded text-white bg-red-500 truncate text-center text-xs"
                                    >
                                      {itemName} - Booked
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Products for selected date */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    Booked Products - {selectedDate}
                  </h3>
                  {(() => {
                    const bookedItems = availabilityData.filter((item) =>
                      item.bookeddates.some(
                        (bd) =>
                          selectedDate >= bd.from.split("T")[0] &&
                          selectedDate <= bd.to.split("T")[0]
                      )
                    );
                    return bookedItems.length > 0 ? (
                      bookedItems.map((item) => (
                        <div
                          key={item.itemid}
                          className="border border-red-200 rounded-lg p-4 bg-red-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">📦</div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {item.itemname}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Code: {item.itemcode}
                              </p>
                            </div>
                            <div className="ml-auto px-3 py-1 rounded bg-red-500 text-white text-sm font-bold">
                              Booked
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No booked products for this date
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Details for Selected Date */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Details — {selectedDate}
              </h2>

              {/* Booked Products - Only show for present and future dates */}
              {!isPastDate(selectedDate) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Booked Products
                  </h3>
                  {(() => {
                    const bookedItems = availabilityData.filter((item) =>
                      item.bookeddates.some(
                        (bd) =>
                          selectedDate >= bd.from.split("T")[0] &&
                          selectedDate <= bd.to.split("T")[0]
                      )
                    );
                    return bookedItems.length > 0 ? (
                      <div className="space-y-3">
                        {bookedItems.map((item) => (
                          <div
                            key={item.itemid}
                            className="border border-red-200 rounded-lg p-3 bg-red-50"
                          >
                            <h4 className="font-medium text-gray-900 text-sm">
                              {item.itemname}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Code: {item.itemcode}
                            </p>
                            <div className="mt-1 text-xs px-2 py-1 rounded bg-red-100 text-red-800 inline-block">
                              Booked
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No booked products for this date
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Available Products */}
              <div
                className={
                  isPastDate(selectedDate)
                    ? ""
                    : "mt-6 pt-6 border-t border-gray-200"
                }
              >
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Available Products
                </h3>
                {selectedAvailable.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAvailable.map((product) => (
                      <div
                        key={product.id}
                        className="border border-green-200 rounded-lg p-3 hover:shadow-md transition bg-green-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {product.productName}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Code: {product.productCode}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium ${getAvailabilityColor(
                                product.availableQty,
                                product.totalQty
                              )}`}
                            >
                              {product.availableQty}/{product.totalQty}
                            </div>
                            <div
                              className={`mt-2 px-2 py-1 rounded text-xs font-medium ${getConditionColor(
                                product.condition
                              )}`}
                            >
                              {product.condition}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          📍 Location: {product.location}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No available products for this date
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Next Available
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.image}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.productCode}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.location}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-center px-3 py-1 rounded font-semibold ${getAvailabilityColor(
                            product.availableQty,
                            product.totalQty
                          )}`}
                        >
                          {product.availableQty}/{product.totalQty}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${getConditionColor(
                            product.condition
                          )}`}
                        >
                          {product.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product.nextAvailableDate}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleSelectProduct(product)}
                          disabled={product.availableQty === 0}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                          Select <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No demo products found</p>
                  <p className="text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckDemoProductAvailability;
