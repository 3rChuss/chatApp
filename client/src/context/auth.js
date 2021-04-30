import React, { createContext, useReducer, useContext } from 'react';

//hold the state
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

//check if user has been login before
let username = localStorage.getItem("username");
let userId = localStorage.getItem("userId");
if (!username) {
    username = null;
}
if (!userId) userId = null;

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem("username", action.payload.username);
            localStorage.setItem("userId", action.payload.id);
            return {
              ...state,
                username: action.payload.username,
                userId: action.payload.id,
            };
        case 'LOGOUT':
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
            return {
              ...state,
              username: null,
            };
        default:
            throw new Error(`unknown action type: ${action.type}`)
    }
}


export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { username, userId });

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