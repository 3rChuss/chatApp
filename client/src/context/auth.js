import React, { createContext, useReducer, useContext } from 'react';

//hold the state
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

//check if user has been login before
let user = localStorage.getItem('user');
if (!user) {
    user = null;
}

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem('user', action.payload.username)
            return {
                ...state,
                user: action.payload
            }
        case 'LOGOUT':
            localStorage.removeItem('user');
            return {
                ...state,
                user: null
            }
        default:
            throw new Error(`unknown action type: ${action.type}`)
    }
}


export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user });

    return (
        <AuthDispatchContext.Provider value={dispatch}>
            <AuthStateContext.Provider value={state}>
                {children}
            </AuthStateContext.Provider>
        </AuthDispatchContext.Provider>
    )
}

export const useAtuhState = () => useContext(AuthStateContext);
export const useAtuhDispatch = () => useContext(AuthDispatchContext);