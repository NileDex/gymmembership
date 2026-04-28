export type MembershipStatus = 'none' | 'active' | 'expired';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  membershipStatus: MembershipStatus;
  role: 'admin' | 'user';
  membershipExpiry: string | null; // ISO string
  membershipType: string | null;
  createdAt: any;
  updatedAt: any;
}

export interface TrainingVideo {
  id: string;
  title: string;
  category: string;
  youtubeUrl: string;
  videoId: string;
  thumbnail: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  tierColor: string;
}
