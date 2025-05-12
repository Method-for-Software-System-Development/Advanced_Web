import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/index.css";

import Home from "./pages/Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;