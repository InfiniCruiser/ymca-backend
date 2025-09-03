"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationIdType1700000000002 = void 0;
class UpdateOrganizationIdType1700000000002 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD "organizationId" uuid`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "submissions" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD "organizationId" character varying(255)`);
    }
}
exports.UpdateOrganizationIdType1700000000002 = UpdateOrganizationIdType1700000000002;
//# sourceMappingURL=002-update-organization-id-type.js.map