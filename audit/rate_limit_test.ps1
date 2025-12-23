<#
.SYNOPSIS
    Rate-limit test: repeatedly POSTs invalid credentials to validate 429 behavior.

.DESCRIPTION
    Sends repeated login attempts for a given credential pair and reports when a 429 (Too Many Requests)
    is observed, along with timing and counts.

.PARAMETER TargetUrl
    Login endpoint (default: https://appmiaplicacion.com/api/auth/login)

.PARAMETER Username
    Username to test (default: invalid_user)

.PARAMETER Password
    Password to test (default: wrongpass)

.PARAMETER Attempts
    Number of attempts to perform (default: 15)

.PARAMETER DelaySeconds
    Delay between attempts (default: 1)

.PARAMETER OutputFile
    Log file path (default: .\rate_limit_results.log)

.PARAMETER SkipCertificateCheck
    Skip TLS validation (testing only)

.PARAMETER UseBasicParsing
    Use -UseBasicParsing when supported to avoid interactive parsing prompts on Windows PowerShell.

.EXAMPLE
    .\rate_limit_test.ps1 -Username test -Password bad -Attempts 20 -DelaySeconds 1 -UseBasicParsing
#>

param(
    [string]$TargetUrl = "https://appmiaplicacion.com/api/auth/login",
    [string]$Username = "invalid_user",
    [string]$Password = "wrongpass",
    [int]$Attempts = 15,
    [int]$DelaySeconds = 1,
    [string]$OutputFile = ".\rate_limit_results.log",
    [switch]$SkipCertificateCheck,
    [switch]$UseBasicParsing
)

Set-StrictMode -Version Latest

function Write-Log { param($m) $t=(Get-Date).ToString('o'); "$t`t$m" | Tee-Object -FilePath $OutputFile -Append; Write-Host $m }

Write-Log "Starting rate-limit test against $TargetUrl (Attempts=$Attempts, Delay=$DelaySeconds)"

for ($i=1; $i -le $Attempts; $i++) {
    $body = @{ usernameOrEmail = $Username; password = $Password } | ConvertTo-Json
    $invokeParams = @{
        Uri = $TargetUrl; Method = 'POST'; Body = $body; ContentType = 'application/json'; TimeoutSec = 30; Headers = @{ 'Accept' = 'application/json' }
    }
    if ($SkipCertificateCheck.IsPresent) { $invokeParams['SkipCertificateCheck'] = $true }
    if ($UseBasicParsing.IsPresent) {
        $invokeCmd = Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue
        if ($invokeCmd -and $invokeCmd.Parameters.Keys -contains 'UseBasicParsing') { $invokeParams['UseBasicParsing'] = $true }
    }

    try {
        $resp = Invoke-WebRequest @invokeParams -ErrorAction Stop
        $status = $resp.StatusCode
        Write-Log "Attempt #$i => $status"
        if ($status -eq 429) { Write-Log "Rate limit reached at attempt #$i"; break }
    } catch {
        $status = 0
        if ($_.Exception.Response -ne $null) {
            try { $status = $_.Exception.Response.StatusCode.value__ } catch {}
        }
        Write-Log "Attempt #$i => ERROR (status: $status)"
        if ($status -eq 429) { Write-Log "Rate limit reached at attempt #$i"; break }
    }
    Start-Sleep -Seconds $DelaySeconds
}

Write-Log "Test finished"
Write-Host "Results saved to: $OutputFile"