import React from "react";

import LeadActivities from "../lead/LeadActivities/LeadActivities";
import LeadAttachements from "../lead/Documents";
import SummaryTimeline from "../lead/SummaryTimeline";
import CommentSystem from "../lead/CommandSystem";

import EmailLayout from "../email/EmailLayout";
import ExternalCommentView from "../lead/ExternalCommentView";
import Addresses from "../../components/Addresses";
import ContactInfo from "../ContactInfo";
import InterestedProducts from "../InterestedProducts";

const TabComponents: { [key: string]: React.FC<any> } = {
  contacts: ContactInfo,
  Address: Addresses,
  documents: LeadAttachements,
  activities: LeadActivities,
  summary: SummaryTimeline,
  comment: CommentSystem,
  businessChallenges: InterestedProducts,
  email: EmailLayout,
  externalComment: ExternalCommentView,
};

export default TabComponents;
