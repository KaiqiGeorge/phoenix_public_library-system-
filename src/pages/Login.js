//登录页
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("登录失败：" + error.message);
    }
  };

  return (
    /*
    <div>
      <h2>用户登录</h2>
      <input
        type="email"
        placeholder="请输入邮箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>登录</button>
      <p>还没有账号？<a href="/register">点击注册</a></p>
    </div>*/
 <div className="container mt-5" style={{ maxWidth: "400px" }}>
  <h2 className="mb-4 text-center">Welcome</h2>

  <div className="mb-3">
    <input
      type="email"
      className="form-control"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  <div className="mb-3">
    <input
      type="password"
      className="form-control"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>

  <div className="d-grid mb-3">
    <button className="btn btn-primary" onClick={handleLogin}>
      Log In
    </button>
  </div>

  <p className="text-center">
    Don't have an account? <a href="/register">Sign Up</a>
  </p>
</div>


  );
}

export default Login;
