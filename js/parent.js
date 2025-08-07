// ===============================================================
// 全新版本的 js/parent.js
// ===============================================================
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
            // 現在會多收到一個 todaysTaskLogs 的資料
            const { tasks, children, todaysTaskLogs } = await callApi('getParentData');
            renderDashboard(tasks, children, todaysTaskLogs);
        } catch (error) {
            dashboard.innerHTML = `<p class="message error">載入失敗: ${error.message}</p>`;
        }
    }

    // renderDashboard 函式現在會接收第三個參數 todaysTaskLogs

function renderDashboard(tasks, children, todaysTaskLogs) {
    dashboard.innerHTML = '';
    children.forEach(child => {
        const childSection = document.createElement('section');
        childSection.className = 'child-section card';
        childSection.innerHTML = `<h3>${child.UserName} 的任務</h3>`;
        
        const taskList = document.createElement('ul');
        taskList.className = 'task-list';

        tasks.forEach(task => {
            const completionCount = todaysTaskLogs.filter(log => 
                log.UserID == child.UserID && log.TaskID === task.TaskID
            ).length;

            const dailyLimit = Number(task.DailyLimit);
            const isLimitReached = completionCount >= dailyLimit;

            const li = document.createElement('li');
            
            // 根據 task.IconURL 是否存在來決定顯示圖片或佔位符
            const iconHtml = task.IconURL 
                ? `<img src="${task.IconURL}" alt="${task.TaskName}" class="item-icon">`
                : `<div class="item-icon-placeholder"></div>`;

            li.innerHTML = `
                ${iconHtml}
                <div class="task-info">
                    <span class="task-name">${task.TaskName} (+${task.MedalValue} 獎章)</span>
                    <span class="task-counter">今日已完成: ${completionCount} / ${dailyLimit}</span>
                </div>
                <button 
                    class="task-button" 
                    data-user-id="${child.UserID}" 
                    data-task-id="${task.TaskID}"
                    ${isLimitReached ? 'disabled' : ''}
                >
                    ${isLimitReached ? '已達上限' : '完成一次'}
                </button>
            `;
            taskList.appendChild(li);
        });
        
        childSection.appendChild(taskList);
        dashboard.appendChild(childSection);
    });

    document.querySelectorAll('.task-button').forEach(button => {
        if (!button.disabled) {
            button.addEventListener('click', handleCompleteTask);
        }
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
            // --- 新增：成功後重新載入整個儀表板來更新狀態 ---
            loadDashboard();
        } catch (error) {
            showToast(error.message, 'error');
            // 失敗時，按鈕狀態會由 loadDashboard() 刷新，故不需手動恢復
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

