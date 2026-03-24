from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    average_rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'average_rating': round(self.average_rating, 2) if self.average_rating else 0.0,
            'review_count': self.review_count
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    wait_time_score = db.Column(db.Integer, nullable=False)
    billing_transparency_score = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    hospital = db.relationship('Hospital', backref=db.backref('reviews', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'wait_time_score': self.wait_time_score,
            'billing_transparency_score': self.billing_transparency_score,
            'review_text': self.review_text,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None
        }
