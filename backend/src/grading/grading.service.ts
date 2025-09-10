import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { 
  DocumentCategoryGrade, 
  ReviewSubmission, 
  ReviewHistory, 
  ReviewStatus, 
  ReviewAction 
} from './entities';
import { 
  SubmitGradesDto, 
  UpdateGradeDto, 
  SubmitReviewDto, 
  ApproveSubmissionDto, 
  RejectSubmissionDto,
  OrganizationsQueryDto,
  CategoriesQueryDto,
  DocumentsQueryDto,
  FinalScoreQueryDto,
  OrganizationsResponseDto,
  CategoriesResponseDto,
  DocumentResponseDto,
  DocumentUrlResponseDto,
  SubmitGradesResponseDto,
  UpdateGradeResponseDto,
  FinalScoreResponseDto,
  ProgressResponseDto
} from './dto';

@Injectable()
export class GradingService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(DocumentCategoryGrade)
    private gradeRepository: Repository<DocumentCategoryGrade>,
    @InjectRepository(ReviewSubmission)
    private reviewRepository: Repository<ReviewSubmission>,
    @InjectRepository(ReviewHistory)
    private historyRepository: Repository<ReviewHistory>,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('S3_BUCKET_NAME');
  }

  // Document categories configuration
  private readonly DOCUMENT_CATEGORIES = [
    { id: 'board-meeting-minutes', name: 'Trailing 12 months of Board Meeting Minutes' },
    { id: 'aquatics-safety-third-party', name: 'Aquatics Safety Third-Party Visit Documentation' },
    { id: 'aquatics-safety-marketing', name: 'Aquatics Safety Marketing Collateral' },
    { id: 'strategic-plan', name: 'Strategic Plan' },
    { id: 'sublicense-agreement', name: 'Sublicense Agreement' },
    { id: 'membership-sops', name: 'Membership Standard Operating Procedures (SOPs)' },
    { id: 'aquatics-facility-assessment', name: 'Aquatics Facility Self-Assessment Results' },
    { id: 'membership-satisfaction-survey', name: 'Membership Satisfaction Survey / Self Assessment' },
    { id: 'membership-third-party-contract', name: 'Membership Third-Party Contract' },
    { id: 'risk-management-documents', name: 'Risk Management Documents' },
    { id: 'staff-performance-review', name: 'Staff Performance Review Forms' },
    { id: 'volunteer-spotlight', name: 'Non-Policy Volunteer Spotlight Example' },
    { id: 'volunteer-survey-results', name: 'Non-Policy Volunteer Survey Results' },
    { id: 'value-pricing-assessment', name: 'Value, Pricing, and Business Model Assessment Plan' },
    { id: 'community-partnerships', name: 'List of Community Partnerships' },
    { id: 'volunteer-training-materials', name: 'Non-Policy Volunteer Training Materials' },
    { id: 'community-benefit-documentation', name: 'Community Benefit Documentation' }
  ];

  async getOrganizations(query: OrganizationsQueryDto): Promise<OrganizationsResponseDto> {
    // This would typically query organizations with file uploads
    // For now, returning a mock response structure
    const organizations = [
      {
        organizationId: 'org-1',
        organizationName: 'YMCA of Example City',
        periodId: query.periodId || '2024-Q1',
        status: 'pending',
        totalCategories: 17,
        gradedCategories: 0,
        lastUploaded: new Date().toISOString(),
        dueDate: null,
        assignedReviewer: null
      }
    ];

    return {
      periodId: query.periodId || '2024-Q1',
      organizations,
      totalCount: organizations.length,
      hasMore: false
    };
  }

  async getOrganizationCategories(organizationId: string, query: CategoriesQueryDto): Promise<CategoriesResponseDto> {
    // Get existing grades for this organization and period
    const existingGrades = await this.gradeRepository.find({
      where: {
        organizationId,
        periodId: query.periodId
      }
    });

    const gradeMap = new Map(existingGrades.map(grade => [grade.categoryId, grade]));

    const categories = this.DOCUMENT_CATEGORIES.map(category => {
      const grade = gradeMap.get(category.id);
      return {
        categoryId: category.id,
        categoryName: category.name,
        hasDocuments: true, // This would be determined by checking file uploads
        documentCount: 1,
        totalSize: 1024000,
        uploadedAt: new Date().toISOString(),
        grade: grade?.score,
        reasoning: grade?.reasoning,
        reviewedAt: grade?.reviewedAt?.toISOString(),
        reviewerId: grade?.reviewerId
      };
    });

    return {
      organizationId,
      organizationName: 'YMCA of Example City', // This would come from organization lookup
      periodId: query.periodId,
      categories: query.includeGraded ? categories : categories.filter(c => !c.grade)
    };
  }

  async getDocuments(organizationId: string, categoryId: string, query: DocumentsQueryDto): Promise<DocumentResponseDto> {
    // This would query the file_uploads table for the specific organization, period, and category
    // For now, returning mock data
    return {
      uploadId: 'upload-123',
      categoryId,
      organizationId,
      periodId: query.periodId,
      files: [
        {
          originalName: `${categoryId}-document.pdf`,
          s3Key: `${organizationId}/${query.periodId}/${categoryId}/main/upload-123/document.pdf`,
          size: 1024000,
          type: 'application/pdf',
          uploadedAt: new Date().toISOString()
        }
      ],
      uploadedAt: new Date().toISOString()
    };
  }

  async getDocumentViewUrl(organizationId: string, categoryId: string, query: DocumentsQueryDto): Promise<DocumentUrlResponseDto> {
    const documents = await this.getDocuments(organizationId, categoryId, query);
    const s3Key = documents.files[0]?.s3Key;
    
    if (!s3Key) {
      throw new NotFoundException('No documents found for this category');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      url,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  }

  async getDocumentDownloadUrl(organizationId: string, categoryId: string, query: DocumentsQueryDto): Promise<DocumentUrlResponseDto> {
    // Same as view URL but with different response headers for download
    return this.getDocumentViewUrl(organizationId, categoryId, query);
  }

  async submitGrades(organizationId: string, submitGradesDto: SubmitGradesDto): Promise<SubmitGradesResponseDto> {
    const { periodId, grades, reviewerId } = submitGradesDto;

    // Validate that all required categories are present
    const requiredCategoryIds = this.DOCUMENT_CATEGORIES.map(c => c.id);
    const submittedCategoryIds = grades.map(g => g.categoryId);
    const missingCategories = requiredCategoryIds.filter(id => !submittedCategoryIds.includes(id));

    if (missingCategories.length > 0) {
      throw new BadRequestException(`Missing grades for categories: ${missingCategories.join(', ')}`);
    }

    // Save or update grades
    const savedGrades = [];
    for (const grade of grades) {
      const existingGrade = await this.gradeRepository.findOne({
        where: {
          organizationId,
          periodId,
          categoryId: grade.categoryId
        }
      });

      if (existingGrade) {
        existingGrade.score = grade.score;
        existingGrade.reasoning = grade.reasoning;
        existingGrade.reviewerId = grade.reviewerId;
        existingGrade.reviewedAt = new Date();
        await this.gradeRepository.save(existingGrade);
        savedGrades.push(existingGrade);
      } else {
        const newGrade = this.gradeRepository.create({
          organizationId,
          periodId,
          categoryId: grade.categoryId,
          score: grade.score,
          reasoning: grade.reasoning,
          reviewerId: grade.reviewerId,
          reviewedAt: new Date()
        });
        await this.gradeRepository.save(newGrade);
        savedGrades.push(newGrade);
      }

      // Log grading action
      await this.logReviewAction(organizationId, periodId, grade.categoryId, ReviewAction.GRADED, grade.reviewerId, {
        score: grade.score,
        reasoning: grade.reasoning
      });
    }

    const totalCategories = this.DOCUMENT_CATEGORIES.length;
    const gradedCategories = savedGrades.length;
    const overallProgress = ((gradedCategories / totalCategories) * 100).toFixed(1);

    return {
      success: true,
      periodId,
      organizationId,
      gradedCategories,
      totalCategories,
      overallProgress: `${overallProgress}%`,
      grades: savedGrades.map(grade => ({
        categoryId: grade.categoryId,
        score: grade.score,
        reasoning: grade.reasoning,
        reviewedAt: grade.reviewedAt.toISOString(),
        reviewerId: grade.reviewerId
      }))
    };
  }

  async updateGrade(organizationId: string, categoryId: string, updateGradeDto: UpdateGradeDto): Promise<UpdateGradeResponseDto> {
    const { score, reasoning, reviewerId } = updateGradeDto;

    const grade = await this.gradeRepository.findOne({
      where: {
        organizationId,
        categoryId
      }
    });

    if (!grade) {
      throw new NotFoundException('Grade not found for this category');
    }

    grade.score = score;
    grade.reasoning = reasoning;
    grade.reviewerId = reviewerId;
    grade.reviewedAt = new Date();

    await this.gradeRepository.save(grade);

    // Log update action
    await this.logReviewAction(organizationId, grade.periodId, categoryId, ReviewAction.GRADED, reviewerId, {
      score,
      reasoning,
      action: 'updated'
    });

    return {
      success: true,
      categoryId,
      score: grade.score,
      reasoning: grade.reasoning,
      reviewedAt: grade.reviewedAt.toISOString(),
      reviewerId: grade.reviewerId
    };
  }

  async submitReview(organizationId: string, submitReviewDto: SubmitReviewDto): Promise<void> {
    const { periodId, reviewerId, notes } = submitReviewDto;

    // Check if all categories are graded
    const grades = await this.gradeRepository.find({
      where: { organizationId, periodId }
    });

    if (grades.length !== this.DOCUMENT_CATEGORIES.length) {
      throw new BadRequestException('All categories must be graded before submission');
    }

    // Update or create review submission
    let reviewSubmission = await this.reviewRepository.findOne({
      where: { organizationId, periodId }
    });

    if (!reviewSubmission) {
      reviewSubmission = this.reviewRepository.create({
        organizationId,
        periodId,
        status: ReviewStatus.SUBMITTED,
        submittedBy: reviewerId,
        submittedAt: new Date()
      });
    } else {
      reviewSubmission.status = ReviewStatus.SUBMITTED;
      reviewSubmission.submittedBy = reviewerId;
      reviewSubmission.submittedAt = new Date();
    }

    await this.reviewRepository.save(reviewSubmission);

    // Log submission action
    await this.logReviewAction(organizationId, periodId, null, ReviewAction.SUBMITTED, reviewerId, {
      notes
    });
  }

  async approveSubmission(organizationId: string, approveDto: ApproveSubmissionDto): Promise<void> {
    const { periodId, reviewerId, approvalNotes } = approveDto;

    const reviewSubmission = await this.reviewRepository.findOne({
      where: { organizationId, periodId }
    });

    if (!reviewSubmission) {
      throw new NotFoundException('Review submission not found');
    }

    if (reviewSubmission.status !== ReviewStatus.SUBMITTED) {
      throw new BadRequestException('Submission must be in submitted status to approve');
    }

    // Calculate final score
    const grades = await this.gradeRepository.find({
      where: { organizationId, periodId }
    });

    const finalScore = grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;

    reviewSubmission.status = ReviewStatus.APPROVED;
    reviewSubmission.approvedBy = reviewerId;
    reviewSubmission.approvedAt = new Date();
    reviewSubmission.approvalNotes = approvalNotes;
    reviewSubmission.finalScore = finalScore;

    await this.reviewRepository.save(reviewSubmission);

    // Log approval action
    await this.logReviewAction(organizationId, periodId, null, ReviewAction.APPROVED, reviewerId, {
      finalScore,
      approvalNotes
    });
  }

  async rejectSubmission(organizationId: string, rejectDto: RejectSubmissionDto): Promise<void> {
    const { periodId, reviewerId, rejectionReason, rejectionNotes } = rejectDto;

    const reviewSubmission = await this.reviewRepository.findOne({
      where: { organizationId, periodId }
    });

    if (!reviewSubmission) {
      throw new NotFoundException('Review submission not found');
    }

    if (reviewSubmission.status !== ReviewStatus.SUBMITTED) {
      throw new BadRequestException('Submission must be in submitted status to reject');
    }

    reviewSubmission.status = ReviewStatus.REJECTED;
    reviewSubmission.rejectedBy = reviewerId;
    reviewSubmission.rejectedAt = new Date();
    reviewSubmission.rejectionReason = rejectionReason;
    reviewSubmission.rejectionNotes = rejectionNotes;

    await this.reviewRepository.save(reviewSubmission);

    // Log rejection action
    await this.logReviewAction(organizationId, periodId, null, ReviewAction.REJECTED, reviewerId, {
      rejectionReason,
      rejectionNotes
    });
  }

  async getFinalScore(organizationId: string, query: FinalScoreQueryDto): Promise<FinalScoreResponseDto> {
    const { periodId } = query;

    const grades = await this.gradeRepository.find({
      where: { organizationId, periodId }
    });

    if (grades.length === 0) {
      throw new NotFoundException('No grades found for this organization and period');
    }

    const finalScore = grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length;
    const maxScore = 10;
    const percentageScore = Math.round((finalScore / maxScore) * 100);

    let performanceCategory = 'low';
    if (finalScore >= 7) performanceCategory = 'high';
    else if (finalScore >= 4) performanceCategory = 'moderate';

    const categoryBreakdown = grades.map(grade => {
      const category = this.DOCUMENT_CATEGORIES.find(c => c.id === grade.categoryId);
      return {
        categoryId: grade.categoryId,
        categoryName: category?.name || grade.categoryId,
        score: grade.score,
        reasoning: grade.reasoning,
        reviewerId: grade.reviewerId,
        reviewedAt: grade.reviewedAt.toISOString()
      };
    });

    return {
      organizationId,
      organizationName: 'YMCA of Example City', // This would come from organization lookup
      periodId,
      finalScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal place
      maxScore,
      percentageScore,
      performanceCategory,
      categoryBreakdown,
      calculatedAt: new Date().toISOString()
    };
  }

  async getProgress(organizationId: string, periodId: string): Promise<ProgressResponseDto> {
    const grades = await this.gradeRepository.find({
      where: { organizationId, periodId }
    });

    const reviewSubmission = await this.reviewRepository.findOne({
      where: { organizationId, periodId }
    });

    const totalCategories = this.DOCUMENT_CATEGORIES.length;
    const gradedCategories = grades.length;
    const pendingCategories = totalCategories - gradedCategories;
    const overallGrade = gradedCategories > 0 ? grades.reduce((sum, grade) => sum + grade.score, 0) / gradedCategories : 0;

    const progressByCategory = grades.map(grade => {
      const category = this.DOCUMENT_CATEGORIES.find(c => c.id === grade.categoryId);
      return {
        categoryId: grade.categoryId,
        categoryName: category?.name || grade.categoryId,
        score: grade.score,
        reasoning: grade.reasoning,
        reviewerId: grade.reviewerId,
        reviewedAt: grade.reviewedAt.toISOString()
      };
    });

    return {
      organizationId,
      periodId,
      totalCategories,
      gradedCategories,
      pendingCategories,
      overallGrade: Math.round(overallGrade * 10) / 10,
      reviewStatus: reviewSubmission?.status || 'pending',
      assignedReviewer: null, // This would come from assignment logic
      dueDate: null, // This would come from assignment logic
      progressByCategory
    };
  }

  private async logReviewAction(
    organizationId: string,
    periodId: string,
    categoryId: string | null,
    action: ReviewAction,
    performedBy: string,
    details?: Record<string, any>
  ): Promise<void> {
    const historyEntry = this.historyRepository.create({
      organizationId,
      periodId,
      categoryId,
      action,
      performedBy,
      details
    });

    await this.historyRepository.save(historyEntry);
  }

  // New methods for frontend URL pattern endpoints
  async getDocumentViewUrlByPath(
    organizationId: string,
    periodId: string,
    categoryId: string,
    uploadType: string,
    uploadId: string,
    filename: string
  ) {
    // For now, return a mock response with the S3 key information
    // In production, this would generate actual presigned URLs
    const s3Key = `uploads/${organizationId}/${periodId}/${categoryId}/${uploadType}/${uploadId}/${filename}`;
    
    return {
      success: true,
      message: 'Document view URL generated',
      data: {
        viewUrl: `https://your-s3-bucket.s3.amazonaws.com/${s3Key}`,
        s3Key,
        organizationId,
        periodId,
        categoryId,
        uploadType,
        uploadId,
        filename,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      }
    };
  }

  async getDocumentDownloadUrlByPath(
    organizationId: string,
    periodId: string,
    categoryId: string,
    uploadType: string,
    uploadId: string,
    filename: string
  ) {
    // For now, return a mock response with the S3 key information
    // In production, this would generate actual presigned URLs
    const s3Key = `uploads/${organizationId}/${periodId}/${categoryId}/${uploadType}/${uploadId}/${filename}`;
    
    return {
      success: true,
      message: 'Document download URL generated',
      data: {
        downloadUrl: `https://your-s3-bucket.s3.amazonaws.com/${s3Key}`,
        s3Key,
        organizationId,
        periodId,
        categoryId,
        uploadType,
        uploadId,
        filename,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      }
    };
  }
}
