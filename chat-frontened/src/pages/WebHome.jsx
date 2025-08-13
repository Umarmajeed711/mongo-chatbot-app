import React, { useContext, useEffect, useState, useRef } from "react";
import "../App.css";
import { Link, Outlet } from "react-router";
import { GlobalContext } from "../context/Context";
import { FaUser } from "react-icons/fa";
import api from "../components/api";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import moment from "moment";
import { IoSearchSharp } from "react-icons/io5";
import { RiGalleryView2 } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const WebHome = () => {
  let { state, dispatch } = useContext(GlobalContext);
  const [message, setMessage] = useState("");
  const [uploadImage, setUploadImage] = useState(null);
  const [FileName, setFileName] = useState("");
  const [userDetails, setUserDatails] = useState({});
  const [recieverID, setReceiverId] = useState("");
  const [Users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [user, setUser] = useState("");
  const [loading, setloading] = useState(false);

  // get all the users

  const getUsers = async (searchTerm = "") => {
    try {
      let response = await api.get(`/users?user=${searchTerm}`, {
        withCredentials: true,
      });

      setUsers(response.data.users);
      setloading(false);
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const searchUser = (e) => {
    e.preventDefault();
    getUsers(user);
    setloading(true);
  };

  // get all users data

  const getAllMessages = async (reciever) => {
    try {
      let response = await api.get(`/allMessages/${reciever}`);
      console.log(response);

      setAllMessages(response?.data.allMessages);
    } catch (error) {
      console.log("Error", error);
    }
  };

  // get user details
  const getUserDetails = async (reciever) => {
    try {
      let userDetails = await api.get(`/user-detail?user_id=${reciever}`);
      console.log(userDetails.data.user);
      setUserDatails(userDetails?.data.user);
    } catch (error) {
      console.log("User details error:", error);
    }
  };

  const inputRef = useRef();

  const messagesEndRef = useRef();

  const startChat = (reciever) => {
    setReceiverId(reciever);

    inputRef.current?.focus();
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    getAllMessages(reciever);
    getUserDetails(reciever);

    const socket = io("http://localhost:5002",{withCredentials:true});

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on(`${reciever}-${state.user.user_id}`, (data) => {
      console.log("Received:", data);
      setAllMessages((prev) => [...prev, data]);
      // getConversation();
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected. Reason:", reason);
    });

    socket.on("error", (error) => {
      console.log("Error:", error);
    });

    return () => {
      console.log("Component unmount");
      socket.close(); // cleanup on unmount
    };
  };

  const handleWrapperClick = () => {
    inputRef.current?.focus(); // Focus input when wrapper is tapped
  };

  const [sending, setIsSending] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      if (message) {
        let response;
      

        if (FileName && uploadImage) {
          setIsSending(true);

          const formData = new FormData();
          formData.append("imageCaption", message);
          formData.append("image", uploadImage); // ✅ Must match your multer field name!

          response = await api.post(`/chat/${recieverID}`, formData, {});
        } else {
          

          if (message && !open) {
            setIsSending(true);

            response = await api.post(`/chat/${recieverID}`, {
              message: message,
            });
          }

          // console.log(response.data);
          
          
        }

       
          setAllMessages((prev) => [...prev, response?.data.chat]);
          setIsSending(false);
          Close()
      }
    } catch (error) {
      console.log("Message send Error", error);
    }
  };

  const Close = () => {
    setOpen(false);
    setUploadImage();
    setFileName("");
    setMessage("");
  };

  return (
    <div className="flex  h-screen ">
      <div className=" border   bg-[#24786d] h-full w-[500px]">
        {/* Home header */}
        <div className="flex justify-between items-center p-2 h-[73px] border border-b-white ">
          <div>
            <img
              src="/cut-logo.png"
              alt="logo "
              className="h-12 w-12 rounded-full border-2 border-white bg-white"
            />
          </div>

          <div className="text-2xl font-semibold">Home</div>

          <div>
            <img
              src="/image.png"
              alt=""
              className="h-12 w-12 rounded-full border-2 border-white"
            />
          </div>
        </div>

        {/* Search user form */}

        <form onSubmit={searchUser} className="relative">
          <input
            onChange={(e) => {
              setUser(e.target.value);
            }}
            type="text"
            placeholder="Search user"
            className="border  bg-white w-full p-1 outline-none"
          />
          <button type="submit" className="absolute top-0 right-0 p-2">
            <IoSearchSharp />
          </button>
        </form>

        {/* map  all the user */}

        <div className="my-2">
          {loading ? (
            <div className="flex justify-center items-center mt-5">
              <p className="h-12 w-12 rounded-full border-4 border-white animate-spin border-r-black"></p>
            </div>
          ) : (
            <div>
              {Users.length ? (
                <div>
                  {Users?.map((eachUser, i) => {
                    return (
                      <div
                        onClick={() => {
                          startChat(eachUser._id);
                        }}
                        key={i}
                        className="w-full border-2 rounded-md p-5 mb-1 text-black block bg-slate-100"
                      >
                        <div className="flex gap-5">
                          <div>
                            <img
                              src="/image.png"
                              alt="avatar"
                              className="rounded-full w-12 h-12"
                              onError={(e) => {
                                e.target.src = "/image.png";
                              }}
                            />
                          </div>

                          <div>
                            <h1>
                              {eachUser?.name}{" "}
                              {eachUser?._id == state?.user.user_id
                                ? "(You)"
                                : ""}
                            </h1>
                            <h6>{eachUser?.email}</h6>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex justify-center items-center h-full mt-5 text-white">
                  <p>User not found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* /// User Chat */}
      <div className="w-full bg-slate-200">
        {recieverID ? (
          <div
            className="flex flex-col  w-full  mx-auto bg-gray-100 shadow-lg"
            style={{ height: "calc(var(--vh))" }}
          >
            <div className="shrink-0">
              <div className="bg-[#24786d]  text-white p-4 flex items-center gap-3">
                <img
                  src="/image.png"
                  alt="avatar"
                  className="rounded-full w-10 h-10"
                  onError={(e) => {
                    e.target.src = "/image.png";
                  }}
                />

                <div>
                  <p className="font-semibold">{userDetails.name}</p>
                  <p className="text-sm opacity-75">online</p>
                </div>
              </div>
            </div>

            {/* map all the user message*/}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 ">
              {allMessages?.map((msg, i) => (
                <div key={i} className="">
                  {/* <div className={`${msg?.from._id === state?.user.user_id ? "ml-auto" : null}`} >
                   <img src="/image.png" alt="ava"
                  className="rounded-full w-12 h-12"

                   onError={(e) => {e.target.src ="/image.png";
              }} />

                </div>

                 <div 
                  className={`max-w-[70%] px-4 py-2 rounded-xl text-sm  self-end  ${
                    msg?.from._id === state?.user.user_id
                      ?
                        "bg-[#24786d] text-white ml-auto"
                      : "bg-white text-gray-900"
                  }`}>
                    {msg?.message}

                  </div> */}

                  {msg?.from._id === state?.user.user_id ? (
                    <div className="flex gap-1 justify-end ">
                      <div className="max-w-[70%] px-4 py-2 rounded-xl rounded-br-none text-sm  self-start bg-[#24786d] text-white">
                        {msg?.message}
                      </div>

                      <div>
                        <img
                          src="/image.png"
                          alt="ava"
                          className="rounded-full w-12 h-12"
                          onError={(e) => {
                            e.target.src = "/image.png";
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <div>
                        <img
                          src="/image.png"
                          alt="ava"
                          className="rounded-full w-12 h-12"
                          onError={(e) => {
                            e.target.src = "/image.png";
                          }}
                        />
                      </div>

                      <div className="max-w-[70%] px-4 py-2 rounded-xl rounded-bl-none text-sm  self-end bg-white text-gray-900">
                        {msg?.message}
                      </div>
                    </div>
                  )}

                  {/* <div className={`${msg?.from._id === state?.user.user_id ? "ml-auto" : null}`} >
                   <img src="/image.png" alt="ava"
                  className="rounded-full w-12 h-12"

                   onError={(e) => {e.target.src ="/image.png";
              }} />
              
                </div>

                 <div 
                  className={`max-w-[70%] px-4 py-2 rounded-xl text-sm  self-end  ${
                    msg?.from._id === state?.user.user_id
                      ?
                        "bg-[#24786d] text-white ml-auto"
                      : "bg-white text-gray-900"
                  }`}>
                    {msg?.message}

                  </div> */}



                  
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* select image div */}
            <div
              className={`relative   w-full h-96 bg-slate-50 ${
                open ? "openYes " : "hidden"
              } " `}
            >
              <p
                onClick={Close}
                className="absolute top-0 right-0 m-3 h-5 z-50"
              >
                <IoMdClose />
              </p>

              <div className="flex justify-center items-center h-full ">
                {FileName ? (
                  `File select: ${FileName}`
                ) : (
                  <h1 style={{ cursor: "pointer" }}>
                    <FaPlus />
                  </h1>
                )}

                <input
                  type="file"
                  className="absolute w-full h-full opacity-0"
                  onChange={(e) => {
                    setUploadImage(e.target.files[0]);
                    setFileName(e?.target.files[0].name);
                  }}
                />
              </div>
            </div>

            {/* send message */}
            <div className="shrink-0">
              {open ? (
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
                    placeholder="Add Caption"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button
                    className="bg-[#24786d] text-white px-4 py-2 rounded-full "
                    disabled={sending}
                  >
                    Send
                  </button>
                </form>
              ) : (
                <form
                  className="p-4 flex gap-2 items-center border-t bg-white active:bg-gray-50"
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

                  <div className="">
                    <h1
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      <RiGalleryView2 />
                    </h1>
                  </div>

                  <button
                    className="bg-[#24786d] text-white px-4 py-2 rounded-full "
                    disabled={sending}
                  >
                    Send
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="flex gap-2 flex-col justify-center items-center">
              <img src="/logo.png" alt="" className="h-60   animate-pulse " />
              <p className="text-[18px] font-normal  text-gray-500">
                Start chat with your family and friends
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebHome;
