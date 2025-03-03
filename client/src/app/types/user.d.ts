export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  projects?: {
    id: string;
    name: string;
  }[];
  userAccount?: {
    id: string;
    email: string;
    role: UserRole;
    isBlocked: boolean;
    isTemporaryPassword: boolean;
  };
};

export type LoginCredentials = {
  email: string;
  password: string;
}; 