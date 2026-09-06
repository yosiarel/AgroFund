import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Melihat profil pengguna saat ini' })
  @ApiResponse({ status: 200, description: 'Berhasil mengambil profil' })
  getProfile(@Request() req: any) {
    if (!req.user) {
      return null;
    }
    return this.userService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengubah profil pengguna' })
  @ApiResponse({ status: 200, description: 'Berhasil mengubah profil' })
  @ApiBody({ type: UpdateProfileDto })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengganti kata sandi pengguna' })
  @ApiResponse({ status: 200, description: 'Berhasil mengganti kata sandi' })
  @ApiBody({ type: ChangePasswordDto })
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.userId, dto);
  }
}
