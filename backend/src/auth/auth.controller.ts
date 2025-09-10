import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateRegularUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Double-check that this is not a tester
    if (user.isTester || user.role === 'TESTER') {
      throw new UnauthorizedException('Test users must use /api/v1/auth/tester-login endpoint');
    }
    
    return this.authService.login(user);
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
    
    // Double-check that this is actually a tester
    if (!user.isTester && user.role !== 'TESTER') {
      throw new UnauthorizedException('Regular users must use /api/v1/auth/login endpoint');
    }
    
    return this.authService.login(user);
  }

  @Post('verify')
  async verifyToken(@Request() req, @Body() body: { token?: string }) {
    let token: string;
    
    // Check if token is in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (body.token) {
      // Fallback: check if token is in request body
      token = body.token;
    } else {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the token manually
      const payload = this.authService.verifyToken(token);
      return {
        valid: true,
        user: {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          organizationId: payload.organizationId,
          isTester: payload.isTester
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
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
