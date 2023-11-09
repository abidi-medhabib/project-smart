import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router-dom';

import { Layout as ProjectLayout } from 'src/layouts/project';

const OverviewPage = lazy(() => import('src/pages/dashboard/index'));

// Other
const AccountPage = lazy(() => import('src/pages/dashboard/account'));
const AnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));

const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
const SkillPage = lazy(() => import('src/pages/skills/Skills'));

export const projectRoutes: RouteObject[] = [
  {
    path: 'projects/:projectId',
    element: (
      <ProjectLayout>
        <Suspense>
          <Outlet />
        </Suspense>
      </ProjectLayout>
    ),
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: 'kanban',
        element: <KanbanPage />,
      }
    ],
  },
];
