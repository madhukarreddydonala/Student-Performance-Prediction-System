"""
WSGI Entry Point — Production Server.
Use this with waitress (Windows) or gunicorn (Linux):

    waitress-serve --port=5000 wsgi:app
    gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
"""

from app import app, db

# Create tables on startup
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        print(f"Warning: Could not connect to MySQL: {e}")

if __name__ == '__main__':
    from waitress import serve
    print("Starting production server on port 5000...")
    serve(app, host='0.0.0.0', port=5000)
