//注册页
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert("注册失败：" + error.message);
    }
  };

  return (
    /*<div>
      <h2>用户注册</h2>
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
      <button onClick={handleRegister}>注册</button>
      <p>已有账号？<a href="/">返回登录</a></p>
    </div>*/
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4 text-center">User Registration</h2>

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
        <button className="btn btn-success" onClick={handleRegister}>
          Sign Up
        </button>
      </div>

      <p className="text-center">
        Already have an account? <a href="/">Go to login</a>
      </p>
    </div>
  );
}

export default Register;
