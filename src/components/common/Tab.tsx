import React, { useState, useRef, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import TabComponents from "./TabComponents";

interface Data {
  [key: string]: string | number;
}

interface Accessories {
  standardConsumableAccessoriesForDiathermy: Data[];
  forVesselSealing: Data[];
}

interface Version {
  version: string; // Assuming version is a string
  quantity: Data;
  accessories: Accessories;
}

interface ComponentDataProbs {
  [key: string]: string | number | Version[] | Data | Accessories; // Changed to an array to match previous errors
}

interface TabViewProps {
  tabData: {
    label: string;
    name: string;
    data?: ComponentDataProbs[];
    actions?: string[];
    leadId?: string;
    oppId?: string;
    stage?: string;
    stageItemId?: string;
    quotationId?: string;
    config?: any;
  }[];

  borderColor?: string;
  textColor?: string;
  active?: string;
}

const Tab: React.FC<TabViewProps> = ({
  tabData,
  borderColor = "border-orange-500",
  textColor = "text-orange-500",
  active,
}) => {
  const [activeTab, setActiveTab] = useState(active || tabData[0]?.label);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    if (tabsRef.current && scrollContainerRef.current) {
      const tabsWidth = tabsRef.current.scrollWidth;
      const containerWidth = scrollContainerRef.current.offsetWidth;
      setMaxScroll(tabsWidth - containerWidth);
    }
  }, [tabData]);

  const scroll = (direction: "left" | "right") => {
    const containerWidth = scrollContainerRef.current?.offsetWidth || 0;
    const newScrollPosition =
      direction === "left"
        ? Math.max(scrollPosition - containerWidth, 0)
        : Math.min(scrollPosition + containerWidth, maxScroll);
    setScrollPosition(newScrollPosition);
  };

  const handleTabChange = (tab: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <button
          onClick={() => scroll("left")}
          className={`p-2 hover:bg-gray-100 rounded-lg ${
            scrollPosition <= 0 ? "invisible" : ""
          }`}
          disabled={scrollPosition <= 0}
        >
          <FiChevronLeft className="w-5 h-5 text-gray-500" />
        </button>

        <div
          ref={scrollContainerRef}
          className="overflow-x-hidden flex-1 scrollbar-hide"
        >
          <div
            ref={tabsRef}
            className="flex whitespace-nowrap transition-transform duration-300 ease-in-out gap-2"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {tabData?.map((tab, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabChange(tab?.label, e);
                }}
                className={`inline-block py-3 px-[12.5px] text-[18px] focus:outline-none whitespace-nowrap ${
                  activeTab === tab?.label
                    ? `${textColor} bg-white dark:text-white border-t-4 ${borderColor}`
                    : "bg-gray-200 dark:bg-gray-800 hover:text-orange-700 hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-700"
                }`}
              >
                {tab?.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => scroll("right")}
          className={`p-2 hover:bg-gray-100 rounded-lg ${
            scrollPosition >= maxScroll ? "invisible" : ""
          }`}
          disabled={scrollPosition >= maxScroll}
        >
          <FiChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div>
        {tabData?.map((tab, idx) => {
          if (tab.label !== activeTab) return null;
          const Component = TabComponents[tab.name];
          return Component ? (
            <Component
              data={tab.data}
              leadId={tab.leadId}
              oppId={tab.oppId}
              stage={tab.stage}
              stageItemId={tab.stageItemId}
              stageid={tab.stageItemId}
              type={tab.stage}
              quotationId={tab.quotationId}
              action={tab.actions}
              key={idx}
              config={tab.config}
            />
          ) : (
            <div>Component Not Found</div>
          );
        })}
      </div>
    </div>
  );
};

export default Tab;
