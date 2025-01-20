import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://service-worker-workshop.onrender.com" // Replace with your actual backend URL
    : "http://localhost:5000";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);

        registration.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            // Request push subscription
            registration.pushManager
              .subscribe({
                userVisibleOnly: true,
                applicationServerKey:
                  "BMG8cdHc7615Zon132Ayc53oMKznCzacWNS8BPB_EzKbwSWPhxPFGxW668dhGSwwypVjhVVGaVh1dDrbK51t_hQ" // Replace with VAPID public key
              })
              .then(function (subscription) {
                console.log("subscription", subscription);
                // Send the subscription object to the backend
                fetch(`${BACKEND_URL}/subscribe`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ subscription })
                })
                  .then((response) => {
                    console.log("Response", response);
                    return response.json();
                  })
                  .then((data) => {
                    console.log("Subscription saved:", data);
                  })
                  .catch((error) =>
                    console.error("Error saving subscription:", error)
                  );
              })
              .catch(function (error) {
                console.error(
                  "Failed to subscribe to push notifications:",
                  error
                );
              });
          }
        });
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
