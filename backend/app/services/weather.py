"""
Weather data service using Open-Meteo API.
Fetches historical climate data for Hacienda Yerovi coordinates.
"""

import requests
from datetime import datetime

LATITUDE = -0.81667
LONGITUDE = -78.6

OPEN_METEO_BASE = "https://archive-api.open-meteo.com/v1/archive"


def fetch_historical_weather(start_year=2010, end_year=None):
    """
    Fetch historical daily min temp and precipitation for the farm location.
    Returns yearly frost event counts and monthly climate averages.
    """
    if end_year is None:
        end_year = datetime.now().year - 1

    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "start_date": f"{start_year}-01-01",
        "end_date": f"{end_year}-12-31",
        "daily": "temperature_2m_min,temperature_2m_max,precipitation_sum",
        "timezone": "America/Guayaquil",
    }

    try:
        resp = requests.get(OPEN_METEO_BASE, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return None

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    min_temps = daily.get("temperature_2m_min", [])
    max_temps = daily.get("temperature_2m_max", [])
    precip = daily.get("precipitation_sum", [])

    frost_by_year = {}
    monthly_temps = {}
    monthly_precip = {}

    for i, date_str in enumerate(dates):
        year = int(date_str[:4])
        month = int(date_str[5:7])

        t_min = min_temps[i] if i < len(min_temps) else None
        t_max = max_temps[i] if i < len(max_temps) else None
        p = precip[i] if i < len(precip) else None

        if t_min is not None and t_min <= 0:
            frost_by_year[year] = frost_by_year.get(year, 0) + 1

        if t_min is not None and t_max is not None:
            key = month
            if key not in monthly_temps:
                monthly_temps[key] = {"min_sum": 0, "max_sum": 0, "count": 0}
            monthly_temps[key]["min_sum"] += t_min
            monthly_temps[key]["max_sum"] += t_max
            monthly_temps[key]["count"] += 1

        if p is not None:
            if month not in monthly_precip:
                monthly_precip[month] = {"sum": 0, "count": 0}
            monthly_precip[month]["sum"] += p
            monthly_precip[month]["count"] += 1

    frost_events = [
        {"year": y, "count": c}
        for y, c in sorted(frost_by_year.items())
    ]

    month_names = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]

    temperature_by_month = []
    for m in range(1, 13):
        if m in monthly_temps:
            d = monthly_temps[m]
            temperature_by_month.append({
                "month": month_names[m - 1],
                "avg_min": round(d["min_sum"] / d["count"], 1),
                "avg_max": round(d["max_sum"] / d["count"], 1),
            })

    precipitation_by_month = []
    years_span = end_year - start_year + 1
    for m in range(1, 13):
        if m in monthly_precip:
            d = monthly_precip[m]
            precipitation_by_month.append({
                "month": month_names[m - 1],
                "avg_mm": round(d["sum"] / years_span, 1),
            })

    return {
        "frost_events_by_year": frost_events,
        "temperature_by_month": temperature_by_month,
        "precipitation_by_month": precipitation_by_month,
        "location": {
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "elevation_m": 2909,
            "name": "Hacienda Yerovi, Joseguango Bajo, Cotopaxi, Ecuador",
        },
    }
