// js/api-service.js
// 前端 API 呼叫服務封裝

/**
 * 通用的 API 呼叫函式
 * @param {string} endpoint - API 端點路徑
 * @param {string} method - HTTP 方法 (GET, POST, PUT, DELETE)
 * @param {Object} data - 要傳送的資料 (可選)
 * @returns {Promise<Object>} API 回應
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(endpoint, options);

        // 檢查回應是否為 JSON
        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // 如果不是 JSON，讀取文字內容並拋出錯誤
            const text = await response.text();
            console.error('API 回應非 JSON:', text);
            throw new Error('伺服器回應格式錯誤，請稍後再試');
        }

        if (!response.ok) {
            throw new Error(result.error || '請求失敗');
        }

        return result;
    } catch (error) {
        console.error(`API 呼叫錯誤 (${endpoint}):`, error);
        throw error;
    }
}

/**
 * 費用記錄相關的 API
 */
const ExpenseAPI = {
    // 新增費用記錄
    create: (userId, date, time, itemName, amount, currency, payerName) =>
        apiCall('/api/tables/expense', 'POST', { userId, date, time, itemName, amount, currency, payerName }),

    // 取得費用記錄列表
    getAll: (userId) =>
        apiCall(`/api/tables/expense?userId=${userId}`, 'GET'),

    // 刪除費用記錄
    delete: (id) =>
        apiCall(`/api/tables/expense?id=${id}`, 'DELETE')
};

/**
 * 使用者相關的 API
 */
const UserAPI = {
    // 註冊新使用者
    register: (username, password, email = null) =>
        apiCall('/api/tables/user?action=register', 'POST', { username, password, email }),

    // 使用者登入
    login: (username, password) =>
        apiCall('/api/tables/user?action=login', 'POST', { username, password }),

    // 取得所有使用者（管理用）
    getAll: () => apiCall('/api/tables/user', 'GET')
};

// 如果在瀏覽器環境中，將 API 服務掛載到 window
if (typeof window !== 'undefined') {
    window.ExpenseAPI = ExpenseAPI;
    window.UserAPI = UserAPI;
}

// 如果使用模組系統，也可以匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExpenseAPI, UserAPI };
}
