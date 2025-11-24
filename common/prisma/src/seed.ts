import { prisma } from './client';

async function main() {
  await prisma.user.deleteMany();

  const example = await prisma.user.upsert({
    where: { email: 'example@example.com' },
    update: {},
    create: {
      email: 'example@example.com',
      username: 'example',
      // cSpell:ignore vsQDysmORCJm4R0iI5og9Sce6lvrq
      password: '$2a$10$iFYoa/8.jROwy/vsQDysmORCJm4R0iI5og9Sce6lvrq.F1ba5eOSi', // example@example.com
    },
  });

  await prisma.space.create({
    data: {
      owner_id: example.user_id,
      space_name: 'MyTodo',
      space_description: 'This is the default workspace.',
      space_order: 0,
      space_image: '',
      created_by: example.user_id,
      updated_by: example.user_id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
