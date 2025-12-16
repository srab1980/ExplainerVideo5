import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  console.log('Creating demo users...');
  
  const hashedPassword = await bcryptjs.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'user',
      emailVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'user',
      emailVerified: false,
    },
  });

  console.log('✅ Created 3 demo users');

  // Create demo tasks
  console.log('Creating demo tasks...');

  const tasks = [
    {
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the project including setup instructions and API documentation',
      status: 'in-progress',
      priority: 'high',
      userId: user1.id,
    },
    {
      title: 'Implement user authentication',
      description: 'Set up NextAuth.js with email/password and OAuth providers',
      status: 'completed',
      priority: 'high',
      userId: user1.id,
    },
    {
      title: 'Design landing page',
      description: 'Create mockups for the landing page with modern UI/UX',
      status: 'pending',
      priority: 'medium',
      userId: user2.id,
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: 'pending',
      priority: 'high',
      userId: user1.id,
    },
    {
      title: 'Write unit tests',
      description: 'Add comprehensive unit tests for all components and API routes',
      status: 'in-progress',
      priority: 'medium',
      userId: user2.id,
    },
    {
      title: 'Optimize database queries',
      description: 'Add indexes and optimize N+1 queries',
      status: 'pending',
      priority: 'low',
      userId: user1.id,
    },
    {
      title: 'Create user onboarding flow',
      description: 'Design and implement step-by-step onboarding for new users',
      status: 'pending',
      priority: 'medium',
      userId: user3.id,
    },
    {
      title: 'Add email notifications',
      description: 'Implement email notifications for task assignments and updates',
      status: 'pending',
      priority: 'low',
      userId: user2.id,
    },
    {
      title: 'Implement real-time updates',
      description: 'Add WebSocket support for real-time task updates',
      status: 'pending',
      priority: 'high',
      userId: user1.id,
    },
    {
      title: 'Performance optimization',
      description: 'Optimize bundle size and implement code splitting',
      status: 'completed',
      priority: 'high',
      userId: user3.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Created 10 demo tasks');

  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Admin: admin@example.com / password123');
  console.log('  User:  user@example.com / password123');
  console.log('  Test:  test@example.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
