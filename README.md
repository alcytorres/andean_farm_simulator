# Andean Farm Simulator

A scenario-based agricultural planning tool for Hacienda Yerovi, a mixed dairy and broccoli farm located in the Cotopaxi highlands of Ecuador at ~2,909 meters (9,544 ft) elevation.

The simulator models land allocation, livestock, crop production, costs, and weather risk to answer: **which farm configuration produces the most profit given real-world constraints?**

![App demo](demo_farm.gif)

## Project Documentation & Analysis

📄 Summary (2–3 min read) | [View Google Doc](https://docs.google.com/document/d/1yGW4azk0sb6uLwir5yvu0JsYctBFCGi41uoaaLFxz_M/edit?tab=t.0)
📊 Interactive Spreadsheet Model | [View Google Sheets](https://docs.google.com/spreadsheets/d/1piFMMD0oddgiiagxbS0Q9GxREtWFVSpc_Iu81TtX4X8/edit?gid=0#gid=0)

## Features

- **Farm Dashboard** — View the current farm baseline: land allocation, revenue breakdown, cost structure, and key operational metrics.
- **Scenario Builder** — Adjust any variable (land use, herd size, prices, weather) and see projected profit recalculate in real time. Every scenario auto-generates base, bull, and bear cases.
- **Scenario Comparison** — Compare 2–4 saved scenarios side by side with grouped bar charts, a metrics table, and auto-generated insights (highest profit, highest risk, most stable).
- **Risk Cases** — Configure bull and bear case weather and price assumptions that apply globally across all scenario comparisons.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, SQLAlchemy |
| Frontend | React, TypeScript, Vite |
| Database | PostgreSQL |
| Charts | Recharts |
| Styling | Tailwind CSS |

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
