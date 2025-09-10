import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @Post('tester-login')
  async testerLogin(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateTester(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid tester credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyToken(@Request() req) {
    // If we reach here, the JWT is valid (JwtAuthGuard validates it)
    return {
      valid: true,
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        organizationId: req.user.organizationId,
        isTester: req.user.isTester
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    // Get fresh user data and generate a new token
    const user = await this.authService.getUserById(req.user.sub);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the logout event for audit purposes
    console.log(`User ${req.user.email} logged out`);
    
    return {
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    };
  }
}
