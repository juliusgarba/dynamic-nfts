import "./App.css";
import { Navbar } from "./components";
import { Home, Token, Mint } from "./pages";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="app">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="nft/:id" element={<Token />} />
          <Route path="/create" element={<Mint />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
