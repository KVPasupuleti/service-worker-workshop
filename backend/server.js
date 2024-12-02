const express = require("express");
const webPush = require("web-push");
const cors = require("cors");
const bodyParser = require("body-parser");
const vapidKeys = require("./data/vapidKeys.json");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// VAPID keys configuration
webPush.setVapidDetails(
  "mailto:example@yourdomain.com",
  vapidKeys.publicVapidKey,
  vapidKeys.privateVapidKey
);

// Path to your subscription file
const subscriptionsFilePath = path.join(
  __dirname,
  "data",
  "subscriptions.json"
);

// Function to get all stored subscriptions
const getSubscriptions = () => {
  try {
    const data = fs.readFileSync(subscriptionsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if no subscriptions exist or error occurs
  }
};

// Function to save subscriptions to the file
const saveSubscriptions = (subscriptions) => {
  fs.writeFileSync(
    subscriptionsFilePath,
    JSON.stringify(subscriptions),
    "utf8"
  );
};

// Endpoint to get the public VAPID key
app.get("/api/get-vapid-key", (req, res) => {
  res.send(vapidKeys.publicVapidKey);
});

// Endpoint to handle subscription
app.post("/subscribe", (req, res) => {
  const subscription = req.body.subscription;

  console.log("Subsc", subscription);

  // Get the current list of subscriptions
  const subscriptions = getSubscriptions();

  // Add the new subscription to the array
  subscriptions.push(subscription);

  // Save the updated subscriptions array to the file
  saveSubscriptions(subscriptions);

  const payload = JSON.stringify({
    title: "Thanks for subscribing",
    body: "Now you'll receive all awesome updates from us!"
  });

  webPush
    .sendNotification(subscription, payload)
    .then(() => res.status(200).send("Subscription success!"))
    .catch((error) => {
      console.error("[Error Subscribing]:", error);
      res.status(500).send("Failed to subscribe.");
    });
});

// API endpoint to send push notifications
app.post("/send-notification", (req, res) => {
  const payload = req.body.payload;

  // Get all subscriptions
  const subscriptions = getSubscriptions();

  // Send the push notification to each subscription
  const pushPromises = subscriptions.map((subscription) => {
    return webPush
      .sendNotification(subscription, JSON.stringify(payload))
      .catch((error) => {
        console.error("Error sending notification:", error);
      });
  });

  // Wait for all notifications to be sent
  Promise.all(pushPromises)
    .then(() => {
      res.status(200).json({ message: "Notifications sent successfully." });
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to send notifications." });
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
});
