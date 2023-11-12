import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Unstable_Grid2';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { useMockedUser } from 'src/hooks/use-mocked-user';
import type { RootState } from 'src/store';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/kanban';
import type { Column, Member, Task } from 'src/types/kanban';

import { TaskComment } from './task-comment';
import { TaskCommentAdd } from './task-comment-add';
import { TaskStatus } from './task-status';
import { authApi } from 'src/api/auth';
import { User } from 'src/types/user';
import { TextField, MenuItem, Avatar, AvatarGroup } from '@mui/material';
import { TaskLabels } from './task-labels';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';
import { UserSkills } from 'src/types/userSkills';

const useColumns = (): Column[] => {
  return useSelector((state) => {
    const { columns } = state.kanban;

    return Object.values(columns.byId);
  });
};

const useTask = (taskId?: string): Task | null => {
  return useSelector((state: RootState) => {
    const { tasks } = state.kanban;

    if (!taskId) {
      return null;
    }

    return tasks.byId[taskId] || null;
  });
};

const useColumn = (columnId?: string): Column | null => {
  return useSelector((state) => {
    const { columns } = state.kanban;

    if (!columnId) {
      return null;
    }

    return columns.byId[columnId] || null;
  });
};

const useAuthor = (authorId?: string): Member | null => {
  return useSelector((state: RootState) => {
    const { members } = state.kanban;

    if (!authorId) {
      return null;
    }

    return members.byId[authorId] || null;
  });
};

const useAssignees = (assigneesIds?: string[]): Member[] => {
  return useSelector((state: RootState) => {
    const { members } = state.kanban;

    if (!assigneesIds) {
      return [];
    }

    return assigneesIds
      .map((assigneeId: string) => members.byId[assigneeId])
      .filter((assignee) => !!assignee);
  });
};

interface TaskModalProps {
  onClose?: () => void;
  open?: boolean;
  taskId?: string;
  projectId: string;
}

export const TaskModal: FC<TaskModalProps> = (props) => {
  const { taskId, onClose, open = false, projectId, ...other } = props;
  const user = useMockedUser();
  const dispatch = useDispatch();
  const columns = useColumns();
  const task = useTask(taskId);
  const column = useColumn(task?.columnId);
  const author = useAuthor(task?.authorId);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [nameCopy, setNameCopy] = useState<string>(task?.name || '');
  const debounceMs = 500;

  const handleTabsReset = useCallback(() => {
    setCurrentTab('overview');
  }, []);

  // Reset tab on task change
  useEffect(
    () => {
      handleTabsReset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taskId]
  );

  const handleNameReset = useCallback(() => {
    setNameCopy(task?.name || '');
  }, [task]);

  // Reset task name copy
  useEffect(
    () => {
      handleNameReset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task]
  );

  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value);
  }, []);

  const handleMove = useCallback(
    async (columnId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.moveTask({
            projectId: projectId,
            taskId: task!._id,
            position: 0,
            columnId,
          })
        );
        onClose?.();
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task, onClose]
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    try {
      await dispatch(
        thunks.deleteTask({
          projectId: projectId,
          taskId: task!._id,
        })
      );
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  }, [dispatch, task, onClose]);

  const handleNameUpdate = useCallback(
    async (name: string) => {
      try {
        await dispatch(
          thunks.updateTask({
            projectId: projectId,
            taskId: task!._id,
            update: {
              name,
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleNameBlur = useCallback(() => {
    if (!nameCopy) {
      setNameCopy(task!.name);
      return;
    }

    if (nameCopy === task!.name) {
      return;
    }

    handleNameUpdate(nameCopy);
  }, [task, nameCopy, handleNameUpdate]);

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setNameCopy(event.target.value);
  }, []);

  const handleNameKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.code === 'Enter') {
        if (nameCopy && nameCopy !== task!.name) {
          handleNameUpdate(nameCopy);
        }
      }
    },
    [task, nameCopy, handleNameUpdate]
  );

  const handleDescriptionUpdate = useMemo(
    () =>
      debounce(async (description: string) => {
        try {
          await dispatch(
            thunks.updateTask({
              projectId: projectId,
              taskId: task!._id,
              update: {
                description,
              },
            })
          );
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong!');
        }
      }, debounceMs),
    [dispatch, task]
  );

  const handleAssignTask = useMemo(
    () =>
      debounce(async (assigneeId: string) => {
        if (task!.assigneesIds.includes(assigneeId)) {
          return;
        }
        try {
          await dispatch(
            thunks.updateTask({
              projectId: projectId,
              taskId: task!._id,
              update: {
                assigneesIds: [...task!.assigneesIds, assigneeId],
              },
            })
          );
        } catch (err) {
          console.error(err);
          toast.error('Something went wrong!');
        }
      }, debounceMs),
    [dispatch, task]
  );

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      handleDescriptionUpdate(event.target.value);
    },
    [handleDescriptionUpdate]
  );

  const handleSubscribe = useCallback(async (): Promise<void> => {
    try {
      await dispatch(
        thunks.updateTask({
          projectId: projectId,
          taskId: task!._id,
          update: { isSubscribed: true },
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  }, [dispatch, task]);

  const handleUnsubscribe = useCallback(async (): Promise<void> => {
    try {
      await dispatch(
        thunks.updateTask({
          projectId: projectId,
          taskId: task!._id,
          update: { isSubscribed: false },
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  }, [dispatch, task]);

  const handleLabelsChange = useCallback(
    async (labels: string[]): Promise<void> => {
      try {
        await dispatch(
          thunks.updateTask({
            projectId: projectId,
            taskId: task!._id,
            update: {
              labels,
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleChecklistAdd = useCallback(async (): Promise<void> => {
    try {
      await dispatch(
        thunks.addChecklist({
          projectId: projectId,
          taskId: task!._id,
          name: 'Untitled Checklist',
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  }, [dispatch, task]);

  const handleChecklistRename = useCallback(
    async (checklistId: string, name: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateChecklist({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
            update: { name },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleChecklistDelete = useCallback(
    async (checklistId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.deleteChecklist({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemAdd = useCallback(
    async (checklistId: string, name: string): Promise<void> => {
      try {
        await dispatch(
          thunks.addCheckItem({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
            name,
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemDelete = useCallback(
    async (checklistId: string, checkItemId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.deleteCheckItem({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
            checkItemId,
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemCheck = useCallback(
    async (checklistId: string, checkItemId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateCheckItem({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
            checkItemId,
            update: {
              state: 'complete',
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemUncheck = useCallback(
    async (checklistId: string, checkItemId: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateCheckItem({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
            checkItemId,
            update: {
              state: 'incomplete',
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCheckItemRename = useCallback(
    async (checklistId: string, checkItemId: string, name: string): Promise<void> => {
      try {
        await dispatch(
          thunks.updateCheckItem({
            projectId: projectId,
            taskId: task!._id,
            checklistId,
            checkItemId,
            update: {
              name,
            },
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const handleCommentAdd = useCallback(
    async (message: string): Promise<void> => {
      try {
        await dispatch(
          thunks.addComment({
            projectId: projectId,
            taskId: task!._id,
            message,
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('Something went wrong!');
      }
    },
    [dispatch, task]
  );

  const statusOptions = useMemo(() => {
    return columns.map((column) => {
      return {
        label: column.name,
        value: column._id,
      };
    });
  }, [columns]);

  const [users, setUsers] = useState<User[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkills[]>([]);
  const assignees = task
    ? task.assigneesIds
        .map((assigneeId: string) => users.find((u) => u._id === assigneeId))
        .filter((assignee) => assignee !== undefined)
    : [];

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: 'http://localhost:8080/api/users',
        headers: { 'x-access-token': accessToken },
      });

      const userSkillsResponse = await axios({
        method: 'get',
        url: 'http://localhost:8080/api/user-skills',
        headers: { 'x-access-token': accessToken },
      });

      setUsers(response.data.users.filter((u: User) => u.role === 'Developper'));
      setUserSkills(userSkillsResponse.data.userSkills);
    };

    fetchData();
  }, []);

  const assignToUser = (event: any) => {
    handleAssignTask(event.target.value);
  };

  const content =
    task && column ? (
      <>
        <Stack
          alignItems={{
            sm: 'center',
          }}
          direction={{
            xs: 'column-reverse',
            sm: 'row',
          }}
          justifyContent={{
            sm: 'space-between',
          }}
          spacing={1}
          sx={{ p: 3 }}
        >
          <div>
            <TaskStatus
              onChange={(columnId) => handleMove(columnId)}
              options={statusOptions}
              value={column._id}
            />
          </div>
        </Stack>
        <Box sx={{ px: 1 }}>
          <Input
            disableUnderline
            fullWidth
            onBlur={handleNameBlur}
            onChange={handleNameChange}
            onKeyUp={handleNameKeyUp}
            placeholder="Task name"
            sx={(theme) => ({
              ...theme.typography.h6,
              '& .MuiInputBase-input': {
                borderRadius: 1.5,
                overflow: 'hidden',
                px: 2,
                py: 1,
                textOverflow: 'ellipsis',
                wordWrap: 'break-word',
                '&:hover, &:focus': {
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100',
                },
              },
            })}
            value={nameCopy}
          />
        </Box>
        <Tabs
          onChange={handleTabsChange}
          sx={{ px: 3 }}
          value={currentTab}
        >
          <Tab
            value="overview"
            label="Overview"
          />
          <Tab
            value="assignments"
            label="Assignments"
          />
          <Tab
            value="comments"
            label="Comments"
          />
        </Tabs>
        <Divider />
        <Box sx={{ p: 3 }}>
          {currentTab === 'overview' && (
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                sm={4}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Required Skills
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                <TaskLabels
                  labels={task.labels}
                  onChange={handleLabelsChange}
                />
              </Grid>
              <Grid
                xs={12}
                sm={12}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Description
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={12}
              >
                <Input
                  defaultValue={task.description}
                  fullWidth
                  multiline
                  disableUnderline
                  onChange={handleDescriptionChange}
                  placeholder="Task description"
                  rows={6}
                  sx={{
                    borderColor: 'ActiveBorder',
                    borderRadius: 1,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    p: 1,
                  }}
                />
              </Grid>
            </Grid>
          )}
          {currentTab === 'assignments' && (
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                sm={12}
              >
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  Assigned to
                </Typography>
              </Grid>
              <Grid
                xs={12}
                sm={12}
              >
                <Stack
                  alignItems="center"
                  direction="row"
                  flexWrap="wrap"
                  spacing={1}
                >
                  <TextField
                    fullWidth
                    label="select a developper"
                    name="role"
                    onChange={assignToUser}
                    select
                    autoComplete="no"
                  >
                    {users.map((user) => (
                      <MenuItem
                        key={user._id}
                        value={user._id}
                      >
                        {`${user.name} (${
                          userSkills.filter(
                            (s) => s.email === user.email && task.labels.includes(s.skill)
                          ).length
                        } matching skills)`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
              <Grid
                xs={12}
                sm={8}
              >
                <Stack
                  alignItems="start"
                  direction="row"
                  flexWrap="wrap"
                  spacing={2}
                >
                  <Stack
                    direction="column"
                    alignContent="end"
                    spacing={5}
                  >
                    {assignees.map((assignee) => (
                      <Stack
                        key={assignee!._id}
                        direction="row"
                        justifyContent="start"
                        spacing={2}
                      >
                        <Avatar src={assignee!.avatar || undefined} />
                        <Typography variant="subtitle2">{assignee?.name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          )}

          {currentTab === 'comments' && (
            <Stack spacing={2}>
              {task.comments.map((comment) => (
                <TaskComment
                  key={comment.id}
                  comment={comment}
                />
              ))}
              <TaskCommentAdd
                avatar={user.avatar}
                onAdd={handleCommentAdd}
              />
            </Stack>
          )}
        </Box>
      </>
    ) : null;
  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 500,
        },
      }}
      {...other}
    >
      {content}
    </Drawer>
  );
};

TaskModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  taskId: PropTypes.string,
};
