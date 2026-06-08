# ARMS Environment Switcher
# Run with: .\switch-environment.ps1 [local|production]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('local','production')]
    [string]$Environment
)

Write-Host "`n🔄 ARMS Environment Switcher`n" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$frontendDir = "frontend"

if ($Environment -eq "local") {
    Write-Host "📍 Switching to LOCAL development environment...`n" -ForegroundColor Green
    
    Write-Host "✓ Frontend will connect to: http://localhost:3001" -ForegroundColor Green
    Write-Host "✓ Using local PostgreSQL database" -ForegroundColor Green
    Write-Host "✓ Run commands:" -ForegroundColor Yellow
    Write-Host "  cd backend && npm run start:dev" -ForegroundColor White
    Write-Host "  cd frontend && npm run dev`n" -ForegroundColor White
    
    Write-Host "📌 Access your app at: http://localhost:3000`n" -ForegroundColor Cyan
    
} elseif ($Environment -eq "production") {
    Write-Host "🌐 Switching to PRODUCTION testing environment...`n" -ForegroundColor Magenta
    
    Write-Host "✓ Frontend will connect to: https://arms-c56l.onrender.com" -ForegroundColor Magenta
    Write-Host "✓ Using production Supabase database" -ForegroundColor Magenta
    Write-Host "✓ Run commands:" -ForegroundColor Yellow
    Write-Host "  cd frontend && npm run build" -ForegroundColor White
    Write-Host "  cd frontend && npm run preview`n" -ForegroundColor White
    
    Write-Host "📌 Access your app at: http://localhost:4173`n" -ForegroundColor Cyan
    Write-Host "⚠️  WARNING: You'll need to create accounts in production!" -ForegroundColor Red
    Write-Host "   - Register new user at production URL" -ForegroundColor Yellow
    Write-Host "   - Confirm email before logging in`n" -ForegroundColor Yellow
}

Write-Host "================================`n" -ForegroundColor Cyan

# Ask to start the servers
$start = Read-Host "Do you want to start the servers now? (y/n)"

if ($start -eq "y") {
    if ($Environment -eq "local") {
        Write-Host "`nStarting backend server...`n" -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"
        
        Start-Sleep -Seconds 2
        
        Write-Host "Starting frontend server...`n" -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
        
    } elseif ($Environment -eq "production") {
        Write-Host "`nBuilding frontend for production...`n" -ForegroundColor Magenta
        Set-Location $frontendDir
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`nStarting preview server...`n" -ForegroundColor Magenta
            npm run preview
        } else {
            Write-Host "`n❌ Build failed. Please check errors above.`n" -ForegroundColor Red
        }
        
        Set-Location ..
    }
} else {
    Write-Host "`nRun the commands above manually when ready.`n" -ForegroundColor Yellow
}
