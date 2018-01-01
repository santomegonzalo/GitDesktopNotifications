import * as types from './actionTypes';

const initialState = {};

export default function app(state = initialState, action = {}) {
  switch (action.type) {
    default: {
      console.log(`ACTION: ${action.type} DATA:`, action.data); // eslint-disable-line no-console
      return state;
    }
  }
}
