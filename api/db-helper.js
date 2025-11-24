// api/db-helper.js
// 通用資料庫操作輔助函式

import { sql } from '@vercel/postgres';

/**
 * 通用的資料插入函式
 * @param {string} tableName - 表格名稱
 * @param {Object} data - 要插入的資料物件
 * @returns {Promise<Object>} 插入結果
 */
export async function insertRecord(tableName, data) {
    // 從資料物件中提取欄位名稱和值
    const columns = Object.keys(data);
    const values = Object.values(data);

    // 動態生成 SQL 語句
    // 例如: INSERT INTO records (name, message) VALUES ($1, $2)
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const columnNames = columns.join(', ');

    const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) RETURNING *`;

    const result = await sql.query(query, values);
    return result.rows[0];
}

/**
 * 通用的資料查詢函式
 * @param {string} tableName - 表格名稱
 * @param {Object} conditions - 查詢條件 (可選)
 * @param {number} limit - 限制筆數 (可選)
 * @returns {Promise<Array>} 查詢結果
 */
export async function getRecords(tableName, conditions = {}, limit = null) {
    let query = `SELECT * FROM ${tableName}`;
    const values = [];

    // 如果有條件，加入 WHERE 子句
    if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
            .map((key, index) => {
                values.push(conditions[key]);
                return `${key} = $${index + 1}`;
            })
            .join(' AND ');
        query += ` WHERE ${whereClause}`;
    }

    // 加入排序（最新的在前）
    query += ' ORDER BY created_at DESC';

    // 如果有限制筆數
    if (limit) {
        query += ` LIMIT ${limit}`;
    }

    const result = await sql.query(query, values);
    return result.rows;
}

/**
 * 通用的資料更新函式
 * @param {string} tableName - 表格名稱
 * @param {number} id - 記錄 ID
 * @param {Object} data - 要更新的資料
 * @returns {Promise<Object>} 更新結果
 */
export async function updateRecord(tableName, id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);

    const setClause = columns
        .map((col, index) => `${col} = $${index + 1}`)
        .join(', ');

    values.push(id); // ID 作為最後一個參數
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length} RETURNING *`;

    const result = await sql.query(query, values);
    return result.rows[0];
}

/**
 * 通用的資料刪除函式
 * @param {string} tableName - 表格名稱
 * @param {number} id - 記錄 ID
 * @returns {Promise<boolean>} 是否刪除成功
 */
export async function deleteRecord(tableName, id) {
    const query = `DELETE FROM ${tableName} WHERE id = $1`;
    await sql.query(query, [id]);
    return true;
}

/**
 * 驗證必填欄位
 * @param {Object} data - 要驗證的資料
 * @param {Array<string>} requiredFields - 必填欄位陣列
 * @returns {Object} { valid: boolean, missingFields: Array }
 */
export function validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

    return {
        valid: missingFields.length === 0,
        missingFields
    };
}
