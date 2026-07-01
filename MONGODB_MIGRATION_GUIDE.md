# ARMS Backend Migration Guide: Render → MongoDB Atlas + Railway/Vercel

## 🚀 **Migration Options**

### **Option 1: Quick Fix - Railway (PostgreSQL)**
*Recommended for immediate deployment*

**Benefits:**
- ✅ No code changes required
- ✅ Keep existing PostgreSQL database
- ✅ Deploy in 5 minutes
- ✅ Better reliability than Render
- ✅ PostgreSQL database included

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your ARMS repository
5. Railway will auto-detect Node.js and deploy
6. Set environment variables in Railway dashboard
7. Your app will be live with a `.railway.app` domain

### **Option 2: Modern Stack - MongoDB Atlas + Vercel**
*For long-term scalability*

**Benefits:**
- ✅ Modern NoSQL database
- ✅ Serverless deployment
- ✅ Better performance at scale
- ✅ Free MongoDB tier available
- ❌ Requires database migration code

---

## 🏃‍♂️ **Quick Railway Deployment (5 minutes)**

### 1. **Deploy to Railway**
```bash
# Visit railway.app and connect your GitHub
# Select the ARMS repository
# Railway will auto-deploy the backend folder
```

### 2. **Set Environment Variables**
In Railway dashboard, add:
```env
NODE_ENV=production
DATABASE_URL=postgresql://[railway-provided-url]
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_key
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

### 3. **Update Frontend API URL**
```env
# In frontend/.env
VITE_API_URL=https://your-app.railway.app
```

---

## 🔄 **MongoDB Migration (Complete Rewrite)**

### Phase 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create free cluster
   - Get connection string

2. **Install MongoDB Dependencies**
```bash
cd backend
npm install @nestjs/mongoose mongoose
npm uninstall pg @nestjs/typeorm typeorm
```

### Phase 2: Update Backend Dependencies

```json
// package.json changes
{
  "dependencies": {
    // Remove:
    // "pg": "^8.11.3",
    // "@nestjs/typeorm": "^10.0.0",
    // "typeorm": "^0.3.17"
    
    // Add:
    "@nestjs/mongoose": "^10.0.2",
    "mongoose": "^8.0.3"
  }
}
```

### Phase 3: Update App Module

```typescript
// src/app.module.ts
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // Replace TypeOrmModule with:
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Phase 4: Convert Entities to Schemas

**Before (TypeORM Entity):**
```typescript
// src/users/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  firstName: string;
}
```

**After (Mongoose Schema):**
```typescript
// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### Phase 5: Update Services

**Before (TypeORM Repository):**
```typescript
constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,
) {}

async findOne(id: string): Promise<User> {
  return this.userRepository.findOne({ where: { id } });
}
```

**After (Mongoose Model):**
```typescript
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

constructor(
  @InjectModel(User.name) 
  private userModel: Model<User>,
) {}

async findOne(id: string): Promise<User> {
  return this.userModel.findById(id).exec();
}
```

### Phase 6: Data Migration Script

```typescript
// scripts/migrate-postgres-to-mongodb.ts
import { Client } from 'pg';
import { MongoClient } from 'mongodb';

const migrateData = async () => {
  // Connect to PostgreSQL
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  // Connect to MongoDB
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db();

  // Migrate users
  const users = await pgClient.query('SELECT * FROM users');
  await db.collection('users').insertMany(
    users.rows.map(user => ({
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))
  );

  // Migrate other tables...
  console.log('Migration completed!');
};
```

---

## 🎯 **Recommended Approach**

### **For Immediate Fix: Use Railway**
1. Deploy to Railway (5 minutes)
2. Keep PostgreSQL database
3. Update frontend API URL
4. Test and go live

### **For Future Enhancement: MongoDB Migration**
1. Plan migration during low-traffic period
2. Test thoroughly in development
3. Create data migration scripts
4. Deploy to Railway + MongoDB Atlas

---

## 🔧 **Railway Deployment Commands**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# Deploy backend
cd backend
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="your-postgres-url"

# Check logs
railway logs
```

---

## 🌐 **Environment Variables Needed**

### **Railway (PostgreSQL)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
PAYSTACK_SECRET_KEY=your-paystack-secret
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **MongoDB Atlas**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arms?retryWrites=true&w=majority
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

---

## ⚡ **Quick Start: Railway Deployment**

1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub and select ARMS repo**
3. **Railway auto-detects and deploys**
4. **Add environment variables**
5. **Update frontend API URL**
6. **Your app is live! 🎉**

Railway is the fastest path to get your backend running reliably without code changes. MongoDB migration can be planned for later when you have more time.

Would you like me to help you deploy to Railway first, or do you prefer to start the MongoDB migration immediately?