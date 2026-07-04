# Elite Fashion - MERN Stack Fashion Catalog & Inventory System

Elite Fashion is a complete, production-ready, premium MERN stack application designed for small fashion boutique businesses (specializing in Sarees, Kurtis, Dresses, Lehengas, and accessories). Customers can browse/filter premium collections and submit buying order requests. Administrators can securely manage products, inventory levels, and process customer orders.

---

## 📁 Folder Structure

```
elite-fashion/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database connection config
│   │   └── cloudinary.js         # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js     # Admin portal authentications
│   │   ├── dashboardController.js# Dashboard statistics
│   │   ├── orderController.js    # Order lifecycle pipeline
│   │   └── productController.js  # Product catalog curation
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protection validation
│   │   ├── errorMiddleware.js    # 404 & global error handlings
│   │   └── uploadMiddleware.js   # Multer memory storage & Cloudinary streaming
│   ├── models/
│   │   ├── Admin.js              # Admin schema with bcrypt hashing
│   │   ├── Order.js              # Client buying order schema
│   │   └── Product.js            # Fashion product properties schema
│   ├── routes/
│   │   ├── authRoutes.js         # Admin endpoints
│   │   ├── dashboardRoutes.js    # Analytics endpoints
│   │   ├── orderRoutes.js        # Checkout endpoints
│   │   └── productRoutes.js      # Catalog endpoints
│   ├── utils/
│   │   ├── generateToken.js      # JWT generator utility
│   │   └── seedAdmin.js          # Admin seeder script (starts on initial run)
│   ├── .env                      # Local server configuration (gitignore)
│   ├── package.json              # Backend script dependencies
│   └── server.js                 # App entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/            # Admin layouts, forms & sidebars
    │   │   ├── layout/           # Shared Navbar, Footer & wrappers
    │   │   ├── products/         # Product grids, cards & filters
    │   │   └── ui/               # Reusable modals, badges & loaders
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Admin session state provider
    │   │   └── ToastContext.jsx  # Notification provider wrapper
    │   ├── pages/
    │   │   ├── admin/            # Dashboard, products, orders & inventory pages
    │   │   ├── HomePage.jsx      # AJIO/Myntra styled landing page
    │   │   ├── ProductsPage.jsx  # Catalog grid list page
    │   │   └── ProductDetailPage.jsx# Detailed specification & order popup
    │   ├── services/
    │   │   ├── api.js            # Axios request client configuration
    │   │   ├── authService.js    # Admin login api calls
    │   │   ├── orderService.js   # Client orders api calls
    │   │   └── productService.js  # Catalog product CRUD operations
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx# Auth validation component
    │   ├── App.jsx               # Application routes mapping
    │   ├── index.css             # Tailwind setup and styles
    │   └── main.jsx              # React render mounting
    ├── tailwind.config.js        # Color palette & animation configs
    ├── postcss.config.js         # PostCSS config
    ├── vite.config.js            # Vite bundler options
    └── .env                      # Front client api endpoints (gitignore)
```

---

## 🔑 Environment Variables

Create `.env` files matching the templates below to start development:

### Backend Configuration (`/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://akhilnemalipuri493:Akhil13277@elite-fashion.mjqur4z.mongodb.net/elitefashion?retryWrites=true&w=majority
JWT_SECRET=elite_fashion_jwt_secret_2024_super_secure_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=dhk7dldxk
CLOUDINARY_API_KEY=463216953213954
CLOUDINARY_API_SECRET=7TY9ldwCtkUVgCcCeEgFpsGSHeA
ADMIN_EMAIL=admin@elitefashion.com
ADMIN_PASSWORD=Admin@123
NODE_ENV=development
```

### Frontend Configuration (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛢️ Database Schema & API Documentation

### Mongoose Models

#### Product Schema
- `name` (String, required): Name of the item
- `category` (String, required): `Sarees`, `Kurtis`, `Dresses`, `Lehengas`, `Suits`, `Tops`, `Bottoms`, `Accessories`, `Others`
- `price` (Number, required): Numeric price
- `description` (String, required): Detail description
- `stock` (Number, required): Stock quantity
- `colors` ([String]): Available color arrays
- `sizes` ([String]): Available size arrays (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `Free Size`)
- `material` (String): Cotton, Silk, Georgette, etc.
- `occasion` (String): `Casual`, `Formal`, `Party`, `Wedding`, `Festival`, `Daily Wear`, `Sports`, `Others`
- `images` ([{ url: String, publicId: String }]): Cloudinary image secure URLs and delete IDs
- `featured` (Boolean): Highlight flag
- `createdAt` (Date): Creation timestamp

#### Order Schema
- `customerName` (String, required): Contact name
- `phone` (String, required): 10 digit contact phone
- `address` (String, required): Full shipping destination
- `product` (ObjectId ref 'Product', required): Reference object
- `quantity` (Number, required): Buy amount
- `status` (String, enum): `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`
- `createdAt` (Date): Checkout timestamp

### REST API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/login` | Login admin, returns JWT token | None |
| **GET** | `/api/auth/profile` | Retrieve admin details | Yes (Admin) |
| **GET** | `/api/products` | Retrieve catalog with pagination, filters, sorting | None |
| **GET** | `/api/products/:id` | Fetch details of a single product | None |
| **POST** | `/api/products` | Create a product with multiple images | Yes (Admin) |
| **PUT** | `/api/products/:id` | Edit details & images | Yes (Admin) |
| **DELETE** | `/api/products/:id` | Delete product and remove images from Cloudinary | Yes (Admin) |
| **PATCH**| `/api/products/:id/stock` | Quick inline stock update | Yes (Admin) |
| **POST** | `/api/orders` | Customer checkout (reduces stock atomically) | None |
| **GET** | `/api/orders` | Fetch list of orders | Yes (Admin) |
| **PUT** | `/api/orders/:id` | Update order processing status | Yes (Admin) |
| **GET** | `/api/dashboard/stats` | Retrieve dashboard stats counters | Yes (Admin) |

---

## 🏃 Local Run Steps

### Step 1: Start Backend Server
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Note: On first startup, the system automatically checks and seeds a default admin user using the credentials specified in your `.env`.*

### Step 2: Start Frontend Application
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the Vite development client:
   ```bash
   npm run dev
   ```
4. Open the browser and browse the live app at: `http://localhost:5173`. Access the admin dashboard via `http://localhost:5173/admin/login` using the seeded admin credentials.

---

## 🚀 Production Deployment Guidelines

### 💻 Backend on Render
1. Push your code repository to GitHub (ensure backend is included).
2. Go to [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
3. Link your GitHub repository.
4. Set the following build options:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Go to the **Environment** tab and add all the keys from `/backend/.env` (like `MONGO_URI`, `CLOUDINARY_API_KEY`, etc.).
6. Deploy the web service.

### 🌐 Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and create a new project.
2. Select and link your GitHub repository.
3. Configure project options:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = (Your Render web service live URL, e.g., `https://your-app-api.onrender.com/api`)
5. Click **Deploy**. Vercel will bundle and serve the client immediately.
