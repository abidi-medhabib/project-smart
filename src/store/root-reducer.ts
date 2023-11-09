import { combineReducers } from '@reduxjs/toolkit';

import { reducer as kanbanReducer } from 'src/slices/kanban';

export const rootReducer = combineReducers({
  kanban: kanbanReducer,
});
