import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import MessageDotsCircleIcon from '@untitled-ui/icons-react/build/esm/MessageDotsCircle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import type { RootState } from 'src/store';
import { useSelector } from 'src/store';
import type { Member, Task } from 'src/types/kanban';

const useTask = (taskId: string): Task | undefined => {
  return useSelector((state: RootState) => {
    const { tasks } = state.kanban;

    return tasks.byId[taskId];
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

interface TaskCardProps {
  taskId: string;
  dragging?: boolean;
  onOpen?: () => void;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(props, ref) {
  const { taskId, dragging = false, onOpen, ...other } = props;
  const task = useTask(taskId);
  const assignees = useAssignees(task?.assigneesIds);

  if (!task) {
    return null;
  }

  const hasAssignees = task.assigneesIds.length > 0;
  const hasAttachments = task.attachments.length > 0;
  const hasChecklists = task.checklists.length > 0;
  const hasComments = task.comments.length > 0;
  const hasLabels = task.labels.length > 0;

  return (
    <Card
      elevation={dragging ? 8 : 1}
      onClick={onOpen}
      ref={ref}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'neutral.800' : 'background.paper',
        ...(dragging && {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'neutral.800' : 'background.paper',
        }),
        p: 3,
        userSelect: 'none',
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'neutral.700' : 'neutral.50',
        },
        '&.MuiPaper-elevation1': {
          boxShadow: 1,
        },
      }}
      {...other}
    >
      <Typography variant="subtitle1">{task.name}</Typography>
      {hasLabels && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            m: -1,
            mt: 1,
          }}
        >
          {task.labels.map((label) => (
            <Chip
              key={label}
              label={label}
              size="small"
              sx={{ m: 1 }}
            />
          ))}
        </Box>
      )}
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
          sx={{ mt: 2 }}
        >
          {hasComments && (
            <SvgIcon color="action">
              <MessageDotsCircleIcon />
            </SvgIcon>
          )}
        </Stack>
        {hasAssignees && (
          <Stack
            direction={'row'}
            spacing={1}
          >
            {assignees.map((assignee) => (
              <Typography
                variant="caption"
                key={assignee.id}
              >
                {assignee.name}
              </Typography>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
});

// @ts-ignore
TaskCard.propTypes = {
  taskId: PropTypes.string.isRequired,
  dragging: PropTypes.bool,
  onOpen: PropTypes.func,
};
