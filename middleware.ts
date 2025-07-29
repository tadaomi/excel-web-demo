import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 静的ファイルやNext.jsの内部ファイルは認証をスキップ
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 環境変数から認証情報を取得
  const basicAuthUser = process.env.BASIC_AUTH_USER || 'admin'
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD || 'password'

  // Authorizationヘッダーを確認
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    // 認証ヘッダーがない場合、認証を要求
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // Basic認証の解析
  const base64Credentials = authHeader.split(' ')[1]
  if (!base64Credentials) {
    return new NextResponse('Invalid authentication format', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  try {
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    // 認証情報を検証
    if (username === basicAuthUser && password === basicAuthPassword) {
      // 認証成功 - リクエストを続行
      return NextResponse.next()
    } else {
      // 認証失敗
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      })
    }
  } catch (error) {
    // Base64デコードエラー
    return new NextResponse('Invalid authentication format', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}