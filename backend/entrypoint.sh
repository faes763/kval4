#!/usr/bin/env bash
set -euo pipefail

# Reads env vars from a Docker secret mounted as a file.
# It DOES NOT override already-set environment variables coming from docker-compose/stack.

ENV_SECRET_FILE="${ENV_SECRET_FILE:-/run/secrets/app_env}"

if [[ -f "${ENV_SECRET_FILE}" ]]; then
  while IFS= read -r line || [[ -n "${line}" ]]; do
    # Skip empty / comment lines
    if [[ -z "${line//[[:space:]]/}" ]]; then
      continue
    fi
    if [[ "${line}" =~ ^[[:space:]]*# ]]; then
      continue
    fi

    # Remove inline comment marker " # ..." (dotenv-style).
    # Assumption: secret values don't contain " #" substring.
    if [[ "${line}" == *" #"* ]]; then
      line="${line%%" # "*}"
    fi

    # Parse KEY=VALUE
    if [[ "${line}" != *"="* ]]; then
      continue
    fi
    key="${line%%=*}"
    value="${line#*=}"

    # Trim whitespace around key/value
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"

    # Strip wrapping quotes
    if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
      value="${value:1:-1}"
    elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
      value="${value:1:-1}"
    fi

    # Don't override variables already set by container environment.
    if [[ "${!key+x}" == "x" ]]; then
      continue
    fi

    export "${key}=${value}"
  done < "${ENV_SECRET_FILE}"
fi

exec "$@"

