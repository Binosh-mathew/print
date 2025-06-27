export interface LoginAlert {
  _id: string;
  email: string;
  ipAddress: string;
  attemptCount: number;
  lastAttempt: Date;
  isResolved: boolean;
  userRole: string;
}
