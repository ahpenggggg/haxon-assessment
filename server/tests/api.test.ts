import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildZip, createTestApp, SAMPLE_FILE } from './helpers/testApp.js';

let app: Express;
let reset: () => Promise<void>;
let close: () => Promise<void>;

const DATABASE_STARTUP_TIMEOUT_MS = 30_000;

beforeAll(async () => {
  ({ app, reset, close } = await createTestApp());
}, DATABASE_STARTUP_TIMEOUT_MS);

beforeEach(async () => {
  await reset();
});

afterAll(async () => {
  await close();
});

async function registeredAgent(email: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ email, password: 'password123' }).expect(201);
  return agent;
}

describe('auth', () => {
  it('registers, reads the session, logs out and logs back in', async () => {
    const agent = request.agent(app);

    const register = await agent
      .post('/api/auth/register')
      .send({ email: ' User@Example.com ', password: 'password123' })
      .expect(201);
    expect(register.body.user.email).toBe('user@example.com');
    expect(register.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);

    await agent.get('/api/auth/me').expect(200);
    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);

    await agent.post('/api/auth/login').send({ email: 'user@example.com', password: 'password123' }).expect(200);
    await agent.get('/api/auth/me').expect(200);
  });

  it('rejects a duplicate email, a short password and wrong credentials', async () => {
    await registeredAgent('a@example.com');

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'A@example.com', password: 'password123' })
      .expect(409);
    await request(app).post('/api/auth/register').send({ email: 'b@example.com', password: 'short' }).expect(400);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@example.com', password: 'wrong-password' })
      .expect(401);
    expect(login.body).toEqual({ error: { message: 'Incorrect email or password.' } });
  });

  it('rejects a tampered token', async () => {
    await request(app).get('/api/auth/me').set('Cookie', 'access_token=not-a-jwt').expect(401);
  });
});

describe('locations', () => {
  it('requires authentication', async () => {
    await request(app).get('/api/locations').expect(401);
    await request(app).post('/api/locations').send({ name: 'A', latitude: 1, longitude: 2 }).expect(401);
    await request(app).post('/api/locations/upload').expect(401);
  });

  it('creates and lists locations', async () => {
    const agent = await registeredAgent('a@example.com');

    const created = await agent
      .post('/api/locations')
      .send({ name: '  Suria KLCC ', latitude: 3.157324409, longitude: 101.7121981 })
      .expect(201);
    expect(created.body.location).toMatchObject({ name: 'Suria KLCC', latitude: 3.157324409, longitude: 101.7121981 });

    const list = await agent.get('/api/locations').expect(200);
    expect(list.body.locations).toEqual([created.body.location]);
  });

  it('validates the location form input', async () => {
    const agent = await registeredAgent('a@example.com');
    const response = await agent.post('/api/locations').send({ name: 'A', latitude: 95, longitude: 2 }).expect(400);
    expect(response.body.error.message).toBe('Latitude must be a number between -90 and 90.');
    await agent.post('/api/locations').send({ name: 'A', latitude: '1', longitude: 2 }).expect(400);
  });

  it("never shows one user's locations to another user", async () => {
    const userA = await registeredAgent('a@example.com');
    const userB = await registeredAgent('b@example.com');

    for (let i = 0; i < 5; i += 1) {
      await userA.post('/api/locations').send({ name: `A${i}`, latitude: i, longitude: i }).expect(201);
    }
    await userA
      .post('/api/locations/upload')
      .attach('file', buildZip({ 'locations.txt': SAMPLE_FILE }), 'locations.zip')
      .expect(201);

    expect((await userA.get('/api/locations')).body.locations).toHaveLength(7);
    expect((await userB.get('/api/locations')).body.locations).toEqual([]);
  });
});

describe('locations upload', () => {
  it('imports every location from a ZIP holding one text file', async () => {
    const agent = await registeredAgent('a@example.com');

    const response = await agent
      .post('/api/locations/upload')
      .attach('file', buildZip({ 'locations.txt': SAMPLE_FILE }), 'locations.zip')
      .expect(201);

    expect(response.body.locations).toMatchObject([
      { name: 'Suria KLCC', latitude: 3.157324409, longitude: 101.7121981 },
      { name: 'Zoo Negara', latitude: 3.2105416, longitude: 101.75920504 },
    ]);
    expect((await agent.get('/api/locations')).body.locations).toHaveLength(2);
  });

  it('rejects a ZIP that holds anything other than a single text file, importing nothing', async () => {
    const agent = await registeredAgent('a@example.com');

    const response = await agent
      .post('/api/locations/upload')
      .attach('file', buildZip({ 'a.txt': SAMPLE_FILE, 'b.txt': SAMPLE_FILE }), 'locations.zip')
      .expect(400);

    expect(response.body.error.message).toBe('The ZIP file must contain exactly one .txt file and nothing else.');
    expect((await agent.get('/api/locations')).body.locations).toEqual([]);
  });

  it('rejects a file with an invalid line, importing nothing', async () => {
    const agent = await registeredAgent('a@example.com');

    await agent
      .post('/api/locations/upload')
      .attach('file', buildZip({ 'a.txt': `${SAMPLE_FILE}\nBad,999,1` }), 'locations.zip')
      .expect(400);

    expect((await agent.get('/api/locations')).body.locations).toEqual([]);
  });

  it('rejects a missing file and a second file', async () => {
    const agent = await registeredAgent('a@example.com');
    const zip = buildZip({ 'a.txt': SAMPLE_FILE });

    await agent.post('/api/locations/upload').expect(400);
    await agent
      .post('/api/locations/upload')
      .attach('file', zip, 'one.zip')
      .attach('file', zip, 'two.zip')
      .expect(400);
  });
});
