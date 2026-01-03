python app.py
# Backend Environment Setup Guide

## Problem Summary
- Current Python version: 3.14.2 (unsupported by scikit-learn, spaCy)
- Need: Python 3.11 or 3.10
- Virtual environment needs to be recreated

## Step-by-Step Solution

### Step 1: Install Python 3.11

**Option A: Download from Python.org (Recommended)**
1. Visit: https://www.python.org/downloads/release/python-3118/
2. Download "Windows installer (64-bit)"
3. **IMPORTANT**: During installation, check ✅ "Add Python to PATH"
4. Click "Install Now"

**Option B: Using Windows Store**
1. Open Microsoft Store
2. Search for "Python 3.11"
3. Install "Python 3.11" by Python Software Foundation

### Step 2: Verify Python 3.11 Installation

Open PowerShell and run:
```powershell
py -3.11 --version
```

Expected output: `Python 3.11.x`

### Step 3: Remove Old Virtual Environment

```powershell
cd "C:\Users\aqib2\OneDrive\Desktop\AI project"
if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }
```

### Step 4: Create New Virtual Environment

```powershell
py -3.11 -m venv venv
```

### Step 5: Activate Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

**If you get an execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try activating again.

### Step 6: Verify Python Version in Venv

```powershell
python --version
```

Should show: `Python 3.11.x` (NOT 3.14!)

### Step 7: Upgrade pip

```powershell
python -m pip install --upgrade pip setuptools wheel
```

### Step 8: Install Dependencies

```powershell
cd backend
python -m pip install -r requirements.txt
```

**If scikit-learn or scipy fail**, install them with prebuilt wheels:
```powershell
python -m pip install numpy==1.24.3 scipy==1.11.2 scikit-learn==1.3.0 --only-binary :all:
python -m pip install -r requirements.txt
```

### Step 9: Download spaCy Model

```powershell
python -m spacy download en_core_web_sm
```

### Step 10: Verify Installation

```powershell
python -c "import sklearn; import spacy; print('✓ All packages imported successfully')"
```

### Step 11: Run Flask Backend

```powershell
python app.py
```

Or if app.py is in a different location:
```powershell
cd backend
python app.py
```

---

## Quick Command Sequence (After Python 3.11 is Installed)

Copy and paste these commands one by one:

```powershell
# Navigate to project
cd "C:\Users\aqib2\OneDrive\Desktop\AI project"

# Remove old venv
if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }

# Create new venv with Python 3.11
py -3.11 -m venv venv

# Activate venv
.\venv\Scripts\Activate.ps1

# Verify Python version (should be 3.11.x)
python --version

# Upgrade pip
python -m pip install --upgrade pip setuptools wheel

# Install dependencies
cd backend
python -m pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Verify installation
python -c "import sklearn; import spacy; print('Success!')"

# Run backend
python app.py
```

---

## Troubleshooting

### Issue: "py -3.11" not found
**Solution**: Python 3.11 not installed or not in PATH. Reinstall Python 3.11 with "Add to PATH" checked.

### Issue: Execution Policy Error
**Solution**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Issue: scikit-learn fails to build
**Solution**: Use prebuilt wheels:
```powershell
python -m pip install scikit-learn==1.3.0 --only-binary :all:
```

### Issue: spaCy model download fails
**Solution**: Download manually:
```powershell
python -m pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.6.0/en_core_web_sm-3.6.0-py3-none-any.whl
```

### Issue: Still using Python 3.14 in venv
**Solution**: The venv was created with wrong Python. Delete venv and recreate:
```powershell
Remove-Item -Recurse -Force venv
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
python --version  # Verify it's 3.11
```

---

## Verification Checklist

- [ ] Python 3.11 installed and accessible via `py -3.11`
- [ ] Virtual environment created with Python 3.11
- [ ] Virtual environment activated (prompt shows `(venv)`)
- [ ] `python --version` shows 3.11.x (NOT 3.14)
- [ ] All packages installed from requirements.txt
- [ ] spaCy model downloaded successfully
- [ ] Can import sklearn and spacy without errors
- [ ] Flask backend runs without errors




