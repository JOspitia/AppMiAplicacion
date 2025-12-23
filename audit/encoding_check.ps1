<#
.SYNOPSIS
    Checks response for signs of encoding/charset problems (mojibake) and inspects Content-Type charset.

.DESCRIPTION
    Performs a login request (or any GET/POST) and inspects the response body for common mojibake patterns
    (e.g., "Ã" sequences) and verifies Content-Type charset header. Reports findings to the log.

.PARAMETER TargetUrl
    Endpoint to call (default: https://appmiaplicacion.com/api/auth/login)

.PARAMETER Method
    HTTP method to use (POST by default)

.PARAMETER Username
    Username to use for POST login (default: admin)

.PARAMETER Password
    Password to use for POST login (default: admin)

.PARAMETER OutputFile
    Log file path (default: .\encoding_check.log)

.PARAMETER SkipCertificateCheck
    Skip TLS validation (test envs only)

.PARAMETER UseBasicParsing
    Use -UseBasicParsing when supported.
#>

param(
    [string]$TargetUrl = "https://appmiaplicacion.com/api/auth/login",
    [ValidateSet('GET','POST')][string]$Method = 'POST',
    [string]$Username = 'admin',
    [string]$Password = 'admin',
    [string]$OutputFile = ".\encoding_check.log",
    [switch]$SkipCertificateCheck,
    [switch]$UseBasicParsing
)

Set-StrictMode -Version Latest
function Write-Log { param($m) $t=(Get-Date).ToString('o'); "$t`t$m" | Tee-Object -FilePath $OutputFile -Append; Write-Host $m }

$invokeParams = @{ Uri = $TargetUrl; Method = $Method; TimeoutSec = 30; Headers = @{ 'Accept' = 'application/json' } }
if ($Method -eq 'POST') { $invokeParams['Body'] = @{ usernameOrEmail = $Username; password = $Password } | ConvertTo-Json; $invokeParams['ContentType'] = 'application/json' }
if ($SkipCertificateCheck.IsPresent) { $invokeParams['SkipCertificateCheck'] = $true }
if ($UseBasicParsing.IsPresent) { $invokeCmd = Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue; if ($invokeCmd -and $invokeCmd.Parameters.Keys -contains 'UseBasicParsing') { $invokeParams['UseBasicParsing'] = $true } }

try {
    $resp = Invoke-WebRequest @invokeParams -ErrorAction Stop
    $status = $resp.StatusCode
    $content = $resp.Content
    $ct = $resp.Headers['Content-Type']
    Write-Log "Status: $status"
    Write-Log "Content-Type: $ct"

    # Heuristic checks for mojibake / encoding issues
    $mojibakePatterns = @('Ã', 'â', 'Ã¡', 'Ã©', '�')
    $found = @()
    foreach ($p in $mojibakePatterns) { if ($content -match [regex]::Escape($p)) { $found += $p } }

    if ($found.Count -gt 0) {
        Write-Log "Potential encoding issues detected: Found sequences: $($found -join ',')"
        # Print a short excerpt where it occurs
        foreach ($p in $found) {
            $i = $content.IndexOf($p)
            $start = [Math]::Max(0, $i-30)
            $len = [Math]::Min(120, $content.Length - $start)
            $excerpt = $content.Substring($start,$len) -replace '\s+',' '
            Write-Log "Excerpt around '$p': $excerpt"
        }
    } else {
        Write-Log "No obvious mojibake patterns detected in response body."
    }

} catch {
    $status = 0
    Write-Log "Request error: $($_.Exception.Message)"
}

Write-Host "Encoding check complete. Log: $OutputFile"