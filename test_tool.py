import json
from google.cloud import firestore

PROJECT_ID = "qwiklabs-gcp-04-32981f4a0382"
db = firestore.Client(project=PROJECT_ID)

def get_destinations(country: str = "") -> str:
    destinations_ref = db.collection("destinations")
    if country:
        query = destinations_ref.where(filter=firestore.FieldFilter("country", "==", country))
        docs = query.stream()
    else:
        docs = destinations_ref.stream()
    results = []
    for doc in docs:
        results.append(doc.to_dict())
    if not results:
        return json.dumps({"message": "No destinations found matching your criteria."})
    return json.dumps(results, indent=2)

print(get_destinations())
