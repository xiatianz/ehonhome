// EdgeOne Cloud Functions - 支付宝 OAuth 重定向
// 路由: /api/auth/alipay
// 已迁移到 Supabase Auth OAuth，此函数仅做重定向

export default function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const SUPABASE_URL = 'https://sbp-2bar7udy02n8mtsi.supabase.opentrust.net';
  const redirectTo = url.origin + '/';
  const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=alipay&redirect_to=${encodeURIComponent(redirectTo)}`;
  return Response.redirect(authUrl, 302);
}
