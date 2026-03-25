"""Seed the database with the Hacienda Yerovi baseline configuration."""

from app import create_app, db
from app.models import FarmBaseline

app = create_app()

with app.app_context():
    existing = FarmBaseline.query.first()
    if existing:
        print("Baseline already exists — skipping seed.")
    else:
        baseline = FarmBaseline(name="Hacienda Yerovi")
        db.session.add(baseline)
        db.session.commit()
        print("Baseline seeded successfully.")
