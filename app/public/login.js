const API_URL = window.location.origin;

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;
    const errorElement = document.querySelector(".error");
    const submitBtn = document.querySelector("button[type='submit']");
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Iniciando sesión...";
    
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, password }),
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            window.location.href = "/admin";
        } else {
            errorElement.textContent = data.error || "Error al iniciar sesión";
            errorElement.classList.remove("escondido");
            submitBtn.disabled = false;
            submitBtn.textContent = "Iniciar sesion";
        }
    } catch (error) {
        console.error("Error en login:", error);
        errorElement.textContent = "Error de conexión con el servidor";
        errorElement.classList.remove("escondido");
        submitBtn.disabled = false;
        submitBtn.textContent = "Iniciar sesion";
    }
});


document.getElementById("user").addEventListener("input", () => {
    document.querySelector(".error")?.classList.add("escondido");
});

document.getElementById("password").addEventListener("input", () => {
    document.querySelector(".error")?.classList.add("escondido");
});
