import { Document, Schema } from 'mongoose';
import { createModel } from '@apnidukaan/shared';

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;

  emailVerified: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;

  avatar?: string;
  active: boolean;
  status: 'active' | 'suspended' | 'banned';

  tokenVersion: number;

  security: {
    failedLoginAttempts: number;
    lastFailedLogin?: Date | null;
    lockUntil?: Date | null;
    lastLogin?: Date;
    passwordChangedAt?: Date;
  };

  oauth?: {
    google?: {
      id: string;
      accessToken?: string;
      refreshToken?: string;
      lastLogin?: Date;
    };
  };

  preferences: {
    currency: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showProfile: boolean;
      showActivity: boolean;
    };
  };

  metadata: {
    registrationSource: string;
    userAgent: string;
    ipAddress: string;
    lastLoginIP?: string;
    lastUserAgent?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      select: false
    },

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      default: '',
      trim: true
    },

    role: {
      type: String,
      enum: ['user', 'customer', 'admin', 'moderator', 'vendor', 'guest'],
      default: 'user'
    },

    emailVerified: {
      type: Boolean,
      default: false
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerifiedAt: Date,
    avatar: String,

    active: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active'
    },

    tokenVersion: {
      type: Number,
      default: 0
    },

    security: {
      failedLoginAttempts: { type: Number, default: 0 },
      lastFailedLogin: { type: Date, default: null },
      lockUntil: { type: Date, default: null },
      lastLogin: Date,
      passwordChangedAt: Date
    },

    oauth: {
      google: {
        id: String,
        accessToken: String,
        refreshToken: String,
        lastLogin: Date
      }
    },

    preferences: {
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
      },
      privacy: {
        showProfile: { type: Boolean, default: false },
        showActivity: { type: Boolean, default: false }
      }
    },

    metadata: {
      registrationSource: { type: String, default: 'direct' },
      userAgent: { type: String, default: '' },
      ipAddress: { type: String, default: '' },
      lastLoginIP: String,
      lastUserAgent: String
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete (ret as any).__v;
        if (ret.oauth?.google) {
          delete ret.oauth.google.accessToken;
          delete ret.oauth.google.refreshToken;
        }
        return ret;
      }
    }
  }
);

// Keep both email verification fields synchronized.
UserSchema.pre('validate', function () {
  if (this.isModified('emailVerified')) {
    this.isEmailVerified = this.emailVerified;
  } else if (this.isModified('isEmailVerified')) {
    this.emailVerified = this.isEmailVerified;
  }
});

UserSchema.index({ 'oauth.google.id': 1 }, { sparse: true });

export const UserModel = createModel<IUserDocument>('User', UserSchema);