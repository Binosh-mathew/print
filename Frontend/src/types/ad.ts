// Ad type for the ads feature
export interface Ad {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  rewardCoins: number;
  active: boolean;
  createdBy?: string;
  videoDetails?: {
    publicId?: string;
    format?: string;
    size?: number;
  };
  thumbnailDetails?: {
    publicId?: string;
    format?: string;
    width?: number;
    height?: number;
  };
  viewCount?: number; // number of users who watched this ad
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchedAd {
  adId: string;
  watchedAt: string;
}
