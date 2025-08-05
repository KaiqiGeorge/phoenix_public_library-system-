//登录成功后的主页面

//// 从 Firebase 中引入认证对象 auth;引入 Firebase 提供的 signOut 方法，用来登出;引入 react-router-dom 中的导航方法，支持页面跳转
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Events from "./Events";
import Members from "./Members";
import HomePage from "./HomePage";

function Dashboard() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");

  const handleLogout = async () => {
    // 使用 Firebase 的 signOut 函数退出用户
    await signOut(auth);
    //跳转回登陆页
    navigate("/");
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(
          collection(db, "members"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          const name = data.name || user.email;
          setFirstName(name.split(" ")[0]); // 拿到 first name
        } else {
          setFirstName(user.email); // 没有匹配到就用 email
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/*  顶部导航栏 */}
      <nav
        className="navbar navbar-expand-lg"
        style={{ backgroundColor: "#0b3558" }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center px-4">
          {/* 左侧 Logo 和品牌名 */}
          <div className="d-flex align-items-center">
            <img
              src="/images/logo2.webp"
              alt="Logo"
              width="56"
              height="56"
              className="me-1"
            />
            <span className="text-white fw-bold">Phoenix Public Library</span>
          </div>

          {/* 中间导航链接 */}
          <ul className="navbar-nav flex-row gap-4">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/dashboard">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/dashboard/members">
                Members
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/dashboard/events">
                Events
              </Link>
            </li>
          </ul>

          {/* 右侧功能图标区 */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-white small" style={{fontSize: "18px"}}>👋 <strong>{firstName}</strong></span>
            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* 页面路由切换内容 */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="members" element={<Members />} />
          <Route path="events" element={<Events />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
