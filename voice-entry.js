(function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const OPTION_CONFIG = [
    { key: "heartRate", label: "Add Heart Rate", hint: "Example: heart rate seventy two" },
    { key: "bloodPressure", label: "Add Blood Pressure", hint: "Example: one twenty over eighty" },
    { key: "sugar", label: "Add Sugar Level", hint: "Example: sugar one forty five" },
    { key: "temperature", label: "Add Temprature", hint: "Example: temperature ninety eight point six" },
    { key: "medicine", label: "Add Medicine with time and dosage", hint: "Example: Paracetamol 500 mg at 8 pm" },
    { key: "markTaken", label: "Mark medicine as taken", hint: "Example: mark paracetamol as taken" }
  ];

  const WORD_NUMBERS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100
  };

  function getRoleMeta() {
    const role = typeof getCurrentRole === "function" ? getCurrentRole() : null;
    return {
      role,
      isSenior: role === "senior"
    };
  }

  function parseNumberWords(input) {
    const normalized = input.toLowerCase().replace(/-/g, " ").trim();
    if (!normalized) return null;
    if (/\d/.test(normalized)) {
      const num = Number((normalized.match(/\d+(\.\d+)?/) || [])[0]);
      return Number.isFinite(num) ? num : null;
    }

    const tokens = normalized.split(/\s+/).filter(Boolean);
    if (
      tokens.length >= 2 &&
      ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"].includes(tokens[0]) &&
      ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"].includes(tokens[1])
    ) {
      const hundreds = WORD_NUMBERS[tokens[0]] * 100;
      const remainder = parseNumberWords(tokens.slice(1).join(" ")) || 0;
      return hundreds + remainder;
    }
    let total = 0;
    let current = 0;

    for (const token of tokens) {
      if (token === "and") continue;
      if (!(token in WORD_NUMBERS)) continue;
      const value = WORD_NUMBERS[token];
      if (value === 100) {
        current = (current || 1) * 100;
      } else {
        current += value;
      }
    }

    total += current;
    return total || null;
  }

  function extractBestNumber(text) {
    const direct = text.match(/\d+(\.\d+)?/);
    if (direct) return Number(direct[0]);

    const cleaned = text.toLowerCase().replace(/[^a-z\s]/g, " ");
    const groups = cleaned.split(/\s{2,}/).map((g) => g.trim()).filter(Boolean);
    const candidates = groups.length ? groups : [cleaned];
    for (const group of candidates) {
      const parsed = parseNumberWords(group);
      if (parsed !== null) return parsed;
    }
    return null;
  }

  function parseBloodPressure(text) {
    const normalized = text.toLowerCase();
    const bpPattern = /(.*?)(?:over|by|\/)(.*)/;
    const match = normalized.match(bpPattern);
    if (!match) return null;

    const systolic = extractBestNumber(match[1]);
    const diastolic = extractBestNumber(match[2]);
    if (!systolic || !diastolic) return null;

    return `${Math.round(systolic)}/${Math.round(diastolic)}`;
  }

  function parseTime(text) {
    const normalized = text.toLowerCase();
    const hhmm = normalized.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/);
    if (hhmm) {
      let hour = Number(hhmm[1]);
      const minute = Number(hhmm[2]);
      const meridian = hhmm[3];
      if (meridian === "pm" && hour < 12) hour += 12;
      if (meridian === "am" && hour === 12) hour = 0;
      if (hour <= 23 && minute <= 59) return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    const words = normalized.match(/(?:at\s+)?(\d{1,2})\s*(am|pm)/);
    if (words) {
      let hour = Number(words[1]);
      if (words[2] === "pm" && hour < 12) hour += 12;
      if (words[2] === "am" && hour === 12) hour = 0;
      return `${String(hour).padStart(2, "0")}:00`;
    }

    return null;
  }

  function cleanMedicineName(text) {
    return text
      .replace(/mark|medicine|as taken|taken|add|with|dosage|dose|at\s+\d{1,2}([:.]\d{2})?\s*(am|pm)?/gi, " ")
      .replace(/\d+\s*(mg|ml|tablet|tablets|pill|pills)/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseSpeech(optionKey, transcript) {
    const text = transcript.trim();
    if (!text) return { error: "I could not hear anything. Please try again." };

    if (optionKey === "heartRate") {
      const value = extractBestNumber(text);
      if (!value) return { error: "Could not detect heart rate value." };
      return { type: "vitals", payload: { hr: Math.round(value) }, summary: `Heart Rate: ${Math.round(value)} bpm` };
    }

    if (optionKey === "bloodPressure") {
      const bp = parseBloodPressure(text);
      if (!bp) return { error: "Could not detect blood pressure in format like 120 over 80." };
      return { type: "vitals", payload: { bp }, summary: `Blood Pressure: ${bp}` };
    }

    if (optionKey === "sugar") {
      const value = extractBestNumber(text);
      if (!value) return { error: "Could not detect sugar level." };
      return { type: "vitals", payload: { sl: Math.round(value) }, summary: `Sugar Level: ${Math.round(value)} mg/dl` };
    }

    if (optionKey === "temperature") {
      const value = extractBestNumber(text);
      if (!value) return { error: "Could not detect temperature." };
      return { type: "vitals", payload: { temp: Number(value.toFixed(1)) }, summary: `Temperature: ${Number(value.toFixed(1))} °C` };
    }

    if (optionKey === "medicine") {
      const dosageMatch = text.match(/(\d+\s*(?:mg|ml|tablet|tablets|pill|pills))/i);
      const dosage = dosageMatch ? dosageMatch[1] : "";
      const time = parseTime(text);
      const name = cleanMedicineName(text);
      if (!name || !time) {
        return { error: "Please include medicine name and time. Example: Paracetamol 500 mg at 8 pm." };
      }
      return {
        type: "medicine",
        payload: { name, dosage, time },
        summary: `Medicine: ${name}${dosage ? `, Dose: ${dosage}` : ""}, Time: ${time}`
      };
    }

    if (optionKey === "markTaken") {
      const name = cleanMedicineName(text);
      const time = parseTime(text);
      if (!name && !time) return { error: "Please say medicine name or time to mark as taken." };
      return {
        type: "markTaken",
        payload: { name: name || null, time },
        summary: `Mark as taken: ${name || "medicine at selected time"}${time ? ` (${time})` : ""}`
      };
    }

    return { error: "Unsupported action." };
  }

  function getLatestVitals() {
    const vitals = JSON.parse(localStorage.getItem("vitals") || "[]");
    if (!Array.isArray(vitals) || !vitals.length) return null;
    return vitals.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }

  function saveVoiceData(parsed) {
    const roleMeta = getRoleMeta();
    if (!roleMeta.isSenior) {
      return { ok: false, message: "Voice entry is available only in senior view." };
    }
    const enteredBy = undefined;

    if (parsed.type === "vitals") {
      const latest = getLatestVitals();
      const merged = {
        bp: parsed.payload.bp ?? latest?.bp,
        hr: parsed.payload.hr ?? latest?.hr,
        temp: parsed.payload.temp ?? latest?.temp,
        sl: parsed.payload.sl ?? latest?.sl
      };

      if (!merged.bp || merged.hr == null || merged.temp == null || merged.sl == null) {
        return { ok: false, message: "Could not complete full vitals record. Please use manual entry for missing fields." };
      }

      const vitals = JSON.parse(localStorage.getItem("vitals") || "[]");
      const newEntry = {
        bp: merged.bp,
        hr: Number(merged.hr),
        temp: Number(merged.temp),
        sl: Number(merged.sl),
        timestamp: new Date().toISOString(),
        enteredBy
      };
      vitals.push(newEntry);
      localStorage.setItem("vitals", JSON.stringify(vitals));
      window.dispatchEvent(new CustomEvent("health-data-updated", { detail: { type: "vitals" } }));
      return { ok: true, message: "Vitals saved successfully." };
    }

    if (parsed.type === "medicine") {
      const meds = JSON.parse(localStorage.getItem("medicines") || "[]");
      meds.push({
        id: Date.now(),
        name: parsed.payload.name,
        dosage: parsed.payload.dosage,
        time: parsed.payload.time,
        taken: false,
        notified: false,
        enteredBy
      });
      localStorage.setItem("medicines", JSON.stringify(meds));
      window.dispatchEvent(new CustomEvent("health-data-updated", { detail: { type: "medicines" } }));
      return { ok: true, message: "Medicine added successfully." };
    }

    if (parsed.type === "markTaken") {
      const meds = JSON.parse(localStorage.getItem("medicines") || "[]");
      const match = meds.find((med) => {
        const sameTime = parsed.payload.time ? med.time === parsed.payload.time : true;
        const sameName = parsed.payload.name
          ? med.name.toLowerCase().includes(parsed.payload.name.toLowerCase())
          : true;
        return sameTime && sameName;
      });

      if (!match) return { ok: false, message: "No matching medicine found to mark as taken." };
      match.taken = true;
      localStorage.setItem("medicines", JSON.stringify(meds));
      window.dispatchEvent(new CustomEvent("health-data-updated", { detail: { type: "medicines" } }));
      return { ok: true, message: "Medicine marked as taken." };
    }

    return { ok: false, message: "Unable to save data." };
  }

  function createVoiceUI(nav) {
    const voiceBtn = document.createElement("button");
    voiceBtn.type = "button";
    voiceBtn.className = "voice-fab";
    voiceBtn.setAttribute("aria-label", "Open voice data entry");
    voiceBtn.innerHTML = `<span class="voice-fab-icon">🎤</span><small>Voice</small>`;

    const insertBefore = nav.children[Math.ceil(nav.children.length / 2)] || null;
    nav.insertBefore(voiceBtn, insertBefore);

    const sheet = document.createElement("div");
    sheet.className = "voice-sheet hidden";
    sheet.innerHTML = `
      <div class="voice-sheet__backdrop" data-close="1"></div>
      <div class="voice-sheet__panel" role="dialog" aria-modal="true" aria-label="Voice data entry">
        <div class="voice-sheet__header">
          <h3>Voice Data Entry</h3>
          <button type="button" class="voice-close" aria-label="Close">✕</button>
        </div>
        <p class="voice-note">Voice input helps with data entry only. This app does not provide medical advice.</p>
        <div class="voice-options"></div>
        <p class="voice-hint" id="voiceStatus">Choose an option to start.</p>
        <div class="voice-confirm hidden" id="voiceConfirm"></div>
      </div>
    `;
    document.body.appendChild(sheet);

    return { voiceBtn, sheet };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".bottom-nav");
    if (!nav) return;

    const roleMeta = getRoleMeta();
    if (!roleMeta.isSenior) {
      return;
    }
    const { voiceBtn, sheet } = createVoiceUI(nav);
    const optionsContainer = sheet.querySelector(".voice-options");
    const statusNode = sheet.querySelector("#voiceStatus");
    const confirmNode = sheet.querySelector("#voiceConfirm");
    let recognition = null;
    let activeSilenceTimeout = null;

    function openSheet() {
      sheet.classList.remove("hidden");
      confirmNode.classList.add("hidden");
      confirmNode.innerHTML = "";
    }

    function closeSheet() {
      sheet.classList.add("hidden");
      if (recognition) recognition.abort();
      if (activeSilenceTimeout) {
        clearTimeout(activeSilenceTimeout);
        activeSilenceTimeout = null;
      }
      statusNode.textContent = "Choose an option to start.";
    }

    if (!SpeechRecognition) {
      voiceBtn.classList.add("disabled");
      voiceBtn.disabled = true;
      voiceBtn.title = "Voice input is not supported on this browser. Please use manual entry.";
      return;
    }

    OPTION_CONFIG.forEach((option) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "voice-option-card";
      card.innerHTML = `<strong>${option.label}</strong><small>${option.hint}</small>`;
      card.addEventListener("click", () => {
        confirmNode.classList.add("hidden");
        confirmNode.innerHTML = "";
        const beginRecognition = (attempt = 0) => {
          let finalTranscript = "";
          let endedWithError = false;

          recognition = new SpeechRecognition();
          recognition.lang = "en-US";
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          statusNode.textContent = "Listening…";
          if (activeSilenceTimeout) clearTimeout(activeSilenceTimeout);
          activeSilenceTimeout = setTimeout(() => {
            if (recognition) recognition.stop();
          }, 7000);

          recognition.onresult = (event) => {
            if (activeSilenceTimeout) {
              clearTimeout(activeSilenceTimeout);
              activeSilenceTimeout = null;
            }
            statusNode.textContent = "Processing…";
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const fragment = event.results[i][0].transcript || "";
              if (event.results[i].isFinal) {
                finalTranscript += ` ${fragment}`;
              }
            }
          };

          recognition.onerror = (event) => {
            endedWithError = true;
            if (activeSilenceTimeout) {
              clearTimeout(activeSilenceTimeout);
              activeSilenceTimeout = null;
            }
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              statusNode.textContent = "Microphone permission was denied. Please continue using manual entry.";
              return;
            }
            if (attempt < 1) {
              statusNode.textContent = "I could not hear clearly. Trying once more…";
              setTimeout(() => beginRecognition(attempt + 1), 400);
              return;
            }
            statusNode.textContent = "Could not capture voice. Please try again.";
          };

          recognition.onend = () => {
            const transcript = finalTranscript.trim();
            recognition = null;
            if (endedWithError) return;
            if (!transcript) {
              if (attempt < 1) {
                statusNode.textContent = "No speech detected. Please speak again.";
                setTimeout(() => beginRecognition(attempt + 1), 400);
              } else {
                statusNode.textContent = "No speech detected. Please try again.";
              }
              return;
            }

          const parsed = parseSpeech(option.key, transcript);
          if (parsed.error) {
            statusNode.textContent = parsed.error;
            return;
          }

          statusNode.textContent = `Heard: "${transcript}"`;
          confirmNode.classList.remove("hidden");
          confirmNode.innerHTML = `
            <p>You are about to save:</p>
            <div class="voice-preview">${parsed.summary}</div>
            <p>Do you want to continue?</p>
            <div class="voice-actions">
              <button type="button" class="confirm-btn">Confirm</button>
              <button type="button" class="cancel-btn">Cancel</button>
            </div>
          `;

          confirmNode.querySelector(".confirm-btn").addEventListener("click", () => {
            const response = saveVoiceData(parsed);
            statusNode.textContent = response.message;
            confirmNode.classList.add("hidden");
            confirmNode.innerHTML = "";
          });

          confirmNode.querySelector(".cancel-btn").addEventListener("click", () => {
            confirmNode.classList.add("hidden");
            confirmNode.innerHTML = "";
            statusNode.textContent = "Entry cancelled. No data saved.";
          });
          };

          recognition.start();
        };

        beginRecognition();
      });
      optionsContainer.appendChild(card);
    });

    voiceBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openSheet();
    });

    const closeButton = sheet.querySelector(".voice-close");
    const backdrop = sheet.querySelector(".voice-sheet__backdrop");
    closeButton.addEventListener("click", closeSheet);
    backdrop.addEventListener("click", closeSheet);
  });
})();
