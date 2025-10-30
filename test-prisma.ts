import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test the models that are supposedly missing
async function testModels() {
  // This should work if the types are correct
  const devices = await prisma.device.findMany();
  const orders = await prisma.order.findMany();
  const payments = await prisma.payment.findMany();
  const sessions = await prisma.deviceSession.findMany();
  
  console.log('Models are working!');
}

export { testModels };