import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Update chat messages
export async function PUT(request: Request) {
  try {
    const { chatId } = request.url
      .split('/')
      .filter(Boolean)
      .reduce((acc, curr) => ({ ...acc, chatId: curr }), { chatId: '' });

    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { messages, title } = await request.json();

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: payload.userId },
      { messages, title },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete chat
export async function DELETE(request: Request) {
  try {
    const { chatId } = request.url
      .split('/')
      .filter(Boolean)
      .reduce((acc, curr) => ({ ...acc, chatId: curr }), { chatId: '' });

    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: payload.userId
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
