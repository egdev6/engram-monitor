$targets = @("dist", "node_modules", "pnpm-lock.yaml", "package-lock.json")

foreach ($target in $targets) {
    if (Test-Path $target) {
        Remove-Item -Recurse -Force $target
        Write-Host "Removed $target"
    }
}

npm cache clean --force
Write-Host "Clean complete."
