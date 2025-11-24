#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="${PROJECT_ROOT}/.venv"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but not found on PATH" >&2
  exit 1
fi

if [[ ! -d "${VENV_DIR}" ]]; then
  echo "Creating virtual environment at ${VENV_DIR}"
  python3 -m venv "${VENV_DIR}"
fi

source "${VENV_DIR}/bin/activate"

pip install --upgrade pip >/dev/null
pip install -r "${PROJECT_ROOT}/backend/requirements.txt"

pushd "${PROJECT_ROOT}/backend" >/dev/null
alembic upgrade head
python scripts/setup_admins.py
popd >/dev/null

echo "Database migrated and admin accounts provisioned."
