import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@krishav/data';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const userRepository = {
    findOne: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
  } as unknown as JwtService;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(userRepository as never, jwtService);
  });

  it('returns JWT and safe user payload on valid credentials', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'admin@acme.com',
      name: 'Bob Admin',
      password: 'hashed',
      role: Role.ADMIN,
      organizationId: 1,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtService.sign as jest.Mock).mockReturnValue('jwt-token');

    const result = await service.login({
      email: 'admin@acme.com',
      password: 'password123',
    });

    expect(result).toEqual({
      access_token: 'jwt-token',
      user: {
        id: 1,
        email: 'admin@acme.com',
        name: 'Bob Admin',
        role: Role.ADMIN,
        organizationId: 1,
      },
    });
  });

  it('throws UnauthorizedException when user is missing', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@acme.com', password: 'x' })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'admin@acme.com',
      name: 'Bob Admin',
      password: 'hashed',
      role: Role.ADMIN,
      organizationId: 1,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'admin@acme.com', password: 'wrong' })
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
