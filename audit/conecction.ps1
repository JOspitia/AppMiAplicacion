$body = @{
    usernameOrEmail = "admin"
    password = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://appmiaplicacion.com/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body `
    -SkipCertificateCheck