import React, { useEffect, useRef, useState } from "react";
import api from "../components/api";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { GlobalContext } from '../context/Context';
import io from "socket.io-client"
import moment from "moment"

const UserChat = () => {
  let {state,dispatch} = useContext(GlobalContext)
  const [message, setMessage] = useState("");
  const [userDetails,setUserDatails] = useState({})
  const [allMessages, setAllMessages] = useState([]);

  const { id } = useParams();

  // get all users data

  const getAllMessages = async () => {
    try {
      let response = await api.get(`/allMessages/${id}`);
      console.log(response);
      

      setAllMessages(response?.data.allMessages);
    } catch (error) {
      console.log("Error", error);
    }
  };

  // get user details
  const getUserDetails = async () => {
    try{

        let userDetails = await api.get(`/user-detail?user_id=${id}`)
        console.log(userDetails.data.user);
        setUserDatails(userDetails?.data.user)
        

    }catch(error){
        console.log("User details error:", error);
        

    }
  }

  const inputRef = useRef();

  const messagesEndRef = useRef();



  useEffect(() => {
    // Automatically focus input on mount
    inputRef.current?.focus();
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    getAllMessages()
    getUserDetails()
  }, []);


  useEffect(() => {
        const socket = io("http://localhost:5002");
    
        socket.on('connect', () => {
            console.log("Connected to server");
        });
    
        socket.on(`${id}-${state.user.user_id}`, (data) => {
            console.log("Received:", data);
            setAllMessages(prev => [...prev, data])
            // getConversation();
        });
    
        socket.on('disconnect', (reason) => {
            console.log("Disconnected. Reason:", reason);
        });

        socket.on('error', (error) => {
            console.log("Error:", error);
        });
    
        return () => {
            console.log("Component unmount")
            socket.close();  // cleanup on unmount
        };
    }, []);


const handleWrapperClick = () => {
    inputRef.current?.focus(); // Focus input when wrapper is tapped
  };

  const [sending,setIsSending] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      if(message){
        setIsSending(true)
         
      let response = await api.post(`/chat/${id}`, {
        message: message,
      });

      console.log(response.data);
      setMessage("");
      setAllMessages(prev => [...prev, response?.data.chat])
      setIsSending(false)

    }
     
    } catch (error) {
      console.log("Message send Error", error);
    }
  };
  return (
    <div
    className="flex flex-col  w-full md:max-w-md mx-auto bg-gray-100 shadow-lg"
    style={{ height: "calc(var(--vh))" }}> 
      <div className="shrink-0">
        <div className="bg-[#24786d]  text-white p-4 flex items-center gap-3">
          <img
            src="/image.png"
            alt="avatar"
            className="rounded-full w-10 h-10"
            onError={(e) => {
                e.target.src ="/image.png";
              }}

          />
         
          <div>
            <p className="font-semibold">{userDetails.name}</p>
            <p className="text-sm opacity-75">online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 ">
        {allMessages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[70%] px-4 py-2 rounded-xl text-sm   ${
              msg.from._id === state?.user.user_id
                ? "bg-[#24786d] text-white ml-auto"
                : "bg-white text-gray-900"
            }`}
          >
            {msg.message}
         
          </div >
        ))}
         <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0">
        <form
          className="p-4 flex gap-2 border-t bg-white active:bg-gray-50"
          onClick={handleWrapperClick}
          onSubmit={sendMessage}
          disabled={sending}
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            // onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="bg-[#24786d] text-white px-4 py-2 rounded-full"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserChat;
