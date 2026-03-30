# Andean Farm Simulator

A scenario-based agricultural planning tool for Hacienda Yerovi, a mixed dairy and broccoli farm in the Cotopaxi highlands of Ecuador (~2,909m elevation).

The simulator models land allocation, livestock, crop production, costs, and weather risk to answer: **which farm configuration produces the most profit given real-world constraints?**

## Features

- **Farm Dashboard** — View the current farm baseline: land allocation, revenue breakdown, cost structure, and key operational metrics.
- **Scenario Builder** — Adjust any variable (land use, herd size, prices, weather) and see projected profit recalculate in real time. Every scenario auto-generates base, bull, and bear cases.
- **Scenario Comparison** — Compare 2–4 saved scenarios side by side with grouped bar charts, a metrics table, and auto-generated insights (highest profit, highest risk, most stable).
- **Climate Data** — Historical weather data from Open-Meteo showing frost trends, temperature ranges, and precipitation patterns. Defines the bull/bear case weather assumptions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, SQLAlchemy |
| Frontend | React, TypeScript, Vite |
| Database | PostgreSQL |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Weather API | Open-Meteo (free, no key required) |

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
createdb andean_farm_simulator   # once, if the DB does not exist
export FLASK_APP=run.py
flask db upgrade
python seed.py
flask run --port 5001
```

Keep this terminal open. Port **5001** avoids macOS using **5000** for AirPlay.

### Frontend Setup

In a **second** terminal:

```bash
cd frontend
npm install
npm run dev
```

The app is at `http://localhost:5173`. Vite proxies `/api/*` to `http://127.0.0.1:5001`. If you see `ECONNREFUSED` in the Vite terminal, the Flask server is not running (or is on a different port—update `frontend/vite.config.ts` to match).

## Project Context

Hacienda Yerovi is a ~243-acre family farm in Joseguango Bajo, Latacunga, Cotopaxi, Ecuador. The farm produces dairy milk (130-cow milking herd), contract broccoli for Ecofroz, and earns commission from a flower lease operation. Since ~2020, increased hailstorm and frost frequency has created revenue volatility, making scenario planning essential for optimizing the farm's land allocation strategy.
