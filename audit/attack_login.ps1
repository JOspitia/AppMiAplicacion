<#
.SYNOPSIS
    Simple authorized login audit script for your own application.

.DESCRIPTION
    Attempts to POST login credentials to the configured endpoint, logs results and respects safe defaults
    (delay between attempts, max attempts). Intended for use in staging or under explicit authorization.

    WARNING: Use responsibly. Do NOT run this against third-party systems you do not own or have
    permission to test. Start with low attempt counts and long delays. Notify stakeholders when
    performing audits on production.

.PARAMETER TargetUrl
    Full URL to the login endpoint (default: https://appmiaplicacion.com/api/auth/login)

.PARAMETER CredentialsFile
    Optional CSV file with columns `usernameOrEmail,password` to load credential pairs.

.PARAMETER DelaySeconds
    Seconds to wait between attempts (default 2).

.PARAMETER MaxAttempts
    Maximum number of attempts (default 100).

.PARAMETER OutputFile
    Path to write the results log (default: .\audit_login_results.log)

.PARAMETER SkipCertificateCheck
    Skip TLS cert validation (useful for local/CI testing only).

.PARAMETER StopOnSuccess
    Stop the run when a successful login is observed (2xx response).

.EXAMPLE
    .\attack_login.ps1 -DelaySeconds 1 -MaxAttempts 50 -StopOnSuccess

#>

param(
    [string]$TargetUrl = "https://appmiaplicacion.com/api/auth/login",
    [string]$CredentialsFile = "",
    [int]$DelaySeconds = 2,
    [int]$MaxAttempts = 100,
    [string]$OutputFile = ".\audit_login_results.log",
    [switch]$SkipCertificateCheck,
    [switch]$StopOnSuccess,
    [switch]$UseBasicParsing  # Add this to avoid interactive "UseBasicParsing" prompt on Windows PowerShell
)

Set-StrictMode -Version Latest

function Write-Log {
    param($Message)
    $timestamp = (Get-Date).ToString('o')
    $line = "$timestamp`t$Message"
    $line | Tee-Object -FilePath $OutputFile -Append
    Write-Host $line
}

# Load credentials: either from inline array (example) or CSV if provided
$credentials = @(
    @{ usernameOrEmail = 'admin'; password = 'admin' },
    @{ usernameOrEmail = 'jospita'; password = 'admin' }
)

if ($CredentialsFile -and (Test-Path $CredentialsFile)) {
    try {
        $csv = Import-Csv -Path $CredentialsFile
        $credentials = @()
        foreach ($row in $csv) {
            $credentials += @{ usernameOrEmail = $row.usernameOrEmail; password = $row.password }
        }
        Write-Log "Loaded $($credentials.Count) credentials from $CredentialsFile"
    } catch {
        Write-Log "Failed to load credentials file: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-Log "Using built-in credential list (override with -CredentialsFile path/to/file.csv)"
}

if ($MaxAttempts -le 0) { Write-Error "MaxAttempts must be > 0"; exit 1 }

$total = 0
$success = 0
$fail = 0
$statusCounts = @{}

foreach ($cred in $credentials) {
    if ($total -ge $MaxAttempts) { break }

    $total++
    $jsonBody = @{ usernameOrEmail = $cred.usernameOrEmail; password = $cred.password } | ConvertTo-Json

    try {
        # Use Invoke-WebRequest to capture status code and response body even on non-2xx
        $invokeParams = @{
            Uri = $TargetUrl
            Method = 'POST'
            Body = $jsonBody
            ContentType = 'application/json'
            Headers = @{ 'Accept' = 'application/json' }
            TimeoutSec = 30
        }
        if ($SkipCertificateCheck.IsPresent) { $invokeParams['SkipCertificateCheck'] = $true }

        # Add UseBasicParsing only if requested AND supported by the local Invoke-WebRequest implementation
        if ($UseBasicParsing.IsPresent) {
            $invokeCmd = Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue
            if ($invokeCmd -and $invokeCmd.Parameters.Keys -contains 'UseBasicParsing') {
                $invokeParams['UseBasicParsing'] = $true
            } else {
                Write-Log "Warning: -UseBasicParsing requested but not supported in this PowerShell version; continuing without it."
            }
        }

        $response = Invoke-WebRequest @invokeParams -ErrorAction Stop
        $status = $response.StatusCode
        $body = $response.Content

        Write-Log "ATTEMPT: $($cred.usernameOrEmail) / $($cred.password) => $status | OK | Body: $($body -replace '\s+',' ')"

        if ($status -ge 200 -and $status -lt 300) {
            $success++
            if ($StopOnSuccess.IsPresent) { Write-Log "Success detected, stopping (StopOnSuccess)."; break }
        } else {
            $fail++
        }

    } catch {
        # Capture response status if available
        $status = 0
        $body = $_.Exception.Message
        if ($_.Exception.Response -ne $null) {
            try {
                $status = $_.Exception.Response.StatusCode.value__
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $body = $reader.ReadToEnd()
            } catch {
                # ignore
            }
        }

        Write-Log "ATTEMPT: $($cred.usernameOrEmail) / $($cred.password) => $status | ERROR | Body: $($body -replace '\s+',' ')"
        $fail++
    }

    # update status counts
    if (-not $statusCounts.ContainsKey($status)) { $statusCounts[$status] = 0 }
    $statusCounts[$status]++

    Start-Sleep -Seconds $DelaySeconds
}

Write-Log "SUMMARY: Total=$total Success=$success Fail=$fail"
foreach ($k in $statusCounts.Keys | Sort-Object) {
    Write-Log ("STATUS {0}: {1}" -f $k, $statusCounts[$k])
}

Write-Host "Audit finished. Results written to: $OutputFile"

# End of script
