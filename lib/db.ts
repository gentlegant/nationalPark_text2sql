import { neon } from "@neondatabase/serverless";

// 确保数据库URL存在
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
}

// 初始化数据库连接
const sql = neon(DATABASE_URL!);

// 添加错误处理和重试逻辑
export async function executeQuery(query: string, params: any[] = []) {
  try {
    console.log("Executing SQL query:", query.trim().split("\n")[0]);
    console.log("With params:", JSON.stringify(params));

    // 添加重试逻辑
    let retries = 3;
    let result;

    while (retries > 0) {
      try {
        // 使用正确的sql.query方法而不是直接调用sql
        result = await sql.query(query, params);
        break;
      } catch (error) {
        if (retries === 1) throw error;
        retries--;
        console.log(`Query failed, retrying... (${retries} attempts left)`);
        // 等待短暂时间后重试
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // 确保我们正确地访问结果中的行数据
    if (result && result.rows) {
      return { success: true, data: result.rows };
    } else if (result) {
      // 如果没有rows属性但结果存在，可能是其他格式
      return { success: true, data: result };
    } else {
      // 如果结果为空但查询成功
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error("Database query error:", error);
    return { success: false, error };
  }
}

// 导出sql实例，以便在需要时使用
export { sql };
