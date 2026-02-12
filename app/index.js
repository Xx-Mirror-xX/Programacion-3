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

const isProduction = process.env.NODE_ENV === 'production';
const DB_PATH = isProduction ? '/opt/data' : __dirname;

if (isProduction && !fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

process.env.USERS_DB_PATH = path.join(DB_PATH, 'users.db');
process.env.ADMIN_DB_PATH = path.join(DB_PATH, 'admin.db');
process.env.PRODUCTS_DB_PATH = path.join(DB_PATH, 'products.db');
process.env.CART_DB_PATH = path.join(DB_PATH, 'cart.db');

initializeDatabase();
initializeAdminDatabase();
initializeProductsDatabase();
initializeCartDatabase();

const app = express();
app.set("port", process.env.PORT || 10000);

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    const allowedOrigins = [
        'https://tienda-de-panes.onrender.com',
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

app.get("/", (req, res) => res.sendFile(__dirname + "/paginas/login.html"));
app.get("/register", (req, res) => res.sendFile(__dirname + "/paginas/register.html"));
app.get("/loginadmin", (req, res) => res.sendFile(__dirname + "/paginas/loginadmin.html"));
app.get("/registeradmin", (req, res) => res.sendFile(__dirname + "/paginas/registeradmin.html"));

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

app.get("/admin", verifyToken, (req, res) => res.sendFile(__dirname + "/paginas/admin/admin.html"));
app.get("/adminvip", verifyAdminToken, (req, res) => res.sendFile(__dirname + "/paginas/adminvip/adminvip.html"));

app.get("/api/verify", verifyToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get("/api/admin/verify", verifyAdminToken, (req, res) => {
    res.json({ success: true, user: req.admin });
});

app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/paginas/404.html");
});

app.listen(app.get("port"), '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVIDOR CORRIENDO EN:');
    console.log(`📍 LOCAL: http://localhost:${app.get("port")}`);
    if (isProduction) {
        console.log(`📍 RENDER: https://tienda-de-panes.onrender.com`);
    }
    console.log('='.repeat(60) + '\n');
});