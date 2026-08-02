from flask import Blueprint, jsonify, request
from app.services.weather import fetch_historical_weather

climate_bp = Blueprint("climate", __name__)


@climate_bp.route("/climate", methods=["GET"])
def get_climate_data():
    start_year = request.args.get("start_year", 2010, type=int)
    end_year = request.args.get("end_year", None, type=int)

    data = fetch_historical_weather(start_year=start_year, end_year=end_year)

    if data is None:
        return jsonify({"error": "Failed to fetch weather data"}), 502

    return jsonify(data)
