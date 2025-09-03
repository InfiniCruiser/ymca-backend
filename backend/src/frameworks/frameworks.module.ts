import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Framework } from './entities/framework.entity';
import { Section } from './entities/section.entity';
import { Area } from './entities/area.entity';
import { Question } from './entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Framework, Section, Area, Question])],
  exports: [TypeOrmModule],
})
export class FrameworksModule {}
