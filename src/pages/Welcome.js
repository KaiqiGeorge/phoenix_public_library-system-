function Welcome({ firstName }) {
  return (
    <div>
      <h5 className="mb-1"> 👋 Howdy, {firstName}! </h5>
      <p>You have successfully logged in.</p>
    </div>
  );
}

export default Welcome;
