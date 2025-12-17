import { db } from "@db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  
  // Check if admin already exists
  const [existingAdmin] = await db.select().from(users).where(eq(users.email, "admin@agrostate.pt"));
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      fullName: "Administrador",
      email: "admin@agrostate.pt",
      phone: "+351 912 345 678",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    });
    console.log("Admin user created: admin@agrostate.pt / admin123");
  } else {
    console.log("Admin user already exists");
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
