import { profile } from "console";
import { prisma } from "../bot";
import profiles from "../profiles";
export async function changePersonality(ctx: any) {
  let data = ctx.match[0].split("-")[1];
  const currentInteraction = await prisma.currentInteraction.findUnique({
    where: {
      userid: String(ctx.from?.id),
    },
  });

  console.log(currentInteraction);
  if (!currentInteraction) {
    await prisma.currentInteraction.create({
      data: {
        userid: String(ctx.from?.id),
        personality: parseInt(data),
      },
    });
    console.log("here");
    await ctx.reply(
      "Your persoanlity has been set to " +
        profiles.profiles[parseInt(data)].name
    );
    return;
  }
  await prisma.currentInteraction.update({
    where: {
      userid: String(ctx.from?.id),
    },
    data: {
      personality: parseInt(data),
    },
  });
  await ctx.reply(
    "Your persoanlity has been set to " + profiles.profiles[parseInt(data)].name
  );
}
