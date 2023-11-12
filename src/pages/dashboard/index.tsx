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

  usePageView();

  const todoColumn = useColumn('5e849c39325dc5ef58e5a5db');
  const progressColumn = useColumn('5e849c2b38d238c33e516755');
  const doneColumn = useColumn('5e849c2b38d238c33e5146755');

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

    getBoard();
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
