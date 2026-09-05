import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { students, guards } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const studentEmail = 'test.student@rishihood.edu.in';
  const existingStudent = await db
    .select()
    .from(students)
    .where(eq(students.email, studentEmail));

  if (existingStudent.length > 0) {
    console.log(`Student with email ${studentEmail} already exists. Skipping.`);
  } else {
    const [newStudent] = await db
      .insert(students)
      .values({
        fullName: 'Test Student',
        email: studentEmail,
        passwordHash,
      })
      .returning();
    console.log(`Inserted test student: ${newStudent.email}`);
  }

  const guardEmail = 'guard@rishihood.edu.in';
  const existingGuard = await db
    .select()
    .from(guards)
    .where(eq(guards.email, guardEmail));

  if (existingGuard.length > 0) {
    console.log(`Guard with email ${guardEmail} already exists. Skipping.`);
  } else {
    const [newGuard] = await db
      .insert(guards)
      .values({
        fullName: 'Test Guard',
        email: guardEmail,
        passwordHash,
      })
      .returning();
    console.log(`Inserted test guard: ${newGuard.email}`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
