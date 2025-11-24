import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.logging import bind_request_context


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get(settings.REQUEST_ID_HEADER)
        if not request_id:
            request_id = uuid.uuid4().hex

        request.state.request_id = request_id
        bind_request_context(request_id=request_id, path=str(request.url.path))

        try:
            response: Response = await call_next(request)
        finally:
            bind_request_context()

        response.headers[settings.REQUEST_ID_HEADER] = request_id
        return response
