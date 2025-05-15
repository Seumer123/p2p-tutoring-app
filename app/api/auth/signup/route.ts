import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Send verification email first
    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    // Only create user if email was sent successfully
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry,
      },
    });

    return NextResponse.json(
      { message: "User created successfully. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
} 