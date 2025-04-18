document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
  
    form.addEventListener("submit", function (e) { 
        e.preventDefault();
  
        // Get input values
        const username = document.getElementById("userInput").value.trim();
        const email = document.getElementById("mailInput").value.trim();
        const password = document.getElementById("passInput").value;
        const confirm = document.getElementById("confirmInput").value;

        const petName = document.getElementById("petName").value.trim();
        const petBreed = document.getElementById("petBreed").value.trim();
  
        // Password match check
        if (password !== confirm) {
            return;
        }
  
        // Check for existing email
        let users = JSON.parse(localStorage.getItem("users") || "[]");
  
        const duplicate = users.find(user => user.email === email);
        if (duplicate) {
            alert("Mail already taken")
            return;
        }

        // Creating a new animal 
        const newAnimal = {
            name: petName,
            breed: petBreed
        };

        // Create user with animal list
        const newUser = {
            username: username,
            email: email,
            password: password,
            animals: [newAnimal]
        };
  
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
  
        // Redirect to login page
        window.location.href = "login.html";
    });
});
  