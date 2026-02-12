const API_URL = window.location.origin;

let currentView = 'all';
let cartItems = [];
let currentUserId = null;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            window.location.href = "/";
            return;
        }
        
        const res = await fetch(`${API_URL}/api/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            const user = data.user;
            currentUserId = user.id;
            const welcomeElement = document.getElementById("welcome-message");
            if (welcomeElement) {
                welcomeElement.textContent = user.username;
            }
            
            loadAllProducts();
            loadCart();
            setupEventListeners();
            setupLogoutButton();
            setupCartButton();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            window.location.href = "/";
        }
    } catch (error) {
        console.error("Error en la inicialización:", error);
        window.location.href = "/";
    }
});


function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                const token = localStorage.getItem("token");
                await fetch(`${API_URL}/api/logout`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include'
                });
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            } finally {
                localStorage.removeItem("token");
                localStorage.removeItem("currentUser");
                window.location.href = "/";
            }
        });
    }
}

function setupCartButton() {
    const cartBtn = document.getElementById("cart-floating-btn");
    const cartModal = document.getElementById("cart-modal");
    const closeCartBtn = document.getElementById("close-cart-btn");
    
    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            openCartModal();
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", () => {
            closeCartModal();
        });
    }
    
    window.addEventListener("click", (e) => {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
}

function openCartModal() {
    const cartModal = document.getElementById("cart-modal");
    if (cartModal) {
        cartModal.style.display = "block";
        document.body.style.overflow = "hidden";
        displayModalCart();
    }
}

function closeCartModal() {
    const cartModal = document.getElementById("cart-modal");
    if (cartModal) {
        cartModal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

function displayModalCart() {
    const container = document.getElementById("modal-cart-items");
    const footer = document.getElementById("cart-modal-footer");
    const totalElement = document.getElementById("modal-cart-total");
    const cartCount = document.getElementById("cart-count");
    
    if (cartCount) {
        cartCount.textContent = cartItems.length || 0;
    }
    
    if (!cartItems || cartItems.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="modal-empty-cart-message">
                    <span>🍞</span>
                    Tu carrito está vacío<br>
                    <small style="font-size: 13px; color: #95a5a6;">Agrega algunos panes deliciosos</small>
                </div>
            `;
        }
        if (footer) footer.style.display = "none";
        return;
    }
    
    let html = '';
    let total = 0;
    
    cartItems.forEach(item => {
        const subtotal = item.product_price * item.quantity;
        total += subtotal;
        
        html += `
            <div class="modal-cart-item" data-item-id="${item.id}">
                <div class="modal-cart-item-info">
                    <div class="modal-cart-item-icon">🍞</div>
                    <div class="modal-cart-item-details">
                        <div class="modal-cart-item-name">${escapeHTML(item.product_name)}</div>
                        <div class="modal-cart-item-code">${item.product_code}</div>
                    </div>
                </div>
                <div class="modal-cart-item-price">$${parseFloat(item.product_price).toFixed(2)} c/u</div>
                <div class="modal-cart-item-quantity">
                    <button class="modal-quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span class="modal-quantity-value">${item.quantity}</span>
                    <button class="modal-quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="modal-cart-item-subtotal">$${subtotal.toFixed(2)}</div>
                <button class="modal-remove-item-btn" onclick="removeFromCart(${item.id})">
                    🗑️ ELIMINAR
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    if (footer) {
        footer.style.display = "flex";
        totalElement.textContent = total.toFixed(2);
    }
}

function escapeHTML(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setupEventListeners() {
    const viewAllBtn = document.getElementById("view-all-btn");
    const viewSingleBtn = document.getElementById("view-single-btn");
    const singleSearch = document.getElementById("single-search");
    const searchBtn = document.getElementById("search-btn");
    const searchCode = document.getElementById("search-code");
    const modalClearCartBtn = document.getElementById("modal-clear-cart-btn");
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", () => {
            currentView = 'all';
            viewAllBtn.classList.add("active");
            viewSingleBtn.classList.remove("active");
            singleSearch.style.display = "none";
            loadAllProducts();
        });
    }
    
    if (viewSingleBtn) {
        viewSingleBtn.addEventListener("click", () => {
            currentView = 'single';
            viewSingleBtn.classList.add("active");
            viewAllBtn.classList.remove("active");
            singleSearch.style.display = "block";
            document.getElementById("products-container").innerHTML = "";
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const codigo = searchCode.value.trim();
            if (codigo) {
                searchProductByCode(codigo);
            } else {
                alert("Por favor ingrese un código de pan");
            }
        });
    }
    
    if (searchCode) {
        searchCode.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchBtn.click();
            }
        });
    }
    
    if (modalClearCartBtn) {
        modalClearCartBtn.addEventListener("click", clearCart);
    }
}


async function loadCart() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/cart/items`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            cartItems = data.items || [];
            displayModalCart();
            updateCartCount();
        }
    } catch (error) {
        console.error("Error al cargar carrito:", error);
    }
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = cartItems.length || 0;
    }
}

async function addToCart(productId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 }),
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            showNotification("✅ Pan agregado al carrito", "success");
            await loadCart();
        } else {
            showNotification(data.error || "Error al agregar al carrito", "error");
        }
    } catch (error) {
        showNotification("Error de conexión", "error");
    }
}

async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return;
    
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/cart/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ itemId, quantity: newQuantity }),
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            await loadCart();
        }
    } catch (error) {
        console.error("Error al actualizar cantidad:", error);
    }
}

async function removeFromCart(itemId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/cart/item/${itemId}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            showNotification("✅ Producto eliminado del carrito", "success");
            await loadCart();
        }
    } catch (error) {
        showNotification("Error al eliminar", "error");
    }
}

async function clearCart() {
    if (!confirm("¿Estás seguro de vaciar tu carrito?")) return;
    
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/cart/clear`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            showNotification("🔄 Carrito vaciado", "success");
            await loadCart();
            closeCartModal();
        }
    } catch (error) {
        showNotification("Error al vaciar carrito", "error");
    }
}


async function loadAllProducts() {
    const container = document.getElementById("products-container");
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px;"><span style="font-size: 60px; animation: girarPan 6s linear infinite; display: inline-block;">🍞</span><br><span style="color: #7f8c8d; font-size: 16px; margin-top: 20px; display: block;">Cargando panes...</span></div>';
    
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success && data.products.length > 0) {
            displayProducts(data.products);
        } else {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px;"><span style="font-size: 70px; animation: girarPan 6s linear infinite; display: inline-block;">🍞</span><br><span style="color: #7f8c8d; font-size: 18px; margin-top: 20px; display: block;">No hay panes disponibles</span><br><span style="color: #95a5a6; font-size: 13px;">Los maestros panaderos pueden agregar nuevos panes</span></div>';
        }
    } catch (error) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px;"><span style="font-size: 50px;">❌</span><br><span style="color: #e74c3c; font-size: 16px; margin-top: 20px; display: block;">Error al cargar panes</span></div>';
    }
}

async function searchProductByCode(codigo) {
    const container = document.getElementById("products-container");
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px;"><span style="font-size: 50px; animation: girarPan 6s linear infinite; display: inline-block;">🔍</span><br><span style="color: #7f8c8d; font-size: 16px; margin-top: 20px; display: block;">Buscando pan...</span></div>';
    
    try {
        const res = await fetch(`${API_URL}/api/products/codigo/${codigo}`, {
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            displaySingleProduct(data.product);
        } else {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px;"><span style="font-size: 60px;">🔎</span><br><span style="color: #7f8c8d; font-size: 18px; margin-top: 20px; display: block;">Pan no encontrado</span><br><span style="color: #95a5a6; font-size: 13px;">El código ingresado no existe en nuestra panadería</span></div>';
        }
    } catch (error) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 80px;"><span style="font-size: 50px;">❌</span><br><span style="color: #e74c3c; font-size: 16px; margin-top: 20px; display: block;">Error al buscar pan</span></div>';
    }
}

function displayProducts(products) {
    const container = document.getElementById("products-container");
    container.className = 'store-products-grid';
    
    let html = '';
    
    products.forEach(product => {
        html += `
            <div class="store-product-card">
                <div class="product-image">
                    <span>🍞</span>
                </div>
                <div class="product-info">
                    <div class="product-code">${escapeHTML(product.codigo)}</div>
                    <div class="product-name">${escapeHTML(product.nombre)}</div>
                    <div class="product-price">${parseFloat(product.precio).toFixed(2)}</div>
                    <div class="product-description">${escapeHTML(product.descripcion) || 'Pan artesanal de primera calidad'}</div>
                    <div class="product-footer">
                        <span class="product-date">📅 ${new Date(product.created_at).toLocaleDateString('es-ES')}</span>
                        <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                            🛒 AGREGAR
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function displaySingleProduct(product) {
    const container = document.getElementById("products-container");
    
    container.innerHTML = `
        <div class="store-single-view" style="grid-column: 1/-1;">
            <div class="store-single-header">
                <button onclick="window.loadAllProducts()" class="store-back-btn">
                    ← VOLVER A PANES
                </button>
                <h2>🔍 PAN ENCONTRADO</h2>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 40px;">
                <div style="background: linear-gradient(145deg, #f8f9fa, #e9ecef); border-radius: 16px; display: flex; align-items: center; justify-content: center; padding: 40px;">
                    <span class="tostadora-giratoria">🍞</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                        <div style="color: #95a5a6; font-size: 12px; font-weight: 600; margin-bottom: 6px;">CÓDIGO DEL PAN</div>
                        <div style="font-size: 18px; color: #2c3e50; font-weight: 700;">${escapeHTML(product.codigo)}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                        <div style="color: #95a5a6; font-size: 12px; font-weight: 600; margin-bottom: 6px;">NOMBRE DEL PAN</div>
                        <div style="font-size: 22px; color: #2c3e50; font-weight: 700;">${escapeHTML(product.nombre)}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                        <div style="color: #95a5a6; font-size: 12px; font-weight: 600; margin-bottom: 6px;">PRECIO</div>
                        <div style="font-size: 32px; font-weight: 800; color: #34495e;">$${parseFloat(product.precio).toFixed(2)}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                        <div style="color: #95a5a6; font-size: 12px; font-weight: 600; margin-bottom: 6px;">DESCRIPCIÓN</div>
                        <div style="font-size: 15px; color: #2c3e50;">${escapeHTML(product.descripcion) || 'Pan artesanal de primera calidad'}</div>
                    </div>
                    <button onclick="addToCart(${product.id})" class="add-to-cart-btn" style="margin-top: 20px; width: 100%; justify-content: center; padding: 15px;">
                        🛒 AGREGAR ESTE PAN AL CARRITO
                    </button>
                </div>
            </div>
        </div>
    `;
}


function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}


window.loadAllProducts = loadAllProducts;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
