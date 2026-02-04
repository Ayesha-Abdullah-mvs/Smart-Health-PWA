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

function getCurrentRole() {
    return getSession()?.role || null;
}

function canEditMedsVitals() {
    const role = getCurrentRole();
    return role === 'senior' || role === 'family';
}

function canEditSteps() {
    const role = getCurrentRole();
    return role === 'senior';
}

function isFamilyRole() {
    return getCurrentRole() === 'family';
}

function ensureFamilyBannerStyles() {
    if (document.getElementById('family-banner-style')) return;
    const style = document.createElement('style');
    style.id = 'family-banner-style';
    style.textContent = `
        .family-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 12px 16px;
            padding: 10px 12px;
            background: #eef6ff;
            color: #1b4b7a;
            border-left: 4px solid #2b6cb0;
            border-radius: 8px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }
        .family-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px 8px;
            background: #2b6cb0;
            color: #fff;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 800;
        }
        .locked-entry {
            opacity: 0.75;
        }
        .lock-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 999px;
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
        }
        .action-button {
            border: 2px solid #000;
            background: #fff7ed;
            color: #000;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

function renderFamilyBanner() {
    if (!isFamilyRole()) return;
    if (document.querySelector('.family-banner')) return;
    ensureFamilyBannerStyles();

    const banner = document.createElement('div');
    banner.className = 'family-banner';
    banner.innerHTML = `
        <span class="family-badge">👥</span>
        <span>Family Member View – Assisted Data Entry</span>
    `;

    const nav = document.querySelector('nav');
    if (nav && nav.parentElement) {
        nav.insertAdjacentElement('afterend', banner);
    } else {
        document.body.prepend(banner);
    }
}

document.addEventListener('DOMContentLoaded', renderFamilyBanner);

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
