#!/bin/bash

# BITCODE CODE REVIEW FRAMEWORK
# Interactive full-screen code review system for optimal feedback collection

set -euo pipefail

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# TTY control
CLEAR='\033[2J'
HOME='\033[H'
SAVE_CURSOR='\033[s'
RESTORE_CURSOR='\033[u'

# Review state
REVIEW_RESPONSES=()
CURRENT_SUB_REVIEW=0
TOTAL_SUB_REVIEWS=0

# Function to clear screen and reset cursor
clear_screen() {
    printf "${CLEAR}${HOME}"
}

# Function to print centered header
print_header() {
    local text="$1"
    local width=$(tput cols)
    local padding=$(( (width - ${#text}) / 2 ))
    printf "${WHITE}%*s%s%*s${NC}\n" $padding "" "$text" $padding ""
}

# Function to print section separator
print_separator() {
    local width=$(tput cols)
    printf "${GRAY}%*s${NC}\n" $width "" | tr ' ' '─'
}

# Function to display code snippet with syntax highlighting
show_code() {
    local file_path="$1"
    local start_line="${2:-1}"
    local end_line="${3:-999999}"
    
    printf "${CYAN}📁 File: ${WHITE}%s${NC}\n" "$file_path"
    printf "${CYAN}📍 Lines: ${WHITE}%s-%s${NC}\n\n" "$start_line" "$end_line"
    
    # Convert relative paths to absolute for better compatibility
    local abs_path="$file_path"
    if [[ ! "$file_path" =~ ^/ ]]; then
        abs_path="$(pwd)/$file_path"
    fi
    
    if [[ -f "$abs_path" ]]; then
        # Use sed to extract lines and add line numbers with better formatting
        sed -n "${start_line},${end_line}p" "$abs_path" | \
        awk -v start=$start_line 'BEGIN{OFS=""} {printf "'"${GRAY}"'%4d→'"${NC}"' %s\n", NR+start-1, $0}' | \
        head -50  # Limit to 50 lines max for readability
    else
        printf "${RED}❌ File not found: %s${NC}\n" "$abs_path"
        printf "${GRAY}   Tried: %s${NC}\n" "$file_path"
    fi
}

# Function to display multiple code snippets
show_multiple_code() {
    local code_refs_var="$1[@]"
    local code_refs=("${!code_refs_var}")
    
    for code_ref in "${code_refs[@]}"; do
        IFS='|' read -r file_path start_line end_line label <<< "$code_ref"
        
        printf "\n${PURPLE}▶ %s${NC}\n" "$label"
        printf "${GRAY}📁 %s (lines %s-%s)${NC}\n" "$file_path" "$start_line" "$end_line"
        
        # Add reasoning/context for this code section
        case "$label" in
            *"Multimodal Processing"*)
                printf "${CYAN}💡 WHY: Shows complete tool evolution with prompt integration, metadata structure${NC}\n"
                ;;
            *"Code Refactor"*)
                printf "${CYAN}💡 WHY: Demonstrates tool chaining relationships and production-grade descriptions${NC}\n"
                ;;
            *"File Management"*)
                printf "${CYAN}💡 WHY: Example of atomic operations integration with prompt primitives${NC}\n"
                ;;
            *"Foundation"*)
                printf "${CYAN}💡 WHY: Core system prompt that's embedded in every tool for consistency${NC}\n"
                ;;
            *"Metadata"*)
                printf "${CYAN}💡 WHY: Shows the intelligence layer for agent tool selection and workflow${NC}\n"
                ;;
        esac
        
        printf "${GRAY}%*s${NC}\n" 80 "" | tr ' ' '─'
        show_code "$file_path" "$start_line" "$end_line"
        printf "${GRAY}%*s${NC}\n" 80 "" | tr ' ' '─'
    done
}

# Function to collect user input
collect_response() {
    local prompt="$1"
    local response=""
    
    # Display question at top for calibration
    printf "\n${YELLOW}💭 QUESTION: %s${NC}\n" "$prompt"
    printf "${GRAY}(Review the code above, then scroll down to answer)${NC}\n"
    
    # Add scrolling separator
    printf "\n${CYAN}"
    printf "═%.0s" {1..80}
    printf "${NC}\n"
    printf "${WHITE}📝 REVIEW RESPONSE AREA - UNLIMITED LENGTH SUPPORTED${NC}\n"
    printf "${CYAN}"
    printf "═%.0s" {1..80}
    printf "${NC}\n\n"
    
    # Re-display question above input box
    printf "${YELLOW}💭 %s${NC}\n\n" "$prompt"
    
    # Multi-line input support
    printf "${GREEN}👉 Your response (minimum 'y' for approval, or detailed feedback):${NC}\n"
    printf "${GRAY}   💡 Tip: Type your response, press Enter for new lines, type 'END' on empty line to finish${NC}\n"
    printf "${GREEN}📝 ${NC}"
    
    # Collect multi-line input
    local line=""
    local full_response=""
    while true; do
        read -r line </dev/tty
        if [[ "$line" == "END" ]]; then
            break
        fi
        if [[ -n "$full_response" ]]; then
            full_response="$full_response\n$line"
        else
            full_response="$line"
        fi
    done
    
    # Validate non-empty
    if [[ -z "$full_response" ]]; then
        printf "${RED}❌ Response cannot be empty. Use 'y' for approval or provide feedback.${NC}\n"
        collect_response "$prompt"  # Recursive retry
    else
        response="$full_response"
    fi
    
    echo "$response"
}

# Function to run a sub-review
run_sub_review() {
    local sub_review_id="$1"
    local title="$2"
    local description="$3"
    shift 3
    
    clear_screen
    
    # Header
    print_header "🔍 BITCODE CODE REVIEW - SUB-REVIEW ${sub_review_id}/${TOTAL_SUB_REVIEWS}"
    print_separator
    
    printf "\n${WHITE}📋 %s${NC}\n" "$title"
    printf "${GRAY}%s${NC}\n\n" "$description"
    
    # Process remaining arguments (code snippets and questions)
    local code_snippets=()
    local questions=()
    local mode="code"
    
    for arg in "$@"; do
        if [[ "$arg" == "--questions" ]]; then
            mode="questions"
            continue
        fi
        
        if [[ "$mode" == "code" ]]; then
            code_snippets+=("$arg")
        else
            questions+=("$arg")
        fi
    done
    
    # Show all questions first for calibration
    local questions_overview=""
    if [[ ${#questions[@]} -gt 0 ]]; then
        questions_overview="${BLUE}📋 QUESTIONS FOR THIS SUB-REVIEW:${NC}\n"
        questions_overview+="$(printf "${GRAY}%*s${NC}\n" 100 "" | tr ' ' '─')\n"
        for i in "${!questions[@]}"; do
            questions_overview+="${YELLOW}Q$((i+1)): ${questions[$i]}${NC}\n\n"
        done
        questions_overview+="$(printf "${GRAY}%*s${NC}\n" 100 "" | tr ' ' '─')\n\n"
        
        printf "%b" "$questions_overview"
    fi
    
    # Show code if provided
    if [[ ${#code_snippets[@]} -gt 0 ]]; then
        printf "${BLUE}📖 CODE TO REVIEW:${NC}\n"
        print_separator
        show_multiple_code code_snippets
    fi
    
    # Collect responses to questions one by one
    local sub_responses=()
    for i in "${!questions[@]}"; do
        printf "\n${WHITE}╔════════════════════════════════════════════════════════════════════════════════╗${NC}\n"
        printf "${WHITE}║                    📝 QUESTION $((i+1)) OF ${#questions[@]} - SUB-REVIEW ${sub_review_id} OF ${TOTAL_SUB_REVIEWS}                     ║${NC}\n"
        printf "${WHITE}╠════════════════════════════════════════════════════════════════════════════════╣${NC}\n"
        printf "${WHITE}║ ${YELLOW}${questions[$i]}${NC}${WHITE} ║${NC}\n"
        printf "${WHITE}╚════════════════════════════════════════════════════════════════════════════════╝${NC}\n"
        
        # Re-show questions for context
        printf "\n${GRAY}📋 CONTEXT - ALL QUESTIONS FOR THIS SUB-REVIEW:${NC}\n"
        for j in "${!questions[@]}"; do
            if [[ $j -eq $i ]]; then
                printf "${WHITE}➤ Q$((j+1)): ${questions[$j]}${NC} ${GREEN}← CURRENT${NC}\n"
            else
                printf "${GRAY}  Q$((j+1)): ${questions[$j]}${NC}\n"
            fi
        done
        printf "\n"
        
        response=$(collect_response "${questions[$i]}")
        sub_responses+=("$response")
        
        printf "\n${GREEN}✅ Question $((i+1)) completed!${NC}\n"
        
        # Don't pause after last question
        if [[ $((i+1)) -lt ${#questions[@]} ]]; then
            printf "${GRAY}Press Enter for next question...${NC}"
            read -r </dev/tty
        fi
    done
    
    # Store responses for this sub-review
    local combined_response=""
    for i in "${!questions[@]}"; do
        combined_response+="Q${i}: ${questions[$i]}\nA${i}: ${sub_responses[$i]}\n\n"
    done
    
    REVIEW_RESPONSES+=("SUB-REVIEW ${sub_review_id}: $title\n$combined_response")
    
    printf "\n${GREEN}✅ Sub-review ${sub_review_id} completed!${NC}\n"
    printf "${GRAY}Press Enter to continue...${NC}"
    read -r </dev/tty
}

# Function to finalize and output results
finalize_review() {
    clear_screen
    print_header "🎉 REVIEW COMPLETED"
    print_separator
    
    printf "\n${GREEN}📊 Review Summary:${NC}\n"
    printf "${GRAY}Total sub-reviews completed: %s${NC}\n" "$TOTAL_SUB_REVIEWS"
    
    # Create output content
    local output_content=""
    output_content+="BITCODE PROMPT PRIMITIVES EVOLUTION REVIEW RESULTS\n"
    output_content+="===============================================\n\n"
    
    for response in "${REVIEW_RESPONSES[@]}"; do
        output_content+="$response"
        output_content+="---\n"
    done
    
    output_content+="\nREVIEW COMPLETED: $TOTAL_SUB_REVIEWS sub-sections analyzed\n"
    
    # Save to temp file for easy copying
    local temp_file="/tmp/bitcode_review_$(date +%s).txt"
    printf "%b" "$output_content" > "$temp_file"
    
    printf "\n${GREEN}✅ Review saved to: ${WHITE}%s${NC}\n" "$temp_file"
    printf "${CYAN}📋 To copy to clipboard: ${WHITE}cat %s | pbcopy${NC}\n" "$temp_file"
    
    printf "\n${GRAY}Press Enter to view results...${NC}"
    read -r </dev/tty
    
    # Display the results
    clear_screen
    printf "%b" "$output_content"
    
    printf "\n${CYAN}📋 To copy to clipboard: ${WHITE}cat %s | pbcopy${NC}\n" "$temp_file"
}

# Main review function to be called by specific review scripts
run_review() {
    local review_title="$1"
    local review_description="$2"
    shift 2
    
    # Count total sub-reviews
    TOTAL_SUB_REVIEWS=$(( $# / 2 ))
    
    clear_screen
    print_header "🚀 BITCODE CODE REVIEW SYSTEM"
    print_separator
    
    printf "\n${WHITE}📋 Review: %s${NC}\n" "$review_title"
    printf "${GRAY}%s${NC}\n\n" "$review_description"
    
    printf "${YELLOW}📝 This review has %s sub-sections${NC}\n" "$TOTAL_SUB_REVIEWS"
    printf "${GRAY}Press Enter to begin...${NC}"
    read -r </dev/tty
    
    # Process sub-reviews
    local sub_review_count=1
    while [[ $# -gt 0 ]]; do
        local sub_title="$1"
        local sub_function="$2"
        shift 2
        
        CURRENT_SUB_REVIEW=$sub_review_count
        "$sub_function" "$sub_review_count" "$sub_title"
        ((sub_review_count++))
    done
    
    finalize_review
}

# Export functions for use in review scripts
export -f clear_screen print_header print_separator show_code show_multiple_code collect_response run_sub_review finalize_review run_review
