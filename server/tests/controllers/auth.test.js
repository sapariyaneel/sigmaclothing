const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user.model');

describe('Auth Controller', () => {
    describe('POST /api/auth/register', () => {
        const validUser = {
            email: 'test@example.com',
            password: 'Password123!',
            fullName: 'Test User',
            phone: '1234567890'
        };

        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', validUser.email);
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('should not register a user with existing email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(validUser);

            // Second registration with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Duplicate');
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('required');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await testSetup.createTestUser();
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('should not login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid credentials');
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid credentials');
        });
    });

    describe('GET /api/auth/logout', () => {
        let token;

        beforeEach(async () => {
            const user = await testSetup.createTestUser();
            token = testSetup.generateToken(user._id);
        });

        it('should logout successfully', async () => {
            const res = await request(app)
                .get('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('logged out');
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .get('/api/auth/logout');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        beforeEach(async () => {
            await testSetup.createTestUser();
        });

        it('should send reset password email for valid user', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('reset link');
        });

        it('should handle non-existent email gracefully', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/auth/reset-password/:token', () => {
        let user;
        let resetToken;

        beforeEach(async () => {
            user = await testSetup.createTestUser();
            resetToken = user.generateResetPasswordToken();
            await user.save();
        });

        it('should reset password with valid token', async () => {
            const res = await request(app)
                .put(`/api/auth/reset-password/${resetToken}`)
                .send({ password: 'newpassword123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('successfully');

            // Verify can login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: 'newpassword123'
                });

            expect(loginRes.status).toBe(200);
        });

        it('should not reset password with invalid token', async () => {
            const res = await request(app)
                .put('/api/auth/reset-password/invalidtoken')
                .send({ password: 'newpassword123' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should validate password requirements', async () => {
            const res = await request(app)
                .put(`/api/auth/reset-password/${resetToken}`)
                .send({ password: '123' }); // Too short

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('password');
        });
    });
}); 