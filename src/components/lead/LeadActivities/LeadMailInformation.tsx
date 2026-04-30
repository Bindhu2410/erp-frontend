// import React, { useEffect, useState } from "react";

// import Accordion from "../../Common/Accordion";
// import { FaEdit, FaReply, FaReplyAll, FaTrash } from "react-icons/fa";
// import axios from "axios";
// import { MdEdit } from "react-icons/md";
// import ReplyMail from "../components/ReplyMail";
// import PopUp from "app/src/modules/shared/components/common/pop-up";
// import InboxList from "../../shared/Inbox/InboxList";

// const LeadMailInformation: React.FC<{ leadId?: string; oppId?: string }> = ({
//   leadId,
//   oppId,
// }) => {
//   const tableData = [
//     {
//       id: 1,
//       from: "Musharof Chowdhury",
//       subject: "Some note & Lorem Ipsum available alteration in some form.",
//       date: "17 Oct, 2024",
//     },
//     {
//       id: 2,
//       from: "Naimur Rahman",
//       subject: "Lorem Ipsum available alteration in some form.",
//       date: "25 Nov, 2024",
//     },
//     {
//       id: 3,
//       from: "Juhan Ahamed",
//       subject: "Lorem Ipsum available alteration in some form.",
//       date: "25 Nov, 2024",
//     },
//   ];

//   const actions = [
//     {
//       label: <FaReply />,
//       onClick: (row: any) => {
//         handleReply(row, "reply");
//       },
//       type: "reply",
//     },
//     {
//       label: <FaReplyAll />,
//       onClick: (row: any) => {
//         handleReply(row, "replyAll");
//       },
//       type: "replyAll",
//     },
//   ];

//   const Draftactions = [
//     {
//       label: <MdEdit title="Edit" />,
//       onClick: (row: any) => {
//         handleEdit(row);
//       },
//       type: "Edit",
//     },
//     {
//       label: <FaTrash title="delete" />,
//       onClick: (row: any) => {
//         handleDelete(row.mailDraftId);
//       },
//       type: "Delete",
//     },
//   ];

//   const handleDelete = async (id: string | number) => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "http://localhost:4321/api/sales/delete_sales_mail_drafts",
//         { mailDraftIds: [id] },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(response.data, "api response");
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     } finally {
//       setLoading(false);
//     }

//     fetchDraftData();
//   };

//   const [inboxdata, setInboxData] = React.useState<any[]>([]);
//   const [draftData, setDraftData] = React.useState<any[]>([]);
//   const [loading, setLoading] = React.useState(false);

//   const fetchInboxData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "http://localhost:4321/api/sales/get_sales_mail_inboxes",
//         {
//           leadId: oppId ? "-" : leadId,
//           opportunityId: leadId ? "-" : oppId,
//         },

//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(response, "Inbox response");
//       setInboxData(response.data?.data?.rows || []);
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const fetchDraftData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "http://localhost:4321/api/sales/get_sales_mail_drafts",
//         {
//           leadId: oppId ? "-" : leadId,
//           opportunityId: leadId ? "-" : oppId,
//         },

//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log(response.data, "Draft response");
//       setDraftData(response.data?.data?.rows || []);
//     } catch (error) {
//       console.error("Error fetching leads:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInboxData();
//     fetchDraftData();
//   }, []);
//   const [modal, setModal] = useState(false);
//   const [content, setContent] = useState<React.ReactNode>(null);
//   const [replyMode, setReplyMode] = useState<"reply" | "replyAll">("reply");
//   const handleEdit = (row: any) => {
//     console.log(row, "Edit");
//     const content = (
//       <ReplyMail
//         mode={"reply"}
//         leadId={leadId}
//         emailData={row}
//         onClose={function (): void {
//           throw new Error("Function not implemented.");
//         }}
//         onAddSuccess={handleRefresh}
//       />
//     );
//     handleModal(content);
//   };
//   const handleModal = (content: React.ReactNode) => {
//     setModal((prev) => !prev);
//     setContent(content);
//   };
//   const handleReply = (row: any, mode: "reply" | "replyAll") => {
//     console.log("Reply", row);
//     setReplyMode(mode);
//     const content = (
//       <ReplyMail
//         mode={mode}
//         emailData={row}
//         leadId={leadId}
//         onClose={() => setModal(false)}
//         onAddSuccess={handleRefresh}
//       />
//     );
//     setContent(content);
//     setModal(true);
//   };
//   const tabs = [
//     {
//       label: "Email",
//       content: (
//         <InboxList
//           data={inboxdata}
//           actions={actions}
//           isDraft={false}
//           leadId={leadId}
//           oppId={oppId}
//         />
//       ),
//     },
//     {
//       label: "Draft",
//       content: (
//         <InboxList
//           data={draftData}
//           actions={Draftactions}
//           isDraft={true}
//           leadId={leadId}
//           oppId={oppId}
//         />
//       ),
//     },
//   ];

//   const handleRefresh = (type: string) => {
//     if (type == "Draft") {
//       fetchDraftData();
//     } else {
//       fetchInboxData();
//     }
//   };
//   return (
//     <div>
//       <Accordion items={tabs} />
//       <PopUp
//         content={content}
//         isModalOpen={modal}
//         heading={"Reply Email"}
//         setModal={setModal}
//       />
//     </div>
//   );
// };

// export default LeadMailInformation;
import React from "react";

const LeadMailInformation = () => {
  return <div></div>;
};

export default LeadMailInformation;
