const API_URL = window.location.origin;

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const user = document.getElementById("user").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorElement = document.querySelector(".error");
    const submitBtn = document.querySelector("button[type='submit']");
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";
    
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, email, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Usuario registrado exitosamente. Por favor inicia sesión.");
            window.location.href = "/";
        } else {
            errorElement.textContent = data.error || "Error al registrar usuario";
            errorElement.classList.remove("escondido");
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrarse";
        }
    } catch (error) {
        console.error("Error en registro:", error);
        errorElement.textContent = "Error de conexión con el servidor";
        errorElement.classList.remove("escondido");
        submitBtn.disabled = false;
        submitBtn.textContent = "Registrarse";
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
