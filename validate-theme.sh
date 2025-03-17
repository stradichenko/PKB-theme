#!/bin/bash

# Validate Hugo Theme Repository Configuration
# Run from the theme's root directory

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed_checks=0
total_checks=0

function check_required_file() {
    ((total_checks++))
    if [[ -f "$1" ]]; then
        echo -e "${GREEN}✓ Found: $1${NC}"
        ((passed_checks++))
        return 0
    else
        echo -e "${RED}✗ Missing: $1${NC}"
        return 1
    fi
}

function validate_theme_toml() {
    ((total_checks++))
    local required_fields=("name" "license")
    local missing_fields=()
    
    if [[ ! -f "theme.toml" ]]; then
        echo -e "${RED}✗ Missing theme.toml${NC}"
        return 1
    fi

    # Check required top-level fields
    for field in "${required_fields[@]}"; do
        if ! grep -q "^$field =" theme.toml; then
            missing_fields+=("$field")
        fi
    done

    # Check author information
    if ! grep -q "^\[author\]" theme.toml && ! grep -q "^authors = \[" theme.toml; then
        missing_fields+=("author(s)")
    fi

    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        echo -e "${RED}✗ theme.toml missing: ${missing_fields[*]}${NC}"
        return 1
    else
        echo -e "${GREEN}✓ theme.toml valid${NC}"
        ((passed_checks++))
        return 0
    fi
}
function validate_go_mod() {
    ((total_checks++))
    if [[ ! -f "go.mod" ]]; then
        echo -e "${RED}✗ Missing go.mod${NC}"
        return 1
    fi

    if grep -q "^module github.com/stradichenko/PKB-theme" go.mod; then
        echo -e "${GREEN}✓ go.mod has correct module path${NC}"
        ((passed_checks++))
        return 0
    else
        echo -e "${RED}✗ Invalid module path in go.mod${NC}"
        return 1
    fi
}

function validate_directory_structure() {
    local required_dirs=("archetypes" "layouts" "static" "assets")
    local missing_dirs=()
    ((total_checks++))
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done

    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        echo -e "${YELLOW}⚠ Missing directories: ${missing_dirs[*]}${NC}"
        return 1
    else
        echo -e "${GREEN}✓ All required directories present${NC}"
        ((passed_checks++))
        return 0
    fi
}

function validate_version_tags() {
    ((total_checks++))
    local tags=$(git tag -l)
    local semver_tags=()
    
    while IFS= read -r tag; do
        if [[ $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            semver_tags+=("$tag")
        fi
    done <<< "$tags"

    if [[ ${#semver_tags[@]} -eq 0 ]]; then
        echo -e "${YELLOW}⚠ No semantic version tags found (e.g., v1.0.0)${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Found semantic version tags: ${semver_tags[*]}${NC}"
        ((passed_checks++))
        return 0
    fi
}

function validate_example_site() {
    ((total_checks++))
    if [[ ! -d "exampleSite" ]]; then
        echo -e "${YELLOW}⚠ Missing exampleSite directory${NC}"
        return 1
    fi

    local example_checks=0
    check_required_file "exampleSite/config.toml" && ((example_checks++))
    [[ -d "exampleSite/content" ]] && ((example_checks++))
    
    if [[ $example_checks -eq 2 ]]; then
        echo -e "${GREEN}✓ exampleSite configuration valid${NC}"
        ((passed_checks++))
        return 0
    else
        echo -e "${YELLOW}⚠ Incomplete exampleSite configuration${NC}"
        return 1
    fi
}

function validate_readme() {
    ((total_checks++))
    local check_passed=1
    
    if [[ ! -f "README.md" ]]; then
        echo -e "${RED}✗ Missing README.md${NC}"
        return 1
    fi

    grep -q "hugo mod init" README.md && \
    grep -q "module.imports" README.md && \
    grep -q "hugo mod get" README.md
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✓ README contains module installation instructions${NC}"
        ((passed_checks++))
        return 0
    else
        echo -e "${YELLOW}⚠ README missing module installation instructions${NC}"
        return 1
    fi
}

function validate_environment() {
    echo -e "\n${YELLOW}=== Environment Validation ===${NC}"
    
    # Check for required commands
    local required_commands=("git" "hugo" "grep")
    for cmd in "${required_commands[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            echo -e "${RED}✗ Missing required command: $cmd${NC}"
            exit 1
        fi
    done

    # Verify we're in a git repository
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        echo -e "${RED}✗ Not in a git repository${NC}"
        exit 1
    fi
}

function main() {
    validate_environment
    
    echo -e "\n${YELLOW}=== Theme Configuration Validation ===${NC}"
    validate_theme_toml
    validate_go_mod
    validate_directory_structure
    validate_version_tags
    validate_example_site
    validate_readme

    echo -e "\n${YELLOW}=== Validation Summary ===${NC}"
    echo -e "Passed checks: ${GREEN}$passed_checks${NC} / $total_checks"
    
    if [[ $passed_checks -eq $total_checks ]]; then
        echo -e "${GREEN}✓ All critical checks passed!${NC}"
    else
        echo -e "${RED}✗ Some checks failed. Review the output above.${NC}"
        exit 1
    fi
}

main
