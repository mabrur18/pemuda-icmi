# scripts/backup/export-sanity.ps1 - PRD NFR-09 & Tahap 10
param(
  [string]$Dataset = "staging"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📦 Ekspor Dataset Sanity ($Dataset)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

pnpm tsx scripts/backup/export-sanity.ts --dataset="$Dataset"
