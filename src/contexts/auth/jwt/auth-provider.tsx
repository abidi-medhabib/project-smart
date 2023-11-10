import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { authApi } from 'src/api/auth';
import type { User } from 'src/types/user';
import { Issuer } from 'src/utils/auth';

import type { State } from './auth-context';
import { AuthContext, initialState } from './auth-context';

export const TOKEN_STORAGE_KEY = 'accessToken';
export const STORAGE_USER_KEY = 'me';

enum ActionType {
  INITIALIZE = 'INITIALIZE',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
}

type InitializeAction = {
  type: ActionType.INITIALIZE;
  payload: {
    isAuthenticated: boolean;
    user: User | null;
  };
};

type SignInAction = {
  type: ActionType.SIGN_IN;
  payload: {
    user: User;
  };
};

type SignOutAction = {
  type: ActionType.SIGN_OUT;
};

type Action = InitializeAction | SignInAction | SignOutAction;

type Handler = (state: State, action: any) => State;

const handlers: Record<ActionType, Handler> = {
  INITIALIZE: (state: State, action: InitializeAction): State => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  SIGN_IN: (state: State, action: SignInAction): State => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  SIGN_OUT: (state: State): State => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state: State, action: Action): State =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async (): Promise<void> => {
    try {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);

      if (accessToken) {
        const userData = window.sessionStorage.getItem(STORAGE_USER_KEY);

        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: true,
            user: userData ? (JSON.parse(userData) as User) : null,
          },
        });
      } else {
        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [dispatch]);

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      const res = await axios({
        method: 'post',
        url: 'http://localhost:8080/api/auth/signin',
        data: {
          email: email,
          password: password,
        },
      });
      const { accessToken } = res.data;
      const user: User = {
        email: res.data.email,
        _id: res.data.id,
        name: res.data.name,
        role: res.data.role,
      };

      sessionStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));

      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user,
        },
      });
    },
    [dispatch]
  );

  const signOut = useCallback(async (): Promise<void> => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    dispatch({ type: ActionType.SIGN_OUT });
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        issuer: Issuer.JWT,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
