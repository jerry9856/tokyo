// js/form-mixin.js
// Vue 表單處理 Mixin

const FormMixin = {
    data() {
        return {
            formStatus: {
                loading: false,
                message: '',
                type: 'info' // 'info', 'success', 'error'
            }
        };
    },

    computed: {
        formStatusColor() {
            const colors = {
                info: 'blue',
                success: 'green',
                error: 'red'
            };
            return colors[this.formStatus.type] || 'blue';
        }
    },

    methods: {
        /**
         * 設定表單狀態訊息
         * @param {string} message - 訊息內容
         * @param {string} type - 訊息類型 ('info', 'success', 'error')
         */
        setFormStatus(message, type = 'info') {
            this.formStatus.message = message;
            this.formStatus.type = type;
        },

        /**
         * 清除表單狀態
         */
        clearFormStatus() {
            this.formStatus.message = '';
            this.formStatus.type = 'info';
        },

        /**
         * 設定載入狀態
         * @param {boolean} loading - 是否載入中
         */
        setLoading(loading) {
            this.formStatus.loading = loading;
        },

        /**
         * 通用的表單提交處理
         * @param {Function} apiCall - API 呼叫函式
         * @param {Object} formData - 表單資料物件
         * @param {Function} onSuccess - 成功後的回調函式
         */
        async handleFormSubmit(apiCall, formData, onSuccess = null) {
            this.setLoading(true);
            this.setFormStatus('正在提交資料...', 'info');

            try {
                const result = await apiCall();

                if (result.success) {
                    this.setFormStatus('✅ ' + (result.message || '操作成功！'), 'success');

                    // 執行成功回調
                    if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess(result);
                    }
                } else {
                    this.setFormStatus('❌ ' + (result.error || '操作失敗'), 'error');
                }
            } catch (error) {
                console.error('表單提交錯誤:', error);
                this.setFormStatus('❌ ' + (error.message || '連線到伺服器失敗'), 'error');
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * 重置表單資料
         * @param {Object} formData - 表單資料物件
         * @param {Object} defaultValues - 預設值 (可選)
         */
        resetForm(formData, defaultValues = {}) {
            Object.keys(formData).forEach(key => {
                formData[key] = defaultValues[key] || '';
            });
            this.clearFormStatus();
        }
    }
};

// 如果在瀏覽器環境中，將 Mixin 掛載到 window
if (typeof window !== 'undefined') {
    window.FormMixin = FormMixin;
}

// 如果使用模組系統，也可以匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormMixin;
}
