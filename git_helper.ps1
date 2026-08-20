$git = "C:\Users\Tulsi Gold & Silver\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

# Initialize if .git doesn't exist
if (-not (Test-Path -Path ".git")) {
    Write-Output "Initializing local Git repository..."
    & $git init
    & $git remote add origin https://github.com/mayank122340/sonikhataapp.git
}

# Configure user details if not set
& $git config user.name "mayank122340"
& $git config user.email "mayank122340@example.com"

# Git operations
Write-Output "Staging files..."
& $git add .

Write-Output "Committing changes..."
& $git commit -m "Update PWA branding and tablet responsive optimizations"

Write-Output "Pushing to GitHub..."
& $git branch -M main
& $git push -u origin main
