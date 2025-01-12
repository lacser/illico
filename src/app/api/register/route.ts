import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';

interface InvitationCode {
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdBy: string;
  isActive: boolean;
}

interface InvitationConfig {
  enableInvitationCode: boolean;
  invitationCodes: InvitationCode[];
}

export async function POST(request: Request) {
  try {
    const { email, username, password, invitationCode, profilePicture } = await request.json();
    
    console.log('Received registration data:', {
      email,
      username,
      hasPassword: !!password,
      hasProfilePicture: !!profilePicture
    });

    if (!email || !password || !username || !invitationCode) {
      return NextResponse.json(
        { error: 'Email, username, password and invitation code are required' },
        { status: 400 }
      );
    }

    // Validate invitation code
    const invitationConfigPath = path.join(process.cwd(), 'src/config/invitation.json');
    const invitationConfig: InvitationConfig = JSON.parse(fs.readFileSync(invitationConfigPath, 'utf8'));

    if (!invitationConfig.enableInvitationCode) {
      return NextResponse.json(
        { error: 'Invitation code system is currently disabled' },
        { status: 400 }
      );
    }

    const validCode = invitationConfig.invitationCodes.find((code: InvitationCode) => 
      code.code === invitationCode && 
      code.isActive && 
      code.usedCount < code.maxUses &&
      new Date(code.expiresAt) > new Date()
    );

    if (!validCode) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 400 }
      );
    }

    // Update invitation code usage
    validCode.usedCount++;
    fs.writeFileSync(invitationConfigPath, JSON.stringify(invitationConfig, null, 2));

    // Add password length validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Check if user already exists (by email or username)
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { username }
      ]
    });
    
    if (existingUser) {
      console.log('User already exists');
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 400 }
      );
    }

    // Create new user
    const userData = {
      email,
      username,
      password,
      profilePicture: profilePicture || '',
      invitationCode
    };

    console.log('Attempting to create user with data:', {
      ...userData,
      password: '[REDACTED]'
    });

    try {
      const newUser = new User(userData);
      await newUser.save();

      console.log('User created successfully:', {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        hasProfilePicture: !!newUser.profilePicture
      });

      return NextResponse.json(
        { message: 'User registered successfully' },
        { status: 201 }
      );
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
