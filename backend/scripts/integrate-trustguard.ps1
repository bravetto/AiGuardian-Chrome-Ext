# TokenGuard Integration Script
# This script helps integrate TokenGuard as a submodule or subtree

param(
    [Parameter(Mandatory=$true)]
    [string]$RepositoryUrl,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("submodule", "subtree", "pointer")]
    [string]$Method = "submodule",
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main",
    
    [switch]$Force,
    [switch]$Help
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Show-Usage {
    Write-Host @"
TrustGuard Integration Script

Usage: .\integrate-trustguard.ps1 -RepositoryUrl <URL> [-Method <method>] [-Branch <branch>] [-Force] [-Help]

PARAMETERS:
    -RepositoryUrl    TrustGuard repository URL (required)
    -Method          Integration method: submodule, subtree, or pointer (default: submodule)
    -Branch          Branch to integrate (default: main)
    -Force           Force overwrite existing integration
    -Help            Show this help message

EXAMPLES:
    .\integrate-trustguard.ps1 -RepositoryUrl https://github.com/org/trustguard.git
    .\integrate-trustguard.ps1 -RepositoryUrl https://github.com/org/trustguard.git -Method subtree
    .\integrate-trustguard.ps1 -RepositoryUrl https://github.com/org/trustguard.git -Method pointer

"@
}

function Test-RepositoryUrl {
    param([string]$Url)
    
    if ($Url -notmatch '^https?://') {
        Write-Error "Invalid repository URL: '$Url'. Must be a valid HTTP/HTTPS URL."
        exit 1
    }
    
    if ($Url -notmatch '(github\.com|gitlab\.com|bitbucket\.org)') {
        Write-Warning "URL doesn't appear to be from GitHub, GitLab, or Bitbucket: '$Url'"
    }
}

function Add-TrustGuardSubmodule {
    param(
        [string]$Url,
        [string]$Branch
    )
    
    Write-Info "Adding TrustGuard as Git submodule..."
    
    # Remove existing trustguard directory if it exists
    if (Test-Path "trustguard" -PathType Container) {
        if ($Force) {
            Write-Warning "Removing existing trustguard directory..."
            Remove-Item -Path "trustguard" -Recurse -Force
        } else {
            Write-Error "TrustGuard directory already exists. Use -Force to overwrite."
            exit 1
        }
    }
    
    # Add submodule
    Write-Info "Adding submodule from: $Url"
    git submodule add -b $Branch $Url trustguard
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to add TrustGuard submodule"
        exit 1
    }
    
    # Initialize and update
    Write-Info "Initializing and updating submodule..."
    git submodule update --init --recursive trustguard
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to initialize TrustGuard submodule"
        exit 1
    }
    
    Write-Success "TrustGuard submodule added successfully"
}

function Add-TrustGuardSubtree {
    param(
        [string]$Url,
        [string]$Branch
    )
    
    Write-Info "Adding TrustGuard as Git subtree..."
    
    # Remove existing trustguard directory if it exists
    if (Test-Path "trustguard" -PathType Container) {
        if ($Force) {
            Write-Warning "Removing existing trustguard directory..."
            Remove-Item -Path "trustguard" -Recurse -Force
        } else {
            Write-Error "TrustGuard directory already exists. Use -Force to overwrite."
            exit 1
        }
    }
    
    # Add remote
    Write-Info "Adding TrustGuard remote..."
    git remote add -f trustguard $Url
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to add TrustGuard remote"
        exit 1
    }
    
    # Add subtree
    Write-Info "Adding subtree from branch: $Branch"
    git subtree add --prefix=trustguard trustguard $Branch --squash
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to add TrustGuard subtree"
        exit 1
    }
    
    Write-Success "TrustGuard subtree added successfully"
}

function Add-TrustGuardPointer {
    param([string]$Url)
    
    Write-Info "Adding TrustGuard as reference pointer..."
    
    # Create pointer file
    $pointerContent = @"
# TrustGuard Reference
Repository URL: $Url
Integration Method: Reference Pointer
Added: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Status: Active

## Usage
This is a reference pointer to the TrustGuard repository.
To use TrustGuard, clone the repository separately or integrate as submodule/subtree.

## Clone Command
git clone $Url trustguard

## Integration Commands
# As submodule:
git submodule add $Url trustguard

# As subtree:
git remote add -f trustguard $Url
git subtree add --prefix=trustguard trustguard main --squash
"@
    
    Set-Content -Path "trustguard/TRUSTGUARD_POINTER.md" -Value $pointerContent
    
    Write-Success "TrustGuard reference pointer created"
}

# Main execution
if ($Help) {
    Show-Usage
    exit 0
}

# Validate inputs
if (-not $RepositoryUrl) {
    Write-Error "Repository URL is required"
    Show-Usage
    exit 1
}

Test-RepositoryUrl $RepositoryUrl

Write-Info "Integrating TrustGuard using method: $Method"
Write-Info "Repository URL: $RepositoryUrl"
Write-Info "Branch: $Branch"

# Execute integration based on method
switch ($Method) {
    "submodule" {
        Add-TrustGuardSubmodule $RepositoryUrl $Branch
    }
    "subtree" {
        Add-TrustGuardSubtree $RepositoryUrl $Branch
    }
    "pointer" {
        Add-TrustGuardPointer $RepositoryUrl
    }
    default {
        Write-Error "Invalid integration method: $Method"
        Show-Usage
        exit 1
    }
}

Write-Info "Next steps:"
Write-Info "  1. Review the integrated TrustGuard components"
Write-Info "  2. Update documentation and build scripts"
Write-Info "  3. Test the integration"
Write-Info "  4. Commit the changes to version control"

Write-Success "TrustGuard integration completed successfully!"
