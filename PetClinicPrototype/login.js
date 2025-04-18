// Wait for the DOM to fully load before executing the script
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  // Grabbing CAPTCHA-related DOM elements
  const captchaType = document.getElementById("captcha-type");
  const arithmeticContainer = document.getElementById("arithmetic-captcha-container");
  const imageContainer = document.getElementById("image-captcha-container");
  const arithmeticChallenge = document.getElementById("arithmetic-challenge");
  const arithmeticAnswerInput = document.getElementById("arithmetic-answer");
  const arithmeticError = document.getElementById("arithmetic-error");
  const imageOptions = document.getElementById("image-options");
  const imageChallengeText = document.getElementById("image-challenge-text");
  const imageError = document.getElementById("image-error");

  // Create and insert lockout message placeholder
  const lockoutMessage = document.createElement("p");
  lockoutMessage.className = "text-red-600 text-center mt-2 font-bold";
  form.insertBefore(lockoutMessage, form.firstChild);

  const loginButton = form.querySelector("button[type='submit']");

  // State variables
  let correctArithmeticAnswer = 0;
  let correctImageTarget = "";
  let failedAttempts = 0;
  let isLockedOut = false;
  let lockoutTimer = null;
  let timeRemaining = 60;
  let expectedCorrectImageCount = 0;

  // Generate a new arithmetic CAPTCHA question
  function generateArithmeticCaptcha() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    correctArithmeticAnswer = a + b;
    arithmeticChallenge.textContent = `${a} + ${b} = ?`;
    arithmeticError.classList.add("hidden");
  }

  // Generate a new image CAPTCHA challenge
  function renderImageCaptcha() {
    imageOptions.innerHTML = "";

    // Possible animal categories
    const types = ["cat", "dog", "rabbit", "horse"];
    correctImageTarget = types[Math.floor(Math.random() * types.length)];
    imageChallengeText.textContent = correctImageTarget;

    // Image pool: 2 for each animal + 6 distractors
    const allImages = [
      { type: "cat", src: "Capcha_images/cat1.jpg" },
      { type: "cat", src: "Capcha_images/cat2.jpg" },
      { type: "dog", src: "Capcha_images/dog1.jpg" },
      { type: "dog", src: "Capcha_images/dog2.jpg" },
      { type: "rabbit", src: "Capcha_images/rabbit1.jpg" },
      { type: "rabbit", src: "Capcha_images/rabbit2.jpg" },
      { type: "horse", src: "Capcha_images/horse1.jpg" },
      { type: "horse", src: "Capcha_images/horse2.jpg" },
      { type: "random", src: "Capcha_images/random0.jpg" },
      { type: "random", src: "Capcha_images/random1.jpg" },
      { type: "random", src: "Capcha_images/random2.jpg" },
      { type: "random", src: "Capcha_images/random3.jpg" },
      { type: "random", src: "Capcha_images/random4.jpg" },
      { type: "random", src: "Capcha_images/random5.jpg" }
    ];

    const correctImages = allImages.filter(img => img.type === correctImageTarget);
    const distractors = allImages.filter(img => img.type !== correctImageTarget);

    expectedCorrectImageCount = Math.min(2, correctImages.length); // Expecting up to 2
    const guaranteedSet = [];
    const used = new Set();

    // Select 1–2 guaranteed correct images
    while (guaranteedSet.length < expectedCorrectImageCount) {
      const candidate = correctImages[Math.floor(Math.random() * correctImages.length)];
      if (!used.has(candidate.src)) {
        guaranteedSet.push(candidate);
        used.add(candidate.src);
      }
    }

    // Fill the rest with distractors
    const distractorPool = distractors.filter(img => !used.has(img.src));
    distractorPool.sort(() => 0.5 - Math.random());

    const selected = [...guaranteedSet];
    for (let i = 0; i < distractorPool.length && selected.length < 6; i++) {
      if (!used.has(distractorPool[i].src)) {
        used.add(distractorPool[i].src);
        selected.push(distractorPool[i]);
      }
    }

    // Shuffle and render selected images
    selected.sort(() => 0.5 - Math.random());
    selected.forEach(img => {
      const el = document.createElement("img");
      el.src = img.src;
      el.alt = img.type;
      el.dataset.type = img.type;
      el.className = "captcha-image-option w-20 h-20 border border-gray-300 cursor-pointer object-cover";
      el.addEventListener("click", () => {
        el.classList.toggle("selected");
        el.style.border = el.classList.contains("selected") ? "2px solid blue" : "1px solid #ccc";
      });
      imageOptions.appendChild(el);
    });

    imageError.classList.add("hidden");
  }

  // Switch CAPTCHA type dynamically
  captchaType.addEventListener("change", function () {
    if (captchaType.value === "arithmetic") {
      arithmeticContainer.classList.remove("hidden");
      imageContainer.classList.add("hidden");
      generateArithmeticCaptcha();
    } else {
      arithmeticContainer.classList.add("hidden");
      imageContainer.classList.remove("hidden");
      renderImageCaptcha();
    }
  });

  // Manual refresh for both types
  document.getElementById("refresh-arithmetic-captcha").addEventListener("click", generateArithmeticCaptcha);
  document.getElementById("refresh-image-captcha").addEventListener("click", renderImageCaptcha);

  // Load a default arithmetic CAPTCHA on first load
  generateArithmeticCaptcha();

  // Start lockout timer (1 minute)
  function startLockoutTimer() {
    isLockedOut = true;
    lockoutMessage.textContent = `Please try in ${timeRemaining} seconds`;
    loginButton.disabled = true;
    loginButton.classList.remove("bg-sky-700", "hover:bg-sky-800");
    loginButton.classList.add("bg-gray-400", "cursor-not-allowed");
    arithmeticContainer.classList.add("hidden");
    imageContainer.classList.add("hidden");
    captchaType.disabled = true;

    lockoutTimer = setInterval(() => {
      timeRemaining--;
      lockoutMessage.textContent = `Please try in ${timeRemaining} seconds`;
      if (timeRemaining <= 0) {
        clearInterval(lockoutTimer);
        isLockedOut = false;
        failedAttempts = 0;
        timeRemaining = 60;
        lockoutMessage.textContent = "";
        loginButton.disabled = false;
        loginButton.classList.remove("bg-gray-400", "cursor-not-allowed");
        loginButton.classList.add("bg-sky-700", "hover:bg-sky-800");
        captchaType.disabled = false;
        captchaType.dispatchEvent(new Event("change")); // regenerate CAPTCHA
      }
    }, 1000);
  }

  // Handle login form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (isLockedOut) {
      alert("Too many failed attempts. Please wait.");
      return;
    }

    const identifier = document.getElementById("userInput").value.trim();
    const password = document.getElementById("passInput").value;
    if (!identifier || !password) return;

    let captchaPassed = false;

    // Arithmetic CAPTCHA validation
    if (captchaType.value === "arithmetic") {
      const userAnswer = arithmeticAnswerInput.value.trim();
      if (parseInt(userAnswer) === correctArithmeticAnswer) {
        captchaPassed = true;
        arithmeticError.classList.add("hidden");
      } else {
        arithmeticError.classList.remove("hidden");
        generateArithmeticCaptcha();
        failedAttempts++;
      }
    } 
    // Image CAPTCHA validation
    else {
      const selected = [...document.querySelectorAll(".captcha-image-option.selected")];
      const correctSelected = selected.filter(img => img.dataset.type === correctImageTarget);
      const incorrectSelected = selected.filter(img => img.dataset.type !== correctImageTarget);
      captchaPassed = correctSelected.length === expectedCorrectImageCount && incorrectSelected.length === 0;
      
      if (!captchaPassed) {
        imageError.classList.remove("hidden");
        renderImageCaptcha();
        failedAttempts++;
      } else {
        imageError.classList.add("hidden");
      }
    }

    // Lockout after 3 failures
    if (!captchaPassed) {
      if (failedAttempts >= 3) {
        startLockoutTimer();
      }
      return;
    }

    // Attempt login with localStorage data
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      u =>
        (u.email === identifier || u.username === identifier) &&
        u.password === password
    );

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "user.html";
    } else {
      alert("Invalid credentials.");
    }
  });

  // Prevent registration while locked out
  const registerLink = document.querySelector("a[href='register.html']");
  if (registerLink) {
    registerLink.addEventListener("click", function (e) {
      if (isLockedOut) {
        e.preventDefault();
        alert("You cannot register during lockout. Please wait.");
      }
    });
  }
});
