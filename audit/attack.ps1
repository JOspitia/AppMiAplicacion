# Script para probar el Rate Limit
for ($i = 1; $i -le 15; $i++) {
    try {
        $body = @{ usernameOrEmail = "admin"; password = "wrongpassword" } | ConvertTo-Json
        $response = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -Body $body -ContentType "application/json"
        
        Write-Host ("Intento " + $i + ": Exito (Status 200)") -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response -ne $null) {
            $status = [int]$_.Exception.Response.StatusCode
            if ($status -eq 429) {
                Write-Host ("Intento " + $i + ": [BLOQUEADO] - Status 429 (Demasiados intentos)") -ForegroundColor Red
            }
            elseif ($status -eq 401) {
                Write-Host ("Intento " + $i + ": Error 401 (Credenciales invalidas)") -ForegroundColor Yellow
            }
            else {
                Write-Host ("Intento " + $i + ": Error " + $status) -ForegroundColor Gray
            }
        }
        else {
            Write-Host ("Intento " + $i + ": Error de conexion") -ForegroundColor Gray
        }
    }
}