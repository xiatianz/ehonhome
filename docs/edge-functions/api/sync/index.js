// EdgeOne Edge Functions - KV 数据同步 API
// 路由: /api/sync
// 使用 Edge Runtime（无需登录，通过设备 ID 标识）

export default async function onRequest(context) {
  const { request, env } = context;

  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Device-ID',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 诊断：检查 KV 绑定是否存在
  if (!env || !env.ehon_kv) {
    return new Response(JSON.stringify({
      error: 'KV not bound',
      message: 'env.ehon_kv is undefined. Please bind KV namespace in EdgeOne Pages project settings and redeploy.',
      envKeys: env ? Object.keys(env) : [],
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

    // 设备数据存储 key
    const userKey = `device:${deviceId}:data`;

    if (request.method === 'GET') {
      // 获取设备数据（Edge Runtime KV.get 返回字符串，需手动解析）
      const raw = await env.ehon_kv.get(userKey);
      const data = raw ? JSON.parse(raw) : null;
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
      await env.ehon_kv.put(userKey, JSON.stringify(body));
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
      await env.ehon_kv.delete(userKey);
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
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
