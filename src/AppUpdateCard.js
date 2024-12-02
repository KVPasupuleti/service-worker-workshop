const AppUpdateCard = (props) => {
  const { handleUpdate } = props;
  return (
    <div
      style={{
        position: "fixed",
        left: "calc(50% - 150px)",
        top: 0,
        width: "300px",
        background: "yellow",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        height: "150px"
      }}
    >
      <p>A new version is available</p>
      <button onClick={handleUpdate}>Update Now</button>
    </div>
  );
};

export default AppUpdateCard;
