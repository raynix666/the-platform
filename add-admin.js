const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("=== Add Admin to Enjaz Platform ===");
  
  const fullName = await question("Enter Admin's Full Name: ");
  if (!fullName.trim()) {
    console.error("Full name cannot be empty.");
    process.exit(1);
  }

  const employeeCode = await question("Enter Employee Code (Password/Key): ");
  if (!employeeCode.trim()) {
    console.error("Employee code cannot be empty.");
    process.exit(1);
  }

  // Check if code exists
  const existing = await prisma.employee.findUnique({
    where: { employeeCode: employeeCode.trim() }
  });

  if (existing) {
    console.error(`An employee/admin with code '${employeeCode}' already exists.`);
    process.exit(1);
  }

  const employee = await prisma.employee.create({
    data: {
      fullName: fullName.trim(),
      employeeCode: employeeCode.trim(),
      role: "ADMIN",
      canExportWorkshops: true,
      canExportVisitors: true
    }
  });

  console.log("\nSuccess! Admin created successfully:");
  console.log("ID:", employee.id);
  console.log("Name:", employee.fullName);
  console.log("Role:", employee.role);
  console.log("Code:", employee.employeeCode);
}

main()
  .catch((err) => {
    console.error("Error creating admin:", err);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
