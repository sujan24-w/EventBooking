import request from 'supertest';
import app from '../src/app'; // Make sure this exports your Express app instance

describe('EventBook Backend Business Rules & Endpoints', () => {
  let userCookie: string;

  // 1. Test public event listing
  test('GET /api/events should return paginated list of events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('events');
  });

  // 2. Test authentication login & cookie generation
  test('POST /api/auth/login should authenticate user and return cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@eventbook.com', password: 'UserPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    userCookie = res.headers['set-cookie'];
  });

  // 3. Test rule: Regular user cannot access admin routes
  test('GET /api/admin/dashboard should reject regular users with 403', async () => {
    if (!userCookie) {
      // Fallback login if userCookie wasn't set
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@eventbook.com', password: 'UserPassword123!' });
      userCookie = loginRes.headers['set-cookie'];
    }

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', userCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});