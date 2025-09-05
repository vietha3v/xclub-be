import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Kiểm tra xem có phải path bị loại trừ không
    const excludePaths = ['/health', '/metrics'];
    if (excludePaths.includes(req.url)) {
      return next();
    }

    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Log request
    console.log(`📥 [${timestamp}] ${req.method} ${req.url}`);
    
    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      console.log(`🔍 Query:`, req.query);
    }
    
    // Log headers
    console.log(`📋 Headers:`, req.headers);
    
    // Log body
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`📄 Body:`, JSON.stringify(req.body, null, 2));
    }
    
    // Capture response data
    const originalSend = res.send;
    let responseBody: any;
    
    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - start;
      let logMessage = `📤 [${timestamp}] ${req.method} ${req.url} - ${res.statusCode}`;
      
      // Log duration
      logMessage += ` (${duration}ms)`;
      
      console.log(logMessage);
      
      // Log response status
      console.log(`📄 Response Status: ${res.statusCode}`);
      
      // Log response headers
      console.log(`📋 Response Headers:`, res.getHeaders());
      
      // Log response body
      if (responseBody) {
        try {
          const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          console.log(`📄 Response Body:`, JSON.stringify(parsedBody, null, 2));
        } catch (e) {
          console.log(`📄 Response Body:`, responseBody);
        }
      }
    });
    
    next();
  }
}
