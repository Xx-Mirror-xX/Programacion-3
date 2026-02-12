import express from "express";
import path from 'path';
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { methods as authentication } from "./controllers/authentication.controllers.js";
import { methods as adminAuthentication } from "./controllers/admin.controllers.js";
import { productsMethods } from "./controllers/products.controllers.js";
import { cartMethods } from "./controllers/cart.controllers.js";
import { initializeDatabase } from "./database/init.js";
import { initializeAdminDatabase } from "./database/admin.init.js";
import { initializeProductsDatabase } from "./database/products.init.js";
import { initializeCartDatabase } from "./database/cart.init.js";
import { verifyToken, verifyAdminToken } from "./middlewares/auth.js";
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_ROOT = __dirname;

const isProduction = process.env.NODE_ENV === 'production';

const DB_PATH = isProduction ? '/tmp/data' : path.join(APP_ROOT, 'data');

try {
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(DB_PATH, { recursive: true });
        console.log(`✅ Directorio BD creado: ${DB_PATH}`);
    }
} catch (error) {
    console.error('❌ Error creando directorio:', error.message);
    process.exit(1);
}

process.env.USERS_DB_PATH = path.join(DB_PATH, 'users.db');
process.env.ADMIN_DB_PATH = path.join(DB_PATH, 'admin.db');
process.env.PRODUCTS_DB_PATH = path.join(DB_PATH, 'products.db');
process.env.CART_DB_PATH = path.join(DB_PATH, 'cart.db');

console.log('\n💾 BASES DE DATOS:');
console.log(`   📍 Users DB: ${process.env.USERS_DB_PATH}`);
console.log(`   📍 Admin DB: ${process.env.ADMIN_DB_PATH}`);
console.log(`   📍 Products DB: ${process.env.PRODUCTS_DB_PATH}`);
console.log(`   📍 Cart DB: ${process.env.CART_DB_PATH}\n`);

try {
    initializeDatabase();
    initializeAdminDatabase();
    initializeProductsDatabase();
    initializeCartDatabase();
    console.log('✅ Bases de datos inicializadas\n');
} catch (error) {
    console.error('❌ Error inicializando BD:', error.message);
    process.exit(1);
}

const app = express();
app.set("port", process.env.PORT || 10000);

app.use(express.static(path.join(APP_ROOT, "public")));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    const allowedOrigins = [
        'https://tienda-de-panes-dode.onrender.com',
        `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`,
        'http://localhost:4000',
        'http://localhost:10000'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.get("/", (req, res) => res.sendFile(path.join(APP_ROOT, "paginas", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(APP_ROOT, "paginas", "register.html")));
app.get("/loginadmin", (req, res) => res.sendFile(path.join(APP_ROOT, "paginas", "loginadmin.html")));
app.get("/registeradmin", (req, res) => res.sendFile(path.join(APP_ROOT, "paginas", "registeradmin.html")));

app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);
app.post("/api/admin/login", adminAuthentication.login);
app.post("/api/admin/register", adminAuthentication.register);
app.post("/api/logout", authentication.logout);
app.post("/api/admin/logout", adminAuthentication.logout);

app.get("/api/products", productsMethods.getAllProducts);
app.get("/api/products/id/:id", productsMethods.getProductById);
app.get("/api/products/codigo/:codigo", productsMethods.getProductByCode);
app.post("/api/products", verifyAdminToken, productsMethods.createProduct);
app.put("/api/products/:id", verifyAdminToken, productsMethods.updateProduct);
app.delete("/api/products/:id", verifyAdminToken, productsMethods.deleteProduct);

app.get("/api/cart", verifyToken, cartMethods.getOrCreateCart);
app.get("/api/cart/items", verifyToken, cartMethods.getCartItems);
app.post("/api/cart/add", verifyToken, cartMethods.addToCart);
app.put("/api/cart/update", verifyToken, cartMethods.updateQuantity);
app.delete("/api/cart/item/:itemId", verifyToken, cartMethods.removeItem);
app.delete("/api/cart/clear", verifyToken, cartMethods.clearCart);

app.get("/admin", verifyToken, (req, res) => res.sendFile(path.join(APP_ROOT, "paginas", "admin", "admin.html")));
app.get("/adminvip", verifyAdminToken, (req, res) => res.sendFile(path.join(APP_ROOT, "paginas", "adminvip", "adminvip.html")));

app.get("/api/verify", verifyToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get("/api/admin/verify", verifyAdminToken, (req, res) => {
    res.json({ success: true, user: req.admin });
});

app.use((req, res) => {
    res.redirect('/');
});

app.use((err, req, res, next) => {
    console.error('❌ Error global:', err.message);
    res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
    });
});

const server = app.listen(app.get("port"), '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 RENDER - SERVIDOR ACTIVO');
    console.log('='.repeat(60));
    console.log(`📍 App Root: ${APP_ROOT}`);
    console.log(`📍 Puerto: ${app.get("port")}`);
    console.log(`📍 URL: https://tienda-de-panes-dode.onrender.com`);
    console.log(`📍 BD: ${DB_PATH} (${isProduction ? 'temporal' : 'local'})`);
    console.log('='.repeat(60) + '\n');
});

process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor...');
    server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor...');
    server.close(() => process.exit(0));
});
