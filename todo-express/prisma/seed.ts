import { PrismaClient } from "@prisma/client";

const ORM = new PrismaClient({});

const main = async () => {
  console.log(`Start seeding ...`);
  console.log(`Seeding finished.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await ORM.$disconnect();
  });
