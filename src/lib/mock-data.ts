import type { User, Club, Expense, Event } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Admin',
    email: 'admin@reimburse.ai',
    role: 'admin',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'user-2',
    name: 'Bob Representative',
    email: 'rep@reimburse.ai',
    role: 'representative',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
];

export const mockClubs: Club[] = [
  {
    id: 'club-1',
    name: 'Coding Club',
    description: 'For students passionate about software development.',
    representativeId: 'user-2',
  },
  {
    id: 'club-2',
    name: 'Design Collective',
    description: 'A community for designers and artists.',
    representativeId: 'user-2',
  },
   {
    id: 'club-3',
    name: 'E-Sports Team',
    description: 'Competitive gaming team.',
    representativeId: 'user-1',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    clubId: 'club-1',
    description: 'Urgent server hosting fees for annual hackathon',
    amount: 250.0,
    status: 'Pending',
    submittedDate: '2024-07-20T10:00:00Z',
  },
  {
    id: 'exp-2',
    clubId: 'club-2',
    description: 'Adobe Creative Cloud subscription renewal for all members',
    amount: 1200.5,
    status: 'Under Review',
    submittedDate: '2024-07-19T14:30:00Z',
  },
  {
    id: 'exp-3',
    clubId: 'club-1',
    description: 'Pizza and snacks for weekly coding session',
    amount: 85.75,
    status: 'Approved',
    submittedDate: '2024-07-15T18:00:00Z',
  },
  {
    id: 'exp-4',
    clubId: 'club-3',
    description: 'New gaming keyboards for the team - critical for upcoming tournament',
    amount: 750.0,
    status: 'Pending',
    submittedDate: '2024-07-21T09:00:00Z',
  },
  {
    id: 'exp-5',
    clubId: 'club-2',
    description: 'Printing costs for promotional flyers for the design fair',
    amount: 150.0,
    status: 'Rejected',
    submittedDate: '2024-07-18T11:45:00Z',
  },
    {
    id: 'exp-6',
    clubId: 'club-1',
    description: 'Travel reimbursement for speaker at tech talk event.',
    amount: 300.0,
    status: 'Under Review',
    submittedDate: '2024-07-22T10:00:00Z',
  },
  {
    id: 'exp-7',
    clubId: 'club-2',
    description: 'Workshop materials: sketchpads and markers.',
    amount: 200.0,
    status: 'Approved',
    submittedDate: '2024-07-12T13:20:00Z',
  },
];

export const mockEvents: Event[] = [
  {
    id: 'evt-1',
    clubId: 'club-1',
    name: 'Annual Hackathon',
    date: '2024-08-15',
  },
  {
    id: 'evt-2',
    clubId: 'club-2',
    name: 'Design Fair',
    date: '2024-09-01',
  },
];
