import { useState } from "react";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import emailjs from "emailjs-com";
import { db } from "../../firebase";

const JoinEventModal = ({ event, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const registrationRef = collection(
        db,
        "events",
        event.id,
        "registrations"
      );
      await addDoc(registrationRef, {
        name,
        email,
        phone,
        address,
        numAttendees: parseInt(numPeople),
        joinedAt: serverTimestamp(),
      });
      //发送邮件通知
      await emailjs.send(
        "service_swvqo0t",
        "template_xrjxrpr",
        {
          to_name: name,
          to_email: email,
          event_name: event.title,
        },
        "t9peBhLNspzIqGEOZ"
      );
      alert("🎉 Registration successful! Confirmation email sent.");
      onClose(); // 关闭弹窗
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Something went wrong. Please try again");
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <h5 className="mb-3">Join: {event.title}</h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="tel"
                className="form-control"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="number"
                className="form-control"
                placeholder="Number of Attendees"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Home Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default JoinEventModal;
