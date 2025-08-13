import React, { useState } from "react";
import api from "../components/api";

const ForgetPassword = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isOtpField, setIsOtpField] = useState(false);
  const [isPassField, setIsPassField] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [otp, setOtp] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();

    let extraField = {};

    if (isOtpField) {
      extraField = { otp: otp };
    }

    if (isPassField) {
      extraField = { otp: otp, pass: newPass };
    }

    let apiData = {
      email: userEmail,
      ...extraField,
    };
    try {
      let response = await api.post(
        isPassField
          ? "/reset-password"
          : isOtpField
          ? "/verify-otp"
          : "/generate-otp",
        apiData
      );
      console.log("RES", response.data);
      if (isOtpField) {
        setIsPassField(true);
      }
      setIsOtpField(true);
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <div>
      <form onSubmit={sendOtp}>
        {isPassField ? (
          <input
            placeholder="enter your pass"
            value={newPass}
            onChange={(e) => {
              setNewPass(e.target.value);
            }}
          />
        ) : isOtpField ? (
          <input
            placeholder="enter your otp"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
            }}
          />
        ) : (
          <input
            type="email"
            name="email"
            placeholder="enter your email"
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value);
            }}
          />
        )}
        <button>Send OTP</button>
      </form>
    </div>
  );
};

export default ForgetPassword;
