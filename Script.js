// SWITCH BETWEEN DASHBOARD SECTIONS

function showSection(sectionName) {

    document.getElementById("weather")
        .classList.add("hidden");

    document.getElementById("crypto")
        .classList.add("hidden");

    document.getElementById(sectionName)
        .classList.remove("hidden");
}


// GET REAL-TIME WEATHER

async function getWeather() {

    const city = document.getElementById("city").value.trim();

    const status = document.getElementById("weatherStatus");

    if (!city) {
        status.textContent = "Please enter a city name.";
        return;
    }

    status.textContent = "Loading weather data...";

    try {

        const response = await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Weather request failed");
        }

        document.getElementById("location").textContent =
            `${data.city}, ${data.country}`;

        document.getElementById("temperature").textContent =
            `${data.temperature} °C`;

        document.getElementById("description").textContent =
            data.description;

        document.getElementById("humidity").textContent =
            `${data.humidity}%`;

        document.getElementById("wind").textContent =
            `${data.wind} m/s`;

        document.getElementById("weatherIcon").src =
            `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

        status.textContent = "Weather updated successfully.";

    } catch (error) {

        status.textContent = error.message;

    }
}


// AUTO REFRESH WEATHER EVERY 60 SECONDS

setInterval(() => {

    const city = document.getElementById("city").value.trim();

    if (city && !document.getElementById("weather").classList.contains("hidden")) {
        getWeather();
    }

}, 60000);


// GENERATE ENCRYPTION KEY

async function generateKey() {

    const status = document.getElementById("cryptoStatus");

    try {

        const response = await fetch("/api/generate-key", {
            method: "POST"
        });

        const data = await response.json();

        document.getElementById("key").value = data.key;

        status.textContent =
            "New encryption key generated. Save it securely.";

    } catch (error) {

        status.textContent = "Unable to generate key.";

    }
}


// ENCRYPT MESSAGE

async function encryptMessage() {

    const message = document.getElementById("message").value;
    const key = document.getElementById("key").value.trim();

    if (!message || !key) {
        document.getElementById("cryptoStatus").textContent =
            "Enter a message and encryption key.";
        return;
    }

    try {

        const response = await fetch("/api/encrypt", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                key: key
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        document.getElementById("result").value =
            data.encrypted;

        document.getElementById("cryptoStatus").textContent =
            "Message encrypted successfully.";

    } catch (error) {

        document.getElementById("cryptoStatus").textContent =
            error.message;

    }
}


// DECRYPT MESSAGE

async function decryptMessage() {

    const message = document.getElementById("message").value.trim();
    const key = document.getElementById("key").value.trim();

    if (!message || !key) {
        document.getElementById("cryptoStatus").textContent =
            "Enter encrypted text and the correct key.";
        return;
    }

    try {

        const response = await fetch("/api/decrypt", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                key: key
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        document.getElementById("result").value =
            data.decrypted;

        document.getElementById("cryptoStatus").textContent =
            "Message decrypted successfully.";

    } catch (error) {

        document.getElementById("cryptoStatus").textContent =
            error.message;

    }
}


// COPY RESULT

async function copyResult() {

    const result = document.getElementById("result").value;

    if (!result) {
        document.getElementById("cryptoStatus").textContent =
            "Nothing to copy.";
        return;
    }

    try {
        await navigator.clipboard.writeText(result);

        document.getElementById("cryptoStatus").textContent =
            "Result copied successfully.";
    } catch (error) {
        document.getElementById("cryptoStatus").textContent =
            "Clipboard access failed.";
    }
}
