<#
.SYNOPSIS
    Sends a login request and captures headers (Set-Cookie, Content-Type) and body.

.DESCRIPTION
    Useful to audit cookie flags (HttpOnly, Secure, SameSite) and response Content-Type/charset.

.PARAMETER TargetUrl
    Login endpoint. Default: https://appmiaplicacion.com/api/auth/login

.PARAMETER Username
    Username to use (default: admin)

.PARAMETER Password
    Password to use (default: admin)

.PARAMETER OutputFile
    Path to save results (default: .\login_with_headers.log)

.PARAMETER SkipCertificateCheck
    Skip TLS verification (for test envs)

.PARAMETER UseBasicParsing
    Use -UseBasicParsing when supported to avoid interactive prompts in Windows PowerShell.

.EXAMPLE
    .\login_with_headers.ps1 -Username admin -Password admin -UseBasicParsing
#>

param(
    [string]$TargetUrl = "https://appmiaplicacion.com/api/auth/login",
    [string]$Username = "admin",
    [string]$Password = "admin",
    [string]$OutputFile = ".\login_with_headers.log",
    [switch]$SkipCertificateCheck,
    [switch]$UseBasicParsing,
    [switch]$FailOnIssue  # Exit with code 1 if cookie issues detected
)

Set-StrictMode -Version Latest
function Write-Log { param($m) $t=(Get-Date).ToString('o'); "$t`t$m" | Tee-Object -FilePath $OutputFile -Append; Write-Host $m }

# Collector for cookie security issues found during parsing
$cookieIssues = @()

function Parse-Cookie {
    param($cookieString)
    # Simple parser to extract flags and record issues
    $parts = $cookieString -split ';' | ForEach-Object { $_.Trim() }
    $nameVal = $parts[0]
    Write-Log "  Cookie: $nameVal"

    $flags = @()
    if ($parts.Length -gt 1) { $flags = $parts[1..($parts.Length-1)] }
    foreach ($p in $flags) { Write-Log "    Flag: $p" }

    $flagsJoined = ($flags -join ' ')

    # Check critical flags
    if (-not ($flagsJoined -match '(?i)\bHttpOnly\b')) {
        $cookieIssues += "Cookie '$nameVal' missing 'HttpOnly'"
        Write-Log "    WARNING: Cookie missing 'HttpOnly' flag"
    }
    if (-not ($flagsJoined -match '(?i)\bSecure\b')) {
        $cookieIssues += "Cookie '$nameVal' missing 'Secure'"
        Write-Log "    WARNING: Cookie missing 'Secure' flag (recommend setting Secure in production)."
    }
    if (-not ($flagsJoined -match '(?i)\bSameSite\b')) {
        $cookieIssues += "Cookie '$nameVal' missing 'SameSite'"
        Write-Log "    WARNING: Cookie missing 'SameSite' flag"
    }
}

$body = @{ usernameOrEmail = $Username; password = $Password } | ConvertTo-Json
$invokeParams = @{ Uri = $TargetUrl; Method = 'POST'; Body = $body; ContentType = 'application/json'; TimeoutSec = 30; Headers = @{ 'Accept' = 'application/json' } }
if ($SkipCertificateCheck.IsPresent) { $invokeParams['SkipCertificateCheck'] = $true }
if ($UseBasicParsing.IsPresent) { $invokeCmd = Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue; if ($invokeCmd -and $invokeCmd.Parameters.Keys -contains 'UseBasicParsing') { $invokeParams['UseBasicParsing'] = $true } }

try {
    $resp = Invoke-WebRequest @invokeParams -ErrorAction Stop
    $status = $resp.StatusCode
    $content = $resp.Content
    $headers = $resp.Headers

    Write-Log "Status: $status"
    Write-Log "Content-Type: $($headers['Content-Type'])"

    # Set-Cookie header may be multiple values (sometimes combined in a single header)
    $setCookie = $headers['Set-Cookie']
    if ($setCookie) {
        $cookieList = @()
        if ($setCookie -is [System.Array]) {
            $cookieList = $setCookie
        } else {
            # Try to split combined Set-Cookie into separate cookie strings
            # Split on comma followed by token= to avoid splitting on Expires which contains commas
            $cookieList = [regex]::Split($setCookie, ',(?=[^=]+=[^;]+)')
        }

        foreach ($c in $cookieList) {
            $cTrim = $c.Trim()
            Write-Log "Set-Cookie: $cTrim"
            Parse-Cookie $cTrim
        }
    } else {
        Write-Log "Set-Cookie: <none>"
    }

    Write-Log "Body: $($content -replace '\s+',' ')"
} catch {
    $status = 0
    $body = ""

    try {
        if ($PSItem -and $PSItem.Exception) {
            $body = $PSItem.Exception.Message

            # Access Response safely (not all exception types expose it)
            $respObj = $null
            try { $respObj = $PSItem.Exception.Response } catch { $respObj = $null }

            if ($respObj -ne $null) {
                try { $status = $respObj.StatusCode.value__ } catch {}

                # Try to read response body if available
                try {
                    $stream = $respObj.GetResponseStream()
                    if ($stream -ne $null) {
                        $reader = New-Object System.IO.StreamReader($stream)
                        $body = $reader.ReadToEnd()
                    }
                } catch {
                    # ignore read errors
                }
            }
        } else {
            $body = $_.ToString()
        }
    } catch {
        $body = $_.ToString()
    }

    Write-Log "Request Error (status=$status): $body"
}



# Summary of cookie issues, if any
if ($cookieIssues.Count -gt 0) {
    Write-Log "Cookie Security Issues found:"
    foreach ($iss in $cookieIssues) { Write-Log " - $iss" }
} else {
    Write-Log "No cookie security issues detected (HttpOnly/Secure/SameSite present where applicable)."
}

# Fail the run if requested and issues were found
if ($FailOnIssue.IsPresent -and $cookieIssues.Count -gt 0) {
    Write-Log "FailOnIssue enabled and issues detected; exiting with code 1"
    exit 1
}

Write-Host "Check complete. Log: $OutputFile"