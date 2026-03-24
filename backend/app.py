from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from models import db, Hospital, Review
import os
import csv
from io import StringIO

def create_app():
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    # Set static_url_path to None or leaving it default avoids mapping bugs, so we map it to ''
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    CORS(app)

    @app.route('/')
    def serve_index():
        return app.send_static_file('index.html')

    @app.route('/<path:path>')
    def catch_all(path):
        """Serve everything else from frontend_dir if it exists, else index.html"""
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return app.send_static_file(path)
        return app.send_static_file('index.html')

    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'carecheck.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        # Seed data if empty
        if Hospital.query.count() == 0:
            seed_data()

    @app.route('/api/hospitals', methods=['POST'])
    def add_hospital():
        data = request.json
        name = data.get('name')
        address = data.get('address')
        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if not all([name, address, latitude, longitude]):
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError:
            return jsonify({'error': 'Latitude and longitude must be numbers'}), 400

        new_hospital = Hospital(
            name=name,
            address=address,
            latitude=latitude,
            longitude=longitude,
            average_rating=0.0,
            review_count=0
        )
        db.session.add(new_hospital)
        db.session.commit()

        return jsonify({'message': 'Hospital added successfully', 'hospital': new_hospital.to_dict()}), 201

    @app.route('/api/hospitals', methods=['GET'])
    def get_hospitals():
        search_query = request.args.get('q', '')
        query = Hospital.query
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(db.or_(Hospital.name.ilike(search_pattern), Hospital.address.ilike(search_pattern)))
        
        hospitals = query.all()
        return jsonify([h.to_dict() for h in hospitals])

    @app.route('/api/hospitals/<int:hospital_id>', methods=['GET'])
    def get_hospital(hospital_id):
        hospital = db.session.get(Hospital, hospital_id)
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404
            
        reviews = Review.query.filter_by(hospital_id=hospital_id).order_by(Review.submitted_at.desc()).all()
        
        data = hospital.to_dict()
        data['recent_reviews'] = [r.to_dict() for r in reviews]
        return jsonify(data)

    @app.route('/api/reviews', methods=['POST'])
    def submit_review():
        data = request.json
        hospital_id = data.get('hospital_id')
        wait_time_score = data.get('wait_time_score')
        billing_score = data.get('billing_transparency_score')
        review_text = data.get('review_text', '')

        if not all([hospital_id, wait_time_score, billing_score]):
            return jsonify({'error': 'Missing required fields'}), 400

        try:
            wait_time_score = int(wait_time_score)
            billing_score = int(billing_score)
            if not (1 <= wait_time_score <= 5) or not (1 <= billing_score <= 5):
                raise ValueError()
        except ValueError:
             return jsonify({'error': 'Scores must be integers between 1 and 5'}), 400

        hospital = db.session.get(Hospital, hospital_id)
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404

        new_review = Review(
            hospital_id=hospital_id,
            wait_time_score=wait_time_score,
            billing_transparency_score=billing_score,
            review_text=review_text
        )
        db.session.add(new_review)

        # Update aggregated metrics
        new_review_score = (wait_time_score + billing_score) / 2.0
        old_average = hospital.average_rating or 0.0
        old_count = hospital.review_count or 0
        
        new_average = ((old_average * old_count) + new_review_score) / (old_count + 1)
        
        hospital.average_rating = new_average
        hospital.review_count = old_count + 1

        db.session.commit()

        return jsonify({'message': 'Review submitted successfully', 'hospital': hospital.to_dict()}), 201

    @app.route('/api/admin/summary', methods=['GET'])
    def get_admin_summary():
        total_hospitals = Hospital.query.count()
        total_reviews = Review.query.count()
        
        # Calculate platform-wide average
        if total_hospitals > 0:
            hospitals_with_reviews = Hospital.query.filter(Hospital.review_count > 0).all()
            if hospitals_with_reviews:
                 avg_rating = sum(h.average_rating for h in hospitals_with_reviews) / len(hospitals_with_reviews)
            else:
                 avg_rating = 0.0
        else:
            avg_rating = 0.0
            
        return jsonify({
            'total_hospitals': total_hospitals,
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 2)
        })

    @app.route('/api/admin/export', methods=['GET'])
    def export_csv():
        hospitals = Hospital.query.all()
        
        si = StringIO()
        cw = csv.writer(si)
        cw.writerow(['ID', 'Name', 'Address', 'Latitude', 'Longitude', 'Average Rating', 'Review Count'])
        
        for h in hospitals:
            cw.writerow([
                h.id, h.name, h.address, h.latitude, h.longitude, 
                round(h.average_rating, 2), h.review_count
            ])
            
        output = si.getvalue()
        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment;filename=hospitals_export.csv"}
        )

    return app

def seed_data():
    hospitals = [
        Hospital(name='Apollo Hospitals', address='Greams Road, Chennai, Tamil Nadu', latitude=13.064, longitude=80.252),
        Hospital(name='Fortis Hospital', address='Mulund West, Mumbai, Maharashtra', latitude=19.166, longitude=72.946),
        Hospital(name='Max Super Speciality', address='Saket, New Delhi', latitude=28.528, longitude=77.212),
        Hospital(name='Manipal Hospital', address='Old Airport Road, Bengaluru, Karnataka', latitude=12.960, longitude=77.648),
        Hospital(name='Ruby Hall Clinic', address='Sassoon Road, Pune, Maharashtra', latitude=18.530, longitude=73.876)
    ]
    db.session.add_all(hospitals)
    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
