# Script para probar Validacion e Inyeccion de datos en Registro
$baseUrl = "http://localhost:8081/api/auth/register"

$tests = @(
    @{
        name     = "Password demasiado corto"
        payload  = @{ username = "testuser1"; email = "test1@test.com"; firstName = "Test"; firstSurname = "User"; password = "123" }
        expected = 400
    },
    @{
        name     = "Email invalido"
        payload  = @{ username = "testuser2"; email = "not-an-email"; firstName = "Test"; firstSurname = "User"; password = "password123" }
        expected = 400
    },
    @{
        name     = "Campo faltante (Username)"
        payload  = @{ email = "test4@test.com"; firstName = "Test"; firstSurname = "User"; password = "password123" }
        expected = 400
    },
    @{
        name     = "Inyeccion XSS en Nombre"
        payload  = @{ username = "xssuser2"; email = "xss2@test.com"; firstName = "<script>alert(1)</script>"; firstSurname = "Script"; password = "password123" }
        expected = 200 
    }
)

foreach ($test in $tests) {
    try {
        $json = $test.payload | ConvertTo-Json
        $response = Invoke-WebRequest -Method Post -Uri $baseUrl -Body $json -ContentType "application/json" -UseBasicParsing
        $status = $response.StatusCode
        if ($status -eq $test.expected) {
            Write-Host ("[OK] Test: " + $test.name + " - Status: " + $status) -ForegroundColor Green
        }
        else {
            Write-Host ("[!] Test: " + $test.name + " - Status: " + $status + " (Se esperaba " + $test.expected + ")") -ForegroundColor Yellow
        }
    }
    catch {
        if ($_.Exception.Response -ne $null) {
            $status = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            
            if ($status -eq $test.expected) {
                Write-Host ("[OK] Test: " + $test.name + " - Status: " + $status + " (Rechazado correctamente)") -ForegroundColor Green
            }
            else {
                Write-Host ("[ERROR] Test: " + $test.name + " - Status: " + $status + " (Se esperaba " + $test.expected + ")") -ForegroundColor Red
                Write-Host "Cuerpo: " $body
            }
        }
        else {
            Write-Host ("[ERROR] Test: " + $test.name + " - Sin respuesta") -ForegroundColor Gray
        }
    }
}
