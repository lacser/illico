import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import InvitationCode from '@/models/InvitationCode';

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

    console.log('Validating invitation code:', invitationCode);
    // Validate invitation code
    const validCode = await InvitationCode.findOne({
      code: invitationCode,
      isActive: true,
    });

    console.log('Invitation code check result:', {
      found: !!validCode,
      code: invitationCode,
      isActive: validCode?.isActive,
      expiresAt: validCode?.expiresAt,
      currentUses: validCode?.usedCount,
      maxUses: validCode?.maxUses
    });

    if (!validCode) {
      console.log('Invalid invitation code: Code not found or expired');
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 400 }
      );
    }

    if (validCode.usedCount >= validCode.maxUses) {
      console.log('Invitation code usage limit exceeded:', {
        code: invitationCode,
        currentUses: validCode.usedCount,
        maxUses: validCode.maxUses
      });
      return NextResponse.json(
        { error: 'Invitation code has reached maximum usage limit' },
        { status: 400 }
      );
    }

    console.log('Updating invitation code usage count:', {
      code: invitationCode,
      previousCount: validCode.usedCount,
      newCount: validCode.usedCount + 1
    });
    // Update invitation code usage
    validCode.usedCount++;
    await validCode.save();

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
