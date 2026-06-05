# Script to check Render service status and get URL

Write-Host "🔍 Checking Render Service Status" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$serviceId = "srv-d8cpsas2m8qs73d9d2hg"

# Expected URLs to try
$urls = @(
    "https://srv-d8cpsas2m8qs73d9d2hg.onrender.com",
    "https://arms-backend.onrender.com",
    "https://arms-backend-production.onrender.com"
)

Write-Host "Testing possible backend URLs..." -ForegroundColor Yellow
Write-Host ""

$foundUrl = $null

foreach ($url in $urls) {
    Write-Host "Testing: $url/health/ping" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "$url/health/ping" -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ SUCCESS! Backend is live at: $url" -ForegroundColor Green
            Write-Host ""
            Write-Host "Response:" -ForegroundColor Cyan
            Write-Host $response.Content -ForegroundColor White
            $foundUrl = $url
            break
        }
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   ❌ 404 Not Found" -ForegroundColor Red
        }
        elseif ($_.Exception.Message -match "timeout") {
            Write-Host "   ⏱️  Timeout - Service might be starting (cold start)" -ForegroundColor Yellow
        }
        else {
            Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

if ($foundUrl) {
    Write-Host ""
    Write-Host "🎉 Your backend is LIVE!" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Backend URL: $foundUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy this URL: $foundUrl" -ForegroundColor White
    Write-Host "2. Update your frontend VITE_API_URL on Vercel" -ForegroundColor White
    Write-Host "3. Update FRONTEND_URL and ALLOWED_ORIGINS on Render" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "⚠️  Backend not responding yet" -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Still deploying (check Render dashboard)" -ForegroundColor Gray
    Write-Host "2. Build failed (check logs)" -ForegroundColor Gray
    Write-Host "3. Health check endpoint issue" -ForegroundColor Gray
    Write-Host "4. Different URL than expected" -ForegroundColor Gray
    Write-Host ""
    Write-Host "What to do:" -ForegroundColor Yellow
    $dashboardUrl = "https://dashboard.render.com/web/$serviceId"
    Write-Host "1. Check Render dashboard: $dashboardUrl" -ForegroundColor Cyan
    Write-Host "2. View logs to see deployment status" -ForegroundColor Gray
    Write-Host "3. Look for the assigned URL in Render dashboard" -ForegroundColor Gray
    Write-Host "4. Wait if build is in progress" -ForegroundColor Gray
    Write-Host ""
}

$dashboardUrl = "https://dashboard.render.com/web/$serviceId"
$logsUrl = "https://dashboard.render.com/web/$serviceId/logs"
Write-Host "Render Dashboard: $dashboardUrl" -ForegroundColor Cyan
Write-Host "Logs: $logsUrl" -ForegroundColor Cyan
