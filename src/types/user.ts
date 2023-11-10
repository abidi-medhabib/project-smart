export type Role = 'Admin' | 'Project Manager' | 'Manager' | 'Developper';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: Role;
  password?: string;
  avatar?: string;
}
