document.addEventListener("DOMContentLoaded", () => {
    // ... (Keep your existing UI element selectors and circumference logic)

    let stepsToday = parseInt(localStorage.getItem("stepsToday")) || 0;
    let stepGoal = parseInt(localStorage.getItem("stepGoal")) || 5000;

    // STEP DETECTION VARIABLES
    let lastMag = 0;
    const threshold = 12; // Sensitivity: adjust based on testing (usually 10-14)
    let isStepBelowThreshold = true;

    // 1. START AUTOMATIC TRACKING
    async function startPedometer() {
        if ('LinearAccelerationSensor' in window) {
            try {
                // Request permission
                const permissions = await Promise.all([
                    navigator.permissions.query({ name: "accelerometer" })
                ]);

                if (permissions[0].state === "denied") {
                    alert("Step tracking requires accelerometer access.");
                    return;
                }

                const sensor = new LinearAccelerationSensor({ frequency: 60 });
                
                sensor.addEventListener('reading', () => {
                    // Calculate Magnitude: sqrt(x^2 + y^2 + z^2)
                    const mag = Math.sqrt(sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2);

                    // Peak detection logic
                    if (mag > threshold && isStepBelowThreshold) {
                        stepsToday++;
                        saveAndSync();
                        isStepBelowThreshold = false;
                    }
                    if (mag < threshold - 2) {
                        isStepBelowThreshold = true;
                    }
                });

                sensor.start();
                keepAppAlive(); // Attempt to keep tracking in background
            } catch (err) {
                console.error("Sensor error:", err);
                fallbackToMotionEvents();
            }
        } else {
            fallbackToMotionEvents();
        }
    }

    // 2. FALLBACK FOR OLDER BROWSERS (DeviceMotionEvent)
    function fallbackToMotionEvents() {
        window.addEventListener('devicemotion', (event) => {
            const acc = event.acceleration;
            if (!acc) return;
            const mag = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
            
            if (mag > threshold && isStepBelowThreshold) {
                stepsToday++;
                saveAndSync();
                isStepBelowThreshold = false;
            }
            if (mag < threshold - 2) {
                isStepBelowThreshold = true;
            }
        });
    }

    // 3. BACKGROUND PERSISTENCE (Wake Lock)
    async function keepAppAlive() {
        if ('wakeLock' in navigator) {
            try {
                await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log("Wake Lock failed. Background tracking may be limited.");
            }
        }
    }

    function saveAndSync() {
        localStorage.setItem("stepsToday", stepsToday);
        updateUI();
    }

    // Initialize
    startPedometer();
    updateUI();
});
