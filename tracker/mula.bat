@echo off
rem BagSense FYP1 tracker - klik dua kali: jana semula + buka browser
cd /d "%~dp0.."
set "PY=C:\Users\AHMAD ADAM HAKIMI\AppData\Local\Programs\Python\Python311\python.exe"
if not exist "%PY%" set "PY=python"
"%PY%" "tracker\build_tracker.py"
if errorlevel 1 pause
start "" "%~dp0index.html"
