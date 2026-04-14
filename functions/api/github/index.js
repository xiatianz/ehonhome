// EdgeOne Pages GitHub OAuth 认证 API
// 路由: /api/github

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  
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
    
    // 生成 JWT token
    const jwtToken = generateJWT({
      sub: user.id.toString(),
      login: user.login,
      avatar: user.avatar_url,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
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

// 简化的 JWT 生成
function generateJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`).replace(/=/g, '');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
