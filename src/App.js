import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import AppUpdateCard from "./AppUpdateCard";

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

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

  return (
    <div className="App">
      {updateAvailable && <AppUpdateCard handleUpdate={handleUpdate} />}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <span className="App-link">Hello, I am V6</span>
      </header>
    </div>
  );
}

export default App;
