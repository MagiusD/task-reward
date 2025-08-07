document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData || userData.role !== 'parent') {
        window.location.href = 'index.html';
        return;
    }

    const welcomeMessage = document.getElementById('welcomeMessage');
    const dashboard = document.getElementById('parent-dashboard');
    const logoutButton = document.getElementById('logoutButton');

    welcomeMessage.textContent = `歡迎，${userData.userName}！`;
    logoutButton.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    loadDashboard();

    async function loadDashboard() {
        dashboard.innerHTML = '<div class="loader">正在載入資料...</div>';
        try {
            const { tasks, children } = await callApi('getParentData');
            renderDashboard(tasks, children);
        } catch (error) {
            dashboard.innerHTML = `<p class="message error">載入失敗: ${error.message}</p>`;
        }
    }

    function renderDashboard(tasks, children) {
        dashboard.innerHTML = '';
        children.forEach(child => {
            const childSection = document.createElement('section');
            childSection.className = 'child-section card';
            childSection.innerHTML = `<h3>${child.UserName} 的任務</h3>`;
            
            const taskList = document.createElement('ul');
            taskList.className = 'task-list';

            tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${task.TaskName} (+${task.MedalValue} 獎章)</span>
                    <button class="task-button" data-user-id="${child.UserID}" data-task-id="${task.TaskID}">完成一次</button>
                `;
                taskList.appendChild(li);
            });
            
            childSection.appendChild(taskList);
            dashboard.appendChild(childSection);
        });

        document.querySelectorAll('.task-button').forEach(button => {
            button.addEventListener('click', handleCompleteTask);
        });
    }

    async function handleCompleteTask(event) {
        const button = event.target;
        const { userId, taskId } = button.dataset;
        
        button.disabled = true;
        button.textContent = '處理中...';

        try {
            const result = await callApi('completeTask', { userId, taskId });
            showToast(result.message, 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            button.disabled = false;
            button.textContent = '完成一次';
        }
    }
    
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
});