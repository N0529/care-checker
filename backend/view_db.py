from app import create_app
from models import db, Hospital

app = create_app()

with app.app_context():
    print('--- CareCheck Hospitals Database ---')
    hospitals = Hospital.query.all()
    if not hospitals:
        print("No hospitals found in the database.")
    for h in hospitals:
        print(f"ID: {h.id} | Name: {h.name} | Avg Rating: {h.average_rating} | Total Reviews: {h.review_count}")
    print('------------------------------------')
