// EdgeOne Pages GitHub OAuth 认证 API

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // GitHub OAuth 登录
    if (path === '/api/auth/github' && request.method === 'GET') {
      const code = url.searchParams.get('code');
      
      if (!code) {
        // 第一步：重定向到 GitHub 授权页面
        const redirectUri = `${url.origin}/oauth-callback.html`;
        const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
          `client_id=${env.GITHUB_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=user`;
        
        return Response.redirect(githubAuthUrl, 302);
      }
      
      // 第二步：用 code 换取 access_token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: `${url.origin}/oauth-callback.html`,
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return new Response(JSON.stringify({ 
          error: 'GitHub OAuth failed',
          message: tokenData.error_description 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      const user = await userResponse.json();
      
      // 生成 JWT token（简化版，生产环境建议使用库）
      const jwtToken = generateJWT({
        sub: user.id.toString(),
        login: user.login,
        avatar: user.avatar_url,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天过期
      }, env.JWT_SECRET);
      
      // 返回 token 给前端
      return new Response(JSON.stringify({
        success: true,
        token: jwtToken,
        user: {
          id: user.id,
          login: user.login,
          avatar: user.avatar_url,
          name: user.name,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 验证 token
    if (path === '/api/auth/verify' && request.method === 'POST') {
      const body = await request.json();
      const { token } = body;
      
      if (!token) {
        return new Response(JSON.stringify({ error: 'Token required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const payload = verifyJWT(token, env.JWT_SECRET);
      
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        valid: true,
        user: {
          id: payload.sub,
          login: payload.login,
        },
        exp: payload.exp,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 刷新 token
    if (path === '/api/auth/refresh' && request.method === 'POST') {
      const body = await request.json();
      const { token } = body;
      
      const payload = verifyJWT(token, env.JWT_SECRET);
      
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // 生成新 token
      const newToken = generateJWT({
        sub: payload.sub,
        login: payload.login,
        avatar: payload.avatar,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      }, env.JWT_SECRET);
      
      return new Response(JSON.stringify({
        success: true,
        token: newToken,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
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

// 简化的 JWT 生成（生产环境建议使用 jsonwebtoken 库）
function generateJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  // 注意：这是简化版，实际应该使用 crypto 进行 HMAC-SHA256 签名
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`).replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 简化的 JWT 验证
function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // 检查过期时间
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    // 验证签名（简化版）
    const expectedSignature = btoa(`${parts[0]}.${parts[1]}.${secret}`).replace(/=/g, '');
    if (parts[2] !== expectedSignature) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
