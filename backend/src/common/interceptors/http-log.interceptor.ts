import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { join } from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// __dirname at runtime = dist/common/interceptors → 3 levels up = project root (backend/)
const logDir = join(__dirname, '../../../../logs');

const transport = new (winston.transports as any).DailyRotateFile({
  filename: join(logDir, 'requests-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  zippedArchive: false,
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
  transports: [transport],
});

@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, ip } = req;
    const start = Date.now();

    const body = this.sanitizeBody(req.body);

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        this.write(method, url, res.statusCode, Date.now() - start, user, ip, body);
      }),
      catchError((err) => {
        this.write(method, url, err?.status ?? 500, Date.now() - start, user, ip, body, err?.message);
        return throwError(() => err);
      }),
    );
  }

  private write(
    method: string,
    url: string,
    status: number,
    ms: number,
    user: any,
    ip: string,
    body: any,
    error?: string,
  ) {
    if (url.startsWith('/imgLink') || url.startsWith('/public')) return;

    const entry: Record<string, any> = {
      method,
      url,
      status,
      ms,
      user: user?.UserName || user?.username || user?.sub || 'anonymous',
      ip: ip || 'unknown',
    };

    if (body && Object.keys(body).length > 0) entry.body = body;
    if (error) entry.error = error;

    logger.info(entry);
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return null;
    const safe = { ...body };
    delete safe.password;
    delete safe.matKhau;
    delete safe.confirmPassword;
    return safe;
  }
}
