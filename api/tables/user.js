// api/tables/user.js
// 使用者管理 API（註冊、登入、驗證）

import { sql } from '@vercel/postgres';
import { validateRequiredFields } from '../db-helper.js';
import crypto from 'crypto';

// 簡單的密碼雜湊函式（實際應用建議使用 bcrypt）
function hashPassword(password) {
    // 這裡使用簡單的 SHA-256 雜湊
    // 在生產環境中應該使用 bcrypt 或 argon2
    return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(request, response) {
    try {
        // POST /api/tables/user?action=register - 註冊新使用者
        if (request.method === 'POST' && request.query.action === 'register') {
            const { username, password, email } = request.body;

            // 驗證必填欄位
            const validation = validateRequiredFields(request.body, ['username', 'password']);
            if (!validation.valid) {
                return response.status(400).json({
                    success: false,
                    error: `缺少必填欄位: ${validation.missingFields.join(', ')}`
                });
            }

            // 檢查使用者名稱是否已存在
            const existingUser = await sql`
                SELECT id FROM users WHERE username = ${username}
            `;

            if (existingUser.rows.length > 0) {
                return response.status(400).json({
                    success: false,
                    error: '使用者名稱已存在'
                });
            }

            // 雜湊密碼
            const hashedPassword = hashPassword(password);

            // 插入新使用者
            const result = await sql`
                INSERT INTO users (username, password_hash, email)
                VALUES (${username}, ${hashedPassword}, ${email || null})
                RETURNING id, username, email, created_at
            `;

            return response.status(200).json({
                success: true,
                message: '註冊成功',
                data: result.rows[0]
            });
        }

        // POST /api/tables/user?action=login - 使用者登入
        if (request.method === 'POST' && request.query.action === 'login') {
            const { username, password } = request.body;

            // 驗證必填欄位
            const validation = validateRequiredFields(request.body, ['username', 'password']);
            if (!validation.valid) {
                return response.status(400).json({
                    success: false,
                    error: `缺少必填欄位: ${validation.missingFields.join(', ')}`
                });
            }

            // 雜湊輸入的密碼
            const hashedPassword = hashPassword(password);

            // 查詢使用者
            const result = await sql`
                SELECT id, username, email, created_at
                FROM users
                WHERE username = ${username} AND password_hash = ${hashedPassword}
            `;

            if (result.rows.length === 0) {
                return response.status(401).json({
                    success: false,
                    error: '帳號或密碼錯誤'
                });
            }

            const user = result.rows[0];

            // 更新最後登入時間
            await sql`
                UPDATE users
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = ${user.id}
            `;

            return response.status(200).json({
                success: true,
                message: '登入成功',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        }

        // GET /api/tables/user - 取得所有使用者（僅供管理用）
        if (request.method === 'GET') {
            const result = await sql`
                SELECT id, username, email, created_at, last_login
                FROM users
                ORDER BY created_at DESC
            `;

            return response.status(200).json({
                success: true,
                data: result.rows
            });
        }

        // 其他方法不允許
        return response.status(405).json({
            success: false,
            error: '不允許的方法'
        });

    } catch (error) {
        console.error('User API 錯誤:', error);
        return response.status(500).json({
            success: false,
            error: '伺服器端操作失敗'
        });
    }
}
