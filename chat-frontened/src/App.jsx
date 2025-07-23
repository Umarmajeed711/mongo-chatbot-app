import './App.css';
import Myroute from './components/Myroute';
import { useContext,useEffect } from 'react';
import { GlobalContext } from './context/Context';
import axios from 'axios';
import { Navigate, Route, Routes } from 'react-router-dom';
import api from './components/api';
import { useState } from 'react';
import SplashScreen from './components/SplashScreen';

function App() {
 

 // data store in a context api
 let {state , dispatch} = useContext(GlobalContext);

 const [Loading,setLoading] = useState(true)

useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 2 seconds

    return () => clearTimeout(timer);
}, []);




 const isUserLogin = async () => {

  try{
     let response = await api.get("/user-detail")

     dispatch({type:"USER_LOGIN", payload:response?.data.user})

      
  }
  catch(error){
    dispatch({type:"USER_LOGOUT"})

  }

 

  

 }


   useEffect(() => {
    isUserLogin()
    
  }, []);


  




  return (
    <div >

      {
        (Loading) ? <SplashScreen/> :  <Myroute/>
      }

     

    
     
    

    
    </div>
  );
}

export default App;
 