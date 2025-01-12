import mongoose, { Document } from 'mongoose';

interface IInvitationCode extends Document {
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  createdBy: string;
  isActive: boolean;
}

// Delete the existing model if it exists to force schema refresh
if (mongoose.models.InvitationCode) {
  delete mongoose.models.InvitationCode;
}

const invitationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  maxUses: {
    type: Number,
    required: true,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const InvitationCode = mongoose.model<IInvitationCode>('InvitationCode', invitationCodeSchema);

export default InvitationCode;
export type { IInvitationCode };
