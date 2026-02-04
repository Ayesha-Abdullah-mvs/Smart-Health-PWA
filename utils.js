// --- Storage Logic ---
function createSenior(data) {
    const seniorId = 'SC-' + Math.floor(100000 + Math.random() * 900000);
    const familyPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const doctorPassword = Math.floor(100000 + Math.random() * 900000).toString();

    const seniorData = {
        ...data,
        familyPassword,
        doctorPassword,
    };

    localStorage.setItem(seniorId, JSON.stringify(seniorData));
    return { seniorId, familyPassword, doctorPassword };
}

function getSeniorData(seniorId) {
    const dataStr = localStorage.getItem(seniorId);
    if (!dataStr) return null;
    return JSON.parse(dataStr);
}

function updateSeniorData(seniorId, updates) {
    const existing = getSeniorData(seniorId);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    localStorage.setItem(seniorId, JSON.stringify(updated));
}

// --- Auth Logic ---
function getSession() {
    const sessionStr = localStorage.getItem('seniorcare_session');
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
}

function setSession(session) {
    localStorage.setItem('seniorcare_session', JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem('seniorcare_session');
}

function requireAuth() {
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
    }
}

function canEdit() {
    const session = getSession();
    return session?.role === 'senior';
}

function validateCredentials(seniorId, role, password) {
    const data = getSeniorData(seniorId);
    if (!data) {
        return { valid: false, error: 'Invalid Senior ID' };
    }

    if (role === 'senior') {
        return { valid: true };
    }

    if (role === 'family') {
        if (data.familyPassword === password) return { valid: true };
        return { valid: false, error: 'Invalid Family Password' };
    }

    if (role === 'doctor') {
        if (data.doctorPassword === password) return { valid: true };
        return { valid: false, error: 'Invalid Doctor Password' };
    }

    return { valid: false, error: 'Invalid role' };
}
