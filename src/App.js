import "./App.css";
import { useState, useEffect } from "react";
import AppUpdateCard from "./AppUpdateCard";
import { BACKEND_URL } from ".";

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationDescription, setNotificationDescription] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SW_UPDATED") {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
      window.location.reload(); // Reload to load the updated files
    }
  };

  const onClickSend = () => {
    fetch(`${BACKEND_URL}/send-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payload: { title: notificationTitle, body: notificationDescription }
      })
    });
  };

  return (
    <div className="App">
      {updateAvailable && <AppUpdateCard handleUpdate={handleUpdate} />}
      <header className="App-header">
        <h1>Service Worker Push Notification Test</h1>
        <div className="input-area">
          <h3>Test Notification</h3>
          <input
            value={notificationTitle}
            onChange={(e) => {
              setNotificationTitle(e.target.value);
            }}
            placeholder="Enter Title"
          />
          <input
            value={notificationDescription}
            onChange={(e) => {
              setNotificationDescription(e.target.value);
            }}
            placeholder="Enter Description"
          />

          <button className="send-notification-button" onClick={onClickSend}>
            Send
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
