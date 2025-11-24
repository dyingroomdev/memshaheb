import logging
import sys
from typing import Any, Dict

import structlog


def configure_logging() -> None:
    timestamper = structlog.processors.TimeStamper(fmt="iso")

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            timestamper,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        structlog.stdlib.ProcessorFormatter(processor=structlog.processors.JSONRenderer())
    )

    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler],
    )


def bind_request_context(request_id: str | None = None, **extra: Any) -> None:
    context: Dict[str, Any] = {}
    if request_id:
        context["request_id"] = request_id
    context.update(extra)
    structlog.contextvars.clear_contextvars()
    if context:
        structlog.contextvars.bind_contextvars(**context)
