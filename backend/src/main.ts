import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 允许跨域请求
  // 全局使用验证管道，自动验证请求数据并过滤掉多余的属性
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 只允许 DTO 中定义的属性，自动过滤掉多余的属性
      transform: true, // 自动将请求数据转换为 DTO 定义的类型，例如将字符串转换为数字
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
