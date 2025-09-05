import { ValidationPipeOptions } from '@nestjs/common';

export const getValidationConfig = (): ValidationPipeOptions => ({
  // Bật validation
  transform: true,
  
  // Bật whitelist để loại bỏ các field không được định nghĩa
  whitelist: true,
  
  // Bật forbidNonWhitelisted để throw error khi có field không được định nghĩa
  forbidNonWhitelisted: true,
  
  // Bật forbidUnknownValues để throw error khi có value không hợp lệ
  forbidUnknownValues: true,
  
  // Bật disableErrorMessages để ẩn error messages trong production
  disableErrorMessages: process.env.NODE_ENV === 'production',
  
  // Cấu hình validation error
  exceptionFactory: (errors) => {
    const formattedErrors = errors.map(error => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children,
    }));
    
    return new Error(JSON.stringify({
      message: 'Validation failed',
      errors: formattedErrors,
    }));
  },
});
