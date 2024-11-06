import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { email, username, password, profilePicture } = await request.json();
    
    console.log('Received registration data:', {
      email,
      username,
      hasPassword: !!password,
      hasProfilePicture: !!profilePicture
    });

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, username and password are required' },
        { status: 400 }
      );
    }

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
      profilePicture: profilePicture || ''
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
