import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';

import { Layout as MainLayout } from 'src/layouts/main';

const OverviewPage = lazy(() => import('src/pages/dashboard/index'));
const ProjectsPage = lazy(() => import('src/pages/projects/Projects'));

// Other
const AccountPage = lazy(() => import('src/pages/dashboard/account'));
const AnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));

const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
const SkillPage = lazy(() => import('src/pages/skills/Skills'));
const UsersPage = lazy(() => import('src/pages/users/Users'));
const SkillMatrixPage = lazy(() => import('src/pages/skillMatrix/SkillMatrix'));

export const mainRoutes: RouteObject[] = [
  {
    element: (
      <MainLayout>
        <Suspense>
          <Outlet />
        </Suspense>
      </MainLayout>
    ),
    children: [
      {
        index: true,
        element: <ProjectsPage />,
      },
      {
        path: 'account',
        element: <AccountPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'kanban',
        element: <KanbanPage />,
      },
      {
        path: 'skills',
        element: <SkillPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'skills-matrix',
        element: <SkillMatrixPage />,
      },
    ],
  },
];
