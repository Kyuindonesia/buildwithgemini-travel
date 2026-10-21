# Copyright 2026 Google LLC
# Agentic AI Web Builder Engine powered by Gemini 3.8 Flash with graceful retry/fallback

import json
import logging
import os
import re
import time
from typing import Any, Dict, List, Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "qwiklabs-gcp-04-32981f4a0382")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "global")
PRIMARY_MODEL = "gemini-3.8-flash"
FALLBACK_MODEL = "gemini-2.5-flash"

def get_genai_client() -> genai.Client:
    return genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION
    )

def clean_json_response(text: str) -> str:
    """Extracts JSON substring from markdown backticks or raw output."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text

def call_gemini_with_fallback(contents: Any, config: types.GenerateContentConfig) -> str:
    """Calls primary model (gemini-3.8-flash) with retry, and falls back if quota exhausted."""
    client = get_genai_client()
    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]

    last_error = None
    for model in models_to_try:
        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                last_error = e
                err_str = str(e)
                logger.warning(f"Error calling {model} (attempt {attempt+1}): {err_str}")
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    time.sleep(2 * (attempt + 1))
                    continue
                break
    raise last_error or RuntimeError("Failed to generate content from Gemini models.")

def enhance_prompt(prompt: str) -> Dict[str, Any]:
    """Expands a short prompt into a detailed website specification."""
    system_instruction = (
        "You are an expert Principal Web Designer and UX Architect. "
        "Your task is to take a brief or rough website idea and produce an exhaustive, "
        "modern specification for a single-page interactive React + Tailwind CSS web application. "
        "Return a JSON object with the following fields: \n"
        "- title: short catchy title\n"
        "- category: e.g. SaaS Landing, Portfolio, E-Commerce, Dashboard, Creative Agency\n"
        "- target_audience: description of users\n"
        "- design_system: object with { color_palette: [hex or tailwind colors], typography: string, aesthetic_mood: string }\n"
        "- key_sections: array of { name: string, purpose: string, components_needed: [string] }\n"
        "- interactive_features: array of specific interactive states (e.g. filters, search, tabs, modal dialog, carts, counters)\n"
        "- expanded_prompt: a comprehensive, vivid master prompt summarizing all architectural requirements for the coding agent."
    )
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        temperature=0.7,
    )
    
    text = call_gemini_with_fallback(
        f"User Website Idea: {prompt}\n\nPlease expand this into an architectural specification.",
        config
    )
    raw = clean_json_response(text)
    try:
        return json.loads(raw)
    except Exception as e:
        logger.error(f"Failed to parse enhanced prompt JSON: {e}, raw: {raw}")
        return {
            "title": "Modern Web Application",
            "category": "Web App",
            "target_audience": "General users",
            "design_system": {"color_palette": ["slate-900", "teal-500", "cyan-400"], "typography": "Inter, sans-serif", "aesthetic_mood": "Sleek Dark Teal Modern"},
            "key_sections": [{"name": "Hero", "purpose": "Showcase main value", "components_needed": ["Header", "CTA"]}],
            "interactive_features": ["Interactive tabs", "Dynamic filtering"],
            "expanded_prompt": prompt
        }

def generate_website(specification: str, existing_files: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Generates a complete, functional React + Tailwind CSS web application project."""
    system_instruction = (
        "You are an Elite Frontend Software Engineer and React master. "
        "You build stunning, responsive, highly interactive web applications using React 18, TypeScript, and Tailwind CSS.\n"
        "IMPORTANT RULES:\n"
        "1. Build a working multi-file or modular single-page React app.\n"
        "2. The main entry point must be `App.tsx`. Make sure it exports `export default function App() ...`.\n"
        "3. You can use standard Lucide React icons. In the browser preview, standard Lucide icons (e.g. Shield, Zap, Search, ChevronRight, Menu, X, ArrowRight, Star, Heart, Check, Trash2, Plus, Sparkles, ExternalLink, Code, Layers, Smartphone, Layout, User, Settings) are available.\n"
        "4. Include mock data and full interactive state (search, filters, cart, tabs, toggles, modal popups, forms with validation/feedback). Avoid empty placeholder stubs.\n"
        "5. Style with Tailwind CSS. Follow modern dark mode aesthetics with teal accents (slate-900, slate-800, teal-500, teal-400, cyan-400, text-white, etc.) by default unless the prompt specifies otherwise.\n"
        "6. Return ONLY a valid JSON object with the format:\n"
        "{\n"
        "  \"summary\": \"Brief explanation of what was built\",\n"
        "  \"files\": {\n"
        "    \"App.tsx\": \"// full code...\",\n"
        "    \"types.ts\": \"// TypeScript interfaces...\",\n"
        "    \"data.ts\": \"// rich realistic mock data...\"\n"
        "  }\n"
        "}\n"
        "Every file in `files` must be a self-contained string."
    )

    contents = [
        f"Build a complete functional web app based on this specification:\n{specification}"
    ]
    if existing_files:
        contents.append(f"Here is the prior file tree for reference:\n{json.dumps(list(existing_files.keys()))}")

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        temperature=0.4,
    )

    text = call_gemini_with_fallback("\n\n".join(contents), config)
    raw = clean_json_response(text)
    return json.loads(raw)

def edit_website(instruction: str, current_files: Dict[str, str], conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """Modifies code files based on user chat instructions."""
    system_instruction = (
        "You are an Elite Coding Agent paired with the user to edit a live React application. "
        "The user will give you a request to modify colors, layout, add new components, fix behavior, or change functionality.\n"
        "You have access to the current project files.\n"
        "Return a JSON object containing:\n"
        "{\n"
        "  \"message\": \"Friendly explanation of the changes made\",\n"
        "  \"modified_files\": {\n"
        "     \"filename.tsx\": \"// complete updated contents of this file\"\n"
        "  }\n"
        "}\n"
        "You ONLY need to include files that were modified or added in `modified_files`."
    )

    files_summary = json.dumps(current_files, indent=2)
    prompt_text = (
        f"CURRENT PROJECT FILES:\n{files_summary}\n\n"
        f"USER CHANGE REQUEST:\n{instruction}\n\n"
        "Apply the requested changes and output the JSON with modified_files."
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        temperature=0.3,
    )

    text = call_gemini_with_fallback(prompt_text, config)
    raw = clean_json_response(text)
    return json.loads(raw)

def debug_website(error_message: str, current_files: Dict[str, str]) -> Dict[str, Any]:
    """Diagnoses error messages from runtime/compiler and fixes the code."""
    system_instruction = (
        "You are an expert Automated Debugging Agent for React, TypeScript, and JavaScript web applications. "
        "A runtime or compilation error occurred in the browser preview sandbox. "
        "Analyze the error traceback and the current source files. "
        "Fix the syntax error, missing import, undefined variable, or invalid React hook usage.\n"
        "Return a JSON object:\n"
        "{\n"
        "  \"diagnosis\": \"Clear 1-sentence explanation of what caused the bug\",\n"
        "  \"fixed_files\": {\n"
        "     \"filename.tsx\": \"// complete corrected contents of this file\"\n"
        "  }\n"
        "}"
    )

    prompt_text = (
        f"SANDBOX RUNTIME / SYNTAX ERROR:\n{error_message}\n\n"
        f"CURRENT CODE FILES:\n{json.dumps(current_files, indent=2)}\n\n"
        "Fix the bug and provide the corrected files in `fixed_files`."
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        temperature=0.2,
    )

    text = call_gemini_with_fallback(prompt_text, config)
    raw = clean_json_response(text)
    return json.loads(raw)
