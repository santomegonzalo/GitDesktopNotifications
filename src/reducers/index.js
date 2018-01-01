import { combineReducers } from 'redux';

/**
 * reducers
 */
import app from './app';
import github from './github';

const AppReducer = combineReducers({
  app,
  github
});

export default AppReducer;