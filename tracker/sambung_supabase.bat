@echo off
chcp 65001 >nul
title BagSense - sambung Supabase
echo ==============================================
echo  Sambung tracker BagSense ke Supabase
echo ==============================================
echo.
echo Ambil dua nilai ini dari Supabase:
echo   Settings - API Keys  (atau Settings - API untuk service_role lama)
echo.
set /p SBURL="Project URL (https://xxxx.supabase.co): "
set /p SBKEY="Secret key (sb_secret_... / service_role): "
echo.
set "SUPABASE_URL=%SBURL%"
set "SUPABASE_SERVICE_KEY=%SBKEY%"
cd /d "%~dp0.."
set "PY=C:\Users\AHMAD ADAM HAKIMI\AppData\Local\Programs\Python\Python311\python.exe"
if not exist "%PY%" set "PY=python"
echo === 1/2 hantar data projek ===
"%PY%" tracker\export_snapshot.py --push
echo.
echo === 2/2 semak sambungan ===
"%PY%" tracker\semak_supabase.py
echo.
echo Tekan mana-mana kekunci untuk tutup.
pause >nul
