const API_URL = window.location.origin;

document.getElementById("register-admin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const user = document.getElementById("user").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorElement = document.querySelector(".error");
    const submitBtn = document.querySelector("button[type='submit']");
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando administrador...";
    
    try {
        const res = await fetch(`${API_URL}/api/admin/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, email, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Administrador registrado exitosamente. Por favor inicia sesión.");
            window.location.href = "/loginadmin";
        } else {
            errorElement.textContent = data.error || "Error al registrar administrador";
            errorElement.classList.remove("escondido");
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrar Administrador";
        }
    } catch (error) {
        console.error("Error en registro admin:", error);
        errorElement.textContent = "Error de conexión con el servidor";
        errorElement.classList.remove("escondido");
        submitBtn.disabled = false;
        submitBtn.textContent = "Registrar Administrador";
    }
});


document.getElementById("user")?.addEventListener("input", () => {
    document.querySelector(".error")?.classList.add("escondido");
});

document.getElementById("email")?.addEventListener("input", () => {
    document.querySelector(".error")?.classList.add("escondido");
});

document.getElementById("password")?.addEventListener("input", () => {
    document.querySelector(".error")?.classList.add("escondido");
});
