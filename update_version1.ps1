# Usage: ./update_version.ps1 <new_version>
# FORMAT IS <0.0.0>

param (
    [string]$new_version
)

if ($new_version -match '^[0-9]+\.[0-9]+\.[0-9]+$') {
    $current_version = (Get-Content ./package.json | Select-String -Pattern '"version":' | ForEach-Object {
        $_.Matches.Groups[1].Value
    }).Trim('"')

    # Update the version in package.json
    (Get-Content ./package.json) -replace '"version": "' + $current_version + '"', '"version": "' + $new_version + '"' | Set-Content ./package.json

    Write-Host "Updated version to $new_version"
} else {
    Write-Host "Version format $new_version isn't correct, proper format is <0.0.0>"
}
