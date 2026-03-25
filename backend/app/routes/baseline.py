from flask import Blueprint, jsonify, request
from app import db
from app.models import FarmBaseline
from app.services.calculator import calculate_all_cases

baseline_bp = Blueprint("baseline", __name__)


@baseline_bp.route("/baseline", methods=["GET"])
def get_baseline():
    baseline = FarmBaseline.query.first()
    if not baseline:
        return jsonify({"error": "No baseline found"}), 404

    params = baseline.to_dict()
    results = calculate_all_cases(params, params)

    return jsonify({
        "params": params,
        "results": results,
    })


@baseline_bp.route("/baseline", methods=["PUT"])
def update_baseline():
    baseline = FarmBaseline.query.first()
    if not baseline:
        return jsonify({"error": "No baseline found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    updatable = {c.name for c in FarmBaseline.__table__.columns} - {"id", "updated_at"}

    for key, value in data.items():
        if key in updatable:
            setattr(baseline, key, value)

    db.session.commit()

    params = baseline.to_dict()
    results = calculate_all_cases(params, params)

    return jsonify({
        "params": params,
        "results": results,
    })


@baseline_bp.route("/calculate", methods=["POST"])
def calculate():
    """
    Stateless calculation endpoint for live recalculation.
    Accepts a full set of params and returns base/bull/bear results
    without saving anything to the database.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    baseline = FarmBaseline.query.first()
    if not baseline:
        return jsonify({"error": "No baseline found"}), 404

    baseline_params = baseline.to_dict()

    params = {**baseline_params, **data}
    results = calculate_all_cases(params, baseline_params)

    return jsonify({"results": results})
