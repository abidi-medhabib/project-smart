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

import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { SkillMatrixListSearch } from './SkillMatrixListSearch';
import { SkillMatrixListTable } from './SkillMatrixListTable';
import type { UserSkills } from 'src/types/userSkills';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';
import { SkillMatrixModal } from './skillMatrixModal/SkillMatrixModal';

interface Filters {
  query?: string;
}

interface UserSkillsSearchState {
  filters: Filters;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const useUserSkillsSearch = () => {
  const [state, setState] = useState<UserSkillsSearchState>({
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

interface UserSkillsStoreState {
  userSkillss: UserSkills[];
  userSkillssCount: number;
}

const useUserSkillsStore = (searchState: UserSkillsSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<UserSkillsStoreState>({
    userSkillss: [],
    userSkillssCount: 0,
  });

  const handleUserSkillsGet = useCallback(async () => {
    try {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: 'http://localhost:8080/api/user-skills',
        headers: { 'x-access-token': accessToken },
      });

      if (isMounted()) {
        setState({
          userSkillss: response.data.userSkills,
          userSkillssCount: response.data.userSkills.count,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleUserSkillsGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
    handleRefresh: handleUserSkillsGet,
  };
};

const useUserSkillsIds = (userSkillss: UserSkills[] = []) => {
  return useMemo(() => {
    return userSkillss.map((customer) => customer._id);
  }, [userSkillss]);
};

const Page = () => {
  const userSkillssSearch = useUserSkillsSearch();
  const userSkillssStore = useUserSkillsStore(userSkillssSearch.state);
  const userSkillssIds = useUserSkillsIds(userSkillssStore.userSkillss);
  const userSkillssSelection = useSelection<string>(userSkillssIds);

  const [openUserSkillsModal, setOpenUserSkillsModal] = useState<boolean>(false);

  const handleTaskOpen = useCallback((): void => {
    setOpenUserSkillsModal(true);
  }, []);

  const handleTaskClose = useCallback((): void => {
    setOpenUserSkillsModal(false);
  }, []);

  usePageView();

  return (
    <>
      <Seo title="UserSkills List" />
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
                <Typography variant="h4">Skills Matrix</Typography>
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
              <SkillMatrixListSearch
                onFiltersChange={userSkillssSearch.handleFiltersChange}
                onSortChange={userSkillssSearch.handleSortChange}
                sortBy={userSkillssSearch.state.sortBy}
                sortDir={userSkillssSearch.state.sortDir}
              />
              <SkillMatrixListTable
                count={userSkillssStore.userSkillssCount}
                items={userSkillssStore.userSkillss}
                onDeselectAll={userSkillssSelection.handleDeselectAll}
                onDeselectOne={userSkillssSelection.handleDeselectOne}
                onPageChange={userSkillssSearch.handlePageChange}
                onRowsPerPageChange={userSkillssSearch.handleRowsPerPageChange}
                onSelectAll={userSkillssSelection.handleSelectAll}
                onSelectOne={userSkillssSelection.handleSelectOne}
                page={userSkillssSearch.state.page}
                rowsPerPage={userSkillssSearch.state.rowsPerPage}
                selected={userSkillssSelection.selected}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <SkillMatrixModal
        onClose={handleTaskClose}
        open={openUserSkillsModal}
        userskillsId={undefined}
        onRefresh={() => userSkillssStore.handleRefresh()}
      />
    </>
  );
};

export default Page;
