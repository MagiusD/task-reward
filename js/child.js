document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData || userData.role !== 'child') {
        window.location.href = 'index.html';
        return;
    }

    const welcomeMessage = document.getElementById('welcomeMessage');
    const medalCountElement = document.getElementById('medal-count');
    const rewardShop = document.getElementById('reward-shop');
    const logoutButton = document.getElementById('logoutButton');

    welcomeMessage.textContent = `嗨，${userData.userName}！`;
    logoutButton.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
    
    loadChildData();

    async function loadChildData() {
        try {
            const data = await callApi('getChildData', { userId: userData.userId });
            renderPage(data);
        } catch (error) {
            medalCountElement.textContent = '無法載入資料';
            rewardShop.innerHTML = `<p class="message error">載入失敗: ${error.message}</p>`;
        }
    }

    function renderPage({ currentMedals, rewards }) {
        medalCountElement.textContent = `${currentMedals} ������`;
        rewardShop.innerHTML = '';

        if (rewards.length === 0) {
            rewardShop.innerHTML = '<p>爸爸媽媽還沒有設定獎品喔！</p>';
            return;
        }

        rewards.forEach(reward => {
            const rewardCard = document.createElement('div');
            rewardCard.className = 'reward-card card';

            const canAfford = currentMedals >= reward.Cost;

            rewardCard.innerHTML = `
                <h4>${reward.RewardName}</h4>
                <p class="cost">${reward.Cost} 獎章</p>
                <div class="limits">
                    ${reward.TotalLimit ? `<p>總限 ${reward.TotalLimit} 次</p>` : ''}
                    ${reward.DailyLimit ? `<p>每日限 ${reward.DailyLimit} 次</p>` : ''}
                </div>
                <button class="redeem-button" data-reward-id="${reward.RewardID}" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? '我要兌換' : '獎章不足'}
                </button>
            `;
            rewardShop.appendChild(rewardCard);
        });

        document.querySelectorAll('.redeem-button').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', handleRedeemReward);
            }
        });
    }
    
    async function handleRedeemReward(event) {
        const button = event.target;
        const { rewardId } = button.dataset;

        if (!confirm('確定要兌換這個獎品嗎？')) {
            return;
        }

        button.disabled = true;
        button.textContent = '兌換中...';

        try {
            const result = await callApi('redeemReward', { userId: userData.userId, rewardId });
            showToast(result.message, 'success');
            // 成功後重新載入所有資料以更新獎章和按鈕狀態
            loadChildData();
        } catch (error) {
            showToast(error.message, 'error');
            button.disabled = false; // 失敗時重新啟用按鈕
            button.textContent = '我要兌換';
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