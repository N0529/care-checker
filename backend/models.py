from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

# Join table for many-to-many relationship between Hospital and InsuranceProvider
hospital_insurance = db.Table('hospital_insurance',
    db.Column('hospital_id', db.Integer, db.ForeignKey('hospitals.id'), primary_key=True),
    db.Column('insurance_id', db.Integer, db.ForeignKey('insurance_providers.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='Patient') # Roles: Patient, Admin, HospitalRep
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    reviews = db.relationship('Review', backref='user', lazy=True)

class InsuranceProvider(db.Model):
    __tablename__ = 'insurance_providers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(100)) # e.g., Private, Government Scheme

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    department_name = db.Column(db.String(255), nullable=False)
    contact_number = db.Column(db.String(50))
    is_24_hours = db.Column(db.Boolean, default=False)

    hospital = db.relationship('Hospital', backref=db.backref('departments', lazy=True, cascade="all, delete-orphan"))

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    average_rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    is_nabh_accredited = db.Column(db.Boolean, default=False)
    is_ayushman_empanelled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    insurances = db.relationship('InsuranceProvider', secondary=hospital_insurance, lazy='subquery',
        backref=db.backref('hospitals', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'average_rating': round(self.average_rating, 2) if self.average_rating else 0.0,
            'review_count': self.review_count,
            'is_nabh_accredited': self.is_nabh_accredited,
            'is_ayushman_empanelled': self.is_ayushman_empanelled,
            'departments': [dep.department_name for dep in self.departments],
            'accepted_insurances': [ins.name for ins in self.insurances]
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Allowed null for backward compatibility
    wait_time_score = db.Column(db.Integer, nullable=False)
    billing_transparency_score = db.Column(db.Integer, nullable=False)
    cleanliness_score = db.Column(db.Integer, nullable=True)
    staff_behavior_score = db.Column(db.Integer, nullable=True)
    emergency_responsiveness_score = db.Column(db.Integer, nullable=True)
    treatment_cost = db.Column(db.Float, nullable=True)
    procedure_type = db.Column(db.String(255), nullable=True)
    insurance_accepted = db.Column(db.Boolean, nullable=True)
    review_text = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='Pending') # Pending, Approved, Rejected
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = db.relationship('Hospital', backref=db.backref('reviews', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'user_id': self.user_id,
            'wait_time_score': self.wait_time_score,
            'billing_transparency_score': self.billing_transparency_score,
            'cleanliness_score': self.cleanliness_score,
            'staff_behavior_score': self.staff_behavior_score,
            'emergency_responsiveness_score': self.emergency_responsiveness_score,
            'treatment_cost': self.treatment_cost,
            'procedure_type': self.procedure_type,
            'insurance_accepted': self.insurance_accepted,
            'review_text': self.review_text,
            'status': self.status,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None
        }

class ReviewMedia(db.Model):
    __tablename__ = 'review_media'
    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.id'), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'review_id': self.review_id,
            'file_url': self.file_url,
            'file_type': self.file_type,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }
