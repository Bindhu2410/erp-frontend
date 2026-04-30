import React, { useEffect, useMemo, useState } from "react";
import ActivitiesCard from "../ActivitiesCard";
import Meetings from "./Meetings";
import CallActivities from "../CallActivities";
import Accordion from "../../common/Accordion";
import LeadEvents from "../LeadEvents";
import axios from "axios";

interface ActivityCounts {
  tasks: string;
  meetings: string;
  calls: string;
  events: string;
}

const LeadActivities: React.FC<{ stage?: string; stageItemId?: string }> = ({
  stage,
  stageItemId,
}) => {
  const [counts, setCounts] = useState<ActivityCounts>({
    tasks: "",
    meetings: "",
    calls: "",
    events: "",
  });

  // Unified fetch function for all activity types
  const fetchActivity = async (endpoint: string) => {
    if (!stageItemId) return;

    try {
      const response = await axios.get(
        `process.env.REACT_APP_API_BASE_URL/${endpoint}/${stage}/${stageItemId}`
      );
      return response.data?.length;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return 0;
    }
  };

  // Fetch all counts in parallel
  useEffect(() => {
    if (!stageItemId) return;

    const fetchAllCounts = async () => {
      const [tasks, meetings, events, calls] = await Promise.all([
        fetchActivity("api/SalesActivityTask/stage"),
        fetchActivity("api/SalesActivityMeeting/stage"),
        fetchActivity("api/SalesActivityEvent/stage"),
        fetchActivity("api/SalesActivityCall/stage"),
      ]);

      setCounts({
        tasks,
        meetings,
        events,
        calls,
      });

      console.log("Activity counts fetched:", tasks, meetings, calls, events);
    };

    fetchAllCounts();
  }, [stageItemId]);

  // Define tabs using useMemo
  const tabs = useMemo(
    () => [
      {
        label: `Tasks `,
        content: <ActivitiesCard stage={stage} stageItemId={stageItemId} />,
        dataLength: counts.tasks,
      },
      {
        label: `Meetings`,
        content: <Meetings stage={stage} stageItemId={stageItemId} />,
        dataLength: counts.meetings,
      },
      {
        label: `Calls`,
        content: <CallActivities stage={stage} stageItemId={stageItemId} />,
        dataLength: counts.calls,
      },
      {
        label: `Events`,
        content: <LeadEvents stage={stage} stageItemId={stageItemId} />,
        dataLength: counts.events,
      },
    ],
    [stage, stageItemId, counts]
  );

  return (
    <div>
      <Accordion items={tabs} />
    </div>
  );
};

export default LeadActivities;
