import json
from typing import AsyncGenerator


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def sse_stage(stage: str, message: str) -> str:
    return sse("stage", {"stage": stage, "message": message})


def sse_step(agent: str, step: str, detail: str = "") -> str:
    return sse("step", {"agent": agent, "step": step, "detail": detail})


def sse_portrait(url: str) -> str:
    return sse("portrait", {"url": url})


def sse_done(character_id: int) -> str:
    return sse("done", {"character_id": character_id})


def sse_error(message: str) -> str:
    return sse("error", {"message": message})
