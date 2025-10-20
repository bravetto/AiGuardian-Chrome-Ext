#!/bin/bash

# TrustGuard Integration Script
# This script helps integrate TrustGuard as a submodule or subtree

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
METHOD="submodule"
BRANCH="main"
FORCE=false

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
TrustGuard Integration Script

Usage: $0 [OPTIONS] <REPOSITORY_URL>

ARGUMENTS:
    REPOSITORY_URL    TrustGuard repository URL (required)

OPTIONS:
    -m, --method METHOD    Integration method: submodule, subtree, or pointer (default: submodule)
    -b, --branch BRANCH   Branch to integrate (default: main)
    -f, --force           Force overwrite existing integration
    -h, --help            Show this help message

EXAMPLES:
    $0 https://github.com/org/trustguard.git
    $0 -m subtree https://github.com/org/trustguard.git
    $0 -m pointer https://github.com/org/trustguard.git

EOF
}

# Function to validate repository URL
validate_repository_url() {
    local url="$1"
    
    if [[ ! "$url" =~ ^https?:// ]]; then
        print_error "Invalid repository URL: '$url'. Must be a valid HTTP/HTTPS URL."
        exit 1
    fi
    
    if [[ ! "$url" =~ (github\.com|gitlab\.com|bitbucket\.org) ]]; then
        print_warning "URL doesn't appear to be from GitHub, GitLab, or Bitbucket: '$url'"
    fi
}

# Function to add TrustGuard as submodule
add_trustguard_submodule() {
    local url="$1"
    local branch="$2"
    
    print_info "Adding TrustGuard as Git submodule..."
    
    # Remove existing trustguard directory if it exists
    if [[ -d "trustguard" ]]; then
        if [[ "$FORCE" == "true" ]]; then
            print_warning "Removing existing trustguard directory..."
            rm -rf trustguard
        else
            print_error "TrustGuard directory already exists. Use --force to overwrite."
            exit 1
        fi
    fi
    
    # Add submodule
    print_info "Adding submodule from: $url"
    git submodule add -b "$branch" "$url" trustguard
    
    # Initialize and update
    print_info "Initializing and updating submodule..."
    git submodule update --init --recursive trustguard
    
    print_success "TrustGuard submodule added successfully"
}

# Function to add TrustGuard as subtree
add_trustguard_subtree() {
    local url="$1"
    local branch="$2"
    
    print_info "Adding TrustGuard as Git subtree..."
    
    # Remove existing trustguard directory if it exists
    if [[ -d "trustguard" ]]; then
        if [[ "$FORCE" == "true" ]]; then
            print_warning "Removing existing trustguard directory..."
            rm -rf trustguard
        else
            print_error "TrustGuard directory already exists. Use --force to overwrite."
            exit 1
        fi
    fi
    
    # Add remote
    print_info "Adding TrustGuard remote..."
    git remote add -f trustguard "$url"
    
    # Add subtree
    print_info "Adding subtree from branch: $branch"
    git subtree add --prefix=trustguard trustguard "$branch" --squash
    
    print_success "TrustGuard subtree added successfully"
}

# Function to add TrustGuard as pointer
add_trustguard_pointer() {
    local url="$1"
    
    print_info "Adding TrustGuard as reference pointer..."
    
    # Create pointer file
    cat > trustguard/TRUSTGUARD_POINTER.md << EOF
# TrustGuard Reference
Repository URL: $url
Integration Method: Reference Pointer
Added: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Status: Active

## Usage
This is a reference pointer to the TrustGuard repository.
To use TrustGuard, clone the repository separately or integrate as submodule/subtree.

## Clone Command
git clone $url trustguard

## Integration Commands
# As submodule:
git submodule add $url trustguard

# As subtree:
git remote add -f trustguard $url
git subtree add --prefix=trustguard trustguard main --squash
EOF
    
    print_success "TrustGuard reference pointer created"
}

# Parse command line arguments
REPOSITORY_URL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--method)
            METHOD="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [[ -z "$REPOSITORY_URL" ]]; then
                REPOSITORY_URL="$1"
            else
                print_error "Too many arguments"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate required arguments
if [[ -z "$REPOSITORY_URL" ]]; then
    print_error "Repository URL is required"
    show_usage
    exit 1
fi

# Validate inputs
validate_repository_url "$REPOSITORY_URL"

print_info "Integrating TrustGuard using method: $METHOD"
print_info "Repository URL: $REPOSITORY_URL"
print_info "Branch: $BRANCH"

# Execute integration based on method
case "$METHOD" in
    "submodule")
        add_trustguard_submodule "$REPOSITORY_URL" "$BRANCH"
        ;;
    "subtree")
        add_trustguard_subtree "$REPOSITORY_URL" "$BRANCH"
        ;;
    "pointer")
        add_trustguard_pointer "$REPOSITORY_URL"
        ;;
    *)
        print_error "Invalid integration method: $METHOD"
        show_usage
        exit 1
        ;;
esac

print_info "Next steps:"
print_info "  1. Review the integrated TrustGuard components"
print_info "  2. Update documentation and build scripts"
print_info "  3. Test the integration"
print_info "  4. Commit the changes to version control"

print_success "TrustGuard integration completed successfully!"
