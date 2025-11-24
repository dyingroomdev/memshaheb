from __future__ import annotations

import os
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


@dataclass(slots=True)
class StorageResult:
    key: str
    url: str
    signed_url: str


class StorageBackend(Protocol):
    def save_file(self, *, file: UploadFile, owner_id: int | None = None) -> StorageResult:
        ...


class LocalStorageBackend:
    def __init__(self, root: Path, base_url: str) -> None:
        self.root = root
        self.base_url = base_url.rstrip("/")
        self.root.mkdir(parents=True, exist_ok=True)

    def save_file(self, *, file: UploadFile, owner_id: int | None = None) -> StorageResult:
        key = _sanitize_filename(file.filename) or f"{uuid4().hex}"
        destination = self.root / key
        if destination.exists():
            stem = destination.stem
            suffix = destination.suffix
            counter = 1
            while destination.exists():
                destination = self.root / f"{stem}-{counter}{suffix}"
                counter += 1
            key = destination.name

        file.file.seek(0)
        with destination.open("wb") as out_file:
            shutil.copyfileobj(file.file, out_file)

        url = f"{self.base_url}/{key}"
        return StorageResult(key=key, url=url, signed_url=url)


class S3StorageBackend:
    def __init__(self) -> None:
        import boto3  # type: ignore

        if not settings.MEDIA_S3_BUCKET:
            raise ValueError("MEDIA_S3_BUCKET must be configured for S3 storage backend.")

        session_kwargs: dict[str, str] = {}
        if settings.MEDIA_S3_ACCESS_KEY_ID and settings.MEDIA_S3_SECRET_ACCESS_KEY:
            session_kwargs.update(
                {
                    "aws_access_key_id": settings.MEDIA_S3_ACCESS_KEY_ID,
                    "aws_secret_access_key": settings.MEDIA_S3_SECRET_ACCESS_KEY,
                }
            )

        self.bucket = settings.MEDIA_S3_BUCKET
        self.base_url = settings.MEDIA_BASE_URL.rstrip("/")
        self.client = boto3.client(
            "s3",
            region_name=settings.MEDIA_S3_REGION,
            endpoint_url=settings.MEDIA_S3_ENDPOINT_URL,
            **session_kwargs,
        )

    def save_file(self, *, file: UploadFile, owner_id: int | None = None) -> StorageResult:
        key = _sanitize_filename(file.filename) or f"{uuid4().hex}"
        file.file.seek(0)
        self.client.upload_fileobj(file.file, self.bucket, key, ExtraArgs={"ContentType": file.content_type or "application/octet-stream"})
        url = f"{self.base_url}/{key}" if self.base_url else key
        signed_url = self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=settings.MEDIA_SIGNED_URL_EXPIRE_SECONDS,
        )
        return StorageResult(key=key, url=url, signed_url=signed_url)


_storage_backend: StorageBackend | None = None


def get_storage_backend() -> StorageBackend:
    global _storage_backend
    if _storage_backend is not None:
        return _storage_backend

    if settings.MEDIA_STORAGE_BACKEND == "s3":
        _storage_backend = S3StorageBackend()
    else:
        root = settings.MEDIA_LOCAL_ROOT
        if not root.is_absolute():
            root = Path(os.getcwd()) / root
        _storage_backend = LocalStorageBackend(root=root, base_url=settings.MEDIA_BASE_URL)

    return _storage_backend


def save_upload(file: UploadFile, owner_id: int | None = None) -> StorageResult:
    backend = get_storage_backend()
    return backend.save_file(file=file, owner_id=owner_id)


def _sanitize_filename(filename: str | None) -> str:
    """Keep the original name as much as possible, strip paths and dangerous chars."""
    if not filename:
        return ""
    name = Path(filename).name  # drop any path
    # replace spaces and invalid chars with underscores
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    # guard against empty result
    return name or ""
