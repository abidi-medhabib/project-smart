import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { projectsApi } from 'src/api/projects/projectApi';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { ProjectListSearch } from './ProjectListSearch';
import { ProjectListTable } from './ProjectsListTable';
import type { Project } from 'src/types/project';
import { ProjectModal } from './projectModal/ProjectModal';

interface Filters {
  query?: string;
}

interface ProjectsSearchState {
  filters: Filters;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const useProjectsSearch = () => {
  const [state, setState] = useState<ProjectsSearchState>({
    filters: {
      query: undefined,
    },
    // page: 0,
    // rowsPerPage: 5,
    // sortBy: 'updatedAt',
    // sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback(
    (sort: { sortBy: string; sortDir: 'asc' | 'desc' }): void => {
      setState((prevState) => ({
        ...prevState,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      }));
    },
    []
  );

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

interface ProjectsStoreState {
  projects: Project[];
  projectsCount: number;
}

export const useProjectsStore = (searchState: ProjectsSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<ProjectsStoreState>({
    projects: [],
    projectsCount: 0,
  });

  const handleProjectsGet = useCallback(async () => {
    try {
      const response = await projectsApi.getProjects(searchState);

      if (isMounted()) {
        setState({
          projects: response.data,
          projectsCount: response.count,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleProjectsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
    handleRefresh: handleProjectsGet,
  };
};

const useProjectsIds = (projects: Project[] = []) => {
  return useMemo(() => {
    return projects.map((customer) => customer.id);
  }, [projects]);
};

const Page = () => {
  const projectsSearch = useProjectsSearch();
  const projectsStore = useProjectsStore(projectsSearch.state);
  const projectsIds = useProjectsIds(projectsStore.projects);
  const projectsSelection = useSelection<string>(projectsIds);

  const [openProjectModal, setOpenProjectModal] = useState<boolean>(false);

  const handleTaskOpen = useCallback((): void => {
    setOpenProjectModal(true);
  }, []);

  const handleTaskClose = useCallback((): void => {
    setOpenProjectModal(false);
  }, []);

  usePageView();

  return (
    <>
      <Seo title="Project List" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Projects</Typography>
              </Stack>
              <Stack
                alignItems="center"
                direction="row"
                spacing={3}
              >
                <Button
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                  onClick={handleTaskOpen}
                >
                  Add
                </Button>
              </Stack>
            </Stack>
            <Card>
              <ProjectListSearch
                onFiltersChange={projectsSearch.handleFiltersChange}
                onSortChange={projectsSearch.handleSortChange}
                sortBy={projectsSearch.state.sortBy}
                sortDir={projectsSearch.state.sortDir}
              />
              <ProjectListTable
                count={projectsStore.projectsCount}
                items={projectsStore.projects}
                onDeselectAll={projectsSelection.handleDeselectAll}
                onDeselectOne={projectsSelection.handleDeselectOne}
                onPageChange={projectsSearch.handlePageChange}
                onRowsPerPageChange={projectsSearch.handleRowsPerPageChange}
                onSelectAll={projectsSelection.handleSelectAll}
                onSelectOne={projectsSelection.handleSelectOne}
                page={projectsSearch.state.page}
                rowsPerPage={projectsSearch.state.rowsPerPage}
                selected={projectsSelection.selected}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <ProjectModal
        onClose={handleTaskClose}
        open={openProjectModal}
        projectId={undefined}
        onRefresh={() => projectsStore.handleRefresh()}
      />
    </>
  );
};

export default Page;
