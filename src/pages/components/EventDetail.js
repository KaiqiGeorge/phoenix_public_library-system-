import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import JoinEventModal from "./JoinEventModal";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

function EventDetail() {
  const { id } = useParams(); // 从 URL 获取当前活动 ID
  const [event, setEvent] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [registrations, setRegistrations] = useState([]); // 存储报名详情
  const [isAdmin, setIsAdmin] = useState(false); // 当前用户是否为管理员
  const navigate = useNavigate();

  // 监听当前登录用户，并检查是否具有 admin 权限
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(!!token.claims.admin); // 通过 custom claims 判断是否是管理员
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe(); // 组件卸载时移除监听
  }, []);

  // 获取活动详情 + 如果是管理员，则获取报名数据
  useEffect(() => {
    const fetchEventAndRegistrations = async () => {
      const eventRef = doc(db, "events", id);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        setEvent({ id: eventSnap.id, ...eventSnap.data() });

        if (isAdmin) {
          // 获取报名子集合
          const regSnap = await getDocs(
            collection(db, "events", id, "registrations")
          );
          setRegistrationCount(regSnap.size); // 统计报名数量
          setRegistrations(
            regSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          ); // 保存报名信息
        }
      } else {
        setEvent(null); // 活动不存在
      }
    };

    fetchEventAndRegistrations();
  }, [id, isAdmin]); // 依赖 isAdmin，确保获取权限后才执行

  // 导出 Excel 文件
  const exportToExcel = () => {
    if (!registrations.length) return;

    const ws = XLSX.utils.json_to_sheet(registrations); // 将报名数据转换为工作表
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `registrations_${id}.xlsx`
    );
  };

  if (!event) return <p>Loading...</p>;
  const d = event.date.toDate();

  return (
    <div className="container mt-5 pt-3" style={{ maxWidth: "800px" }}>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Event Details</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {/* 左侧：活动封面图 */}
            {event.imageUrl && (
              <div className="col-md-5 mb-3 mb-md-0">
                <img
                  src={event.imageUrl}
                  alt="Event Cover"
                  className="img-fluid rounded"
                  style={{ height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {/* 右侧：活动信息 */}
            <div className={event.imageUrl ? "col-md-7" : "col-12"}>
              
                <h2 className="mt-1 mb-4">{event.title}</h2>
              
              <p className="mb-4">
                {event.description || "N/A"}
              </p>
              <p className="mb-2">
                <strong>📅 Time:</strong>{" "}
                {d.toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                })}{" "}
                <span style={{ marginLeft: "8px", marginRight: "4px" }}>
                  🕙
                </span>
                {d.toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </p>
              {event.location && (
                <p className="mb-2">
                  <strong>📍Location:</strong> {event.location}
                </p>
              )}

              {/* <p className="mb-2">
                <strong>Created:</strong>{" "}
                {event.createdAt?.toDate().toLocaleString("en-US")}
              </p> */}

              {/* 仅管理员可见的报名信息和导出按钮 */}
              {isAdmin && (
                <>
                  <p className="mt-2">
                    <strong>✍️ Registrations:</strong> {registrationCount}
                  </p>
                  <button
                    className="btn btn-outline-primary mt-2 me-2"
                    onClick={exportToExcel}
                  >
                    Export to Excel
                  </button>
                </>
              )}

              {/* 报名按钮，所有用户可见 */}
              <button
                className="btn btn-success mt-2"
                onClick={() => setShowJoinModal(true)}
              >
                Join Event
              </button>
              <button
                className="btn btn-secondary mt-2 ms-2"
                onClick={() => navigate(-1)}
              >
                ← Back to Events
              </button>
            </div>
          </div>

          {/* 弹窗组件 */}
          {showJoinModal && (
            <JoinEventModal
              event={event}
              onClose={() => setShowJoinModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
