import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { OverviewDoneTasks } from 'src/sections/dashboard/overview/overview-done-tasks';
import { OverviewPendingIssues } from 'src/sections/dashboard/overview/overview-pending-issues';
import { OverviewOpenTickets } from 'src/sections/dashboard/overview/overview-open-tickets';
import { t } from 'i18next';
import { tokens } from 'src/locales/tokens';
import { useSelector } from 'src/store';
import type { Board, Column } from 'src/types/kanban';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Project } from 'src/types/project';
import { format } from 'date-fns';

const useColumn = (columnId: string): Column | undefined => {
  return useSelector((state) => {
    const { columns } = state.kanban;

    return columns.byId[columnId];
  });
};

const Page = () => {
  const settings = useSettings();
  const params = useParams();
  const [board, setBoard] = useState<Board | undefined>();
  const [project, setProject] = useState<Project | undefined>();

  usePageView();

  useEffect(() => {
    const getBoard = async () => {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: `http://localhost:8080/api/board/${params.projectId}`,
        headers: { 'x-access-token': accessToken },
      });
      setBoard(response.data.board);
    };

    const getProject = async () => {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: `http://localhost:8080/api/projects/${params.projectId}`,
        headers: { 'x-access-token': accessToken },
      });
      setProject(response.data.project);
    };

    getBoard();
    getProject();
  }, [params]);

  return (
    <>
      <Seo title="Overview" />
      {board && (
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth={settings.stretch ? false : 'xl'}>
            <Grid
              container
              disableEqualOverflow
              spacing={{
                xs: 3,
                lg: 4,
              }}
            >
              <Grid xs={12}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={4}
                >
                  <div>
                    <Typography variant="h4">{t(tokens.nav.overview)}</Typography>
                  </div>
                </Stack>
              </Grid>
              <Grid xs={12}>
                <Stack
                  justifyContent="space-between"
                  direction="row"
                  spacing={6}
                >
                  <Stack
                    direction="column"
                    justifyContent="space-between"
                    spacing={0}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Name
                    </Typography>
                    <Typography
                      color="text.primary"
                      variant="h6"
                    >
                      {project?.name}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="column"
                    justifyContent="space-between"
                    spacing={0}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Client
                    </Typography>
                    <Typography
                      color="text.primary"
                      variant="h6"
                    >
                      {project?.client}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="column"
                    justifyContent="space-between"
                    spacing={0}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Category
                    </Typography>
                    <Typography
                      color="text.primary"
                      variant="h6"
                    >
                      {project?.category}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="column"
                    justifyContent="space-between"
                    spacing={0}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Start date
                    </Typography>
                    <Typography
                      color="text.primary"
                      variant="h6"
                    >
                      {project?.startDate && format(new Date(project?.startDate), 'dd/MM/yyyy')}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="column"
                    justifyContent="space-between"
                    spacing={0}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      End Date
                    </Typography>
                    <Typography
                      color="text.primary"
                      variant="h6"
                    >
                      {project?.endDate && format(new Date(project?.endDate), 'dd/MM/yyyy')}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid
                xs={12}
                md={4}
              >
                <OverviewDoneTasks
                  amount={
                    board.tasks.filter(
                      (t) => t.columnId === board.columns.find((c) => c.name === 'Done')?._id
                    )?.length || 0
                  }
                />
              </Grid>
              <Grid
                xs={12}
                md={4}
              >
                <OverviewPendingIssues
                  amount={
                    board.tasks.filter(
                      (t) => t.columnId === board.columns.find((c) => c.name === 'Progress')?._id
                    )?.length || 0
                  }
                />
              </Grid>
              <Grid
                xs={12}
                md={4}
              >
                <OverviewOpenTickets
                  amount={
                    board.tasks.filter(
                      (t) => t.columnId === board.columns.find((c) => c.name === 'Todo')?._id
                    )?.length || 0
                  }
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}
    </>
  );
};

export default Page;
