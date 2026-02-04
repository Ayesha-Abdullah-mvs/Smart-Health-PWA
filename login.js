document.addEventListener('DOMContentLoaded', () => {
    const roleSelect = document.getElementById('role');
    const passwordContainer = document.getElementById('passwordContainer');
    const passwordInput = document.getElementById('password');
    const doctorCodeContainer = document.getElementById('doctorCodeContainer');
    const doctorCodeInput = document.getElementById('doctorCode');
    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('errorBox');

    // Handle Role Change to show/hide password
    roleSelect.addEventListener('change', (e) => {
        if (e.target.value === 'senior') {
            passwordContainer.classList.add('hidden');
            passwordInput.required = false;
        } else {
            passwordContainer.classList.remove('hidden');
            passwordInput.required = true;
            doctorCodeContainer.classList.add('hidden');
            doctorCodeInput.required = false;
        } else {
            passwordContainer.classList.remove('hidden');
            passwordInput.required = true;
            if (e.target.value === 'doctor') {
                doctorCodeContainer.classList.remove('hidden');
                doctorCodeInput.required = true;
            } else {
                doctorCodeContainer.classList.add('hidden');
                doctorCodeInput.required = false;
            }
        }
    });

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorBox.classList.add('hidden');

        const seniorId = document.getElementById('seniorId').value.toUpperCase();
        const role = roleSelect.value;
        const password = passwordInput.value;

        const result = validateCredentials(seniorId, role, password);
        const doctorCode = doctorCodeInput.value;
        const password = passwordInput.value;

        const result = validateCredentials(seniorId, role, password, doctorCode);

        if (result.valid) {
            setSession({ seniorId, role });
            window.location.href = 'dashboard.html';
        } else {
            errorBox.textContent = result.error || 'Login failed';
            errorBox.classList.remove('hidden');
        }
    });
});
