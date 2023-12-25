const { PrismaClient } =  require("@prisma/client");
prisma = new PrismaClient();

async function cleanUp() {
const message = await prisma?.message.deleteMany({

})
console.log(message);
}

cleanUp();