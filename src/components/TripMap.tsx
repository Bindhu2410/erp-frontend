import React from "react";
import { useState } from "react";
import { FaRoute, FaFilter } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface TripStats {
  distance: number;
  time: string;
  appointments: string;
}

const defaultStats: TripStats = {
  distance: 45.2,
  time: "3h 15m",
  appointments: "4/4",
};

const TripMap: React.FC = () => {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState<TripStats>(defaultStats);

  // Use LatLngExpression for center and marker
  const mapCenter: LatLngExpression = [20.5937, 78.9629];

  React.useEffect(() => {
    if (period === "today") setStats(defaultStats);
    if (period === "week")
      setStats({ distance: 210.5, time: "18h 40m", appointments: "18/20" });
    if (period === "month")
      setStats({ distance: 820.7, time: "72h 10m", appointments: "65/70" });
  }, [period]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h5 className="text-lg font-semibold flex items-center gap-2">
          <FaRoute className="text-blue-500" />
          Today's Trip Tracking
        </h5>
        <div className="relative">
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-blue-200 rounded-lg bg-white hover:bg-blue-50 transition"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <FaFilter className="text-blue-400" /> Period
          </button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <li>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    period === "today" ? "font-bold text-blue-600" : ""
                  }`}
                  onClick={() => {
                    setPeriod("today");
                    setDropdownOpen(false);
                  }}
                >
                  Today
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    period === "week" ? "font-bold text-blue-600" : ""
                  }`}
                  onClick={() => {
                    setPeriod("week");
                    setDropdownOpen(false);
                  }}
                >
                  This Week
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    period === "month" ? "font-bold text-blue-600" : ""
                  }`}
                  onClick={() => {
                    setPeriod("month");
                    setDropdownOpen(false);
                  }}
                >
                  This Month
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        {/* OpenStreetMap Integration */}
        <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-blue-200">
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={mapCenter}>
              <Popup>Your trip start location (demo)</Popup>
            </Marker>
          </MapContainer>
        </div>
        {/* Stats */}
        <div className="flex w-full justify-around mt-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Distance Traveled</span>
            <span className="text-lg font-bold text-blue-700">
              {stats.distance} km
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Travel Time</span>
            <span className="text-lg font-bold text-yellow-600">
              {stats.time}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Appointments</span>
            <span className="text-lg font-bold text-green-600">
              {stats.appointments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripMap;
