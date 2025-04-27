import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // 使用正确的标签模板语法
    const result = await sql`SELECT NOW() as time`

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      time: result[0]?.time,
      data: result,
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Database test failed",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
