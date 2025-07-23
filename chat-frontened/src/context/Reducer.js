export const reducer = (state, action) => {
    switch (action.type) {
      case "USER_LOGIN": {
        return { isLogin: true , user: action.payload , isAdmin : false}
      }
      case "ADMIN_LOGIN" : {
         return { isLogin: true , user: action.payload , isAdmin : true}
      }
      case "USER_LOGOUT": {
        return { ...state, isLogin: false , isAdmin: false } // set this to null on purpose, do not change
      }
      default: {
        return state
      }
    }
  }