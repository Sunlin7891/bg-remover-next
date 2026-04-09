'use client';

import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserData {
  user: {
    id: string;
    email: string;
    name: string | null;
    picture: string | null;
  } | null;
  quota: {
    daily_limit: number;
    daily_used: number;
  };
  history: Array<{
    id: number;
    created_at: string;
    file_size: number | null;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user")
        .then(res => res.json())
        .then(data => {
          setUserData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">请先登录</h1>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            使用 Google 登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            个人中心
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            退出登录
          </button>
        </div>

        {/* 用户信息 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            {userData?.user?.picture ? (
              <img
                src={userData.user.picture}
                alt={userData.user.name || "User"}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {userData?.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {userData?.user?.name || session.user?.name || "用户"}
              </h2>
              <p className="text-gray-600">{session.user?.email}</p>
            </div>
          </div>
        </div>

        {/* 配额信息 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">今日配额</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
                style={{
                  width: `${Math.min((userData?.quota?.daily_used || 0) / (userData?.quota?.daily_limit || 10) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {userData?.quota?.daily_used || 0} / {userData?.quota?.daily_limit || 10}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            每日免费 {(userData?.quota?.daily_limit || 10)} 次，明日重置
          </p>
        </div>

        {/* 使用历史 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">最近使用记录</h3>
          {userData?.history && userData.history.length > 0 ? (
            <div className="space-y-3">
              {userData.history.map((log) => (
                <div key={log.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {new Date(log.created_at).toLocaleString("zh-CN")}
                  </span>
                  <span className="text-sm text-gray-500">
                    {log.file_size ? `${(log.file_size / 1024).toFixed(2)} KB` : "-"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">暂无使用记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
