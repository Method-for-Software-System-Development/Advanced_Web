document.addEventListener("DOMContentLoaded", function () {
  // Fake users
  const fakeUsers = [
    {
      username: "Ilan Tavori",
      email: "ilan@example.com",
      password: "123",
      animals: [
        { name: "Tommy", breed: "Labrador" },
        { name: "Lucy", breed: "Persian Cat" },
        { name: "Kuki", breed: "Hamster" },
      ]
    },
    {
      username: "Donna May",
      email: "sapir@example.com",
      password: "123",
      animals: [
        { name: "Sap", breed: "Bulldog" },
        { name: "Nala", breed: "Golden Retriever" },
      ]
    },
    {
      username: "Noam Cohen",
      email: "noam@example.com",
      password: "123",
      animals: [
        { name: "Chico", breed: "Parrot" },
        { name: "Snuffles", breed: "Guinea Pig" },
        { name: "Milo", breed: "Beagle" },
      ]
    }
  ];

  // Load existing users from localStorage and add only if not already present
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  fakeUsers.forEach(fakeUser => {
    const exists = users.find(u => u.email === fakeUser.email);
    if (!exists) {
      users.push(fakeUser);
    }
  });

  // Save updated user list
  localStorage.setItem("users", JSON.stringify(users));
});
