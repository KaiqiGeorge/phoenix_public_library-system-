import MemberManager from "./components/MemberManager";

function Members(){
    return(
        <div>
        <div className="event-hero">
        <div className="overlay">
          <h2 className="display-4 fw-bold text-black">Members</h2>
          <p className="lead text-black">
            Let's connect with each other.
          </p>
        </div>
      </div>
        <div>
            <MemberManager />
        </div>
        </div>
    );
}
export default Members;