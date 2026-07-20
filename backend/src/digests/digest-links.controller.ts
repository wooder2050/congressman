/**
 * Lawmake Radar 이메일 링크 엔드포인트(로그인 없이 서명 토큰). 전역 prefix 'api' 하위.
 * - GET  /api/r/c/:token                 클릭 기록 후 법안 상세로 302
 * - GET  /api/email/unsubscribe/:token   수신거부 확인 화면(HTML)
 * - POST /api/email/unsubscribe/:token   수신거부 실행(스캐너 오작동 방지 위해 POST 분리)
 */

import { Controller, Get, Post, Param, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DigestLinksService } from './digest-links.service';

const TOKEN_MAX = 512;

function safeToken(token: string): string {
  // 토큰은 base64url·점 구성. 길이·문자 방어(과도한 입력·경로 조작 차단).
  if (!token || token.length > TOKEN_MAX || !/^[\w.-]+$/.test(token)) {
    return '';
  }
  return token;
}

@ApiTags('Radar')
@Controller()
export class DigestLinksController {
  constructor(private readonly service: DigestLinksService) {}

  @Get('r/c/:token')
  @ApiOperation({ summary: '이메일 링크 클릭 → 법안 상세 리다이렉트' })
  async click(@Param('token') token: string, @Res() res: Response): Promise<void> {
    const t = safeToken(token);
    let target = 'https://www.lawmake.kr/alerts';
    if (t) {
      try {
        target = await this.service.handleClick(t);
      } catch {
        // 만료·위조 토큰이어도 사용자에겐 관리 화면으로 조용히 안내.
      }
    }
    res.redirect(302, target);
  }

  @Get('email/unsubscribe/:token')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: '수신거부 확인 화면' })
  async unsubscribeForm(@Param('token') token: string): Promise<string> {
    const t = safeToken(token);
    let valid = false;
    if (t) {
      try {
        await this.service.resolveUnsubscribe(t);
        valid = true;
      } catch {
        valid = false;
      }
    }
    return unsubscribeHtml(t, valid);
  }

  @Post('email/unsubscribe/:token')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({ summary: '수신거부 실행' })
  async unsubscribe(@Param('token') token: string): Promise<string> {
    const t = safeToken(token);
    if (!t) return resultHtml('유효하지 않은 링크입니다.');
    try {
      await this.service.applyUnsubscribe(t);
      return resultHtml('수신 거부가 완료되었습니다. 앞으로 Radar 주간 이메일을 보내지 않습니다.');
    } catch {
      return resultHtml('링크가 만료되었거나 유효하지 않습니다.');
    }
  }
}

function page(body: string): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Lawmake 알림</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:64px auto;padding:0 24px;color:#111;">
${body}
</body></html>`;
}

function unsubscribeHtml(token: string, valid: boolean): string {
  if (!valid) {
    return page(`<h2>수신 거부</h2><p>링크가 만료되었거나 유효하지 않습니다.</p>`);
  }
  // POST로만 실제 해제(메일 스캐너의 GET 프리페치로 자동 해제되는 것 방지).
  return page(`<h2>수신 거부</h2>
<p>Lawmake 법안 변경 주간 이메일 수신을 거부하시겠어요?</p>
<form method="post" action="/api/email/unsubscribe/${token}">
  <button type="submit" style="padding:10px 20px;background:#111;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;">
    수신 거부하기
  </button>
</form>`);
}

function resultHtml(message: string): string {
  return page(`<h2>Lawmake 알림</h2><p>${message}</p>`);
}
