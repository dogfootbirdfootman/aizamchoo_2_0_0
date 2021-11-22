import { createStore } from 'redux';

const initialState = {
    user: null
}

function reducer(state = initialState, action){
    if(action.type === 'user'){
        return {...state, user: action.user }
    }
    return state;
}

const store = createStore(reducer);

export default store;