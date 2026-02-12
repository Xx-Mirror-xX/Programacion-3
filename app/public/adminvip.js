document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
            window.location.href = "/loginadmin";
            return;
        }
        
        const res = await fetch("http://localhost:4000/api/admin/verify", {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            const admin = data.user;
            
            const welcomeElement = document.getElementById("welcome-message");
            const levelElement = document.getElementById("admin-level");
            
            if (welcomeElement) {
                welcomeElement.textContent = admin.username;
            }
            if (levelElement) {
                levelElement.textContent = admin.admin_level || 'VIP';
            }
            
            loadTotalProducts();
            setupCreateProduct();
            addActivityLog(`✨ ${admin.username} inició sesión como admin`);
        } else {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("currentAdmin");
            window.location.href = "/loginadmin";
        }
    } catch (error) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("currentAdmin");
        window.location.href = "/loginadmin";
    }
});

async function loadTotalProducts() {
    try {
        const res = await fetch("http://localhost:4000/api/products", {
            credentials: 'include'
        });
        
        const data = await res.json();
        
        const totalProductsEl = document.getElementById('total-products');
        if (totalProductsEl && data.success) {
            totalProductsEl.textContent = data.products.length || 0;
        }
    } catch (error) {
        console.error('Error loading total products:', error);
    }
}

function addActivityLog(message) {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon">✨</div>
        <div class="activity-content">
            <div class="activity-text">${message}</div>
            <div class="activity-time">${timeString}</div>
        </div>
    `;
    
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);
    
    if (activityFeed.children.length > 5) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

function setupCreateProduct() {
    const createBtn = document.getElementById("btn-create-product");
    const codigo = document.getElementById("codigo");
    const nombre = document.getElementById("nombre");
    const precio = document.getElementById("precio");
    const descripcion = document.getElementById("descripcion");
    const messageDiv = document.getElementById("product-message");
    
    if (createBtn) {
        createBtn.addEventListener("click", async () => {
            if (!codigo.value.trim()) {
                showMessage("📌 El código del producto es obligatorio", "error");
                codigo.focus();
                return;
            }
            
            if (!nombre.value.trim()) {
                showMessage("🏷️ El nombre del producto es obligatorio", "error");
                nombre.focus();
                return;
            }
            
            if (!precio.value || parseFloat(precio.value) <= 0) {
                showMessage("💰 El precio debe ser mayor a $0", "error");
                precio.focus();
                return;
            }
            
            const token = localStorage.getItem("adminToken");
            
            try {
                createBtn.disabled = true;
                createBtn.innerHTML = '<span>🍞</span> PROCESANDO... <span>✨</span>';
                
                const res = await fetch("http://localhost:4000/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        codigo: codigo.value.trim(),
                        nombre: nombre.value.trim(),
                        precio: parseFloat(precio.value),
                        descripcion: descripcion.value.trim()
                    }),
                    credentials: 'include'
                });
                
                const data = await res.json();
                
                if (data.success) {
                    showMessage(`✅ Producto ${codigo.value.trim()} registrado exitosamente`, "success");
                    addActivityLog(`📦 ${nombre.value.trim()} agregado al catálogo`);
                    
                    codigo.value = "";
                    nombre.value = "";
                    precio.value = "";
                    descripcion.value = "";
                    
                    loadTotalProducts();
                } else {
                    showMessage(data.error || "Error al registrar producto", "error");
                }
            } catch (error) {
                showMessage("Error de conexión con el servidor", "error");
            } finally {
                createBtn.disabled = false;
                createBtn.innerHTML = '<span>🍞</span> REGISTRAR PRODUCTO <span>✨</span>';
            }
        });
    }
    
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `corporate-message ${type}`;
            
            setTimeout(() => {
                messageDiv.style.display = "none";
            }, 4000);
        }
    }
}

document.querySelector("#logout-btn")?.addEventListener("click", async () => {
    try {
        await fetch("http://localhost:4000/api/admin/logout", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
            },
            credentials: 'include'
        });
    } catch (error) {}
    
    localStorage.removeItem("adminToken");
    localStorage.removeItem("currentAdmin");
    window.location.href = "/loginadmin";
});