import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/index.css";

import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4 text-white space-x-4">
        <Link to="/">Home</Link>
      </nav>

      <div className="p-8">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
