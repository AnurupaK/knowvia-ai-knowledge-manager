from flask import Flask, render_template

from backend.routes.knowledge import knowledge_bp
from backend.routes.metadata import metadata_bp
from backend.routes.faq import faq_bp


app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static"
)


app.register_blueprint(
    knowledge_bp
)

app.register_blueprint(
    metadata_bp
)

app.register_blueprint(
    faq_bp
)


@app.route("/", methods=["GET"])
def home():

    return render_template(
        "index.html"
    )


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )