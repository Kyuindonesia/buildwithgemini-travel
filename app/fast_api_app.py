import os
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.memory import VertexAiMemoryBankService
from .agent import app as adk_app

def memory_bank_service_builder():
    return VertexAiMemoryBankService(
        project="qwiklabs-gcp-04-32981f4a0382",
        location="us-east1",
        agent_engine_id="670450304780599296",
    )

app = get_fast_api_app(adk_app, memory_service_builder=memory_bank_service_builder)
