import fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import Yaml from 'json-to-pretty-yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Energy API')
    .setDescription('Standardized API for reading and storing metered data')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // fs.writeFileSync('./src/schema.yaml', Yaml.stringify(document));

  await app.listen(3000);
}
bootstrap();
