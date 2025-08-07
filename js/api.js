// ===============================================================
// API 呼叫模組
// ===============================================================
const API_URL = "https://script.google.com/macros/s/AKfycbx3sIJgurNnn_yIYl9TorEm5ReJmdK316aRtBtHI-wK7nJDA6tLRLaZz4d5-sRAEJ5j/exec";

async function callApi(action, payload = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Apps Script Web App 的特殊要求
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.message);
    }
    
    return result.data;

  } catch (error) {
    console.error("API Call Failed:", error);
    // 將錯誤訊息直接拋出，讓呼叫者可以捕捉到
    throw error;
  }
}