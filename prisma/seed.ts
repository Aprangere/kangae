import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Tech", slug: "tech" },
  { name: "Environnement", slug: "environnement" },
  { name: "IA", slug: "ia" },
  { name: "Administration", slug: "administration" },
  { name: "Management", slug: "management" },
];

const natures = [
  { name: "Idée de startup", slug: "idee-startup" },
  { name: "Le monde en a besoin", slug: "le-monde-en-a-besoin" },
  { name: "Question de recherche", slug: "question-recherche" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  for (const nature of natures) {
    await prisma.nature.upsert({
      where: { slug: nature.slug },
      update: {},
      create: nature,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
