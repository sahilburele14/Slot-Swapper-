// backend/tests/swap.test.js
// Sample test file for the swap functionality

const request = require('supertest');
const app = require('../server'); // You'll need to export app from server.js
const db = require('../config/db');

describe('Swap Request Tests', () => {
  let user1Token, user2Token;
  let user1Id, user2Id;
  let event1Id, event2Id;

  beforeAll(async () => {
    // Clean up database
    await db.query('DELETE FROM swap_requests');
    await db.query('DELETE FROM events');
    await db.query('DELETE FROM users');

    // Create two test users
    const user1Response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'User One',
        email: 'user1@test.com',
        password: 'password123'
      });
    
    user1Token = user1Response.body.token;
    user1Id = user1Response.body.user.id;

    const user2Response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'User Two',
        email: 'user2@test.com',
        password: 'password123'
      });
    
    user2Token = user2Response.body.token;
    user2Id = user2Response.body.user.id;

    // Create events for both users
    const event1Response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'User 1 Event',
        startTime: '2024-12-01T10:00:00Z',
        endTime: '2024-12-01T11:00:00Z',
        status: 'SWAPPABLE'
      });
    
    event1Id = event1Response.body.event.id;

    const event2Response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        title: 'User 2 Event',
        startTime: '2024-12-01T14:00:00Z',
        endTime: '2024-12-01T15:00:00Z',
        status: 'SWAPPABLE'
      });
    
    event2Id = event2Response.body.event.id;
  });

  afterAll(async () => {
    // Clean up
    await db.query('DELETE FROM swap_requests');
    await db.query('DELETE FROM events');
    await db.query('DELETE FROM users');
    await db.pool.end();
  });

  describe('GET /api/swappable-slots', () => {
    it('should return only other users swappable slots', async () => {
      const response = await request(app)
        .get('/api/swappable-slots')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.swappableSlots).toHaveLength(1);
      expect(response.body.swappableSlots[0].id).toBe(event2Id);
      expect(response.body.swappableSlots[0].user_id).toBe(user2Id);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/swappable-slots')
        .expect(401);
    });
  });

  describe('POST /api/swap-request', () => {
    it('should create a swap request successfully', async () => {
      const response = await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: event1Id,
          theirSlotId: event2Id
        })
        .expect(201);

      expect(response.body.message).toBe('Swap request created successfully');
      expect(response.body.swapRequest).toHaveProperty('id');
      expect(response.body.swapRequest.status).toBe('PENDING');
    });

    it('should set both events to SWAP_PENDING', async () => {
      const event1 = await db.query('SELECT status FROM events WHERE id = $1', [event1Id]);
      const event2 = await db.query('SELECT status FROM events WHERE id = $1', [event2Id]);

      expect(event1.rows[0].status).toBe('SWAP_PENDING');
      expect(event2.rows[0].status).toBe('SWAP_PENDING');
    });

    it('should reject swap with own slot', async () => {
      // Create another event for user1
      const event3Response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Another Event',
          startTime: '2024-12-02T10:00:00Z',
          endTime: '2024-12-02T11:00:00Z',
          status: 'SWAPPABLE'
        });

      const event3Id = event3Response.body.event.id;

      await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: event1Id,
          theirSlotId: event3Id
        })
        .expect(400);
    });

    it('should reject swap with non-swappable slot', async () => {
      // Create a BUSY event
      const busyEventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'Busy Event',
          startTime: '2024-12-03T10:00:00Z',
          endTime: '2024-12-03T11:00:00Z',
          status: 'BUSY'
        });

      const busyEventId = busyEventResponse.body.event.id;

      // Create swappable event for user1
      const swappableEventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Swappable Event',
          startTime: '2024-12-03T14:00:00Z',
          endTime: '2024-12-03T15:00:00Z',
          status: 'SWAPPABLE'
        });

      const swappableEventId = swappableEventResponse.body.event.id;

      await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: swappableEventId,
          theirSlotId: busyEventId
        })
        .expect(400);
    });
  });

  describe('POST /api/swap-response/:id', () => {
    let swapRequestId;

    beforeEach(async () => {
      // Clean up and create fresh events
      await db.query('DELETE FROM swap_requests');
      await db.query('DELETE FROM events');

      const event1Response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Fresh Event',
          startTime: '2024-12-05T10:00:00Z',
          endTime: '2024-12-05T11:00:00Z',
          status: 'SWAPPABLE'
        });
      
      event1Id = event1Response.body.event.id;

      const event2Response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          title: 'User 2 Fresh Event',
          startTime: '2024-12-05T14:00:00Z',
          endTime: '2024-12-05T15:00:00Z',
          status: 'SWAPPABLE'
        });
      
      event2Id = event2Response.body.event.id;

      // Create swap request
      const swapResponse = await request(app)
        .post('/api/swap-request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          mySlotId: event1Id,
          theirSlotId: event2Id
        });

      swapRequestId = swapResponse.body.swapRequest.id;
    });

    it('should accept swap and exchange event ownership', async () => {
      const response = await request(app)
        .post(`/api/swap-response/${swapRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ accept: true })
        .expect(200);

      expect(response.body.message).toBe('Swap accepted successfully');

      // Verify ownership swap
      const event1After = await db.query('SELECT user_id, status FROM events WHERE id = $1', [event1Id]);
      const event2After = await db.query('SELECT user_id, status FROM events WHERE id = $1', [event2Id]);

      expect(event1After.rows[0].user_id).toBe(user2Id);
      expect(event1After.rows[0].status).toBe('BUSY');
      
      expect(event2After.rows[0].user_id).toBe(user1Id);
      expect(event2After.rows[0].status).toBe('BUSY');

      // Verify swap request status
      const swapRequest = await db.query('SELECT status FROM swap_requests WHERE id = $1', [swapRequestId]);
      expect(swapRequest.rows[0].status).toBe('ACCEPTED');
    });

    it('should reject swap and restore SWAPPABLE status', async () => {
      const response = await request(app)
        .post(`/api/swap-response/${swapRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ accept: false })
        .expect(200);

      expect(response.body.message).toBe('Swap rejected successfully');

      // Verify ownership unchanged
      const event1After = await db.query('SELECT user_id, status FROM events WHERE id = $1', [event1Id]);
      const event2After = await db.query('SELECT user_id, status FROM events WHERE id = $1', [event2Id]);

      expect(event1After.rows[0].user_id).toBe(user1Id);
      expect(event1After.rows[0].status).toBe('SWAPPABLE');
      
      expect(event2After.rows[0].user_id).toBe(user2Id);
      expect(event2After.rows[0].status).toBe('SWAPPABLE');

      // Verify swap request status
      const swapRequest = await db.query('SELECT status FROM swap_requests WHERE id = $1', [swapRequestId]);
      expect(swapRequest.rows[0].status).toBe('REJECTED');
    });

    it('should not allow unauthorized user to respond', async () => {
      await request(app)
        .post(`/api/swap-response/${swapRequestId}`)
        .set('Authorization', `Bearer ${user1Token}`) // user1 created the request
        .send({ accept: true })
        .expect(403);
    });

    it('should not allow responding to already processed request', async () => {
      // Accept once
      await request(app)
        .post(`/api/swap-response/${swapRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ accept: true })
        .expect(200);

      // Try to respond again
      await request(app)
        .post(`/api/swap-response/${swapRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ accept: false })
        .expect(400);
    });
  });

  describe('GET /api/swap-requests/incoming', () => {
    it('should return incoming swap requests', async () => {
      const response = await request(app)
        .get('/api/swap-requests/incoming')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body.incomingRequests).toBeInstanceOf(Array);
      expect(response.body.incomingRequests.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/swap-requests/outgoing', () => {
    it('should return outgoing swap requests', async () => {
      const response = await request(app)
        .get('/api/swap-requests/outgoing')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.outgoingRequests).toBeInstanceOf(Array);
      expect(response.body.outgoingRequests.length).toBeGreaterThan(0);
    });
  });
});

// =====================================================
// To make this work, modify backend/server.js to export the app:
// =====================================================

// At the end of server.js, instead of just app.listen(), do:

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;

// =====================================================
// Run tests with:
// npm test
// =====================================================