from google.cloud import firestore

PROJECT_ID = "qwiklabs-gcp-04-32981f4a0382"

db = firestore.Client(project=PROJECT_ID)

destinations = [
    {
        "id": "tokyo-jp",
        "name": "Tokyo",
        "country": "Japan",
        "description": "A bustling metropolis mixing the ultramodern and the traditional.",
        "best_time_to_visit": "March to May and September to November",
        "rating": 4.9
    },
    {
        "id": "paris-fr",
        "name": "Paris",
        "country": "France",
        "description": "The city of light, famous for its cafe culture and landmarks.",
        "best_time_to_visit": "April to June and October to early November",
        "rating": 4.8
    },
    {
        "id": "banff-ca",
        "name": "Banff",
        "country": "Canada",
        "description": "A resort town in the province of Alberta, located within Banff National Park.",
        "best_time_to_visit": "June to August and December to March",
        "rating": 4.7
    }
]

print("Seeding destinations...")
for dest in destinations:
    doc_ref = db.collection('destinations').document(dest['id'])
    doc_ref.set(dest)
    print(f"Added {dest['name']}")

print("Done.")
