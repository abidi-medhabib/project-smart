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

import { authApi } from 'src/api/auth/index';
import { Seo } from 'src/components/seo';
import { useMounted } from 'src/hooks/use-mounted';
import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { UserListSearch } from './UserListSearch';
import { UserListTable } from './UserListTable';
import type { User } from 'src/types/user';
import { UserModal } from './userModal/UserModal';

interface Filters {
  query?: string;
}

interface UsersSearchState {
  filters: Filters;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const useUsersSearch = () => {
  const [state, setState] = useState<UsersSearchState>({
    filters: {
      query: undefined,
    },
    // page: 0,
    // rowsPerPage: 5,
    // sortBy: 'id',
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

interface UsersStoreState {
  users: User[];
  usersCount: number;
}

const useUsersStore = (searchState: UsersSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<UsersStoreState>({
    users: [],
    usersCount: 0,
  });

  const handleUsersGet = useCallback(async () => {
    try {
      const response = await authApi.getUsers(searchState);

      if (isMounted()) {
        setState({
          users: response.data,
          usersCount: response.count,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);

  useEffect(
    () => {
      handleUsersGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchState]
  );

  return {
    ...state,
    handleRefresh: handleUsersGet,
  };
};

const useUsersIds = (users: User[] = []) => {
  return useMemo(() => {
    return users.map((customer) => customer.id);
  }, [users]);
};

const Page = () => {
  const usersSearch = useUsersSearch();
  const usersStore = useUsersStore(usersSearch.state);
  const usersIds = useUsersIds(usersStore.users);
  const usersSelection = useSelection<string>(usersIds);

  const [openUserModal, setOpenUserModal] = useState<boolean>(false);

  const handleTaskOpen = useCallback((): void => {
    setOpenUserModal(true);
  }, []);

  const handleTaskClose = useCallback((): void => {
    setOpenUserModal(false);
  }, []);

  usePageView();

  return (
    <>
      <Seo title="User List" />
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
                <Typography variant="h4">Users</Typography>
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
                  onClick={handleTaskOpen}
                  variant="contained"
                >
                  Add
                </Button>
              </Stack>
            </Stack>
            <Card>
              <UserListSearch
                onFiltersChange={usersSearch.handleFiltersChange}
                onSortChange={usersSearch.handleSortChange}
                sortBy={usersSearch.state.sortBy}
                sortDir={usersSearch.state.sortDir}
              />
              <UserListTable
                count={usersStore.usersCount}
                items={usersStore.users}
                onDeselectAll={usersSelection.handleDeselectAll}
                onDeselectOne={usersSelection.handleDeselectOne}
                onPageChange={usersSearch.handlePageChange}
                onRowsPerPageChange={usersSearch.handleRowsPerPageChange}
                onSelectAll={usersSelection.handleSelectAll}
                onSelectOne={usersSelection.handleSelectOne}
                page={usersSearch.state.page}
                rowsPerPage={usersSearch.state.rowsPerPage}
                selected={usersSelection.selected}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <UserModal
        onClose={handleTaskClose}
        open={openUserModal}
        onRefresh={() => usersStore.handleRefresh()}
        userId={undefined}
      />
    </>
  );
};

export default Page;
