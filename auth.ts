import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { students, guards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = ((credentials?.email as string) || '').toLowerCase().trim();
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const [student] = await db.select().from(students).where(eq(students.email, email));
        if (student && (await bcrypt.compare(password, student.passwordHash))) {
          return { id: student.id, email: student.email, name: student.fullName, role: 'learner' };
        }

        const [guard] = await db.select().from(guards).where(eq(guards.email, email));
        if (guard && (await bcrypt.compare(password, guard.passwordHash))) {
          const role = email.endsWith('@admin.com') ? 'admin' : 'guard';
          return { id: guard.id, email: guard.email, name: guard.fullName, role };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});
