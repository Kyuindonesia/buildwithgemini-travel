# Copyright 2026 Google LLC
# Licensed under the Apache License, Version 2.0

import os
import json
import uuid
import urllib.request
import urllib.parse
from google.cloud import firestore
from google.cloud import storage
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools import ToolContext
from google import genai
from google.genai import types

from google.adk.agents.callback_context import CallbackContext
from google.adk.tools.preload_memory_tool import PreloadMemoryTool

try:
    from google.adk.code_executors import AgentEngineSandboxCodeExecutor
except ImportError:
    AgentEngineSandboxCodeExecutor = None

from .a2ui_utils import a2ui_callback

MODEL = "gemini-3.7-flash"
PROJECT_ID = "qwiklabs-gcp-04-32981f4a0382"
BUCKET_NAME = "travel-app-assets-9061"

def _get_db():
    return firestore.Client(project=PROJECT_ID)

def get_weather(location: str) -> str:
    """Gets the current weather and temperature for a specific location."""
    try:
        url = f"https://wttr.in/{urllib.parse.quote(location)}?format=%C+%t"
        req = urllib.request.Request(url, headers={'User-Agent': 'curl/7.68.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                weather_data = response.read().decode('utf-8').strip()
                return f"The current weather in {location} is {weather_data}."
            return f"Could not fetch weather for {location}."
    except Exception as e:
        return f"Error fetching weather: {str(e)}"

def convert_currency(amount: float, base_currency: str, target_currency: str) -> str:
    """Converts an amount from a base currency to a target currency using real-time exchange rates."""
    try:
        url = f"https://api.frankfurter.app/latest?amount={amount}&from={base_currency.upper()}&to={target_currency.upper()}"
        req = urllib.request.Request(url, headers={'User-Agent': 'curl/7.68.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                converted_amount = data['rates'][target_currency.upper()]
                return f"{amount} {base_currency.upper()} is equal to {converted_amount} {target_currency.upper()}."
            return f"Could not convert currency."
    except Exception as e:
        return f"Error converting currency: {str(e)}"

def geocode_address(address: str) -> str:
    """Converts a street address or city name into latitude and longitude coordinates."""
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return json.dumps({"error": "GOOGLE_MAPS_API_KEY environment variable not set."})
        
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={urllib.parse.quote(address)}&key={api_key}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                if data['status'] == 'OK' and len(data['results']) > 0:
                    location = data['results'][0]['geometry']['location']
                    return json.dumps({
                        "latitude": location['lat'],
                        "longitude": location['lng'],
                        "formatted_address": data['results'][0].get('formatted_address', address)
                    })
                return json.dumps({"error": f"Geocoding failed: {data['status']}"})
            return json.dumps({"error": f"HTTP Error {response.status}"})
    except Exception as e:
        return json.dumps({"error": f"Exception during geocoding: {str(e)}"})

def search_nearby_places(latitude: float, longitude: float, place_type: str, radius: float = 1000.0) -> str:
    """Searches for nearby places of a specific type around a given latitude and longitude."""
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return json.dumps({"error": "GOOGLE_MAPS_API_KEY environment variable not set."})
        
    url = "https://places.googleapis.com/v1/places:searchNearby"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location"
    }
    
    payload = {
        "includedTypes": [place_type],
        "maxResultCount": 5,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": radius
            }
        }
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                places = data.get('places', [])
                
                results = []
                for place in places:
                    name = place.get('displayName', {}).get('text', 'Unknown')
                    address = place.get('formattedAddress', 'No address')
                    results.append({
                        "name": name,
                        "address": address
                    })
                return json.dumps(results, indent=2)
            return json.dumps({"error": f"HTTP Error {response.status}"})
    except Exception as e:
        return json.dumps({"error": f"Exception during places search: {str(e)}"})

def get_destinations(country: str = "") -> str:
    """Gets a list of recommended travel destinations from the catalog."""
    db = _get_db()
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

def add_destination(dest_id: str, name: str, country: str, description: str, best_time_to_visit: str, rating: float) -> str:
    """Adds a new destination to the catalog."""
    db = _get_db()
    doc_ref = db.collection("destinations").document(dest_id)
    doc_ref.set({
        "id": dest_id,
        "name": name,
        "country": country,
        "description": description,
        "best_time_to_visit": best_time_to_visit,
        "rating": rating
    })
    return json.dumps({"message": f"Successfully added {name} to destinations."})

def generate_destination_image(prompt: str, tool_context: ToolContext = None) -> str:
    """Generates an image for a travel destination and returns its public URL."""
    try:
        client = genai.Client(http_options={'api_version': 'v1'})
        result = client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/jpeg",
                aspect_ratio="16:9"
            )
        )
        
        image_bytes = result.generated_images[0].image.image_bytes
        file_name = f"dest_{uuid.uuid4().hex[:8]}.jpg"
        
        if tool_context:
            tool_context.save_artifact(
                name=file_name,
                content=image_bytes,
                content_type="image/jpeg"
            )
            
        storage_client = storage.Client(project=PROJECT_ID)
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(file_name)
        blob.upload_from_string(image_bytes, content_type="image/jpeg")
        
        public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{file_name}"
        return json.dumps({"image_url": public_url, "message": "Image generated successfully."})
        
    except Exception as e:
        return json.dumps({"error": f"Failed to generate image: {str(e)}"})

sandbox_executor = None
if AgentEngineSandboxCodeExecutor:
    # Use the pre-created sandbox explicitly so we don't hit creation timeouts in agents-cli run
    sandbox_name = "projects/319380460169/locations/us-east1/reasoningEngines/670450304780599296/sandboxEnvironments/1919874845445718016"
    sandbox_executor = AgentEngineSandboxCodeExecutor(sandbox_resource_name=sandbox_name)

async def handle_memories_and_a2ui(callback_context: CallbackContext, llm_request, llm_response):
    await callback_context.add_session_to_memory()
    return await a2ui_callback(callback_context, llm_response)

with open(os.path.join(os.path.dirname(__file__), '..', 'temp_env', 'prompt.txt'), 'r') as f:
    prompt_content = f.read().split("---START---")[1].split("---END---")[0].strip()

root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=prompt_content,
    tools=[get_destinations, add_destination, get_weather, convert_currency, geocode_address, search_nearby_places, generate_destination_image, PreloadMemoryTool()],
    code_executor=sandbox_executor,
    after_model_callback=handle_memories_and_a2ui,
)

app = App(
    root_agent=root_agent,
    name="app",
)
