import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { SignInDto } from './dto/singIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PayloadToken } from '@/common/types/payloadToken.type';

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
}
