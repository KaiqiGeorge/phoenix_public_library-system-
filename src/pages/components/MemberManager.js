import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

function MemberManager() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [members, setMembers] = useState([]); //用于保存从数据库读取的成员列表
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null); // 照片文件
  const [showModal, setShowModal] = useState(false); // 控制弹窗显示
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // 当前正在编辑的成员对象
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("member");
  const [editPhone, setEditPhone] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);

  const membersRef = collection(db, "members");
  //查看当前用户是不是管理员
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 页面加载时执行，只执行一次：设置实时监听 Firestore 数据变化
  useEffect(() => {
    const unsubscribe = onSnapshot(membersRef, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        // 将 Firestore 返回的每条文档转换为对象数组，并保存到状态中
        id: doc.id,
        ...doc.data(),
      }));

      setMembers(list); //更新成员状态
    });
    // 返回取消监听函数（组件卸载时自动调用）
    return () => unsubscribe();
  }, [membersRef]);

  // 添加成员按钮点击时触发的函数
  const handleAddMember = async () => {
    if (!name || !role || !email || !phone || !photo) {
      alert("Please fill in all required fields ");
      return;
    }

    try {
      let photoUrl = "";

      if (photo) {
        const photoRef = ref(
          storage,
          `memberPhotos/${Date.now()}_${photo.name}`
        );
        await uploadBytes(photoRef, photo);
        photoUrl = await getDownloadURL(photoRef);
      }

      // 使用 addDoc 向 Firestore 添加一个新文档
      await addDoc(membersRef, { name, role, email, photoUrl, phone });
      // 添加成功后清空输入框
      setName("");
      setRole("");
      setEmail("");
      setPhone("");
      setPhoto("");
    } catch (error) {
      alert("Fail to add member:" + error.message);
    }
  };

  // 删除成员函数：根据 ID 删除 Firestore 中的文档
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "members", id));
    } catch (error) {
      alert("Failed to delete member:" + error.message);
    }
  };
  // 编辑保存
  const handleSaveEdit = async () => {
    if (!editingMember) return;

    try {
      let newPhotoUrl = editingMember.photoUrl;

      if (editPhoto) {
        const photoRef = ref(
          storage,
          `memberPhotos/${Date.now()}_${editPhoto.name}`
        );
        await uploadBytes(photoRef, editPhoto);
        newPhotoUrl = await getDownloadURL(photoRef);
      }

      const memberRef = doc(db, "members", editingMember.id);
      await updateDoc(memberRef, {
        name: editName,
        email: editEmail,
        role: editRole,
        phone: editPhone,
        photoUrl: newPhotoUrl,
      });

      // 关闭弹窗
      setEditingMember(null);
    } catch (error) {
      alert("Failed to update member: " + error.message);
    }
  };

  //页面渲染部分
  return (
    <div className="container mt-4">
      {/* 添加按钮：仅管理员可见 */}
      {isAdmin && (
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Member
          </button>
        </div>
      )}

      <div className="row">
        {members.map((member) => (
          <div key={member.id} className="col-md-4 col-sm-6 mb-4 mt-4">
            <div className="card h-100 shadow-sm">
              {member.photoUrl && (
                <img
                  src={member.photoUrl}
                  alt={`${member.name}'s profile`}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: "200px" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{member.name}</h5>
                <p className="card-text mb-1">📧 {member.email}</p>
                <p className="card-text mb-1">👤 {member.role}</p>
                <p className="card-text">📱 {member.phone}</p>
                {isAdmin && (
                  <div className="d-flex justify-content-end mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm me-2 ps-2"
                      onClick={() => {
                        setEditingMember(member);
                        setEditName(member.name);
                        setEditEmail(member.email);
                        setEditRole(member.role);
                        setEditPhone(member.phone);
                        setEditPhoto(null); // 不预设旧图
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(member.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 添加按钮弹窗的内容 */}
      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Member</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <select
                  className="form-select mb-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="member">🙋‍♂️ member</option>
                  {isAdmin && <option value="admin">👑 admin</option>}
                </select>

                <input
                  className="form-control mb-2"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddMember}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editingMember && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Member</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingMember(null)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-2"
                  placeholder="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
                <select
                  className="form-select mb-2"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="member">🙋‍♂️ member</option>
                  {isAdmin && <option value="admin">👑 admin</option>}
                </select>
                <input
                  className="form-control mb-2"
                  placeholder="Phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditPhoto(e.target.files[0])}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberManager;
