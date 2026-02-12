document.getElementById("register-admin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const user = document.getElementById("user").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorElement = document.querySelector(".error");
    const submitBtn = document.querySelector("button[type='submit']");
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";
    
    try {
        const res = await fetch("http://localhost:4000/api/admin/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, email, password })
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert("Administrador registrado exitosamente. Por favor inicia sesión.");
            window.location.href = "/loginadmin";
        } else {
            errorElement.textContent = data.error || "Error al registrar administrador";
            errorElement.classList.remove("escondido");
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrar Administrador";
        }
    } catch (error) {
        errorElement.textContent = "Error de conexión con el servidor";
        errorElement.classList.remove("escondido");
        submitBtn.disabled = false;
        submitBtn.textContent = "Registrar Administrador";
    }
});