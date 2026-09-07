import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { students } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

export class StudentRepository {
  async findByEmail(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const [result] = await db
      .select()
      .from(students)
      .where(eq(students.email, cleanEmail));
    return result || null;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    return result || null;
  }

  async create(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    hostelRoom?: string;
  }) {
    const cleanEmail = data.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(data.password, 10);

    const [newStudent] = await db
      .insert(students)
      .values({
        fullName: data.fullName.trim(),
        email: cleanEmail,
        passwordHash,
        phone: data.phone?.trim() || null,
        hostelRoom: data.hostelRoom?.trim() || null,
      })
      .returning();

    return newStudent;
  }
}
