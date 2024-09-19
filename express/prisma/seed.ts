import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  const example = await prisma.user.upsert({
    where: { email: 'example@example.com' },
    update: {},
    create: {
      email: 'example@example.com',
      username: 'example',
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

  await prisma.tag.createMany({
    data: [
      {
        owner_id: example.user_id,
        tag_name: 'Urgent',
        tag_color: '#FF0000',
        tag_order: 1,
        created_by: example.user_id,
        updated_by: example.user_id,
      },
      {
        owner_id: example.user_id,
        tag_name: 'Important',
        tag_color: '#FFA500',
        tag_order: 2,
        created_by: example.user_id,
        updated_by: example.user_id,
      },
      {
        owner_id: example.user_id,
        tag_name: 'Reminder',
        tag_color: '#0000FF',
        tag_order: 3,
        created_by: example.user_id,
        updated_by: example.user_id,
      },
      {
        owner_id: example.user_id,
        tag_name: 'Optional',
        tag_color: '#808080',
        tag_order: 4,
        created_by: example.user_id,
        updated_by: example.user_id,
      },
      {
        owner_id: example.user_id,
        tag_name: 'In Progress',
        tag_color: '#FFFF00',
        tag_order: 5,
        created_by: example.user_id,
        updated_by: example.user_id,
      },
      {
        owner_id: example.user_id,
        tag_name: 'Completed',
        tag_color: '#008000',
        tag_order: 6,
        created_by: example.user_id,
        updated_by: example.user_id,
      },
    ],
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
