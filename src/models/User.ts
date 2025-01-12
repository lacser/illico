import mongoose, { CallbackError, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for User document
interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  profilePicture: string;
  invitationCode: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Delete the existing model if it exists to force schema refresh
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  profilePicture: {
    type: String,
    default: '',
  },
  invitationCode: {
    type: String,
    required: [true, 'Invitation code is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  strict: true, // Enforce strict schema
  strictQuery: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Method to check password validity
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
export type { IUser };
