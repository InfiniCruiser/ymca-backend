"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubmissionsTable1700000000001 = void 0;
const typeorm_1 = require("typeorm");
class CreateSubmissionsTable1700000000001 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'submissions',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'periodId',
                    type: 'varchar',
                    length: '255',
                },
                {
                    name: 'totalQuestions',
                    type: 'int',
                },
                {
                    name: 'responses',
                    type: 'jsonb',
                },
                {
                    name: 'completed',
                    type: 'boolean',
                    default: true,
                },
                {
                    name: 'submittedBy',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'organizationId',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('submissions');
    }
}
exports.CreateSubmissionsTable1700000000001 = CreateSubmissionsTable1700000000001;
//# sourceMappingURL=001-create-submissions-table.js.map