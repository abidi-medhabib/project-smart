import axios from 'axios';
import { kanbanApi } from 'src/api/kanban';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import { slice } from 'src/slices/kanban';
import type { AppThunk } from 'src/store';

const getBoard =
  (projectId: string): AppThunk =>
  async (dispatch): Promise<void> => {
    //const data = await kanbanApi.getBoard({ projectId });
    const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const response = await axios({
      method: 'get',
      url: `http://localhost:8080/api/board/${projectId}`,
      headers: { 'x-access-token': accessToken },
    });

    dispatch(slice.actions.getBoard(response.data.board));
  };

type CreateColumnParams = {
  name: string;
  projectId: string;
};

const createColumn =
  (params: CreateColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.createColumn(params);

    dispatch(slice.actions.createColumn(response));
  };

type UpdateColumnParams = {
  columnId: string;
  projectId: string;
  update: {
    name: string;
  };
};

const updateColumn =
  (params: UpdateColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateColumn(params);

    dispatch(slice.actions.updateColumn(response));
  };

type ClearColumnParams = {
  columnId: string;
  projectId: string;
};

const clearColumn =
  (params: ClearColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.clearColumn(params);

    dispatch(slice.actions.clearColumn(params.columnId));
  };

type DeleteColumnParams = {
  columnId: string;
  projectId: string;
};

const deleteColumn =
  (params: DeleteColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteColumn(params);

    dispatch(slice.actions.deleteColumn(params.columnId));
  };

type CreateTaskParams = {
  columnId: string;
  projectId: string;
  name: string;
};

const createTask =
  (params: CreateTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    //const response = await kanbanApi.createTask(params);
    const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8080/api/board/tasks',
      headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
      data: params,
    });

    dispatch(slice.actions.createTask(response.data));
  };

type UpdateTaskParams = {
  projectId: string;
  taskId: string;
  update: {
    name?: string;
    description?: string;
    isSubscribed?: boolean;
    labels?: string[];
    assigneesIds?: string[];
  };
};

const updateTask =
  (params: UpdateTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    // const response = await kanbanApi.updateTask(params);
    const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const response = await axios({
      method: 'put',
      url: 'http://localhost:8080/api/board/tasks',
      headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
      data: params,
    });

    dispatch(slice.actions.updateTask(response.data));
  };

type MoveTaskParams = {
  projectId: string;
  taskId: string;
  position: number;
  columnId?: string;
};

const moveTask =
  (params: MoveTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    // await kanbanApi.moveTask(params);
    const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8080/api/board/tasks/move',
      headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
      data: params,
    });

    dispatch(slice.actions.moveTask(params));
  };

type DeleteTaskParams = {
  projectId: string;
  taskId: string;
};

const deleteTask =
  (params: DeleteTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteTask(params);

    dispatch(slice.actions.deleteTask(params.taskId));
  };

type AddCommentParams = {
  projectId: string;
  taskId: string;
  message: string;
};

const addComment =
  (params: AddCommentParams): AppThunk =>
  async (dispatch): Promise<void> => {
    // const response = await kanbanApi.addComment(params);
    const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const response = await axios({
      method: 'post',
      url: 'http://localhost:8080/api/board/tasks/comment',
      headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
      data: params,
    });

    dispatch(
      slice.actions.addComment({
        taskId: params.taskId,
        comment: response.data,
      })
    );
  };

type AddCheckListParams = {
  projectId: string;
  taskId: string;
  name: string;
};

const addChecklist =
  (params: AddCheckListParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.addChecklist(params);

    dispatch(
      slice.actions.addChecklist({
        taskId: params.taskId,
        checklist: response,
      })
    );
  };

type UpdateChecklistParams = {
  projectId: string;
  taskId: string;
  checklistId: string;
  update: { name: string };
};

const updateChecklist =
  (params: UpdateChecklistParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateChecklist(params);

    dispatch(
      slice.actions.updateChecklist({
        taskId: params.taskId,
        checklist: response,
      })
    );
  };

type DeleteChecklistParams = {
  projectId: string;
  taskId: string;
  checklistId: string;
};

const deleteChecklist =
  (params: DeleteChecklistParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteChecklist(params);

    dispatch(slice.actions.deleteChecklist(params));
  };

type AddCheckItemParams = {
  projectId: string;
  taskId: string;
  checklistId: string;
  name: string;
};

const addCheckItem =
  (params: AddCheckItemParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.addCheckItem(params);

    dispatch(
      slice.actions.addCheckItem({
        taskId: params.taskId,
        checklistId: params.checklistId,
        checkItem: response,
      })
    );
  };

type UpdateCheckItemParams = {
  projectId: string;
  taskId: string;
  checklistId: string;
  checkItemId: string;
  update: {
    name?: string;
    state?: 'complete' | 'incomplete';
  };
};

const updateCheckItem =
  (params: UpdateCheckItemParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateCheckItem(params);

    dispatch(
      slice.actions.updateCheckItem({
        taskId: params.taskId,
        checklistId: params.checklistId,
        checkItem: response,
      })
    );
  };

type DeleteCheckItemParams = {
  projectId: string;
  taskId: string;
  checklistId: string;
  checkItemId: string;
};

const deleteCheckItem =
  (params: DeleteCheckItemParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteCheckItem(params);

    dispatch(slice.actions.deleteCheckItem(params));
  };

export const thunks = {
  addCheckItem,
  addChecklist,
  addComment,
  clearColumn,
  createColumn,
  createTask,
  deleteCheckItem,
  deleteChecklist,
  deleteColumn,
  deleteTask,
  getBoard,
  moveTask,
  updateCheckItem,
  updateChecklist,
  updateColumn,
  updateTask,
};
