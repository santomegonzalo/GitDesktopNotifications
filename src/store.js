import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

const composer = applyMiddleware(thunk);

const store = createStore(
  reducer,
  composer
);

export default store;
