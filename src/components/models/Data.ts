import { SalesBoard } from "../models/Sales";

export const initialSalesData: SalesBoard = [
  {
    id: "leads",
    title: "Leads",
    cards: [
      {
        id: "lead-1",
        title: "Software License Renewal",
        company: "Acme Corp",
        amount: 12500,
        contactName: "John Smith",
        contactEmail: "john@acmecorp.com",
        priority: "medium",
        lastUpdated: "2023-06-10",
        dueDate: "2023-07-15",
        notes: "Initial discussion about annual license renewal.",
        avatar:
          "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
      {
        id: "lead-2",
        title: "Enterprise Security Package",
        company: "TechGlobal Inc",
        amount: 45000,
        contactName: "Sarah Johnson",
        contactEmail: "sarah@techglobal.com",
        priority: "high",
        lastUpdated: "2023-06-12",
        notes: "Interested in our new enterprise security solution",
        avatar:
          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
      {
        id: "lead-3",
        title: "Website Redesign Project",
        company: "FreshStart Bakery",
        amount: 8500,
        contactName: "Mike Brown",
        contactEmail: "mike@freshstart.com",
        priority: "low",
        lastUpdated: "2023-06-15",
        dueDate: "2023-08-01",
        avatar:
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
    ],
  },
  {
    id: "qualified",
    title: "Qualified",
    cards: [
      {
        id: "qualified-1",
        title: "Cloud Infrastructure Migration",
        company: "Stellar Systems",
        amount: 75000,
        contactName: "Emma Watson",
        contactEmail: "emma@stellarsystems.io",
        priority: "high",
        lastUpdated: "2023-06-08",
        dueDate: "2023-07-30",
        notes: "Looking to migrate from on-premise to cloud in Q3",
        avatar:
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
      {
        id: "qualified-2",
        title: "CRM Implementation",
        company: "Global Logistics Co",
        amount: 35000,
        contactName: "Robert Chen",
        contactEmail: "robert@globallogistics.com",
        priority: "medium",
        lastUpdated: "2023-06-11",
        dueDate: "2023-08-15",
        avatar:
          "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
    ],
  },
  {
    id: "proposal",
    title: "Proposal",
    cards: [
      {
        id: "proposal-1",
        title: "Software Development Services",
        company: "InnovateTech",
        amount: 120000,
        contactName: "David Miller",
        contactEmail: "david@innovatetech.com",
        priority: "high",
        lastUpdated: "2023-06-07",
        dueDate: "2023-07-01",
        notes: "Proposal for 6-month development project",
        avatar:
          "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
    ],
  },
  {
    id: "negotiation",
    title: "Negotiation",
    cards: [
      {
        id: "negotiation-1",
        title: "Annual Support Contract",
        company: "MediCare Health",
        amount: 65000,
        contactName: "Jennifer Lopez",
        contactEmail: "jennifer@medicare.org",
        priority: "medium",
        lastUpdated: "2023-06-05",
        dueDate: "2023-06-25",
        notes: "Finalizing contract terms and pricing",
        avatar:
          "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
      {
        id: "negotiation-2",
        title: "Marketing Campaign",
        company: "Urban Outfitters",
        amount: 28500,
        contactName: "Kevin Hart",
        contactEmail: "kevin@urbanoutfitters.com",
        priority: "medium",
        lastUpdated: "2023-06-09",
        dueDate: "2023-07-10",
        avatar:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
    ],
  },
  {
    id: "closed",
    title: "Closed Won",
    cards: [
      {
        id: "closed-1",
        title: "Data Analytics Platform",
        company: "Finance First",
        amount: 89000,
        contactName: "Alexandra Kim",
        contactEmail: "alex@financefirst.com",
        priority: "high",
        lastUpdated: "2023-06-01",
        notes: "Deal finalized! Implementation starting next month",
        avatar:
          "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
      {
        id: "closed-2",
        title: "Employee Training Program",
        company: "North Education",
        amount: 42000,
        contactName: "Thomas Jackson",
        contactEmail: "thomas@northedu.com",
        priority: "low",
        lastUpdated: "2023-06-03",
        avatar:
          "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
    ],
  },
  {
    id: "lost",
    title: "Closed Lost",
    cards: [
      {
        id: "lost-1",
        title: "Office Renovation Project",
        company: "Creative Spaces",
        amount: 55000,
        contactName: "Michelle Rodriguez",
        contactEmail: "michelle@creativespaces.com",
        priority: "medium",
        lastUpdated: "2023-06-02",
        notes: "Lost to competitor with lower pricing",
        avatar:
          "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
    ],
  },
];
