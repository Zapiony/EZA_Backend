import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SimulationAuthController, SimulationAuthService } from './simulation-mocks';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

// Mock Config Service or just hardcode secret for test
const TEST_SECRET = 'test-secret-key-123';

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: TEST_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}

describe('Simulation Backend (InMemory)', () => {
  let app: INestApplication;

  // Increase timeout to allow the server to run indefinitely (until user stops it)
  jest.setTimeout(2147483647);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: TEST_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [SimulationAuthController],
      providers: [
        SimulationAuthService,
        TestJwtStrategy,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable CORS as requested
    app.enableCors({
      origin: '*', // Allow all origins for testing
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Start listening on port 3000
    await app.listen(3000);
    console.log('----------------------------------------------------------------');
    console.log('🚀 SIMULATION SERVER RUNNING ON http://localhost:3000');
    console.log('   - Database: In-Memory List (Reset on restart)');
    console.log('   - Auth: Enabled (Mock)');
    console.log('   - CORS: Enabled (*)');
    console.log('Press Ctrl+C to stop.');
    console.log('----------------------------------------------------------------');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should keep the server running for manual testing', async () => {
    // This promise effectively keeps the Jest process alive
    await new Promise(() => { });
  });
});
