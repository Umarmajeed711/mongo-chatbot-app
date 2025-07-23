import React, { useContext } from "react";
import "../App.css";
import { Link } from "react-router";
import { GlobalContext } from "../context/Context";
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import api from "./api";
import { useEffect } from "react";
const Chats = () => {
  let { state, dispatch } = useContext(GlobalContext);

    const [Users,setUsers] = useState([])

  const getUsers = async () => {
    try{
      let response = await api.get("/users")

      setUsers(response.data.users)


    }
    catch(error){
      console.log("Error",error);
      

    }
  }

  useEffect(() => {
    getUsers()
  },[])
   return (
    
       

     <div className="isLogin h-full">
      <div className="my-2">
        {
          Users.map((eachUser,i) =>{
            return(
              <Link to={`/UserChat/${eachUser?._id}`} key={i} className="w-full border-2 rounded-md p-5 mb-1 text-black block bg-slate-100">
                <div className="flex gap-5">

                  <div>
                      <img
            src="/image.png"
            alt="avatar"
            className="rounded-full w-12 h-12"
            onError={(e) => {
                e.target.src ="/image.png";
              }}

          />
                  </div>

                  <div>
                     <h1>{eachUser?.name}  {(eachUser?._id == state?.user.user_id) ? "(You)" : ""}</h1>
            <h6>{eachUser?.email}</h6>

                  </div>

                </div>
                


              </Link>

            )
          })
        }
      </div>
     
     </div>
   );
}

export default Chats