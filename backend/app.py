from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from models import db, Hospital, Review, ReviewMedia, User, Department, InsuranceProvider
from werkzeug.security import generate_password_hash, check_password_hash
import os
import csv
import uuid
from io import StringIO
from werkzeug.utils import secure_filename

def create_app():
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    # Set static_url_path to None or leaving it default avoids mapping bugs, so we map it to ''
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    CORS(app)

    UPLOAD_FOLDER = os.path.join(frontend_dir, 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'carecheck_v2.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        # Seed data if empty
        if Hospital.query.count() == 0:
            seed_data()

    @app.route('/api/auth/register', methods=['POST'])
    def register():
        data = request.json
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
            
        if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Username or Email already exists'}), 400
            
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            role=data.get('role', 'Patient')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': {'id': new_user.id, 'username': new_user.username, 'role': new_user.role}}), 201

    @app.route('/api/auth/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(email=data.get('email')).first()
        if user and check_password_hash(user.password_hash, data.get('password')):
            return jsonify({'message': 'Logged in', 'user': {'id': user.id, 'username': user.username, 'role': user.role}}), 200
        return jsonify({'error': 'Invalid email or password'}), 401

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
            
        reviews = Review.query.filter_by(hospital_id=hospital_id, status='Approved').order_by(Review.submitted_at.desc()).all()
        
        data = hospital.to_dict()
        data['recent_reviews'] = []
        for r in reviews:
            r_dict = r.to_dict()
            # Fetch associated media
            media = ReviewMedia.query.filter_by(review_id=r.id).all()
            r_dict['media'] = [m.to_dict() for m in media]
            data['recent_reviews'].append(r_dict)
            
        return jsonify(data)

    @app.route('/api/hospitals/<int:hospital_id>/departments', methods=['GET', 'POST'])
    def manage_departments(hospital_id):
        hospital = db.session.get(Hospital, hospital_id)
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404
            
        if request.method == 'GET':
            return jsonify([{'id': d.id, 'name': d.department_name, 'contact': d.contact_number, 'is_24_hours': d.is_24_hours} for d in hospital.departments])
            
        if request.method == 'POST':
            data = request.json
            name = data.get('department_name')
            if not name:
                 return jsonify({'error': 'Department name is required'}), 400
                 
            new_dept = Department(
                hospital_id=hospital_id,
                department_name=name,
                contact_number=data.get('contact_number'),
                is_24_hours=bool(data.get('is_24_hours', False))
            )
            db.session.add(new_dept)
            db.session.commit()
            return jsonify({'message': 'Department added successfully'}), 201

    @app.route('/api/insurances', methods=['GET'])
    def get_insurances():
        insurances = InsuranceProvider.query.all()
        return jsonify([{'id': i.id, 'name': i.name, 'type': i.type} for i in insurances])

    @app.route('/api/hospitals/<int:hospital_id>/insurances', methods=['GET', 'POST'])
    def manage_hospital_insurances(hospital_id):
        hospital = db.session.get(Hospital, hospital_id)
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404
            
        if request.method == 'GET':
            return jsonify([{'id': i.id, 'name': i.name, 'type': i.type} for i in hospital.insurances])
            
        if request.method == 'POST':
            data = request.json
            insurance_id = data.get('insurance_id')
            if not insurance_id:
                return jsonify({'error': 'Insurance ID is required'}), 400
                
            insurance = db.session.get(InsuranceProvider, insurance_id)
            if not insurance:
                return jsonify({'error': 'Insurance not found'}), 404
                
            if insurance not in hospital.insurances:
                hospital.insurances.append(insurance)
                db.session.commit()
                
            return jsonify({'message': 'Insurance linked successfully'}), 201

    @app.route('/api/reviews', methods=['POST'])
    def submit_review():
        # Handle form data since we might have file uploads
        hospital_id = request.form.get('hospital_id')
        user_id = request.form.get('user_id')
        wait_time_score = request.form.get('wait_time_score')
        billing_score = request.form.get('billing_transparency_score')
        cleanliness_score = request.form.get('cleanliness_score')
        staff_behavior_score = request.form.get('staff_behavior_score')
        emergency_responsiveness_score = request.form.get('emergency_responsiveness_score')
        review_text = request.form.get('review_text', '')

        if not all([hospital_id, wait_time_score, billing_score]):
            return jsonify({'error': 'Missing required base fields'}), 400

        try:
            wait_time_score = int(wait_time_score)
            billing_score = int(billing_score)
            cln_score = int(cleanliness_score) if cleanliness_score else None
            staff_score = int(staff_behavior_score) if staff_behavior_score else None
            emerg_score = int(emergency_responsiveness_score) if emergency_responsiveness_score else None
            if not (1 <= wait_time_score <= 5) or not (1 <= billing_score <= 5):
                raise ValueError()
        except ValueError:
             return jsonify({'error': 'Scores must be valid integers'}), 400

        hospital = db.session.get(Hospital, hospital_id)
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404

        new_review = Review(
            hospital_id=hospital_id,
            user_id=user_id if user_id else None,
            wait_time_score=wait_time_score,
            billing_transparency_score=billing_score,
            cleanliness_score=cln_score,
            staff_behavior_score=staff_score,
            emergency_responsiveness_score=emerg_score,
            review_text=review_text,
            status='Pending'
        )
        db.session.add(new_review)
        db.session.commit() # Commit to get review ID for media attachment

        # Handle optional file upload
        if 'media' in request.files:
            file = request.files['media']
            if file and file.filename:
                ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'unknown'
                unique_filename = f"{uuid.uuid4().hex}.{ext}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(filepath)

                new_media = ReviewMedia(
                    review_id=new_review.id,
                    file_url=f"/uploads/{unique_filename}",
                    file_type=file.content_type
                )
                db.session.add(new_media)
                db.session.commit()

        return jsonify({'message': 'Review submitted successfully and is awaiting moderation', 'review_id': new_review.id}), 201

    @app.route('/api/admin/reviews/pending', methods=['GET'])
    def get_pending_reviews():
        reviews = Review.query.filter_by(status='Pending').order_by(Review.submitted_at.asc()).all()
        result = []
        for r in reviews:
            r_dict = r.to_dict()
            # Fetch hospital info for context
            hospital = db.session.get(Hospital, r.hospital_id)
            r_dict['hospital_name'] = hospital.name if hospital else 'Unknown'
            # Fetch media
            media = ReviewMedia.query.filter_by(review_id=r.id).all()
            r_dict['media'] = [m.to_dict() for m in media]
            result.append(r_dict)
            
        return jsonify(result)

    @app.route('/api/admin/reviews/<int:review_id>/approve', methods=['POST'])
    def approve_review(review_id):
        review = db.session.get(Review, review_id)
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        if review.status == 'Approved':
            return jsonify({'message': 'Already approved'}), 200

        review.status = 'Approved'
        
        # Update aggregated metrics when approved
        hospital = db.session.get(Hospital, review.hospital_id)
        if hospital:
            total_score = float(review.wait_time_score + review.billing_transparency_score)
            divisor = 2.0
            if review.cleanliness_score:
                total_score += review.cleanliness_score
                divisor += 1.0
            if review.staff_behavior_score:
                total_score += review.staff_behavior_score
                divisor += 1.0
            if review.emergency_responsiveness_score:
                total_score += review.emergency_responsiveness_score
                divisor += 1.0
                
            new_review_score = total_score / divisor
            
            old_average = hospital.average_rating or 0.0
            old_count = hospital.review_count or 0
            
            new_average = ((old_average * old_count) + new_review_score) / (old_count + 1)
            
            hospital.average_rating = new_average
            hospital.review_count = old_count + 1

        db.session.commit()
        return jsonify({'message': 'Review approved successfully'})

    @app.route('/api/admin/reviews/<int:review_id>/reject', methods=['POST'])
    def reject_review(review_id):
        review = db.session.get(Review, review_id)
        if not review:
            return jsonify({'error': 'Review not found'}), 404
            
        review.status = 'Rejected'
        db.session.commit()
        return jsonify({'message': 'Review rejected successfully'})

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
            'average_rating': float(f"{avg_rating:.2f}")
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
        Hospital(name='Apollo Hospitals', address='Greams Road, Chennai, Tamil Nadu', latitude=13.064, longitude=80.252, is_nabh_accredited=True, is_ayushman_empanelled=True),
        Hospital(name='Fortis Hospital', address='Mulund West, Mumbai, Maharashtra', latitude=19.166, longitude=72.946, is_nabh_accredited=True),
        Hospital(name='Max Super Speciality', address='Saket, New Delhi', latitude=28.528, longitude=77.212, is_nabh_accredited=True, is_ayushman_empanelled=True),
        Hospital(name='Manipal Hospital', address='Old Airport Road, Bengaluru, Karnataka', latitude=12.960, longitude=77.648, is_nabh_accredited=False, is_ayushman_empanelled=True),
        Hospital(name='Ruby Hall Clinic', address='Sassoon Road, Pune, Maharashtra', latitude=18.530, longitude=73.876)
    ]
    db.session.add_all(hospitals)
    db.session.commit()
    
    insurances = [
        InsuranceProvider(name='Star Health', type='Private'),
        InsuranceProvider(name='HDFC ERGO', type='Private'),
        InsuranceProvider(name='Ayushman Bharat', type='Government Scheme'),
        InsuranceProvider(name='Max Bupa', type='Private')
    ]
    db.session.add_all(insurances)
    db.session.commit()
    
    admin = User(username='admin', email='admin@carecheck.in', password_hash=generate_password_hash('admin123'), role='Admin')
    patient = User(username='patient1', email='patient@example.com', password_hash=generate_password_hash('password123'), role='Patient')
    db.session.add_all([admin, patient])
    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
