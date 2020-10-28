import request from 'supertest';
import { app } from '../app';
import { AuthService } from './auth.service';
const authService = new AuthService();
authService.setupPassport();
import '../sequelize';
import { User } from '../user/user.model';
import { Like } from '../like/like.model';

const MOCKED_USER = { username: 'test123456', password: 'test132' };

async function clearDatabase() {
  await Like.destroy({ truncate: true, cascade: true });
  return await User.destroy({ truncate: true, cascade: true });
}

describe('Sign up user POST /signup', () => {
  it('Valid request for signup should return user', async () => {
    const res = await request(app)
      .post('/signup')
      .set('Content-Type', 'application/json')
      .send(MOCKED_USER)
      .expect(res => {
        expect(res.body.user.username).toBe(MOCKED_USER.username);
        expect(res.body.user.password).toBeDefined();
        expect(res.status).toEqual(201);
      });
  });
});

describe('Log in user POST /login', () => {
  it('Should login user that exists', async () => {
    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(MOCKED_USER)
      .expect(async res => {
        expect(res.body.token).toBeDefined();
        expect(res.status).toEqual(200);
        await clearDatabase();
      });
  });
});

describe('Forbidden login for user that does not exist user POST /login', () => {
  it('Should not login user that  does not exists', async () => {
    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send({
        username: 'doesnotexist',
        password: 'whatever',
      })
      .expect(res => {
        expect(res.status).toEqual(401);
      });
  });
});

describe('Unauthorized login for user that does not provide correct password for user POST /login', () => {
  it('Should not login user with invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send({
        username: MOCKED_USER.username,
        password: 'whatever',
      })
      .expect(res => {
        expect(res.status).not.toEqual(200);
      });
  });
});

describe('Get authenticated user GET /me', () => {
  it('Should login user that exists', async () => {
    const response = await request(app)
      .get('/me')
      .set('Content-Type', 'application/json')
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxMjM0IiwiaWF0IjoxNjAzODgxMjMwfQ.Drxa_8EzPkJ4aOm386i6A2ukGgaWcR1qHvcY_j_AR7U',
      )
      .send()
      .expect(res => {
        expect(res.body.user).toBeDefined();
        expect(res.status).toEqual(200);
      });
  });
});
