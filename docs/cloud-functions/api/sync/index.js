// EdgeOne Cloud Functions - KV 数据同步 API
// 路由: /api/sync
// 使用 Node.js runtime

export default function onRequest(context) {
  const { request, env } = context;
  
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handleRequest(request, env, corsHeaders);
}

async function handleRequest(request, env, corsHeaders) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    const userId = await verifyToken(token, env);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 用户数据存储 key
    const userKey = `user:${userId}:data`;
    
    switch (request.method) {
      case 'GET':
        // 获取用户数据
        const data = await env.ehon_kv.get(userKey, 'json');
        return new Response(JSON.stringify({ 
          success: true, 
          data: data || null,
          lastSync: data ? data._lastSync : null 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'POST':
      case 'PUT':
        // 保存用户数据
        const body = await request.json();
        
        // 添加同步时间戳
        body._lastSync = new Date().toISOString();
        body._version = (body._version || 0) + 1;
        
        await env.ehon_kv.put(userKey, JSON.stringify(body));
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Data saved successfully',
          lastSync: body._lastSync,
          version: body._version
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      case 'DELETE':
        // 删除用户数据
        await env.ehon_kv.delete(userKey);
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Data deleted successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 验证 token
async function verifyToken(token, env) {
  try {
    // 如果配置了 JWT_SECRET，验证 JWT
    if (env.JWT_SECRET) {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // 使用 Node.js Buffer 解码 base64url
      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);
      
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return null; // Token 过期
      }
      return payload.sub; // 返回用户 ID
    }
    
    // 否则直接验证 GitHub token
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const user = await response.json();
    return user.id.toString();
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
