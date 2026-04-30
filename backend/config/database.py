from pymongo import MongoClient, ASCENDING
from config.settings import settings

client = None
db = None


def connect_db():
    global client, db
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]

    # Create indexes
    db.farmers.create_index("phone", unique=True)
    db.queries.create_index("farmer_id")
    db.queries.create_index("created_at")
    db.sessions.create_index("farmer_id")


def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
