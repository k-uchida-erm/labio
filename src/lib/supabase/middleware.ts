import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import type { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // セッションを更新
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証が必要なパス
  const protectedPaths = ['/dashboard', '/settings'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // 動的ルート（/[labSlug]/[projectSlug]）も保護
  const pathname = request.nextUrl.pathname;
  const isDynamicLabRoute =
    /^\/[^/]+\/[^/]+$/.test(pathname) &&
    pathname !== '/login' &&
    pathname !== '/signup' &&
    pathname !== '/forgot-password';
  const needsAuth = isProtectedPath || isDynamicLabRoute;

  // 認証が必要なパスに未認証でアクセスした場合
  if (needsAuth && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 認証ページにアクセスした場合、セッションがあってもリダイレクトしない
  // （セッションが無効な場合や、Labのメンバーでない場合があるため）
  // ログインページ側で適切に処理する

  return response;
}
