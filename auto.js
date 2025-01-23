# !/bin/bash

curl -s https://raw.githubusercontent.com/CryptoBureau01/logo/main/logo.sh | bash
sleep 5

# Function to print info messages
print_info() {
    echo -e "\e[32m[INFO] $1\e[0m"
}

# Function to print error messages
print_error() {
    echo -e "\e[31m[ERROR] $1\e[0m"
}



#Function to check system type and root privileges
master_fun() {
    echo "Checking system requirements..."

    # Check if the system is Ubuntu
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [ "$ID" != "ubuntu" ]; then
            echo "This script is designed for Ubuntu. Exiting."
            exit 1
        fi
    else
        echo "Cannot detect operating system. Exiting."
        exit 1
    fi

    # Check if the user is root
    if [ "$EUID" -ne 0 ]; then
        echo "You are not running as root. Please enter root password to proceed."
        sudo -k  # Force the user to enter password
        if sudo true; then
            echo "Switched to root user."
        else
            echo "Failed to gain root privileges. Exiting."
            exit 1
        fi
    else
        echo "You are running as root."
    fi

    echo "System check passed. Proceeding to package installation..."
}


install_dependency() {
    print_info "<=========== Install Dependency ==============>"
    
    # Update and upgrade system packages
    print_info "Updating and upgrading system packages, and installing required tools..."
    sudo apt update && sudo apt upgrade -y && sudo apt install -y screen git wget curl 
    
    # Install Python3 using a custom script
    print_info "Installing Python3..."
    wget https://raw.githubusercontent.com/CryptoBureau01/packages/main/python3.10.sh -O python3.10.sh && chmod +x python3.10.sh && ./python3.10.sh
    
    # Check if the Python installation script executed successfully
    if [ $? -ne 0 ]; then
        print_error "Failed to install Python3. Please check your system for issues."
        exit 1
    fi
    
    # Remove the Python installation script after execution
    rm -f python3.10.sh

    # Install pip for Python3
    print_info "Installing pip for Python3..."
    sudo apt install -y python3-pip

    # Create and activate a Python virtual environment
    if [ ! -d "venv" ]; then
        print_info "Creating a Python virtual environment..."
        python3 -m venv venv
    else
        print_info "Virtual environment already exists. Skipping creation."
    fi
    source venv/bin/activate

    # Install dependencies from linux.txt if available
    if [ -f "linux.txt" ]; then
        print_info "linux.txt found. Installing dependencies..."
        pip install --upgrade pip
        pip install -r linux.txt
    else
        print_error "linux.txt not found! Exiting installation process."
        exit 1
    fi

    # Call the master function
    print_info "Dependency installation completed. Returning to the main menu..."
    master
}












# Function to display menu and prompt user for input
master() {
    print_info "=================================="
    print_info "    T3rn Auto Swap Tool Menu      "
    print_info "=================================="
    print_info ""
    print_info "1. Install-Dependency"
    print_info "2. Setup-Citrea"
    print_info "3. "
    print_info "4. "
    print_info "5. "
    print_info "6. "
    print_info "7. "
    print_info "8. "
    print_info "9. "
    
    print_info ""
    print_info "==============================="
    print_info " Created By : CB-Master "
    print_info "==============================="
    print_info ""
    
    read -p "Enter your choice (1 or 3): " user_choice

    case $user_choice in
        1)
            install_dependency
            ;;
        2)
            setup_node
            ;;
        3) 

            ;;
        4)

            ;;
        5)

            ;;
        6)

            ;;
        7)

            ;;
        8)
            exit 0  # Exit the script after breaking the loop
            ;;
        *)
            print_error "Invalid choice. Please enter 1 or 3 : "
            ;;
    esac
}

# Call the uni_menu function to display the menu
master_fun
master
