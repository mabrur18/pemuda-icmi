#!/usr/bin/env bash
# scripts/backup/export-sanity.sh - PRD NFR-09 & Tahap 10
set -euo pipefail

DATASET="${1:-staging}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/sanity-${DATASET}-${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "============================================================"
echo "📦 Ekspor Dataset Sanity ($DATASET)"
echo "Target: $FILENAME"
echo "============================================================"

# Jalankan ekspor menggunakan script TypeScript cross-platform
pnpm tsx scripts/backup/export-sanity.ts --dataset="$DATASET"

echo "Ekspor selesai."
