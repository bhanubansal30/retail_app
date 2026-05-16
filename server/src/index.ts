import { PrismaPg } from '@prisma/adapter-pg';
import pkg from '@prisma/client';
import cors from 'cors';
import 'dotenv/config';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import jwt from 'jsonwebtoken';
const { PrismaClient } = pkg;

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

// Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
  console.warn(
    '\n⚠️  WARNING: JWT_SECRET not set in environment variables!'
  );
  console.warn('   This is using a default key which is NOT SECURE for production.');
  console.warn('   To fix:');
  console.warn('   1. Create server/.env file with: JWT_SECRET=your-random-secret');
  console.warn('   2. Or set environment variable: export JWT_SECRET=your-random-secret');
  console.warn('   3. Then restart the server\n');
} else {
  console.log('✓ JWT_SECRET is configured');
}

// Token generation functions
interface TokenPayload {
  userId: string;
  id: string;
  role: string;
}

const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    console.log('✓ Access token generated successfully');
    return token;
  } catch (error) {
    console.error('✗ Failed to generate access token:', error);
    throw error;
  }
};

const generateRefreshToken = (payload: TokenPayload): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    console.log('✓ Refresh token generated successfully');
    return token;
  } catch (error) {
    console.error('✗ Failed to generate refresh token:', error);
    throw error;
  }
};

// Middleware to verify access token
const verifyAccessToken = (
  req: Request & { user?: TokenPayload },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

// const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// const generateId = (prefix: string, length: number) => {
//   const raw = randomBytes(length).toString('base64url').toUpperCase();
//   const trimmed = raw.replace(/[^A-Z0-9]/g, '').slice(0, length);
//   return `${prefix}${trimmed}`;
// };

// const generatePassword = (length: number) => {
//   const raw = randomBytes(length).toString('base64url');
//   return raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
// };

// const generateUniqueUserId = async () => {
//   for (let attempt = 0; attempt < 5; attempt += 1) {
//     const userId = generateId('RT-', 6);
//     const exists = await prisma.retailer.findUnique({
//       where: { userId },
//       select: { id: true },
//     });
//     if (!exists) {
//       return userId;
//     }
//   }

//   throw new Error('Unable to generate unique user ID');
// };

// const requireAdminAccess: express.RequestHandler = async (req, res, next) => {
//   const token = req.header('x-admin-token');
//   const adminUserId = req.header('x-admin-userid');

//   if (!ADMIN_TOKEN) {
//     return res.status(500).json({
//       success: false,
//       message: 'ADMIN_TOKEN is not configured',
//     });
//   }

//   if (!token || token !== ADMIN_TOKEN) {
//     return res.status(401).json({
//       success: false,
//       message: 'Unauthorized admin token',
//     });
//   }

//   if (!adminUserId) {
//     return res.status(401).json({
//       success: false,
//       message: 'Admin userId header missing',
//     });
//   }

//   try {
//     const admin = await prisma.retailer.findUnique({
//       where: { userId: String(adminUserId) },
//       select: { role: true },
//     });

//     if (!admin || admin.role !== Role.ADMIN) {
//       return res.status(403).json({
//         success: false,
//         message: 'Admin access required',
//       });
//     }

//     return next();
//   } catch (error: any) {
//     console.error('Admin access error:', error);
//     return res.status(500).json({
//       success: false,
//       message: error?.message || 'Internal server error',
//     });
//   }
// };

app.get('/', (_req, res) => {
  res.send('Server running');
});

app.post('/signup', async (req, res) => {
  try {
    console.log('Signup data received:', req.body);

    const {
      firmName,
      shopType,
      proprietorName,
      mobile,
      address,
      businessType,
    } = req.body;

    if (!firmName || !shopType || !proprietorName || !mobile || !address || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        received: req.body,
      });
    }

    const shopCategoryMap: Record<string, 'KIRANA' | 'CONFECTIONERY'> = {
      Kirana: 'KIRANA',
      Confectionery: 'CONFECTIONERY',
    };

    const businessTypeMap: Record<string, 'WHOLESALER' | 'RETAILER'> = {
      Wholesaler: 'WHOLESALER',
      Retailer: 'RETAILER',
    };

    const shopCategory = shopCategoryMap[shopType];
    const finalBusinessType = businessTypeMap[businessType];

    if (!shopCategory || !finalBusinessType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shop type or business type',
      });
    }

    const retailer = await prisma.retailer.create({
      data: {
        firmName,
        shopCategory,
        proprietorName,
        mobileNumber: mobile,
        addressLine1: address,
        businessType: finalBusinessType,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      data: retailer,
    });
  } catch (error: any) {
    console.error('Signup error full:', error);

    if (error?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already registered',
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
    });
  }
});

app.post('/admin/assign-credentials', async (req, res) => {
  const { mobile, userId, password } = req.body;

  if (!mobile || !userId || !password) {
    return res.status(400).json({
      success: false,
      message: 'mobile, userId, and password are required',
    });
  }

  try {
    const existingUserId = await prisma.retailer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existingUserId) {
      return res.status(409).json({
        success: false,
        message: 'User ID already exists',
      });
    }

    const retailer = await prisma.retailer.findUnique({
      where: { mobileNumber: mobile },
    });

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer not found for this mobile number',
      });
    }

    const updated = await prisma.retailer.update({
      where: { mobileNumber: mobile },
      data: {
        userId: String(userId),
        passwordHash: String(password),
        isVerified: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Credentials assigned successfully',
      data: { id: updated.id, userId: updated.userId },
    });
  } catch (error: any) {
    console.error('Assign credentials error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
    });
  }
});

app.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: 'userId and password are required',
    });
  }

  try {
    console.log('🔍 Login attempt for userId:', userId);
    const retailer = await prisma.retailer.findUnique({
      where: { userId: String(userId) },
    });

    if (!retailer) {
      console.log('❌ User not found:', userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account not approved',
      });
    }

    if (!retailer.passwordHash) {
      console.log('⚠️  User has no password hash:', userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account not approved',
      });
    }

    // Validate required fields for token generation
    if (!retailer.userId || !retailer.id || !retailer.role) {
      console.error('❌ Missing required fields for token generation:', {
        hasUserId: !!retailer.userId,
        hasId: !!retailer.id,
        hasRole: !!retailer.role,
      });
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Missing user data',
      });
    }

    console.log('✓ User found:', { id: retailer.id, userId: retailer.userId, role: retailer.role });

    // Debug: Show what fields actually have data
    console.log('📊 User data in database:', {
      firmName: retailer.firmName || '❌ NULL',
      proprietorName: retailer.proprietorName || '❌ NULL',
      mobileNumber: retailer.mobileNumber || '❌ NULL',
      addressLine1: retailer.addressLine1 || '❌ NULL',
      city: retailer.city || '❌ NULL',
      state: retailer.state || '❌ NULL',
      pincode: retailer.pincode || '❌ NULL',
      businessType: retailer.businessType || '❌ NULL',
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: retailer.userId as string,
      id: retailer.id as string,
      role: retailer.role as string,
    };

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    try {
      accessToken = generateAccessToken(tokenPayload);
      console.log('✓ Access token generated, length:', accessToken?.length);
    } catch (tokenError) {
      console.error('❌ Error generating access token:', tokenError);
      throw tokenError;
    }

    try {
      refreshToken = generateRefreshToken(tokenPayload);
      console.log('✓ Refresh token generated, length:', refreshToken?.length);
    } catch (tokenError) {
      console.error('❌ Error generating refresh token:', tokenError);
      throw tokenError;
    }

    if (!accessToken || !refreshToken) {
      console.error('❌ Tokens are null/undefined:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      throw new Error('Token generation produced null/undefined result');
    }

    console.log('✓ Both tokens generated successfully');

    const loginResponse = {
      success: true,
      message: 'Login successful',
      data: {
        id: retailer.id,
        userId: retailer.userId,
        firmName: retailer.firmName,
        proprietorName: retailer.proprietorName,
        mobileNumber: retailer.mobileNumber,
        addressLine1: retailer.addressLine1,
        city: retailer.city,
        state: retailer.state,
        pincode: retailer.pincode,
        businessType: retailer.businessType,
        isVerified: retailer.isVerified,
        role: retailer.role,
        accessToken,
        refreshToken,
      },
    };

    console.log('✓ Response object:', JSON.stringify({
      success: loginResponse.success,
      message: loginResponse.message,
      hasAccessToken: !!loginResponse.data.accessToken,
      hasRefreshToken: !!loginResponse.data.refreshToken,
    }));

    console.log('📤 Sending login response with user data:', JSON.stringify({
      firmName: loginResponse.data.firmName,
      proprietorName: loginResponse.data.proprietorName,
      mobileNumber: loginResponse.data.mobileNumber,
      addressLine1: loginResponse.data.addressLine1,
      city: loginResponse.data.city,
      state: loginResponse.data.state,
      pincode: loginResponse.data.pincode,
      businessType: loginResponse.data.businessType,
    }, null, 2));
    
    return res.status(200).json(loginResponse);
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
    });
  }
});

// Update user profile endpoint
app.put('/profile/:userId', verifyAccessToken, async (req, res) => {
  const { userId } = req.params;
  const {
    proprietorName,
    mobileNumber,
    addressLine1,
    city,
    state,
    pincode,
    businessType,
  } = req.body;

  try {
    console.log('📝 Updating profile for userId:', userId);

    const retailer = await prisma.retailer.findUnique({
      where: { userId },
    });

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update only provided fields
    const updated = await prisma.retailer.update({
      where: { userId },
      data: {
        ...(proprietorName && { proprietorName }),
        ...(mobileNumber && { mobileNumber }),
        ...(addressLine1 && { addressLine1 }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pincode && { pincode }),
        ...(businessType && { businessType }),
      },
    });

    console.log('✓ Profile updated:', updated.userId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updated.id,
        userId: updated.userId,
        firmName: updated.firmName,
        proprietorName: updated.proprietorName,
        mobileNumber: updated.mobileNumber,
        addressLine1: updated.addressLine1,
        city: updated.city,
        state: updated.state,
        pincode: updated.pincode,
        businessType: updated.businessType,
        isVerified: updated.isVerified,
        role: updated.role,
      },
    });
  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update profile',
    });
  }
});

// Refresh token endpoint
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded);

    // Optionally generate new refresh token
    const newRefreshToken = generateRefreshToken(decoded);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
});

// Verify token endpoint
app.get('/verify-token', verifyAccessToken, (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid',
  });
});

// Logout endpoint
app.post('/logout', verifyAccessToken, async (_req, res) => {
  // In a real app, you might want to blacklist the token or update the database
  // For now, just return success as the client will clear local tokens
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// app.get('/admin/retailers', requireAdminAccess, async (_req, res) => {
//   try {
//     const retailers = await prisma.retailer.findMany({
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         firmName: true,
//         proprietorName: true,
//         mobileNumber: true,
//         userId: true,
//         isVerified: true,
//         role: true,
//         createdAt: true,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       data: retailers,
//     });
//   } catch (error: any) {
//     console.error('Admin retailers error:', error);
//     return res.status(500).json({
//       success: false,
//       message: error?.message || 'Internal server error',
//     });
//   }
// });

// app.post('/admin/verify-retailer', requireAdminAccess, async (req, res) => {
//   const { retailerId } = req.body;

//   if (!retailerId) {
//     return res.status(400).json({
//       success: false,
//       message: 'retailerId is required',
//     });
//   }

//   try {
//     const retailer = await prisma.retailer.findUnique({
//       where: { id: String(retailerId) },
//       select: { id: true, userId: true, isVerified: true },
//     });

//     if (!retailer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Retailer not found',
//       });
//     }

//     if (retailer.userId && retailer.isVerified) {
//       return res.status(409).json({
//         success: false,
//         message: 'Retailer already verified',
//       });
//     }

//     const userId = retailer.userId ?? (await generateUniqueUserId());
//     const plainPassword = generatePassword(8);

//     await prisma.retailer.update({
//       where: { id: retailer.id },
//       data: {
//         userId,
//         passwordHash: plainPassword,
//         isVerified: true,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Retailer verified',
//       data: {
//         userId,
//         password: plainPassword,
//       },
//     });
//   } catch (error: any) {
//     console.error('Verify retailer error:', error);
//     return res.status(500).json({
//       success: false,
//       message: error?.message || 'Internal server error',
//     });
//   }
// });

// ===== CATEGORY ENDPOINTS =====

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          select: { id: true, name: true, price: true, mrp: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch categories',
    });
  }
});

// Create new category
app.post('/api/categories', verifyAccessToken, async (req, res) => {
  const { name, description, icon, image } = req.body;
  
  // Check if user is ADMIN
  const user = (req as any).user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create categories',
    });
  }

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Category name is required',
    });
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || 'cube',
        image: image?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create category',
    });
  }
});

// Delete category
app.delete('/api/categories/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params;
  
  // Check if user is ADMIN
  const user = (req as any).user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete categories',
    });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete category',
    });
  }
});

// ===== PRODUCT ENDPOINTS =====

// Get products by category
app.get('/api/products/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await prisma.product.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch products',
    });
  }
});

// Create new product
app.post('/api/products', verifyAccessToken, async (req, res) => {
  const { name, description, price, mrp, categoryId, stock } = req.body;

  if (!name || !price || !mrp || !categoryId) {
    return res.status(400).json({
      success: false,
      message: 'name, price, mrp, and categoryId are required',
    });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseInt(price),
        mrp: parseInt(mrp),
        stock: parseInt(stock) || 0,
        categoryId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create product',
    });
  }
});

// Update product (stock, price, etc)
app.put('/api/products/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, mrp, stock } = req.body;

  try {
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price) updateData.price = parseInt(price);
    if (mrp) updateData.mrp = parseInt(mrp);
    if (stock !== undefined) updateData.stock = parseInt(stock);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update product',
    });
  }
});

// Delete product
app.delete('/api/products/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete product',
    });
  }
});

// Get all orders (admin)
app.get('/api/orders', verifyAccessToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        retailer: {
          select: {
            firmName: true,
            mobileNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch orders',
    });
  }
});

// Get orders for specific retailer
app.get('/api/orders/retailer/:retailerId', verifyAccessToken, async (req, res) => {
  const { retailerId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: { retailerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('Get retailer orders error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch orders',
    });
  }
});

// Create order
app.post('/api/orders', verifyAccessToken, async (req, res) => {
  const { retailerId, items } = req.body;

  if (!retailerId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'retailerId and items are required',
    });
  }

  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        retailerId,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create order',
    });
  }
});

// Update order status
app.put('/api/orders/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'status is required',
    });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update order',
    });
  }
});

// Delete order
app.delete('/api/orders/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.order.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete order',
    });
  }
});

// Get admin statistics
app.get('/api/stats', verifyAccessToken, async (req, res) => {
  try {
    const [totalUsers, totalCategories, totalProducts, totalOrders] = await Promise.all([
      prisma.retailer.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCategories,
        totalProducts,
        totalOrders,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch statistics',
    });
  }
});

// Get all users (retailers)
app.get('/api/users', verifyAccessToken, async (req, res) => {
  try {
    const users = await prisma.retailer.findMany({
      select: {
        id: true,
        userId: true,
        firmName: true,
        proprietorName: true,
        mobileNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch users',
    });
  }
});

// Verify user
app.put('/api/users/:id/verify', verifyAccessToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.retailer.update({
      where: { id },
      data: { isVerified: true },
    });

    return res.status(200).json({
      success: true,
      message: 'User verified successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Verify user error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to verify user',
    });
  }
});

// Update user role
app.put('/api/users/:id/role', verifyAccessToken, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Valid role (USER or ADMIN) is required',
    });
  }

  try {
    const user = await prisma.retailer.update({
      where: { id },
      data: { role: role as any },
    });

    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update user role',
    });
  }
});

// Delete user
app.delete('/api/users/:id', verifyAccessToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.retailer.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete user',
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});