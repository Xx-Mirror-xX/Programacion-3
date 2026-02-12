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
        const res = await fetch("http://localhost:4000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, email, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("Usuario registrado exitosamente. Por favor inicia sesión.");
            window.location.href = "/";
        } else {
            errorElement.textContent = data.error || "Error al registrar usuario";
            errorElement.classList.remove("escondido");
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrarse";
        }
    } catch (error) {
        errorElement.textContent = "Error de conexión con el servidor";
        errorElement.classList.remove("escondido");
        submitBtn.disabled = false;
        submitBtn.textContent = "Registrarse";
    }
});