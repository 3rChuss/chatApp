import React, { createContext, useReducer, useContext } from "react";

//hold the state
const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

const messageReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      console.log('state SET USER')
      return {
        ...state,
        users: action.payload,
      };

    case "SET_SELECTED_CHAT":
      console.log('state SELECTEDCHAT')
      return {
        ...state,
        selectedChat: action.payload,
      }

    case "UPDATE_GROUP":
      console.log(action.payload)
      return {
        ...state
      }
      
    default:
      throw new Error(`unknown action type: ${action.type}`);
  }
};

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, { users: null});

  return (
    <MessageDispatchContext.Provider value={dispatch}>
      <MessageStateContext.Provider value={state}>
        {children}
      </MessageStateContext.Provider>
    </MessageDispatchContext.Provider>
  );
};

export const useMessageState = () => useContext(MessageStateContext);
export const useMessageDispatch = () => useContext(MessageDispatchContext);
