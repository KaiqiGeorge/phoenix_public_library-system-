import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";
//import { parseDateToNoon } from "./formateDate"; // 工具函数：将日期字符串转为中午12点，防止时区偏移
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase"; // 确保在顶部引入了 storage
import { getAuth, onAuthStateChanged } from "firebase/auth";
import EventDetail from "./EventDetail";
function EventManager() {
  // 状态定义区
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editingId, setEditingId] = useState(null); // 当前正在编辑的活动ID
  const [lastDoc, setLastDoc] = useState(null); // 当前页的最后一个文档
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据可加载
  const [pageCursors, setPageCursors] = useState([]); // 游标栈：记录每一页的起点
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false); // 控制弹窗显示

  const PAGE_SIZE = 5; // 每页活动数量限制
  const eventsRef = collection(db, "events"); // 获取 Firestore 的 events 集合引用

  // 加载活动（分页模式）
  // 全新分页函数：支持上一页 / 下一页 / 重置
  // 全新版 loadEvents 函数：支持
  // 1.下一页/上一页/重置分页
  // 2.精确分类：Upcoming / Today / Ended
  // 3. Ended 按时间倒序，Upcoming 过了 6 个月不显示

  const loadEvents = async (cursor = null, direction = "next") => {
    setIsLoading(true);

    try {
      let q;

      // 构建查询：分页 + 按日期降序
      if (direction === "next" && cursor) {
        q = query(
          eventsRef,
          orderBy("date", "desc"),
          startAfter(cursor),
          limit(PAGE_SIZE)
        );
      } else if (direction === "prev" && cursor) {
        q = query(
          eventsRef,
          orderBy("date", "desc"),
          startAfter(cursor),
          limit(PAGE_SIZE)
        );
      } else {
        q = query(eventsRef, orderBy("date", "desc"), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      const rawDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 分类：Upcoming / Today / Ended
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      const upcoming = [],
        todayEvents = [],
        ended = [];

      rawDocs.forEach((event) => {
        const eventDate = event.date.toDate();
        const eventDay = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        );

        if (eventDay.getTime() > today.getTime() && eventDay < sixMonthsLater) {
          upcoming.push(event);
        } else if (eventDay.getTime() === today.getTime()) {
          todayEvents.push(event);
        } else {
          ended.push(event);
        }
      });

      // 每组内排序：Upcoming & Today 升序，Ended 倒序
      upcoming.sort((a, b) => a.date.toDate() - b.date.toDate());
      todayEvents.sort((a, b) => a.date.toDate() - b.date.toDate());
      ended.sort((a, b) => b.date.toDate() - a.date.toDate());

      // 合并结果：Upcoming > Today > Ended
      const sortedDocs = [...todayEvents,...upcoming, ...ended];
      setEvents(sortedDocs);

      // 只有有文档时才设置分页清单
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      // 更新分页状态
      if (direction === "next") {
        setPageCursors((prev) => [...prev, cursor]);
        setCurrentPage((prev) => prev + 1);
      } else if (direction === "prev") {
        setPageCursors((prev) => prev.slice(0, -1));
        setCurrentPage((prev) => prev - 1);
      } else if (direction === "reset") {
        setPageCursors([]);
        setCurrentPage(1);
      }

      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading events:", error);
      alert("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  };

  // 页面初始加载第一页
  useEffect(() => {
    loadEvents(null, "reset"); // 加载第一页
  }, []);
  //判断是否是管理员
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin); // 若有 admin 自定义声明
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe(); // 清除监听器
  }, []);

  // 添加活动
  const handleAdd = async () => {
    if (!title || !date || !location) {
      alert("Please enter title, date, and location.");
      return;
    }

    try {
      let imageUrl = "";

      // 如果选择了图片，先上传到 Firebase Storage
      if (imageFile) {
        const imageRef = ref(
          storage,
          `eventImages/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef); // 获取图片 URL
      }
      // 合并日期和时间
      const combinedDateTime = new Date(`${date}T${time || "12:00"}`);
      // 写入 Firestore 的活动数据
      await addDoc(eventsRef, {
        title,
        description,
        date: combinedDateTime,
        location,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      // 清空表单
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setImageFile(null);

      await loadEvents(null, "reset"); // 添加后刷新第一页
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Failed to add event.");
    }
  };

  // 删除活动
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "events", id));
    await loadEvents(null, "reset"); // 删除后刷新第一页
  };

  // 保存编辑后的活动
  const handleSave = async (id) => {
    const eventRef = doc(db, "events", id);
    const combinedDateTime = new Date(`${editDate}T${editTime || "12:00"}`);
    await updateDoc(eventRef, {
      title: editTitle,
      description: editDescription,
      location: editLocation,
      date: combinedDateTime,
    });
    console.log("Saving:", {
      editTitle,
      editDescription,
      editDate,
      editTime,
      editLocation,
    });

    setEditingId(null); // 退出编辑状态
    await loadEvents(null, "reset"); // 更新后刷新第一页
  };

  // 添加下一页和上一页的函数
  const loadNextPage = () => {
    loadEvents(lastDoc, "next");
  };

  const loadPreviousPage = () => {
    const prevCursor = pageCursors[pageCursors.length - 2]; // 上一页的起点
    loadEvents(prevCursor || null, "prev");
  };

  // 判断活动状态（已结束 / 今天进行 / 即将开始）
  // 根据活动日期，返回带颜色的 badge 状态标签
  function renderEventStatusBadge(eventDate) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    let text = "";
    let bgColor = "";
    let emoji = "";

    if (eventDay.getTime() < today.getTime()) {
      text = "Ended";
      bgColor = "#9e9e9e"; // 灰色
      emoji = "✅";
    } else if (eventDay.getTime() === today.getTime()) {
      text = "Today";
      bgColor = "#ff9800"; // 橙色
      emoji = "🟢";
    } else {
      text = "Upcoming";
      bgColor = "#4caf50"; // 绿色
      emoji = "⏳";
    }
    //统一时间格式的函数
    const getWeekday = (date) => {
      return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });
    };

    const getDay = (date) => {
      return new Date(date.seconds * 1000).getDate();
    };

    const formatDateTime = (date) => {
      return new Date(date.seconds * 1000).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    };

    return (
      <span
        style={{
          backgroundColor: bgColor,
          color: "white",
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          marginLeft: "8px",
        }}
      >
        {emoji} {text}
      </span>
    );
  }

  // 页面渲染
  return (
    <div className="container mt-4">
      {/* 添加活动表单按钮 */}
      {isAdmin && (
        <div className="d-flex justify-content-end mb-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Event
          </button>
        </div>
      )}

      {/* 卡片式活动列表 */}
      <div>
        {events.map((event) => {
          const d = event.date.toDate();
          const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
          const day = d.getDate();

          return (
            <div key={event.id} className="border-0 mb-4 shadow-sm ">
              <div className="row g-0">
                {/* 日期块 */}
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-center bg-light">
                  <div className="text-uppercase">{weekday}</div>
                  <div className="display-6">{day}</div>
                </div>

                {/* 主要内容块 */}
                <div className="col-md-7 p-3">
                  {editingId === event.id ? (
                    <>
                      {/* 编辑模式的输入框 */}
                      <input
                        className="form-control mb-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <input
                        className="form-control mb-2"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <input
                        className="form-control mb-2"
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                      <input
                        type="time"
                        className="form-control mb-2"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                      />

                      <input
                        className="form-control mb-2"
                        placeholder="Location"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                      />
                      <div className="d-flex">
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleSave(event.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 非编辑模式 */}
                      <h5 className="mb-4">
                        <span style={{ fontSize: "30px" }}>{event.title} </span>
                        {renderEventStatusBadge(event.date.toDate())}
                      </h5>
                      <p className="mb-1">
                        <strong>📅 Time:</strong>{" "}
                        {d
                          .toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace("at", `${"\u00A0".repeat(2)}🕙 `)}
                      </p>
                      {event.location && (
                        <p className="mb-1">
                          <strong>📍Location:</strong> {event.location}
                        </p>
                      )}
                      <p className="text-muted">
                        {event.description?.slice(0, 100)}...
                      </p>
                      <button
                        className="btn btn-primary p-1 ps-2 pe-2"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View Details
                      </button>
                      {isAdmin && (
                        <div className="mt-2 d-flex">
                          <button
                            className="btn btn-outline-success btn-sm me-2"
                            onClick={() => {
                              setEditingId(event.id);
                              setEditTitle(event.title);
                              setEditDescription(event.description || "");
                              setEditDate(
                                event.date.toDate().toISOString().split("T")[0]
                              );
                              setEditTime(
                                event.date.toDate().toTimeString().slice(0, 5)
                              );
                              setEditLocation(event.location || "");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 封面图 */}
                {event.imageUrl && (
                  <div className="col-md-3">
                    <img
                      src={event.imageUrl}
                      alt="cover"
                      className="img-fluid h-100"
                      style={{
                        objectFit: "cover",
                        borderTopRightRadius: "0.375rem",
                        borderBottomRightRadius: "0.375rem",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* 添加活动按钮表单 */}
        {showModal && (
          <div
            className="modal show fade d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Event</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    className="form-control mb-2"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <input
                    className="form-control mb-2"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <input
                    className="form-control mb-2"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <input
                    className="form-control mb-2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAdd}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 分页按钮 */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          onClick={loadPreviousPage}
          disabled={currentPage <= 1 || isLoading}
        >
          Prev
        </button>
        <span className="align-self-center">Page {currentPage}</span>
        <button
          className="btn btn-outline-secondary"
          onClick={loadNextPage}
          disabled={!hasMore || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default EventManager;
