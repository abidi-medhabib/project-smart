export const paths = {
  index: '/',
  auth: {
    jwt: {
      login: '/auth/jwt/login',
    }
  },
  main: {
    index: '/',
    account: '/account',
    skills: '/skills',
    skillMatrix: '/skills-matrix',
    users: '/users',
  },
  projects: {
    index: '/projects/:projectId',
    kanban: '/projects/:projectId/kanban'
  },
  notAuthorized: '/401',
  notFound: '/404',
  serverError: '/500',
};
