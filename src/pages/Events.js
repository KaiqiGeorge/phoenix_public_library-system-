import EventManager from "./components/EventManager";

function Events(){
    return(
           <div>
      {/* 顶部横幅区域 */}
      <div className="event-hero">
        <div className="overlay">
          <h2 className="display-4 fw-bold text-black">Events</h2>
          <p className="lead text-black">
            Get the latest information on upcoming events at phoenix public libraries.
          </p>
        </div>
      </div>

      {/* 管理区域 */}
      <div className="container mt-4">
        <EventManager />
      </div>
    </div>
    );
}

export default Events;