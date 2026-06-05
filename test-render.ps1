$serviceId = "srv-d8cpsas2m8qs73d9d2hg"
$urls = @(
    "https://srv-d8cpsas2m8qs73d9d2hg.onrender.com",
    "https://arms-backend.onrender.com"
)

Write-Host "Testing Render backend..." -ForegroundColor Cyan

foreach ($url in $urls) {
    Write-Host "Testing: $url/health/ping" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$url/health/ping" -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "SUCCESS! Backend is live!" -ForegroundColor Green
            Write-Host "URL: $url" -ForegroundColor White
            Write-Host "Response: $($response.Content)" -ForegroundColor White
            break
        }
    }
    catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Dashboard: https://dashboard.render.com/web/$serviceId" -ForegroundColor Cyan
