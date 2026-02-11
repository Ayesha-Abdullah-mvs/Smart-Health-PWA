const CACHE_NAME = "smart-health-v1";

const ASSETS = [
  "index.html",
  "dashboard.html",
  "medications.html",
  "reports.html",
  "login.html",
  "pedometer.html",
  "vitals.html",
  "voice.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "styles.css",
  "app.js",
  "script.js",
  "login.js",
  "dashboard.js",
  "steps.js",
  "vitals.js",
  "medications.js",
  "bottom-nav.js",
  "voice.js",
  "voice.css",
  "medications.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-steps') {
    event.waitUntil(fetchAndStoreSteps());
  }
});

async function fetchAndStoreSteps() {
  // 1. In a real-world app, you would fetch data from a
  // fitness API here (e.g., Google Fit REST API).
  // 2. Update IndexedDB or local storage with the new count.
  console.log("Syncing steps in the background...");
}
self.addEventListener("notificationclick", event => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  const medicationUrl = `/medications.html${data.medicineId ? `?med=${encodeURIComponent(data.medicineId)}` : ""}`;

  event.waitUntil((async () => {
    notification.close();

    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

    if (action === "taken") {
      allClients.forEach(client => {
        client.postMessage({ type: "MARK_MED_TAKEN", medicineId: data.medicineId });
      });

      if (allClients.length > 0) {
        await allClients[0].focus();
      } else {
        await clients.openWindow(medicationUrl);
      }
      return;
    }

    if (action === "snooze") {
      const title = data.medicineName
        ? `Time to take: ${data.medicineName}`
        : "Medication Reminder";
      const body = data.medicineName && data.dosage
        ? `Dose: ${data.dosage}\nSchedule: ${data.time}\nTap to mark as taken.`
        : "It’s time to take your scheduled medicine.";

      await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
      await self.registration.showNotification(title, {
        body,
        icon: "icon-192.png",
        tag: `medication-${data.medicineId || "reminder"}`,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
          { action: "taken", title: "Mark as Taken" },
          { action: "snooze", title: "Remind in 10 min" }
        ],
        data
      });
      return;
    }

    const existingClient = allClients.find(client => "focus" in client);
    if (existingClient) {
      await existingClient.focus();
      existingClient.postMessage({ type: "OPEN_MEDICATION_PAGE", url: medicationUrl });
      return;
    }
    await clients.openWindow(medicationUrl);
  })());
});
