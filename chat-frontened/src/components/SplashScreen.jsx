import React from "react";

export default function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <img
        src="/logo.png" // Replace with your logo path
        alt="Logo"
        className="animate-pulse"
      />
    </div>
  );
}
