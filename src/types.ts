export type Affiliation = '대외선교부' | 'IUBA 경상대센터';

export type VIPCategory = '금융·기업·단체' | '교육·문학·언론' | '정치·법조·공직·경찰';

export interface VIPEntry {
  id: string;
  date: string;
  affiliation: string;
  name: string;
  position: string;
  category: VIPCategory;
  contact: string;
  progress: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string; // The "Name" used for login
  name: string;
  affiliation: Affiliation;
  role: 'admin' | 'user';
  is_initial_password?: boolean;
}

export interface OutreachEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  created_at: string;
  poster_image?: string;
}

export enum LoginState {
  LOGGED_OUT = 'LOGGED_OUT',
  LOGGED_IN = 'LOGGED_IN',
  NEED_PASSWORD_CHANGE = 'NEED_PASSWORD_CHANGE',
}
