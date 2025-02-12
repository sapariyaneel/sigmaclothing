const request = require('supertest');
const app = require('../../app');
const Product = require('../../models/product.model');

describe('Product Controller', () => {
    let adminToken;
    let userToken;
    let testProduct;

    beforeEach(async () => {
        // Create admin user
        const admin = await testSetup.createTestUser({ role: 'admin' });
        adminToken = testSetup.generateToken(admin._id, 'admin');

        // Create regular user
        const user = await testSetup.createTestUser({ 
            email: 'user@example.com',
            role: 'user' 
        });
        userToken = testSetup.generateToken(user._id, 'user');

        // Create test product
        testProduct = await testSetup.createTestProduct();
    });

    describe('GET /api/products', () => {
        it('should get all products', async () => {
            const res = await request(app)
                .get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe(testProduct.name);
        });

        it('should filter products by category', async () => {
            // Create another product with different category
            await testSetup.createTestProduct({ 
                category: 'women',
                name: 'Women\'s Product' 
            });

            const res = await request(app)
                .get('/api/products')
                .query({ category: 'men' });

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].category).toBe('men');
        });

        it('should search products by name', async () => {
            await testSetup.createTestProduct({ 
                name: 'Unique Product Name' 
            });

            const res = await request(app)
                .get('/api/products')
                .query({ search: 'Unique' });

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toContain('Unique');
        });

        it('should sort products by price', async () => {
            await testSetup.createTestProduct({ 
                name: 'Expensive Product',
                price: 1999 
            });

            const res = await request(app)
                .get('/api/products')
                .query({ sort: 'price' });

            expect(res.status).toBe(200);
            expect(res.body.data[0].price).toBeLessThan(res.body.data[1].price);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should get product by id', async () => {
            const res = await request(app)
                .get(`/api/products/${testProduct._id}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(testProduct.name);
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .get(`/api/products/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/products', () => {
        const newProduct = {
            name: 'New Product',
            description: 'New Description',
            price: 1499,
            category: 'men',
            subCategory: 'shirts',
            sizes: ['S', 'M', 'L'],
            colors: ['Blue', 'Red'],
            images: ['image1.jpg'],
            stock: 50
        };

        it('should create new product when admin', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newProduct);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(newProduct.name);
        });

        it('should not allow product creation for non-admin users', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newProduct);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('required');
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update product when admin', async () => {
            const update = { name: 'Updated Name', price: 1599 };
            
            const res = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(update);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(update.name);
            expect(res.body.data.price).toBe(update.price);
        });

        it('should not allow product update for non-admin users', async () => {
            const res = await request(app)
                .put(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete product when admin', async () => {
            const res = await request(app)
                .delete(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify product is deleted
            const deletedProduct = await Product.findById(testProduct._id);
            expect(deletedProduct).toBeNull();
        });

        it('should not allow product deletion for non-admin users', async () => {
            const res = await request(app)
                .delete(`/api/products/${testProduct._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/products/:id/ratings', () => {
        it('should add rating to product when authenticated', async () => {
            const rating = { rating: 4, review: 'Great product!' };
            
            const res = await request(app)
                .post(`/api/products/${testProduct._id}/ratings`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(rating);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.ratings).toHaveLength(1);
            expect(res.body.data.ratings[0].rating).toBe(rating.rating);
            expect(res.body.data.ratings[0].review).toBe(rating.review);
        });

        it('should not allow rating without authentication', async () => {
            const res = await request(app)
                .post(`/api/products/${testProduct._id}/ratings`)
                .send({ rating: 4 });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should validate rating value', async () => {
            const res = await request(app)
                .post(`/api/products/${testProduct._id}/ratings`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ rating: 6 }); // Invalid rating value

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
}); 