import { adapter, PrismaClient, SpaceUserRole } from './client';

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error', { emit: 'event', level: 'query' }],
});

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
      space_name: 'MySpace',
      space_description: 'This is the default workspace.',
      space_image: '',
      space_color: '',
      created_by: example.user_id,
      updated_by: example.user_id,

      space_user_list: {
        create: {
          role: SpaceUserRole.OWNER,
          user_id: example.user_id,
        },
      },

      group_list: {
        create: {
          group_name: 'MyGroup',
          group_description: 'This is the default group.',
          group_order: 0,
          group_image: '',
          group_color: '',
          created_by: example.user_id,
          updated_by: example.user_id,

          todo_list: {
            create: {
              title: 'MyTodo',
              description: 'This is the default todo.',
              order: 0,
              created_by: example.user_id,
              updated_by: example.user_id,
            },
          },
        },
      },
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
