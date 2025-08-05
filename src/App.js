import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/components/EventDetail";
import Register from "./pages/Register";

//设置路由
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/signup" element={<Register />} /> 
      </Routes>
    </Router>
  );
}

export default App;
