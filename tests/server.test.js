const request = require('supertest');
const assert = require('assert')
const app = require('../server');

describe('GET /', () => {
  it('serves the landing page HTML', async function() {
    const res = await request(app)
      .get('/')
      .set('Accept', 'text/html');

    assert.equal(res.status, 200);
    assert.ok(res.type.includes('html'));
    assert.ok(res.text.includes('<main'));
  });
});

describe('GET /api/health', () => {
  it('responds to the world', async function() {
    const res = await request(app)
      .get('/api/health')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(res.type, 'application/json');
    assert.equal(res.body.message, 'Hello World!');
  });
});

describe('GET /404', () => {
  it('responds with a 404', async function() {
    const res = await request(app)
      .get('/404')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
  });
});
