import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Database } from "@/lib/db";

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const db = new Database((globalThis as any).DB);
    const userId = session.user.id;

    // 获取用户信息
    const user = await db.getUserById(userId);
    
    // 如果没有用户记录，创建一个新的
    if (!user && session.user.email) {
      const newUser = await db.createUser({
        id: userId,
        email: session.user.email,
        name: session.user.name || "",
        picture: session.user.image || "",
        google_id: (session.user as any).googleId || "",
      });
      if (!newUser) {
        return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
      }
      return NextResponse.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || "",
          picture: newUser.picture || "",
        },
        quota: { daily_limit: 10, daily_used: 0 },
        history: [],
      });
    }

    // 获取配额
    const quota = await db.getUserQuota(userId);
    
    // 获取使用历史
    const history = await db.getUserUsageLogs(userId, 10);

    return NextResponse.json({
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      } : null,
      quota: quota ? {
        daily_limit: quota.daily_limit,
        daily_used: quota.daily_used,
      } : { daily_limit: 10, daily_used: 0 },
      history: history.map(log => ({
        id: log.id,
        created_at: log.created_at,
        file_size: log.file_size,
      })),
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
