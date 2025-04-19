// Wait until the DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
    // Retrieve the logged-in user from local storage
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
    // If no user is found (user not logged in), redirect to the login page
    if (!user) {
      window.location.href = "login.html";
      return;
    }
  
    // Display greeting with the user's name
    const greeting = document.getElementById("greeting");
    if (greeting && user.username) {
      greeting.textContent = `Hello, ${user.username}!`;
    }
  
    // Get the container where pet cards will be displayed
    const petsGrid = document.getElementById("petsGrid");
  
    // If the user has registered animals, create and display a card for each
    if (user.animals && user.animals.length > 0) {
      user.animals.forEach(animal => {
        // Create a styled card div for the pet
        const card = document.createElement("div");
        card.className = "bg-gray-200 p-4 rounded-lg shadow hover:bg-gray-300 transition";
  
        // Insert animal name and breed into the card
        card.innerHTML = `
          <h2 class="text-lg font-bold text-gray-800 mb-2">${animal.name}</h2>
          <p class="text-sm text-gray-600">${animal.breed}</p>
        `;
  
        // Add the card to the pets grid
        petsGrid.appendChild(card);
      });
    } else {
      // If no pets are registered, show a placeholder message
      petsGrid.innerHTML = `<p class="text-center text-gray-500 col-span-3">No pets registered.</p>`;
    }
  });
  
  // Function to log out the user
  function signOut() {
    localStorage.removeItem("loggedInUser"); // Remove user session
    window.location.href = "login.html";     // Redirect to login page
  }
  