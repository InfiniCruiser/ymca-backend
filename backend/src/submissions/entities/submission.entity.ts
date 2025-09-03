import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  periodId: string;

  @Column({ type: 'int' })
  totalQuestions: number;

  @Column({ type: 'jsonb' })
  responses: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  completed: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  submittedBy: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
