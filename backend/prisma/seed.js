const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Clear existing data
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Database cleared. Creating new seed data...');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
            },
        }),
        prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
                role: 'user',
            },
        }),
        prisma.user.create({
            data: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'user',
            },
        }),
    ]);

    const imageBaseUrl = 'http://localhost:3030/storage/uploads/';
    console.log(`Created ${users.length} users`);

    // Create products
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Modern Office Chair',
                description: 'Ergonomic office chair with lumbar support and breathable mesh back.',
                price: 199.99,
                stock: 25,
                category: 'Furniture',
                imageUrl: `${imageBaseUrl}chair.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Wireless Earbuds',
                description: 'True wireless earbuds with active noise cancellation and premium sound quality.',
                price: 149.99,
                stock: 50,
                category: 'Electronics',
                imageUrl: `${imageBaseUrl}earbuds.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Leather Wallet',
                description: 'Handcrafted genuine leather wallet with RFID protection.',
                price: 59.99,
                stock: 35,
                category: 'Accessories',
                imageUrl: `${imageBaseUrl}wallet.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Smart Watch',
                description: 'Fitness tracker with heart rate monitoring, GPS, and water resistance.',
                price: 249.99,
                stock: 20,
                category: 'Electronics',
                imageUrl: `${imageBaseUrl}smart-watch.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Coffee Maker',
                description: 'Programmable coffee maker with thermal carafe and auto shut-off.',
                price: 89.99,
                stock: 15,
                category: 'Home',
                imageUrl: `${imageBaseUrl}coffee-maker.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Backpack',
                description: 'Water-resistant backpack with laptop compartment and multiple pockets.',
                price: 79.99,
                stock: 30,
                category: 'Accessories',
                imageUrl: `${imageBaseUrl}backpack.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Desk Lamp',
                description: 'LED desk lamp with adjustable brightness and color temperature.',
                price: 49.99,
                stock: 40,
                category: 'Home',
                imageUrl: `${imageBaseUrl}desk-lamp.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Yoga Mat',
                description: 'Eco-friendly, non-slip yoga mat with alignment marks.',
                price: 39.99,
                stock: 45,
                category: 'Fitness',
                imageUrl: `${imageBaseUrl}yoga-mat.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Portable Bluetooth Speaker',
                description: 'Waterproof Bluetooth speaker with 24-hour battery life.',
                price: 129.99,
                stock: 22,
                category: 'Electronics',
                imageUrl: `${imageBaseUrl}bluetooth-speaker.jpeg`,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Stainless Steel Water Bottle',
                description: 'Double-walled, vacuum-insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
                price: 34.99,
                stock: 55,
                category: 'Accessories',
                imageUrl: `${imageBaseUrl}water-bottle.jpeg`,
            },
        }),
    ]);

    console.log(`Created ${products.length} products`);

    // Create orders
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    // Generate dates from the past 30 days
    const getRandomDate = () => {
        const now = new Date();
        const pastDays = Math.floor(Math.random() * 30);
        now.setDate(now.getDate() - pastDays);
        return now;
    };

    // Function to create an order with payment
    const createOrderWithPayment = async (userId, productList, status, date) => {
        // Calculate total from selected products
        const orderItems = productList.map(p => ({
            productId: p.id,
            quantity: Math.floor(Math.random() * 3) + 1, // Random quantity between 1-3
            price: p.price
        }));

        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create the order - NOTE: There's no OrderItem in the schema, so we don't create any
        const order = await prisma.order.create({
            data: {
                userId,
                status,
                totalPrice: total
            }
        });

        // Create payment for the order if not pending
        if (['paid', 'shipped', 'delivered'].includes(status)) {
            await prisma.payment.create({
                data: {
                    orderId: order.id,
                    userId,
                    amount: total,
                    status: status === 'delivered' ? 'completed' : 'pending',
                    createdAt: date
                }
            });
        }

        return order;
    };

    // Create 5 orders
    const orders = [];

    // Order 1: John orders multiple items, delivered
    const order1Products = [products[0], products[3], products[5]]; // Chair, Smart Watch, Backpack
    const order1Date = getRandomDate();
    orders.push(await createOrderWithPayment(users[1].id, order1Products, 'delivered', order1Date));

    // Order 2: Jane orders a single item, shipped
    const order2Products = [products[1]]; // Earbuds
    const order2Date = getRandomDate();
    orders.push(await createOrderWithPayment(users[2].id, order2Products, 'shipped', order2Date));

    // Order 3: John has a pending order
    const order3Products = [products[8], products[9]]; // Bluetooth Speaker, Water Bottle
    const order3Date = getRandomDate();
    orders.push(await createOrderWithPayment(users[1].id, order3Products, 'pending', order3Date));

    // Order 4: Jane has a processing order
    const order4Products = [products[6], products[7]]; // Desk Lamp, Yoga Mat
    const order4Date = getRandomDate();
    orders.push(await createOrderWithPayment(users[2].id, order4Products, 'paid', order4Date));

    // Order 5: Admin user has an order too
    const order5Products = [products[2], products[4]]; // Leather Wallet, Coffee Maker
    const order5Date = getRandomDate();
    orders.push(await createOrderWithPayment(users[0].id, order5Products, 'shipped', order5Date));

    console.log(`Created ${orders.length} orders`);
    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });