import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MemberManager from "./pages/components/MemberManager";
import EventManager from "./pages/components/EventManager";
import EventDetail from "./pages/components/EventDetail";

//设置路由
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
