import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import "../App.css";
import { useContext, useState } from "react";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { GlobalContext } from "../context/Context";
import axios from "axios";
import Swal from "sweetalert2";
import Alert from "@mui/material/Alert";
import api from "../components/api";

export const Signup = () => {
  let { state, dispatch } = useContext(GlobalContext);

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setloading] = useState(false);

  const [apiError, setApiError] = useState("");

  const PasswordVisible = () => {
    setShowPassword(!showPassword);
  };


  const signUpValidation = yup.object({
    name: yup.string().trim().required("Name is required"),
    email: yup
      .string()
      .trim()
      .email("Invalid email format")
      .required("Email is required")
      .test(
        "valid-domain",
        "emails ending in @gmail.com are allowed",
        (value) => (value ? value.toLowerCase().endsWith("@gmail.com") : false)
      ),
    // password: yup.string().required().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/),
    password: yup
      .string()
      .required()
      .min(8, "At least 8 characters")
      .matches(/[a-z]/, "Must include a lowercase letter")
      .matches(/[A-Z]/, "Must include an uppercase letter")
      .matches(/\d/, "Must include a number")
      .matches(/[@$!%*?&#]/, "Must include a special character"),
  });

  const signUpFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: signUpValidation,

    onSubmit: async (values) => {
      setloading(true);

      try {
        let response = await api.post(
          `/sign-up`,
          {
            name: values.name,
            email: values.email,
            password: values.password,
          },
          {
            withCredentials: true, // ✅ This sends and receives cookies
          }
        );

        setloading(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Account Created",
        });

        signUpFormik.resetForm();

        navigate("/login");
      } catch (error) {
        console.log(error);
        setloading(false);

        setApiError(error?.response.data.message || "Something went wrong");
      }
    },
  });

  let Styles = {
    inputField:
      "border-b-2  bg-transparent p-1 outline-none focus:drop-shadow-xl w-[230px]",
  };
  return (
    <div className="flex justify-center items-center h-full overflow-hidden bg-slate-100">
      <div className="flex justify-center   gap-20  p-16  ">
        {/* Image div */}
        
        <div className="hidden  md:flex flex-col ">
          <div>
            <img src="/logo.png" alt="" className="h-48" />
          </div>

         
        </div>
        

        {/* signup form */}

        <div>
          <div className="h-[40px] w-full flex justify-center items-center mb-2 overflow-hidden">
            <Alert
              severity="error"
              className="transition-all duration-300 max-w-[350px] text-sm px-4 py-1"
              style={{
                opacity: apiError ? 1 : 0,
                visibility: apiError ? "visible" : "hidden",
              }}
            >
              {apiError || "placeholder"}
            </Alert>
          </div>

           <div className="sm:hidden">
            <Link to={"/isLogin"}>Arrow</Link>
          </div>

          <form
            onSubmit={signUpFormik.handleSubmit}
            className=" p-6 flex flex-col justify-center max-w-80 "
          >
            <div className="flex flex-col gap-2">
             <p className="text-[28px] sm:text-3xl text-center  font-bold">Sign up with <span className="border-[#24786d] border-b-4 ">Email</span></p>
            <p className="py-2 text-center mt-3 text-gray-500">
              Get chatting with friends and family today by signing up for our chat app!
            </p>
            </div>

            <div className="flex flex-col justify-center gap-3 my-4">
              <div className="flex gap-3 items-center ">
                <label htmlFor="name">
                  <span className="text-xl font-bold">
                    <FaUser />
                  </span>
                </label>

                <div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name"
                    value={signUpFormik.values.name}
                    onChange={(e) => {
                      signUpFormik.handleChange(e);
                      setApiError(""); // clear backend error
                    }}
                    className={Styles.inputField}
                    disabled={loading}
                  />

                  {signUpFormik.touched.name &&
                  Boolean(signUpFormik.errors.name) ? (
                    <p className="requiredError">
                      {signUpFormik.touched.name && signUpFormik.errors.name}
                    </p>
                  ) : (
                    <p className="ErrorArea">Error Area</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <label htmlFor="email">
                  <span className="text-xl font-bold">
                    <MdEmail />
                  </span>
                </label>
                <div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email"
                    value={signUpFormik.values.email}
                    onChange={(e) => {
                      signUpFormik.handleChange(e);
                      setApiError(""); // clear backend error
                    }}
                    className={Styles.inputField}
                    disabled={loading}
                  />

                  {signUpFormik.touched.email &&
                  Boolean(signUpFormik.errors.email) ? (
                    <p className="requiredError">
                      {signUpFormik.touched.email && signUpFormik.errors.email}
                    </p>
                  ) : (
                    <p className="ErrorArea">Error Area</p>
                  )}
                </div>
              </div>

              <div
                className="flex gap-3 items-center"
                style={{ position: "relative" }}
              >
                <label htmlFor="password">
                  <span className="text-xl font-bold">
                    <RiLockPasswordFill />
                  </span>
                </label>
                <div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    maxLength={32}
                    value={signUpFormik.values.password}
                    className={Styles.inputField}
                    onChange={(e) => {
                      signUpFormik.handleChange(e);
                      setApiError(""); // clear backend error
                    }}
                    disabled={loading}
                  />

                  <p
                    onClick={PasswordVisible}
                    style={{
                      position: "absolute",
                      right: "0",
                      top: "0",
                      margin: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </p>

                  {signUpFormik.touched.password &&
                  Boolean(signUpFormik.errors.password) ? (
                    <p className="requiredError">
                      {signUpFormik.touched.password &&
                        signUpFormik.errors.password}
                    </p>
                  ) : (
                    <p className="ErrorArea">Error Area</p>
                  )}
                </div>
              </div>
            </div>

            

            <button
              disabled={loading}
              type="submit"
               className=" bg-[#24786d] w-full transition-all duration-200 rounded flex justify-center p-2 my-4 text-white  hover:shadow-[#24786d] hover:shadow-md"
              
            >
              {loading ? (
                <div className="flex items-center  p-2 gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                </div>
              ) : 
               "Create Account"
               
              }
            </button>

            <div className="flex justify-center mt-2">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="transition-all duration-100  hover:underline hover:text-[#24786d]"
                >
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
