from flask import Blueprint, jsonify, request
from app import db
from app.models import Scenario, FarmBaseline
from app.services.calculator import calculate_all_cases

scenarios_bp = Blueprint("scenarios", __name__)


@scenarios_bp.route("/scenarios", methods=["GET"])
def list_scenarios():
    baseline = FarmBaseline.query.first()
    if not baseline:
        return jsonify({"error": "No baseline found"}), 404

    baseline_params = baseline.to_dict()
    scenarios = Scenario.query.order_by(Scenario.created_at.desc()).all()

    result = []
    for s in scenarios:
        merged = s.get_merged_params(baseline)
        cases = calculate_all_cases(merged, baseline_params)
        result.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "overrides": {
                k: v for k, v in s.to_dict().items()
                if v is not None and k not in (
                    "id", "name", "description", "created_at", "updated_at"
                )
            },
            "results": cases,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    return jsonify(result)


@scenarios_bp.route("/scenarios", methods=["POST"])
def create_scenario():
    data = request.get_json()
    if not data or "name" not in data:
        return jsonify({"error": "Scenario name is required"}), 400

    scenario = Scenario(
        name=data["name"],
        description=data.get("description"),
    )

    settable = {c.name for c in Scenario.__table__.columns} - {
        "id", "name", "description", "created_at", "updated_at"
    }

    for key, value in data.items():
        if key in settable and value is not None:
            setattr(scenario, key, value)

    db.session.add(scenario)
    db.session.commit()

    baseline = FarmBaseline.query.first()
    baseline_params = baseline.to_dict()
    merged = scenario.get_merged_params(baseline)
    cases = calculate_all_cases(merged, baseline_params)

    return jsonify({
        "id": scenario.id,
        "name": scenario.name,
        "description": scenario.description,
        "results": cases,
    }), 201


@scenarios_bp.route("/scenarios/<int:scenario_id>", methods=["PUT"])
def update_scenario(scenario_id):
    scenario = Scenario.query.get_or_404(scenario_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    if "name" in data:
        scenario.name = data["name"]
    if "description" in data:
        scenario.description = data["description"]

    settable = {c.name for c in Scenario.__table__.columns} - {
        "id", "name", "description", "created_at", "updated_at"
    }

    for key, value in data.items():
        if key in settable:
            setattr(scenario, key, value)

    db.session.commit()

    baseline = FarmBaseline.query.first()
    baseline_params = baseline.to_dict()
    merged = scenario.get_merged_params(baseline)
    cases = calculate_all_cases(merged, baseline_params)

    return jsonify({
        "id": scenario.id,
        "name": scenario.name,
        "description": scenario.description,
        "results": cases,
    })


@scenarios_bp.route("/scenarios/<int:scenario_id>", methods=["DELETE"])
def delete_scenario(scenario_id):
    scenario = Scenario.query.get_or_404(scenario_id)
    db.session.delete(scenario)
    db.session.commit()
    return jsonify({"message": "Scenario deleted"}), 200
