from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
def health_check():
    return {"status": "ok", "service": "studio-wars-api"}
