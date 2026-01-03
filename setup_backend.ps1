# Smart Resume Analyzer - Backend Environment Setup Script
# This script sets up a clean Python 3.11/3.10 virtual environment for the Flask backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check for Python 3.11 or 3.10
Write-Host "[1/7] Checking for Python 3.11 or 3.10..." -ForegroundColor Yellow

$python311 = $null
$python310 = $null

# Check Python Launcher for 3.11
try {
    $version = py -3.11 --version 2>&1
    if ($version -match "Python 3\.(11|10)") {
        $python311 = "py -3.11"
        Write-Host "✓ Found Python 3.11 via py launcher" -ForegroundColor Green
    }
} catch {
    # Try direct path
    $possiblePaths = @(
        "C:\Python311\python.exe",
        "C:\Python310\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $version = & $path --version 2>&1
            if ($version -match "Python 3\.(11|10)") {
                $python311 = $path
                Write-Host "✓ Found Python at: $path" -ForegroundColor Green
                break
            }
        }
    }
}

if (-not $python311) {
    Write-Host "✗ Python 3.11 or 3.10 not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.11 or 3.10:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.python.org/downloads/release/python-3118/" -ForegroundColor Cyan
    Write-Host "2. During installation, check 'Add Python to PATH'" -ForegroundColor Cyan
    Write-Host "3. Run this script again" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Step 2: Remove old virtual environment
Write-Host "[2/7] Removing old virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Remove-Item -Recurse -Force "venv"
    Write-Host "✓ Old venv removed" -ForegroundColor Green
} else {
    Write-Host "✓ No existing venv found" -ForegroundColor Green
}

# Step 3: Create new virtual environment
Write-Host "[3/7] Creating new virtual environment with Python 3.11..." -ForegroundColor Yellow
if ($python311 -match "^py ") {
    & $python311 -m venv venv
} else {
    & $python311 -m venv venv
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Virtual environment created" -ForegroundColor Green

# Step 4: Activate virtual environment
Write-Host "[4/7] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to activate virtual environment" -ForegroundColor Red
    Write-Host "Note: You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Step 5: Upgrade pip
Write-Host "[5/7] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip
Write-Host "✓ pip upgraded" -ForegroundColor Green

# Step 6: Verify Python version
Write-Host "[6/7] Verifying Python version..." -ForegroundColor Yellow
$version = python --version
Write-Host "Current Python: $version" -ForegroundColor Cyan
if ($version -match "Python 3\.(14|15|16)") {
    Write-Host "✗ WARNING: Still using unsupported Python version!" -ForegroundColor Red
    Write-Host "The virtual environment may have been created with the wrong Python." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Python version is compatible" -ForegroundColor Green

# Step 7: Install dependencies
Write-Host "[7/7] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan

# Change to backend directory
Push-Location backend

# Install dependencies
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install some dependencies" -ForegroundColor Red
    Write-Host "Trying to install problematic packages individually..." -ForegroundColor Yellow
    
    # Try installing scikit-learn and scipy first (they need prebuilt wheels)
    python -m pip install scikit-learn==1.3.0 --only-binary :all:
    python -m pip install scipy==1.11.2 --only-binary :all:
    python -m pip install numpy==1.24.3 --only-binary :all:
    
    # Then install the rest
    python -m pip install -r requirements.txt
}

Pop-Location

Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 8: Download spaCy model
Write-Host "[8/8] Downloading spaCy English model..." -ForegroundColor Yellow
python -m spacy download en_core_web_sm

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To activate the environment in the future, run:" -ForegroundColor Cyan
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host ""
Write-Host "To run the Flask backend:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  python app.py" -ForegroundColor White
Write-Host ""




