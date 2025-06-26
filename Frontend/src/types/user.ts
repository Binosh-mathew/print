import { WatchedAd } from './ad';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'developer';
  status: 'active' | 'inactive';
  supercoins?: number;
  watchedAds?: WatchedAd[];
  createdAt: Date;
  updatedAt: Date;
} 