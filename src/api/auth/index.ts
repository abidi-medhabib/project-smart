import type { Role, User } from 'src/types/user';
import { createResourceId } from 'src/utils/create-resource-id';
import { decode, JWT_EXPIRES_IN, JWT_SECRET, sign } from 'src/utils/jwt';
import { wait } from 'src/utils/wait';

import { users } from './data';
import { deepCopy } from 'src/utils/deep-copy';
import { applySort } from 'src/utils/apply-sort';
import { applyPagination } from 'src/utils/apply-pagination';

const STORAGE_KEY = 'users';

// NOTE: We use sessionStorage since memory storage is lost after page reload.
//  This should be replaced with a server call that returns DB persisted data.

const getPersistedUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...users]));
      return users;
    }

    return JSON.parse(data) as User[];
  } catch (err) {
    console.error(err);
    return [];
  }
};

const persistUser = (user: User): void => {
  try {
    const usersData = getPersistedUsers();
    const data = JSON.stringify([...usersData, user]);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (err) {
    console.error(err);
  }
};

type GetUsersRequest = {
  filters?: {
    query?: string;
  };
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

type GetUsersResponse = Promise<{
  data: User[];
  count: number;
}>;

type SignInRequest = {
  email: string;
  password: string;
};

type SignInResponse = Promise<{
  accessToken: string;
}>;

type SignUpRequest = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

type SignUpResponse = Promise<{
  accessToken: string;
}>;

type MeRequest = {
  accessToken: string;
};

type MeResponse = Promise<User>;

class AuthApi {
  async signIn(request: SignInRequest): SignInResponse {
    const { email, password } = request;

    await wait(500);

    return new Promise((resolve, reject) => {
      try {
        // Find the user
        const user = getPersistedUsers().find((user) => user.email === email);

        if (!user || user.password !== password) {
          reject(new Error('Please check your email and password'));
          return;
        }

        // Create the access token
        const accessToken = sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        resolve({ accessToken });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  async signUp(request: SignUpRequest): SignUpResponse {
    const { email, name, password, role } = request;

    await wait(1000);

    return new Promise((resolve, reject) => {
      try {
        // Check if a user already exists
        let user = getPersistedUsers().find((user) => user.email === email);

        if (user) {
          reject(new Error('User already exists'));
          return;
        }

        user = {
          _id: createResourceId(),
          email,
          name,
          password,
          role,
        };

        persistUser(user);

        const accessToken = sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        resolve({ accessToken });
      } catch (err) {
        console.error('[Auth Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  getUsers(request: GetUsersRequest = {}): GetUsersResponse {
    const { filters, page, rowsPerPage, sortBy, sortDir } = request;

    let data = deepCopy(getPersistedUsers()) as User[];
    let count = data.length;

    if (typeof filters !== 'undefined') {
      data = data.filter((user) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;
          const properties: ('email' | 'name' | 'role')[] = ['email', 'name', 'role'];

          properties.forEach((property) => {
            if (user && user[property].toLowerCase().includes(filters.query!.toLowerCase())) {
              queryMatched = true;
            }
          });
          if (!queryMatched) {
            return false;
          }
        }

        return true;
      });
      count = data.length;
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
      data = applySort(data, sortBy, sortDir);
    }

    if (typeof page !== 'undefined' && typeof rowsPerPage !== 'undefined') {
      data = applyPagination(data, page, rowsPerPage);
    }

    return Promise.resolve({
      data,
      count,
    });
  }

  saveUser(user: User) {
    persistUser(user);
  }
}

export const authApi = new AuthApi();
