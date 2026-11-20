import { prisma } from "../src/core/config/db.js";
import { syncInstallationFromGitHub } from "../src/modules/installation/installation.service.js";

async function main() {
  console.log("Fetching all installations from Neon DB...");
  const allInst = await prisma.gitHubInstallation.findMany();
  console.log(`Found ${allInst.length} installations in DB.`);

  for (const i of allInst) {
    console.log(`Syncing installation ${i.installationId.toString()} (userId: ${i.userId})...`);
    try {
      await syncInstallationFromGitHub(i.installationId, i.userId || undefined);
      const repos = await prisma.repository.findMany({ where: { installationId: i.id } });
      console.log(`✓ Repositories for ${i.installationId}:`, repos.map(r => r.fullName));
    } catch (e: any) {
      console.error(`Error syncing installation ${i.installationId}:`, e.message);
    }
  }

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("Error in main:", err);
  process.exit(1);
});
