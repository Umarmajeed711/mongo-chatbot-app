import React, { createContext, useReducer } from 'react'
import { reducer } from './Reducer';

export const GlobalContext = createContext("Initial Value");

let data = {
    user: {},
    isLogin: false,
    baseUrl: 'http://localhost:5002/api/v1',
    baseSocketIo:  window.location.href.split(":")[0] == "http" ? "http://localhost:5002" : ""
    // isAdmin:false

}

export default function ContextProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, data)
    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {children}
        </GlobalContext.Provider>
    )
}