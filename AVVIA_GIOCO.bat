@echo off
cd /d "%~dp0"
set PORT=8090

where python >nul 2>nul
if errorlevel 1 (
  echo Python non trovato. Installa Python oppure avvia un server locale nella cartella del gioco.
  pause
  exit /b 1
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:%PORT%/'"
python -m http.server %PORT% --bind 127.0.0.1
