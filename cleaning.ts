import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanUp() {
  const message = await prisma?.message.deleteMany({});
  console.log(message);
}

async function main() {
  const user = await prisma?.user.create({
    data: {
      email: "tanued",
      name: "tanu",
    },
  });
  console.log(user);
}

async function test() {
  const users = await prisma?.user.findMany({});
  console.log(users);
}

// main();
test();
