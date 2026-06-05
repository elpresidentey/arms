# ARMS Backend Deployment Script for Railway
# PowerShell script to deploy backend to Railway

Write-Host "🚀 ARMS Backend Railway Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Railway CLI is installed
Write-Host "Step 1: Checking Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Railway CLI is installed: $railwayVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Railway CLI. Please install manually." -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Step 2: Login to Railway
Write-Host "Step 2: Logging into Railway..." -ForegroundColor Yellow
Write-Host "This will open your browser for authentication." -ForegroundColor Gray
$response = Read-Host "Press Enter to continue or 'skip' if already logged in"
if ($response -ne "skip") {
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to login to Railway" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Railway login successful" -ForegroundColor Green
Write-Host ""

# Step 3: Navigate to backend directory
Write-Host "Step 3: Navigating to backend directory..." -ForegroundColor Yellow
Set-Location backend
Write-Host "✅ In backend directory" -ForegroundColor Green
Write-Host ""

# Step 4: Check if project is linked
Write-Host "Step 4: Checking Railway project..." -ForegroundColor Yellow
$projectCheck = railway status 2>&1
if ($LASTEXITCODE -ne 0 -or $projectCheck -match "not linked") {
    Write-Host "⚠️  Project not linked to Railway" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor Cyan
    Write-Host "1. Create NEW Railway project" -ForegroundColor White
    Write-Host "2. Link to EXISTING Railway project" -ForegroundColor White
    $choice = Read-Host "Enter choice (1 or 2)"
    
    if ($choice -eq "1") {
        Write-Host "Creating new Railway project..." -ForegroundColor Yellow
        railway init
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create project" -ForegroundColor Red
            exit 1
        }
    } elseif ($choice -eq "2") {
        Write-Host "Linking to existing project..." -ForegroundColor Yellow
        railway link
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to link project" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Railway project linked" -ForegroundColor Green
Write-Host ""

# Step 5: Set environment variables
Write-Host "Step 5: Environment Variables..." -ForegroundColor Yellow
Write-Host "Do you want to set environment variables?" -ForegroundColor Cyan
Write-Host "1. Use .env file (recommended if .env is complete)" -ForegroundColor White
Write-Host "2. Set manually via Railway dashboard (skip this step)" -ForegroundColor White
Write-Host "3. Continue without setting (if already set)" -ForegroundColor White
$envChoice = Read-Host "Enter choice (1, 2, or 3)"

if ($envChoice -eq "1") {
    Write-Host "Checking .env file..." -ForegroundColor Yellow
    if (Test-Path ".env") {
        Write-Host "✅ .env file found" -ForegroundColor Green
        Write-Host "⚠️  Note: Railway will use these variables on deployment" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env file not found in backend directory" -ForegroundColor Red
        Write-Host "Please create .env file or set variables in Railway dashboard" -ForegroundColor Yellow
        $continueAnyway = Read-Host "Continue anyway? (y/n)"
        if ($continueAnyway -ne "y") {
            exit 1
        }
    }
} elseif ($envChoice -eq "2") {
    Write-Host "Please set environment variables in Railway dashboard:" -ForegroundColor Yellow
    Write-Host "Run: railway open" -ForegroundColor Cyan
    Write-Host "Then go to Variables tab and add all required variables" -ForegroundColor Gray
    $ready = Read-Host "Press Enter when done"
}
Write-Host ""

# Step 6: Deploy
Write-Host "Step 6: Deploying to Railway..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed. Check logs with: railway logs" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""

# Step 7: Generate domain
Write-Host "Step 7: Generating public domain..." -ForegroundColor Yellow
railway domain
Write-Host ""

# Step 8: Show logs
Write-Host "Step 8: Checking deployment logs..." -ForegroundColor Yellow
Write-Host "Waiting for deployment to complete..." -ForegroundColor Gray
Start-Sleep -Seconds 5
railway logs --tail 50
Write-Host ""

# Final steps
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy your Railway backend URL from above" -ForegroundColor White
Write-Host "2. Update frontend VITE_API_URL environment variable on Vercel" -ForegroundColor White
Write-Host "3. Update Railway FRONTEND_URL and ALLOWED_ORIGINS variables" -ForegroundColor White
Write-Host "4. Test your backend: curl https://your-backend.up.railway.app/health/ping" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Yellow
Write-Host "- View logs: railway logs" -ForegroundColor Gray
Write-Host "- Open dashboard: railway open" -ForegroundColor Gray
Write-Host "- Check status: railway status" -ForegroundColor Gray
Write-Host "- View variables: railway variables" -ForegroundColor Gray
Write-Host ""

Set-Location ..
Write-Host "✅ All done! Your backend is deploying to Railway." -ForegroundColor Green
