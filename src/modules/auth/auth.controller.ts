import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { SignInDto } from './dto/singIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PayloadToken } from '@/common/types/payloadToken.type';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ResponseMessage('Signin successful')
  async signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data);
  }

  @Post('refresh-tokens')
  @ResponseMessage('Tokens refreshed successfully')
  async refreshTokens(@Body() data: RefreshTokenDto) {
    return this.authService.refreshTokens(data);
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('User profile fetched successfully')
  async getProfile(@CurrentUser() user: PayloadToken) {
    const userId = user.id;
    return await this.authService.getProfile(userId!);
  }
  @Post('sign-up')
  @ResponseMessage('Signup successful')
  async signUp(@Body() data: SignUpDto) {
    return await this.authService.signUp(data);
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Logout successful')
  logout(@CurrentUser() user: PayloadToken) {
    return this.authService.logout(user.id!);
  }
  @Post('forgot-password')
  @ResponseMessage('Password reset link sent successfully')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    return await this.authService.forgotPassword(data);
  }
  @Post('reset-password')
  @ResponseMessage('Password reset successful')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return await this.authService.resetPassword(data);
  }
}
