# ARMS Backend Verification Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ARMS Backend Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if port 3001 is listening
Write-Host "Test 1: Checking if backend is running on port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":3001" | findstr "LISTENING"
if ($portCheck) {
    Write-Host "[PASS] Backend is running on port 3001" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Backend is NOT running on port 3001" -ForegroundColor Red
    Write-Host "Please start the backend with: npm run start:dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: Test admin login
Write-Host "Test 2: Testing admin login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@arms.com"
        password = "Admin@2026"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    
    if ($loginResponse.access_token) {
        Write-Host "[PASS] Admin login successful" -ForegroundColor Green
        $token = $loginResponse.access_token
    } else {
        Write-Host "[FAIL] Login failed - no token received" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[FAIL] Login failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Test authenticated endpoint (pending withdrawals)
Write-Host "Test 3: Testing pending withdrawals endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $withdrawals = Invoke-RestMethod -Uri "http://localhost:3001/wallet/admin/pending-withdrawals" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "[PASS] Pending withdrawals endpoint working" -ForegroundColor Green
    Write-Host "Found $($withdrawals.Count) pending withdrawal(s)" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Pending withdrawals failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "This might indicate a Supabase connection issue" -ForegroundColor Yellow
}
Write-Host ""

# Test 4: Test recyclables endpoint
Write-Host "Test 4: Testing recyclables endpoint..." -ForegroundColor Yellow
try {
    $recyclables = Invoke-RestMethod -Uri "http://localhost:3001/recyclables" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "[PASS] Recyclables endpoint working" -ForegroundColor Green
    Write-Host "Found $($recyclables.Count) recyclable(s)" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Recyclables failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Write-Host ""

# Test 5: Test service requests endpoint
Write-Host "Test 5: Testing service requests endpoint..." -ForegroundColor Yellow
try {
    $requests = Invoke-RestMethod -Uri "http://localhost:3001/service-requests" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "[PASS] Service requests endpoint working" -ForegroundColor Green
    Write-Host "Found $($requests.Count) service request(s)" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Service requests failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If any tests failed with Supabase connection errors:" -ForegroundColor Yellow
Write-Host "1. Check your internet connection" -ForegroundColor Yellow
Write-Host "2. Restart the backend: npm run start:dev" -ForegroundColor Yellow
Write-Host "3. Wait 10-15 seconds for full startup" -ForegroundColor Yellow
Write-Host "4. Run this script again" -ForegroundColor Yellow
Write-Host ""
