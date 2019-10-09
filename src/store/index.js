import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import * as GetMenuListReducer from '@/store/menu/reducer';
import * as GlobalConfigReducer from '@/store/config/reducer';
import * as statusCodeReducer from '@/store/statusCode/reducer';

const store = createStore(
    combineReducers({
        ...GlobalConfigReducer,
        ...GetMenuListReducer,
        ...statusCodeReducer
    }),
    applyMiddleware(thunk)
);


export default store