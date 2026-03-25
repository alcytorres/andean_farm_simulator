from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from app.routes.baseline import baseline_bp
    from app.routes.scenarios import scenarios_bp
    from app.routes.climate import climate_bp

    app.register_blueprint(baseline_bp, url_prefix="/api")
    app.register_blueprint(scenarios_bp, url_prefix="/api")
    app.register_blueprint(climate_bp, url_prefix="/api")

    return app
