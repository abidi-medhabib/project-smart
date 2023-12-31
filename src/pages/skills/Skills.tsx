import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Download01Icon from '@untitled-ui/icons-react/build/esm/Download01';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { skillsApi } from 'src/api/skills/skillApi';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { SkillListSearch } from './SkillListSearch';
import { SkillListTable } from './SkillListTable';
import type { Skill } from 'src/types/skill';
import { SkillModal } from './skillModal/SkillModal';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';

interface Filters {
  query?: string;
}

interface SkillsSearchState {
  filters: Filters;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const useSkillsSearch = () => {
  const [state, setState] = useState<SkillsSearchState>({
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

interface SkillsStoreState {
  skills: Skill[];
  skillsCount: number;
}

const useSkillsStore = (searchState: SkillsSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<SkillsStoreState>({
    skills: [],
    skillsCount: 0,
  });

  const handleSkillsGet = useCallback(async () => {
    try {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: 'http://localhost:8080/api/skills',
        headers: { 'x-access-token': accessToken },
      });

      if (isMounted()) {
        setState({
          skills: response.data.skills,
          skillsCount: response.data.skills.count,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleSkillsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
    handleRefresh: handleSkillsGet,
  };
};

const useSkillsIds = (skills: Skill[] = []) => {
  return useMemo(() => {
    return skills.map((customer) => customer._id);
  }, [skills]);
};

const Page = () => {
  const skillsSearch = useSkillsSearch();
  const skillsStore = useSkillsStore(skillsSearch.state);
  const skillsIds = useSkillsIds(skillsStore.skills);
  const skillsSelection = useSelection<string>(skillsIds);

  const [openSkillModal, setOpenSkillModal] = useState<boolean>(false);

  const handleTaskOpen = useCallback((): void => {
    setOpenSkillModal(true);
  }, []);

  const handleTaskClose = useCallback((): void => {
    setOpenSkillModal(false);
  }, []);

  usePageView();

  return (
    <>
      <Seo title="Skill List" />
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
                <Typography variant="h4">Skills</Typography>
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
              <SkillListSearch
                onFiltersChange={skillsSearch.handleFiltersChange}
                onSortChange={skillsSearch.handleSortChange}
                sortBy={skillsSearch.state.sortBy}
                sortDir={skillsSearch.state.sortDir}
              />
              <SkillListTable
                count={skillsStore.skillsCount}
                items={skillsStore.skills}
                onDeselectAll={skillsSelection.handleDeselectAll}
                onDeselectOne={skillsSelection.handleDeselectOne}
                onPageChange={skillsSearch.handlePageChange}
                onRowsPerPageChange={skillsSearch.handleRowsPerPageChange}
                onSelectAll={skillsSelection.handleSelectAll}
                onSelectOne={skillsSelection.handleSelectOne}
                page={skillsSearch.state.page}
                rowsPerPage={skillsSearch.state.rowsPerPage}
                selected={skillsSelection.selected}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <SkillModal
        onClose={handleTaskClose}
        open={openSkillModal}
        skillId={undefined}
        onRefresh={() => skillsStore.handleRefresh()}
      />
    </>
  );
};

export default Page;
