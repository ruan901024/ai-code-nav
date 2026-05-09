import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Detect locale from:
 * 1. Cookie (user preference)
 * 2. Accept-Language header (browser preference)
 * 3. Default to Chinese
 */
function detectLocale(request: NextRequest): 'zh' | 'en' {
  // Check cookie first (highest priority - user's explicit choice)
  const cookieLocale = request.cookies.get('locale');
  if (cookieLocale?.value === 'en' || cookieLocale?.value === 'zh') {
    return cookieLocale.value as 'zh' | 'en';
  }

  // Check Accept-Language header (browser preference)
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse the Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0].trim().toLowerCase());
    
    // Check if any Chinese variant is present
    const hasChinese = languages.some(lang => 
      lang.startsWith('zh') || lang === 'cn' || lang === 'chinese'
    );
    
    if (hasChinese) {
      return 'zh';
    }
  }

  // Default to English for non-Chinese speakers
  // This means international users get English by default
  return 'en';
}

export function middleware(request: NextRequest) {
  const locale = detectLocale(request);
  
  // Create response
  let response = NextResponse.next();
  
  // Set cookie if not already set
  if (!request.cookies.has('locale')) {
    response.cookies.set('locale', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
    });
  }
  
  return response;
}

// Match all request paths except API routes and static files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
