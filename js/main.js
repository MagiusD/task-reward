document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const userIdInput = document.getElementById('userIdInput');
    const messageElement = document.getElementById('message');

    loginButton.addEventListener('click', handleLogin);
    userIdInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    });

    async function handleLogin() {
        const userId = userIdInput.value.trim();
        if (!userId) {
            messageElement.textContent = '請輸入代碼！';
            messageElement.className = 'message error';
            return;
        }

        messageElement.textContent = '登入中...';
        messageElement.className = 'message info';
        loginButton.disabled = true;

        try {
            const data = await callApi('login', { userId });
            sessionStorage.setItem('userData', JSON.stringify(data));
            
            if (data.role === 'parent') {
                window.location.href = 'parent.html';
            } else {
                window.location.href = 'child.html';
            }
        } catch (error) {
            messageElement.textContent = error.message;
            messageElement.className = 'message error';
            loginButton.disabled = false;
        }
    }
});