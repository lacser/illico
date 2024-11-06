import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse(null, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return new NextResponse(null, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: payload.email }).select('email username profilePicture');
    
    if (!user) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse(null, { status: 500 });
  }
}
