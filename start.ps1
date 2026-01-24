Write-Host "Starting Portfolio Backend..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install/update dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    $envContent = @"
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
PORT=5000
"@
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host ".env file created!" -ForegroundColor Green
}

# Start Flask server
Write-Host ""
Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
python app.py
