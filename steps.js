document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.getAttribute('data-page');

    if (currentPage === 'steps') {
        let currentSteps = parseInt(localStorage.getItem('stepsToday')) || 0;
        let stepGoal = parseInt(localStorage.getItem('stepGoal')) || 5000;
        
        // Variables for step detection
        let lastAcceleration = { x: 0, y: 0, z: 0 };
        let movementThreshold = 1.5; // Adjust as needed
        let stepDetected = false;

        // Function to request motion sensor permissions (for iOS 13+)
        function requestMotionPermission() {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('devicemotion', handleDeviceMotion);
                        } else {
                            alert("Motion sensor access denied. Pedometer will not work.");
                        }
                    })
                    .catch(console.error);
            } else {
                // Handle non-iOS 13+ devices
                window.addEventListener('devicemotion', handleDeviceMotion);
            }
        }

        // Function to handle accelerometer data
        function handleDeviceMotion(event) {
            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;

            // Calculate the magnitude of change in acceleration (basic logic)
            const deltaX = acceleration.x - lastAcceleration.x;
            const deltaY = acceleration.y - lastAcceleration.y;
            const deltaZ = acceleration.z - lastAcceleration.z;
            const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

            // Detect a step
            if (movement > movementThreshold && !stepDetected) {
                currentSteps++;
                localStorage.setItem('stepsToday', currentSteps);
                updateStepUI();
                stepDetected = true;
                // Set a small timeout to avoid counting multiple steps for one movement
                setTimeout(() => {
                    stepDetected = false;
                }, 300); // 300ms debounce
            }
            
            lastAcceleration = acceleration;
        }

        // Request permission and start listening for motion
        requestMotionPermission();

        // UI update function (remains mostly the same)
        function updateStepUI() {
            const progress = Math.min((currentSteps / stepGoal) * 100, 100);
            document.getElementById('todaySteps').textContent = currentSteps.toLocaleString();
            document.getElementById('goalText').textContent = `${stepGoal.toLocaleString()} steps`;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `${Math.round(progress)}% of daily goal`;
            const status = document.getElementById('goalStatus');
            if (progress >= 100) {
                status.textContent = "🎉 Goal Achieved!";
            } else {
                status.textContent = "";
            }
        }

        // Goal editing functions (remains the same)
        window.editGoal = () => {
            document.getElementById('goalEdit').classList.toggle('hidden');
            document.getElementById('newGoal').value = stepGoal;
        };

        window.saveGoal = () => {
            const newVal = document.getElementById('newGoal').value;
            if (newVal >= 1000) {
                stepGoal = parseInt(newVal);
                localStorage.setItem('stepGoal', stepGoal);
                updateStepUI();
                document.getElementById('goalEdit').classList.add('hidden');
            } else {
                alert("Please enter a goal of at least 1,000 steps.");
            }
        };

        // Initialize UI on load
        updateStepUI();
    } 
    // ... (dashboard logic remains the same)
    if (currentPage === 'dashboard') {
        const stepsToday = localStorage.getItem('stepsToday') || "0";
        const stepGoal = localStorage.getItem('stepGoal') || "5000";
        if (document.getElementById('stepsToday')) {
            document.getElementById('stepsToday').textContent = parseInt(stepsToday).toLocaleString();
        }
        if (document.getElementById('stepGoal')) {
            document.getElementById('stepGoal').textContent = parseInt(stepGoal).toLocaleString();
        }
    }
});
async function registerPeriodicSync() {
  const registration = await navigator.serviceWorker.ready;
  try {
    // Attempt to register a sync every 1 hour (minInterval is in ms)
    await registration.periodicSync.register('get-latest-steps', {
      minInterval: 60 * 60 * 1000, 
    });
  } catch (err) {
    console.error("Periodic Sync could not be registered:", err);
  }
}

// Call this after a user interaction
document.body.addEventListener('click', registerPeriodicSync, { once: true });
