from flask import Flask, render_template, request, jsonify
import requests
import os

from cryptography.fernet import Fernet, InvalidToken

app = Flask(__name__)

API_KEY = os.getenv("WEATHER_API_KEY")


@app.route("/")
def home():
    return render_template("index.html")


# REAL-TIME WEATHER
@app.route("/api/weather")
def weather():

    city = request.args.get("city", "").strip()

    if not city:
        return jsonify({"error": "Please enter a city"}), 400

    if not API_KEY:
        return jsonify({"error": "Weather API key is not configured"}), 500

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        if response.status_code != 200:
            return jsonify({
                "error": data.get("message", "Weather unavailable")
            }), response.status_code

        result = {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "wind": data["wind"]["speed"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"]
        }

        return jsonify(result)

    except requests.RequestException:
        return jsonify({"error": "Unable to connect to weather service"}), 502


# GENERATE ENCRYPTION KEY
@app.route("/api/generate-key", methods=["POST"])
def generate_key():

    key = Fernet.generate_key().decode()

    return jsonify({"key": key})


# AES-BASED ENCRYPTION
@app.route("/api/encrypt", methods=["POST"])
def encrypt():

    data = request.get_json(silent=True) or {}

    message = data.get("message", "")
    key = data.get("key", "")

    if not message or not key:
        return jsonify({"error": "Message and key are required"}), 400

    try:
        cipher = Fernet(key.encode())
        encrypted = cipher.encrypt(message.encode()).decode()

        return jsonify({"encrypted": encrypted})

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid encryption key"}), 400


# DECRYPTION
@app.route("/api/decrypt", methods=["POST"])
def decrypt():

    data = request.get_json(silent=True) or {}

    encrypted_message = data.get("message", "")
    key = data.get("key", "")

    if not encrypted_message or not key:
        return jsonify({"error": "Encrypted text and key are required"}), 400

    try:
        cipher = Fernet(key.encode())

        decrypted = cipher.decrypt(
            encrypted_message.encode()
        ).decode()

        return jsonify({"decrypted": decrypted})

    except (InvalidToken, ValueError, TypeError):
        return jsonify({
            "error": "Invalid key or encrypted message"
        }), 400


if __name__ == "__main__":
    app.run(debug=True)
