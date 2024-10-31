import { prisma } from "../bot";

export async function addTokenCount(token: string, user: string) {
  console.log("starting");
  try {
    const existingToken = await prisma.scannedTokens.findUnique({
      where: { token: String(token) },
    });

    if (!existingToken)
      await prisma.scannedTokens.create({
        data: {
          scannedBy: String(user),
          token: String(token),
          scannedFrom: "telegram",
        },
      });
    else {
      await prisma.scannedTokens.update({
        where: { token: String(token) },
        data: {
          count: existingToken.count + 1,
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
}
