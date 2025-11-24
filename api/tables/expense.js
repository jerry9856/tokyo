import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    try {
        // GET /api/tables/expense - 取得費用記錄
        if (request.method === 'GET') {
            const { userId } = request.query;

            if (!userId) {
                return response.status(400).json({
                    success: false,
                    error: '缺少 User ID'
                });
            }

            const result = await sql`
                SELECT id, date, time, item_name, amount, currency, created_at
                FROM expenses
                WHERE user_id = ${userId}
                ORDER BY date DESC, time DESC
            `;

            return response.status(200).json({
                success: true,
                data: result.rows
            });
        }

        // POST /api/tables/expense - 新增費用記錄
        if (request.method === 'POST') {
            const { userId, date, time, itemName, amount, currency } = request.body;

            if (!userId || !date || !time || !itemName || !amount || !currency) {
                return response.status(400).json({
                    success: false,
                    error: '缺少必填欄位'
                });
            }

            const result = await sql`
                INSERT INTO expenses (user_id, date, time, item_name, amount, currency)
                VALUES (${userId}, ${date}, ${time}, ${itemName}, ${amount}, ${currency})
                RETURNING id, date, time, item_name, amount, currency, created_at
            `;

            return response.status(200).json({
                success: true,
                message: '新增成功',
                data: result.rows[0]
            });
        }

        // DELETE /api/tables/expense - 刪除費用記錄
        if (request.method === 'DELETE') {
            const { id } = request.query;

            if (!id) {
                return response.status(400).json({
                    success: false,
                    error: '缺少 ID'
                });
            }

            await sql`
                DELETE FROM expenses
                WHERE id = ${id}
            `;

            return response.status(200).json({
                success: true,
                message: '刪除成功'
            });
        }

        return response.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error) {
        console.error('Expense API Error:', error);
        return response.status(500).json({
            success: false,
            error: '伺服器錯誤'
        });
    }
}
