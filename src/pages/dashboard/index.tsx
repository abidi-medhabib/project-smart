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
import type { Column } from 'src/types/kanban';

const useColumn = (columnId: string): Column | undefined => {
  return useSelector((state) => {
    const { columns } = state.kanban;

    return columns.byId[columnId];
  });
};

const Page = () => {
  const settings = useSettings();

  usePageView();

  const todoColumn = useColumn('5e849c39325dc5ef58e5a5db');
  const progressColumn = useColumn('5e849c2b38d238c33e516755');
  const doneColumn = useColumn('5e849c2b38d238c33e5146755');

  return (
    <>
      <Seo title="Overview" />
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
              <OverviewDoneTasks amount={doneColumn?.taskIds.length || 0} />
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <OverviewPendingIssues amount={progressColumn?.taskIds.length || 0} />
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <OverviewOpenTickets amount={todoColumn?.taskIds.length || 0} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Page;
