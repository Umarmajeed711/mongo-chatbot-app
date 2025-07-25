import React, { useContext, useEffect, useState } from "react";
import "../App.css";
import { Link, Outlet } from "react-router";
import { GlobalContext } from "../context/Context";
import { FaUser } from "react-icons/fa";
import api from "../components/api";

const Home = () => {
  let { state, dispatch } = useContext(GlobalContext);


  return (
    <div className="flex justify-center  h-screen ">
      <div className="w-80 border   isLogin">
        <div className="flex justify-between items-center p-2 h-14 ">
          <div>Icon</div>

          <div>Home</div>

          <div>
            <img
              src="/image.png"
              alt=""
              className="h-12 w-12 rounded-full border-2 border-white"
            />
          </div>
        </div>

        <div className="chat-height w-full bg-slate-50 ">
          <Outlet/>        
        </div>

        <div className="flex items-end justify-between bg-white text-black  p-2 w-full h-14">
           <Link to="/home" className="flex flex-col items-center gap-1">
            <div>
              <FaUser />
            </div>

            <div>Chats</div>
           </Link>
          

      
          <Link to="calls" className="flex flex-col items-center gap-1">
            <div>
              <FaUser />
            </div>

            <div>Calls</div>
           </Link>

           <Link to="Status" className="flex flex-col items-center gap-1">
            <div>
              <FaUser />
            </div>
           <div>Status</div>
          </Link>

           <Link to="Profile" className="flex flex-col items-center gap-1">
            <div>
              <FaUser />
            </div>
           <div>Profile</div>
          </Link>
        </div>
      </div>

      
      
    </div>
  );
};

export default Home;
