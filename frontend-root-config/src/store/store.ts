import { legacy_createStore as createStore, applyMiddleware, combineReducers, compose } from 'redux'
import thunk from 'redux-thunk'

import { userReducer } from './reducers/user'

const composeEnhancers = compose

const rootReducer = combineReducers({
    userModule: userReducer,
})


export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))