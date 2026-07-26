import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // TypeORM的装饰器，用于注入Repository实例
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt'; // NestJS的JWT（JSON web tokens）服务，用于生成和验证JWT令牌
import { Repository } from 'typeorm'; // TypeORM的Repository类，用于数据库操作
import { ethers } from 'ethers';
// 授权随机数
import { AuthNonce } from './auth-nonce.entity';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthNonce)
    private readonly authNonceRepo: Repository<AuthNonce>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 规范化地址（转换为checksum地址是后面的字母大写，标准格式，方便比较）
  private normalizeAddress(address: string) {
    return ethers.getAddress(address);
  }

  // 构建登录消息，包含钱包地址、随机数和过期时间等信息，供用户签名验证身份
  private buildMessage(
    walletAddress: string,
    nonce: string,
    expiredAt: number,
  ) {
    return [
      'Welcome to Huan Morpho',
      '',
      `Wallet Address: ${walletAddress}`,
      `Nonce: ${nonce}`,
      `Expiration Time: ${expiredAt}`,
      '',
      'This request will not trigger a blockchain transaction or cost any gas.',
    ].join('\n');
  }

  // 请求登录，生成随机数和消息，并保存到数据库中，返回给前端供用户签名
  async requestWalletLogin(walletAddress: string) {
    // 规范化钱包地址
    const normalizedAddress = this.normalizeAddress(walletAddress);
    // 生成随机数
    const nonce = randomBytes(16).toString('hex');
    const now = Date.now();
    // 5 minutes
    const expiredAt =
      now + Number(process.env.LOGIN_NONCE_EXPIRES_MS ?? '300000');
    // create message
    const message = this.buildMessage(normalizedAddress, nonce, expiredAt);

    // save to db
    const authNonce = this.authNonceRepo.create({
      walletAddress: normalizedAddress,
      nonce,
      message,
      used: false,
      expiredAt,
      createdAt: now,
    });

    await this.authNonceRepo.save(authNonce);

    console.log(
      `Generated login nonce for address ${normalizedAddress}: ${nonce} (expires at ${new Date(
        expiredAt,
      ).toISOString()})`,
    );

    return {
      walletAddress: normalizedAddress,
      nonce,
      message,
      expiredAt,
    };
  }

  // 验证登录，检查随机数和消息是否匹配，验证签名是否正确，生成JWT令牌并返回用户信息
  // signature是用户使用钱包签名后的结果，message是之前生成的登录消息，walletAddress是用户的钱包地址
  async verifyWalletLogin(
    walletAddress: string,
    message: string,
    signature: string,
  ) {
    const normalizedAddress = this.normalizeAddress(walletAddress);

    const authNonce = await this.authNonceRepo.findOne({
      where: {
        walletAddress: normalizedAddress,
        message,
        used: false,
      },
      order: {
        id: 'DESC',
      },
    });

    if (!authNonce) {
      throw new UnauthorizedException('Challenge not found');
    }

    if (authNonce.expiredAt < Date.now()) {
      throw new UnauthorizedException('Challenge expired');
    }

    // ethers.verifyMessage 会根据 message 和 signature 恢复出签名者的地址，然后我们将其与用户提供的 walletAddress 进行比较，以验证签名的有效性
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (this.normalizeAddress(recoveredAddress) !== normalizedAddress) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 使用签名的随机数标记为已使用
    authNonce.used = true;
    await this.authNonceRepo.save(authNonce);

    let user = await this.userRepo.findOne({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      const now = Date.now();
      user = this.userRepo.create({
        walletAddress: normalizedAddress,
        createdAt: now,
        updatedAt: now,
      });
      await this.userRepo.save(user);
    } else {
      user.updatedAt = Date.now();
      await this.userRepo.save(user);
    }

    // JWT的payload中通常包含用户的唯一标识（如用户ID）和其他相关信息（如钱包地址），以便后续验证和授权使用
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      walletAddress: user.walletAddress,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
      },
    };
  }

  // 获取当前用户信息，根据用户ID查询数据库，如果用户不存在则抛出异常
  async getMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
