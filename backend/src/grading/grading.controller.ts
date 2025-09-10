import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { GradingService } from './grading.service';
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

@ApiTags('grading')
@Controller('grading')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get grading API information',
    description: 'Returns information about available grading endpoints'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API information retrieved successfully'
  })
  async getApiInfo() {
    return {
      message: 'YMCA Grading Management API',
      version: '1.0.0',
      endpoints: {
        organizations: 'GET /api/v1/grading/organizations',
        categories: 'GET /api/v1/grading/organizations/{orgId}/categories',
        documents: 'GET /api/v1/grading/documents/{orgId}/{categoryId}',
        submitGrades: 'POST /api/v1/grading/organizations/{orgId}/grades',
        finalScore: 'GET /api/v1/grading/organizations/{orgId}/final-score'
      },
      documentation: process.env.API_DOCS_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com/api/docs'
    };
  }

  @Get('organizations')
  @ApiOperation({ 
    summary: 'Get organizations with pending submissions for grading',
    description: 'Returns list of organizations that have submitted documents for grading'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Organizations retrieved successfully',
    type: OrganizationsResponseDto
  })
  async getOrganizations(@Query() query: OrganizationsQueryDto): Promise<OrganizationsResponseDto> {
    return this.gradingService.getOrganizations(query);
  }

  @Get('organizations/:orgId/categories')
  @ApiOperation({ 
    summary: 'Get document categories for an organization',
    description: 'Returns the 17 document categories with upload status and review state'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories retrieved successfully',
    type: CategoriesResponseDto
  })
  async getOrganizationCategories(
    @Param('orgId') orgId: string,
    @Query() query: CategoriesQueryDto
  ): Promise<CategoriesResponseDto> {
    return this.gradingService.getOrganizationCategories(orgId, query);
  }

  @Get('documents/:orgId/:categoryId')
  @ApiOperation({ 
    summary: 'Get documents for a specific category',
    description: 'Returns document metadata and file information for a category'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documents retrieved successfully',
    type: DocumentResponseDto
  })
  async getDocuments(
    @Param('orgId') orgId: string,
    @Param('categoryId') categoryId: string,
    @Query() query: DocumentsQueryDto
  ): Promise<DocumentResponseDto> {
    return this.gradingService.getDocuments(orgId, categoryId, query);
  }

  @Get('documents/:orgId/:categoryId/view-url')
  @ApiOperation({ 
    summary: 'Get presigned URL for document viewing',
    description: 'Returns presigned S3 URL for in-browser document viewing'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'View URL generated successfully',
    type: DocumentUrlResponseDto
  })
  async getDocumentViewUrl(
    @Param('orgId') orgId: string,
    @Param('categoryId') categoryId: string,
    @Query() query: DocumentsQueryDto
  ): Promise<DocumentUrlResponseDto> {
    return this.gradingService.getDocumentViewUrl(orgId, categoryId, query);
  }

  @Get('documents/:orgId/:categoryId/download-url')
  @ApiOperation({ 
    summary: 'Get presigned URL for document download',
    description: 'Returns presigned S3 URL for document download'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Download URL generated successfully',
    type: DocumentUrlResponseDto
  })
  async getDocumentDownloadUrl(
    @Param('orgId') orgId: string,
    @Param('categoryId') categoryId: string,
    @Query() query: DocumentsQueryDto
  ): Promise<DocumentUrlResponseDto> {
    return this.gradingService.getDocumentDownloadUrl(orgId, categoryId, query);
  }

  // Additional endpoints to match frontend URL patterns
  @Get('documents/view/:organizationId/:periodId/:categoryId/:uploadType/:uploadId/:filename')
  @ApiOperation({ 
    summary: 'Get document view URL (frontend pattern)',
    description: 'Returns a presigned URL for viewing a document in the browser'
  })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiParam({ name: 'periodId', description: 'Period ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiParam({ name: 'uploadType', description: 'Upload type (main, additional)' })
  @ApiParam({ name: 'uploadId', description: 'Upload ID' })
  @ApiParam({ name: 'filename', description: 'File name' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document view URL retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentViewUrlByPath(
    @Param('organizationId') organizationId: string,
    @Param('periodId') periodId: string,
    @Param('categoryId') categoryId: string,
    @Param('uploadType') uploadType: string,
    @Param('uploadId') uploadId: string,
    @Param('filename') filename: string
  ) {
    return this.gradingService.getDocumentViewUrlByPath(organizationId, periodId, categoryId, uploadType, uploadId, filename);
  }

  @Get('documents/download/:organizationId/:periodId/:categoryId/:uploadType/:uploadId/:filename')
  @ApiOperation({ 
    summary: 'Get document download URL (frontend pattern)',
    description: 'Returns a presigned URL for downloading a document'
  })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiParam({ name: 'periodId', description: 'Period ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiParam({ name: 'uploadType', description: 'Upload type (main, additional)' })
  @ApiParam({ name: 'uploadId', description: 'Upload ID' })
  @ApiParam({ name: 'filename', description: 'File name' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document download URL retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentDownloadUrlByPath(
    @Param('organizationId') organizationId: string,
    @Param('periodId') periodId: string,
    @Param('categoryId') categoryId: string,
    @Param('uploadType') uploadType: string,
    @Param('uploadId') uploadId: string,
    @Param('filename') filename: string
  ) {
    return this.gradingService.getDocumentDownloadUrlByPath(organizationId, periodId, categoryId, uploadType, uploadId, filename);
  }

  @Post('organizations/:orgId/grades')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Submit grades for multiple categories',
    description: 'Submit grades for all 17 document categories at once'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiBody({ type: SubmitGradesDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Grades submitted successfully',
    type: SubmitGradesResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid grade data or missing categories' 
  })
  async submitGrades(
    @Param('orgId') orgId: string,
    @Body() submitGradesDto: SubmitGradesDto
  ): Promise<SubmitGradesResponseDto> {
    return this.gradingService.submitGrades(orgId, submitGradesDto);
  }

  @Put('organizations/:orgId/grades/:categoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update grade for a specific category',
    description: 'Update the grade and reasoning for a specific document category'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiBody({ type: UpdateGradeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Grade updated successfully',
    type: UpdateGradeResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Grade not found for this category' 
  })
  async updateGrade(
    @Param('orgId') orgId: string,
    @Param('categoryId') categoryId: string,
    @Body() updateGradeDto: UpdateGradeDto
  ): Promise<UpdateGradeResponseDto> {
    return this.gradingService.updateGrade(orgId, categoryId, updateGradeDto);
  }

  @Post('organizations/:orgId/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Submit all grades for final review',
    description: 'Submit all graded categories for final review and approval'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiBody({ type: SubmitReviewDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Review submitted successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'All categories must be graded before submission' 
  })
  async submitReview(
    @Param('orgId') orgId: string,
    @Body() submitReviewDto: SubmitReviewDto
  ): Promise<void> {
    return this.gradingService.submitReview(orgId, submitReviewDto);
  }

  @Post('organizations/:orgId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Approve the graded submission',
    description: 'Approve the submission and calculate final performance score'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiBody({ type: ApproveSubmissionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Submission approved successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Submission must be in submitted status to approve' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Review submission not found' 
  })
  async approveSubmission(
    @Param('orgId') orgId: string,
    @Body() approveDto: ApproveSubmissionDto
  ): Promise<void> {
    return this.gradingService.approveSubmission(orgId, approveDto);
  }

  @Post('organizations/:orgId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reject the graded submission',
    description: 'Reject the submission and return for revision'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiBody({ type: RejectSubmissionDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Submission rejected successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Submission must be in submitted status to reject' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Review submission not found' 
  })
  async rejectSubmission(
    @Param('orgId') orgId: string,
    @Body() rejectDto: RejectSubmissionDto
  ): Promise<void> {
    return this.gradingService.rejectSubmission(orgId, rejectDto);
  }

  @Get('organizations/:orgId/final-score')
  @ApiOperation({ 
    summary: 'Get calculated final performance score',
    description: 'Returns the calculated final performance score and category breakdown'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Final score retrieved successfully',
    type: FinalScoreResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No grades found for this organization and period' 
  })
  async getFinalScore(
    @Param('orgId') orgId: string,
    @Query() query: FinalScoreQueryDto
  ): Promise<FinalScoreResponseDto> {
    return this.gradingService.getFinalScore(orgId, query);
  }

  @Get('organizations/:orgId/progress')
  @ApiOperation({ 
    summary: 'Get grading progress for an organization',
    description: 'Returns the current grading progress and status'
  })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiQuery({ name: 'periodId', description: 'Period ID', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Progress retrieved successfully',
    type: ProgressResponseDto
  })
  async getProgress(
    @Param('orgId') orgId: string,
    @Query('periodId') periodId: string
  ): Promise<ProgressResponseDto> {
    return this.gradingService.getProgress(orgId, periodId);
  }
}
