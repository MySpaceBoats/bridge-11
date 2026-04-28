export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  skills?: string[];
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdById: string;
  createdAt: string;
  members?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'admin' | 'member';
  user: User;
  joinedAt: string;
}

export interface FamilyRelation {
  id: string;
  familyId: string;
  fromUserId: string;
  toUserId: string;
  relationType: RelationType;
  fromUser?: User;
  toUser?: User;
}

export type RelationType =
  | 'parent' | 'child' | 'sibling' | 'spouse'
  | 'cousin' | 'grandparent' | 'grandchild'
  | 'uncle_aunt' | 'nephew_niece' | 'other';

export interface TreeNode {
  id: string;
  data: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  };
  position: { x: number; y: number };
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface Event {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type: 'punctual' | 'recurring';
  createdBy: User;
  participations: EventParticipation[];
  createdAt: string;
}

export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  status: 'going' | 'not_going' | 'maybe';
  user: User;
}

export interface ChatGroup {
  id: string;
  familyId: string;
  name: string;
  type: 'general' | 'branch';
  createdAt: string;
}

export interface Message {
  id: string;
  groupId: string;
  content: string;
  mediaUrl?: string;
  sender: User;
  createdAt: string;
}

export interface Post {
  id: string;
  familyId: string;
  content: string;
  imageUrl?: string;
  author: User;
  comments: Comment[];
  likes: Like[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
}

export interface Album {
  id: string;
  familyId: string;
  name: string;
  coverUrl?: string;
  createdBy: User;
  event?: Event;
  media?: Media[];
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'photo' | 'video';
  name?: string;
  uploadedBy: User;
  createdAt: string;
}

export interface Poll {
  id: string;
  familyId: string;
  question: string;
  options: string[];
  endsAt?: string;
  allowMultiple: boolean;
  createdBy: User;
  votes: PollVote[];
  results?: { option: string; count: number }[];
  createdAt: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionIndex: number;
}

export interface Contribution {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  targetAmount?: number;
  currency?: string;
  createdBy: User;
  event?: Event;
  payments: ContributionPayment[];
  createdAt: string;
}

export interface ContributionPayment {
  id: string;
  contributionId: string;
  userId: string;
  promisedAmount: number;
  paidAmount: number;
  status: 'promised' | 'paid' | 'cancelled';
  notes?: string;
  user: User;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
