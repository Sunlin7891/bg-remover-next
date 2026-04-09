import { NextRequest } from "next/server";

export const runtime = 'edge';

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(request: NextRequest) {
  const debugInfo: Record<string, unknown> = { step: "start" };
  
  try {
    const formData = await request.formData();
    debugInfo.step = "formData parsed";
    
    const imageFile = formData.get("image") as File | null;
    debugInfo.imageFile = imageFile ? {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
      constructor: imageFile.constructor.name
    } : null;

    if (!imageFile) {
      return jsonResponse({ error: "请上传图片文件", debug: debugInfo, _httpStatus: 400 });
    }

    // 验证文件类型 - 放宽验证
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", ""];
    if (!allowedTypes.includes(imageFile.type)) {
      return jsonResponse(
        { error: "只支持 JPG/PNG 格式的图片", received: imageFile.type, debug: debugInfo, _httpStatus: 400 }
      );
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return jsonResponse(
        { error: "图片大小不能超过 5MB", debug: debugInfo, _httpStatus: 400 }
      );
    }

    // 调用 remove.bg API
    const apiKey = "j8u5RsqgUxZk9CGYarmW1n5o";
    debugInfo.step = "calling remove.bg";

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

    debugInfo.step = "remove.bg responded";
    debugInfo.removeBgStatus = removeBgResponse.status;

    if (!removeBgResponse.ok) {
      const errorData = await removeBgResponse.json().catch(() => ({}));
      debugInfo.removeBgError = errorData;

      return jsonResponse({
        error: errorData.errors?.[0]?.title || "背景移除失败",
        debug: debugInfo,
        rawError: errorData,
        _httpStatus: removeBgResponse.status
      });
    }

    // 返回处理后的图片
    const imageBuffer = await removeBgResponse.arrayBuffer();
    debugInfo.step = "success";
    debugInfo.imageBufferSize = imageBuffer.byteLength;
    
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="no-bg.png"',
      },
    });
  } catch (error) {
    debugInfo.error = {
      type: error?.constructor?.name,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "N/A"
    };
    // 用 200 状态码返回错误，避免被 Cloudflare 拦截
    return new Response(JSON.stringify({ error: "服务器错误", debug: debugInfo, _status: 500 }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
