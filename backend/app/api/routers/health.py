from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.core.rate_limit import limiter

router = APIRouter(tags=["health"])


@router.get("/health")
@limiter.limit("30/minute")
def health_check(request: Request) -> JSONResponse:
    return JSONResponse({"status": "ok"})
