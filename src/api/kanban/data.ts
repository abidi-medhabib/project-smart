import { addDays, subDays } from 'date-fns';

import type { Board } from 'src/types/kanban';

const now = new Date();

const board: Board = {
  members: [],
  columns: [
    {
      id: '5e849c39325dc5ef58e5a5db',
      taskIds: [],
      name: 'Todo',
    },
    {
      id: '5e849c2b38d238c33e516755',
      taskIds: [],
      name: 'Progress',
    },
    {
      id: '5e849c2b38d238c33e5146755',
      taskIds: [],
      name: 'Done',
    },
  ],
  tasks: [],
};

export const data = {
  board,
};
