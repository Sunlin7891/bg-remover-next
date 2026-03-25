import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "只支持 JPG/PNG 格式的图片" },
        { status: 400 }
      );
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "图片大小不能超过 5MB" },
        { status: 400 }
      );
    }

    // 调用 remove.bg API
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "服务器配置错误：缺少 remove.bg API Key" },
        { status: 500 }
      );
    }

    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", imageFile);
    removeBgFormData.append("size", "auto");

    const removeBgResponse = await fetch(
      "https://api.remove.bg/v1.0/removebg",
      {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
        },
        body: removeBgFormData,
      }
    );

    if (!removeBgResponse.ok) {
      const errorData = await removeBgResponse.json().catch(() => ({}));

      if (removeBgResponse.status === 402) {
        return NextResponse.json(
          { error: "API 额度已用完，请充值或明日再来" },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: errorData.errors?.[0]?.title || "背景移除失败，请重试" },
        { status: removeBgResponse.status }
      );
    }

    // 返回处理后的图片
    const imageBuffer = await removeBgResponse.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="no-bg.png"',
      },
    });
  } catch (error) {
    console.error("Remove BG Error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
