const API_URL = window.location.origin;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("adminToken");
        
        if (!token) {
            window.location.href = "/loginadmin";
            return;
        }
        
        const res = await fetch(`${API_URL}/api/admin/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
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
            addActivityLog(`🥖 ${admin.username} encendió el horno`);
            
            const avatar = document.getElementById('corporate-avatar');
            if (avatar && admin.username) {
                avatar.textContent = admin.username.charAt(0).toUpperCase();
            }
        } else {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("currentAdmin");
            window.location.href = "/loginadmin";
        }
    } catch (error) {
        console.error("Error al verificar admin:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("currentAdmin");
        window.location.href = "/loginadmin";
    }
});

async function loadTotalProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            credentials: 'include'
        });
        
        const data = await res.json();
        
        const totalProductsEl = document.getElementById('total-products');
        if (totalProductsEl && data.success) {
            totalProductsEl.textContent = data.products.length || 0;
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
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
        <div class="activity-icon">🥖</div>
        <div class="activity-content">
            <div class="activity-text">${escapeHTML(message)}</div>
            <div class="activity-time">${timeString}</div>
        </div>
    `;
    
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);
    
    if (activityFeed.children.length > 5) {
        activityFeed.removeChild(activityFeed.lastChild);
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
                showMessage("📌 El código del pan es obligatorio", "error");
                codigo.focus();
                return;
            }
            
            if (!nombre.value.trim()) {
                showMessage("🏷️ El nombre del pan es obligatorio", "error");
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
                createBtn.innerHTML = '<span>🥖</span> HORNEANDO... <span>⏳</span>';
                
                const res = await fetch(`${API_URL}/api/products`, {
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
                    showMessage(`✅ Pan ${codigo.value.trim()} horneado exitosamente`, "success");
                    addActivityLog(`🍞 ${nombre.value.trim()} agregado al menú`);
                    
                    codigo.value = "";
                    nombre.value = "";
                    precio.value = "";
                    descripcion.value = "";
                    
                    loadTotalProducts();
                } else {
                    showMessage(data.error || "Error al hornear el pan", "error");
                }
            } catch (error) {
                showMessage("Error de conexión con el horno", "error");
            } finally {
                createBtn.disabled = false;
                createBtn.innerHTML = '<span>🥖</span> REGISTRAR NUEVO PAN <span>✨</span>';
            }
        });
    }
    
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `corporate-message ${type}`;
            messageDiv.style.display = "block";
            
            setTimeout(() => {
                messageDiv.style.display = "none";
            }, 4000);
        }
    }
}

document.querySelector("#logout-btn")?.addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("adminToken");
        await fetch(`${API_URL}/api/admin/logout`, {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    } finally {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("currentAdmin");
        window.location.href = "/loginadmin";
    }
});


function updateTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

setInterval(updateTime, 1000);
