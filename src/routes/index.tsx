import { lazy } from 'react';
import type { RouteObject } from 'react-router';


import { authRoutes } from './auth';
import { projectRoutes } from './projectRoutes';
import { mainRoutes } from './mainRoutes';

const Error401Page = lazy(() => import('src/pages/401'));
const Error404Page = lazy(() => import('src/pages/404'));
const Error500Page = lazy(() => import('src/pages/500'));


export const routes: RouteObject[] = [
  ...authRoutes,
  ...mainRoutes,
  ...projectRoutes,
  {
    path: '401',
    element: <Error401Page />,
  },
  {
    path: '404',
    element: <Error404Page />,
  },
  {
    path: '500',
    element: <Error500Page />,
  },
  {
    path: '*',
    element: <Error404Page />,
  },
];
