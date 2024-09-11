# update_version.ps1
# Usage: ./update_version.ps1 <new_version>
# FORMAT IS <0.0.0>

param (
    [string]$new_version
)

if ($new_version -match '^[0-9]+\.[0-9]+\.[0-9]+$') {
    # Define directories to exclude
    $excludeDirs = @('node_modules', '.git', 'dist', 'out', 'build')

    # Get all package.json files recursively excluding specific directories
    $packageJsonFiles = Get-ChildItem -Recurse -Filter "package.json" | Where-Object {
        $dir = $_.DirectoryName
        -not ($excludeDirs | ForEach-Object { $dir -like "*$_*" })
    }

    foreach ($packageJsonFile in $packageJsonFiles) {
        Write-Host "Processing $($packageJsonFile.FullName)"
        # Read the content of the current package.json file
        $packageJsonContent = Get-Content -Raw -Path $packageJsonFile.FullName

        try {
            $packageJsonParsed = $packageJsonContent | ConvertFrom-Json
        } catch {
            Write-Host "Error parsing $($packageJsonFile.FullName)"
            continue
        }

        # Check if the current package.json has a version field
        if ($packageJsonParsed.version) {
            $current_version = $packageJsonParsed.version
            if ($current_version -ne $new_version) {
                Write-Host "Updating version from $current_version to $new_version in $($packageJsonFile.FullName)"
                # Update the version
                $updatedPackageJson = $packageJsonContent -replace '"version": "' + $current_version + '"', '"version": "' + $new_version + '"'

                # Write the updated content back to the package.json file
                $updatedPackageJson | Set-Content -Path $packageJsonFile.FullName
            } else {
                Write-Host "Version is already $new_version in $($packageJsonFile.FullName)"
            }
        } else {
            Write-Host "No version field found in $($packageJsonFile.FullName)"
        }
    }
} else {
    Write-Host "Version format $new_version isn't correct, proper format is <0.0.0>"
}
