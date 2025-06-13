// src/App.jsx
import React from "react";
import CarromBoard from "./components/CarromBoard";
import "./App.css"

const App = () => {
  return (
    <div>
      <h1 style={{ textAlign: "center", marginTop: "20px" }}>🎯 Carrom Board Game</h1>
      <CarromBoard />
    </div>
  );
};

export default App;
