import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Signup } from '../pages/signup'
import { Login } from '../pages/login'
import Home from '../pages/Home'
import { GlobalContext } from '../context/Context'
import IsLogin from '../pages/isLogin'
import Chats from './chats'
import Calls from './calls'
import UserChat from '../pages/UserChat'
import Profile from './Profile'
import Status from './Status'
import WebHome from '../pages/WebHome'
import ForgetPassword from '../pages/ForgetPassword'




const Myroute = () => {


  let {state , dispatch} = useContext(GlobalContext)


  return (

   <div>
    {
     (state?.isLogin == true) ?
    
    <Routes>
        <Route path='/home'   element={<Home/>}>
          <Route path=''  element={<Chats/>} />
          {/* <Route path='calls' element={<Calls/>} /> */}
          <Route path='Status' element={<Status/>}/>
          <Route path="Profile" element={<Profile/>}/>
        </Route>
        <Route path='/WebHome' element={<WebHome/>}></Route>
        <Route path='/UserChat/:id' element={<UserChat/>}></Route>
        <Route path="*" element={<Navigate to="/home" />}></Route>
       
    </Routes>
    
   
     : (state?.isLogin == false) ?
    <Routes>
    <Route path='/signup' element={<Signup/>}></Route>
    <Route path='/login' element={<Login/>}></Route>
    <Route path="/isLogin" element={<IsLogin/>}></Route> 
    <Route path='/forget-password' element={<ForgetPassword />} />
    <Route path='/WebHome' element={<WebHome/>}></Route>
   
    <Route path="*" element={<Navigate to="/isLogin" />}></Route>
    </Routes>
     : null
    }

</div>

  )
}

export default Myroute