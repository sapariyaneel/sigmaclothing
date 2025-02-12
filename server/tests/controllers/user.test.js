const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');

describe('User Controller', () => {
    let userToken;
    let adminToken;
    let testUser;
    let testAdmin;

    beforeEach(async () => {
        // Create admin user
        testAdmin = await testSetup.createTestUser({ 
            email: 'admin@example.com',
            role: 'admin' 
        });
        adminToken = testSetup.generateToken(testAdmin._id, 'admin');

        // Create regular user
        testUser = await testSetup.createTestUser({ 
            email: 'user@example.com',
            role: 'user' 
        });
        userToken = testSetup.generateToken(testUser._id, 'user');
    });

    describe('GET /api/users/profile', () => {
        it('should get user profile when authenticated', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testUser.email);
            expect(res.body.data.password).toBeUndefined();
        });

        it('should not get profile without authentication', async () => {
            const res = await request(app)
                .get('/api/users/profile');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile when authenticated', async () => {
            const update = {
                name: 'Updated Name',
                phone: '1234567890'
            };

            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send(update);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(update.name);
            expect(res.body.data.phone).toBe(update.phone);
        });

        it('should not update email', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ email: 'newemail@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should hash password if updated', async () => {
            const update = { password: 'newpassword123' };

            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send(update);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser.password).not.toBe(update.password);
            expect(updatedUser.password).toHaveLength(60); // bcrypt hash length
        });
    });

    describe('GET /api/users/wishlist', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await testSetup.createTestProduct();
            await User.findByIdAndUpdate(testUser._id, {
                $push: { wishlist: testProduct._id }
            });
        });

        it('should get user wishlist when authenticated', async () => {
            const res = await request(app)
                .get('/api/users/wishlist')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data[0]._id).toBe(testProduct._id.toString());
        });

        it('should not get wishlist without authentication', async () => {
            const res = await request(app)
                .get('/api/users/wishlist');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/users/wishlist/:productId', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await testSetup.createTestProduct();
        });

        it('should add product to wishlist when authenticated', async () => {
            const res = await request(app)
                .post(`/api/users/wishlist/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.wishlist).toContain(testProduct._id.toString());
        });

        it('should not add same product twice', async () => {
            await request(app)
                .post(`/api/users/wishlist/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            const res = await request(app)
                .post(`/api/users/wishlist/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/users/wishlist/:productId', () => {
        let testProduct;

        beforeEach(async () => {
            testProduct = await testSetup.createTestProduct();
            await User.findByIdAndUpdate(testUser._id, {
                $push: { wishlist: testProduct._id }
            });
        });

        it('should remove product from wishlist when authenticated', async () => {
            const res = await request(app)
                .delete(`/api/users/wishlist/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.wishlist).not.toContain(testProduct._id.toString());
        });

        it('should handle removing non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .delete(`/api/users/wishlist/${fakeId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/users (Admin)', () => {
        it('should get all users when admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should not allow access to non-admin users', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/users/:id (Admin)', () => {
        it('should get user by id when admin', async () => {
            const res = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(testUser._id.toString());
        });

        it('should not allow access to non-admin users', async () => {
            const res = await request(app)
                .get(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/users/:id (Admin)', () => {
        it('should update user when admin', async () => {
            const update = {
                name: 'Admin Updated',
                role: 'admin'
            };

            const res = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(update);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(update.name);
            expect(res.body.data.role).toBe(update.role);
        });

        it('should not allow updates by non-admin users', async () => {
            const res = await request(app)
                .put(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Updated' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/users/:id (Admin)', () => {
        it('should delete user when admin', async () => {
            const res = await request(app)
                .delete(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const deletedUser = await User.findById(testUser._id);
            expect(deletedUser).toBeNull();
        });

        it('should not allow deletion by non-admin users', async () => {
            const res = await request(app)
                .delete(`/api/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should not allow admin to delete themselves', async () => {
            const res = await request(app)
                .delete(`/api/users/${testAdmin._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
}); 