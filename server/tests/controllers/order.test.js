const request = require('supertest');
const app = require('../../app');
const Order = require('../../models/order.model');

describe('Order Controller', () => {
    let userToken;
    let adminToken;
    let testProduct;
    let testOrder;
    let testUser;

    beforeEach(async () => {
        // Create admin user
        const admin = await testSetup.createTestUser({ role: 'admin' });
        adminToken = testSetup.generateToken(admin._id, 'admin');

        // Create regular user
        testUser = await testSetup.createTestUser({ 
            email: 'user@example.com',
            role: 'user' 
        });
        userToken = testSetup.generateToken(testUser._id, 'user');

        // Create test product
        testProduct = await testSetup.createTestProduct();

        // Create test order
        testOrder = await testSetup.createTestOrder(testUser._id, [testProduct._id]);
    });

    describe('POST /api/orders', () => {
        const orderData = {
            items: [],
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'card'
        };

        beforeEach(() => {
            orderData.items = [{
                product: testProduct._id,
                quantity: 2,
                size: 'M',
                color: 'Blue'
            }];
        });

        it('should create new order when authenticated', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toBe(testUser._id.toString());
            expect(res.body.data.items).toHaveLength(1);
            expect(res.body.data.status).toBe('pending');
        });

        it('should not create order without authentication', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send(orderData);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('required');
        });

        it('should validate product stock availability', async () => {
            orderData.items[0].quantity = 999; // More than available stock

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${userToken}`)
                .send(orderData);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('stock');
        });
    });

    describe('GET /api/orders/my-orders', () => {
        it('should get user\'s orders when authenticated', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data[0].user).toBe(testUser._id.toString());
        });

        it('should not get orders without authentication', async () => {
            const res = await request(app)
                .get('/api/orders/my-orders');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should get order by id for owner', async () => {
            const res = await request(app)
                .get(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(testOrder._id.toString());
        });

        it('should get any order when admin', async () => {
            const res = await request(app)
                .get(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should not get order of other user', async () => {
            const otherUser = await testSetup.createTestUser({ 
                email: 'other@example.com' 
            });
            const otherToken = testSetup.generateToken(otherUser._id, 'user');

            const res = await request(app)
                .get(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        it('should update order status when admin', async () => {
            const res = await request(app)
                .put(`/api/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'processing' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('processing');
        });

        it('should not update status without admin rights', async () => {
            const res = await request(app)
                .put(`/api/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ status: 'processing' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should validate status value', async () => {
            const res = await request(app)
                .put(`/api/orders/${testOrder._id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'invalid_status' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('should cancel order when owner and order is pending', async () => {
            const res = await request(app)
                .delete(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const cancelledOrder = await Order.findById(testOrder._id);
            expect(cancelledOrder.status).toBe('cancelled');
        });

        it('should not cancel order when processing', async () => {
            await Order.findByIdAndUpdate(testOrder._id, { status: 'processing' });

            const res = await request(app)
                .delete(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should not cancel order of other user', async () => {
            const otherUser = await testSetup.createTestUser({ 
                email: 'other@example.com' 
            });
            const otherToken = testSetup.generateToken(otherUser._id, 'user');

            const res = await request(app)
                .delete(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
}); 