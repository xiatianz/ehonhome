// EdgeOne Cloud Functions - GitHub OAuth 重定向
// 路由: /api/auth/github
// 已迁移到 Supabase Auth OAuth，此函数仅做重定向

export default function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
  const redirectTo = url.origin + '/';
  const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(redirectTo)}`;
  return Response.redirect(authUrl, 302);
}
