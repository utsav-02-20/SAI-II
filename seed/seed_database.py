#!/usr/bin/env python3
"""
Standalone Database Seeding Utility for ArogyaAI
Completely decoupled from Express backend.
Directly interfaces with MongoDB using PyMongo.
"""

import os
import sys
import json
import argparse
from datetime import datetime
from dotenv import load_dotenv

# Try importing pymongo
try:
    from pymongo import MongoClient
    from bson.objectid import ObjectId
except ImportError:
    print("[Error] pymongo is not installed. Please run: pip install pymongo python-dotenv")
    sys.exit(1)

# Load environment
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017/arogya_db")

def get_db():
    try:
        client = MongoClient(DATABASE_URL, serverSelectionTimeoutMS=5000)
        # Extract db name or default
        db_name = DATABASE_URL.split("/")[-1].split("?")[0] or "arogya_db"
        return client[db_name]
    except Exception as e:
        print(f"[Database Connection Error] {e}")
        return None

def clear_database(db):
    print("-> Clearing existing test data from MongoDB...")
    db.User.delete_many({"email": {"$regex": "@example\\.com$"}})
    db.PatientProfile.delete_many({})
    db.DoctorProfile.delete_many({})
    print("-> Completed data purge.")

def seed_patients(db):
    patients_file = os.path.join(os.path.dirname(__file__), "mock_patients.json")
    if not os.path.exists(patients_file):
        print(f"[Error] {patients_file} not found.")
        return

    with open(patients_file, "r", encoding="utf-8") as f:
        patients = json.load(f)

    print(f"-> Seeding {len(patients)} mock patients...")
    for item in patients:
        user_doc = {
            "email": item["email"],
            "passwordHash": item["passwordHash"],
            "phone": item.get("phone"),
            "role": item.get("role", "PATIENT"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        user_res = db.User.insert_one(user_doc)
        user_id = user_res.inserted_id

        prof_data = item["profile"]
        prof_doc = {
            "userId": user_id,
            "firstName": prof_data["firstName"],
            "lastName": prof_data["lastName"],
            "dateOfBirth": datetime.fromisoformat(prof_data["dateOfBirth"].replace("Z", "+00:00")),
            "gender": prof_data["gender"],
            "bloodGroup": prof_data.get("bloodGroup"),
            "heightCm": prof_data.get("heightCm"),
            "weightKg": prof_data.get("weightKg"),
            "allergies": prof_data.get("allergies", []),
            "chronicConditions": prof_data.get("chronicConditions", []),
            "familyHistory": prof_data.get("familyHistory", []),
            "emergencyContacts": prof_data.get("emergencyContacts", []),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        db.PatientProfile.insert_one(prof_doc)
        print(f"   + Seeded Patient: {prof_data['firstName']} {prof_data['lastName']} ({item['email']})")

def seed_doctors(db):
    doctors_file = os.path.join(os.path.dirname(__file__), "mock_doctors.json")
    if not os.path.exists(doctors_file):
        print(f"[Error] {doctors_file} not found.")
        return

    with open(doctors_file, "r", encoding="utf-8") as f:
        doctors = json.load(f)

    print(f"-> Seeding {len(doctors)} mock doctors...")
    for item in doctors:
        user_doc = {
            "email": item["email"],
            "passwordHash": item["passwordHash"],
            "phone": item.get("phone"),
            "role": item.get("role", "DOCTOR"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        user_res = db.User.insert_one(user_doc)
        user_id = user_res.inserted_id

        doc_data = item["doctorProfile"]
        doc_profile = {
            "userId": user_id,
            "fullName": doc_data["fullName"],
            "specialty": doc_data["specialty"],
            "medicalLicenseNo": doc_data["medicalLicenseNo"],
            "experienceYears": doc_data["experienceYears"],
            "consultationFee": doc_data["consultationFee"],
            "isAvailable": doc_data.get("isAvailable", True),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        db.DoctorProfile.insert_one(doc_profile)
        print(f"   + Seeded Doctor: {doc_data['fullName']} ({doc_data['specialty']})")

def main():
    parser = argparse.ArgumentParser(description="Standalone ArogyaAI Database Seeder (Python)")
    parser.add_argument("--clear", action="store_true", help="Clear previous test records")
    parser.add_argument("--patients", action="store_true", help="Seed mock patients only")
    parser.add_argument("--doctors", action="store_true", help="Seed mock doctors only")
    parser.add_argument("--all", action="store_true", default=True, help="Seed all entities")

    args = parser.parse_args()

    print("\n=======================================================")
    print(" ArogyaAI Standalone Database Seeder (Pure Python)   ")
    print("=======================================================\n")

    db = get_db()
    if db is None:
        print("[!] Could not connect to MongoDB. Check DATABASE_URL in .env.")
        sys.exit(1)

    if args.clear:
        clear_database(db)

    if args.patients:
        seed_patients(db)
    elif args.doctors:
        seed_doctors(db)
    else:
        seed_patients(db)
        seed_doctors(db)

    print("\n[OK] Seeding routine completed successfully!\n")

if __name__ == "__main__":
    main()
