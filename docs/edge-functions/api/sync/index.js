// EdgeOne Edge Functions - KV 数据同步 API
// 路由: /api/sync
// 使用 Edge Runtime（无需登录，通过设备 ID 标识）
// 注意：EdgeOne KV 绑定变量是全局变量，不是通过 env 访问
/* global ehon_kv */

export default async function onRequest(context) {
  const { request } = context;

  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Device-ID',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 诊断：检查 KV 绑定是否存在且有效
  if (typeof ehon_kv === 'undefined') {
    return new Response(JSON.stringify({
      error: 'KV not bound',
      message: 'ehon_kv is not defined. Please bind the KV namespace (ehon_data) to this project in EdgeOne Pages console.',
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  // 检查 KV 对象是否有有效方法
  if (typeof ehon_kv.put !== 'function' || typeof ehon_kv.get !== 'function') {
    return new Response(JSON.stringify({
      error: 'KV invalid',
      message: 'ehon_kv exists but put/get methods are missing',
      kvType: typeof ehon_kv,
      kvKeys: Object.keys(ehon_kv || {}),
    }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 通过 X-Device-ID 头获取设备 ID（无需登录）
    const deviceId = request.headers.get('X-Device-ID');
    if (!deviceId) {
      return new Response(JSON.stringify({ error: 'Missing X-Device-ID header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 设备数据存储 key（只支持数字、字母、下徒线，不能用冒号）
    const safeDeviceId = deviceId.replace(/[^a-zA-Z0-9_]/g, '_');
    const userKey = `${safeDeviceId}_data`;

    if (request.method === 'GET') {
      // 获取设备数据
      const data = await ehon_kv.get(userKey, { type: 'json' });
      return new Response(JSON.stringify({
        success: true,
        data: data || null,
        lastSync: data ? data._lastSync : null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      // 保存设备数据
      const body = await request.json();
      body._lastSync = new Date().toISOString();
      body._version = (body._version || 0) + 1;
      await ehon_kv.put(userKey, JSON.stringify(body));
      return new Response(JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        lastSync: body._lastSync,
        version: body._version,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'DELETE') {
      // 删除设备数据
      await ehon_kv.delete(userKey);
      return new Response(JSON.stringify({
        success: true,
        message: 'Data deleted successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack,
      name: error.name,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
