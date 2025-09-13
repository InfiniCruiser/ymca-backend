import { CeoApprovalService } from './ceo-approval.service';
import { Submission } from './entities/submission.entity';
export declare class SubmissionsController {
    private readonly ceoApprovalService;
    constructor(ceoApprovalService: CeoApprovalService);
    editSubmission(organizationId: string, periodId: string, updates: Partial<Submission>, req: any): Promise<Submission>;
}
