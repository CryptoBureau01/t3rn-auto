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


setup_t3rn_swap() {
    local FOLDER_PATH="/root/t3rn-swap"
    local REPO_URL="https://github.com/CryptoBureau01/t3rn-auto.git"

    print_info "<=========== Setting Up t3rn-swap Folder ==============>"

    # Check if the folder exists
    if [ -d "$FOLDER_PATH" ]; then
        print_info "Folder $FOLDER_PATH already exists. Checking its contents..."
    else
        print_info "Folder $FOLDER_PATH does not exist. Creating it..."
        mkdir -p "$FOLDER_PATH"
    fi

    # Navigate to the folder
    cd "$FOLDER_PATH" || {
        print_error "Failed to navigate to $FOLDER_PATH. Exiting..."
        exit 1
    }

    # Check if the repository is already cloned
    if [ -d "$FOLDER_PATH/.git" ]; then
        print_info "Repository already cloned in $FOLDER_PATH. Pulling latest changes..."
        git pull origin main
    else
        print_info "Cloning repository $REPO_URL into $FOLDER_PATH..."
        git clone "$REPO_URL" .
        
        if [ $? -ne 0 ]; then
            print_error "Failed to clone repository. Please check the URL or your network connection."
            exit 1
        fi
    fi

    print_info "t3rn-swap setup is complete."
    master
}


handle_private_key() {
    ENV_FILE="/root/t3rn-swap/.env"

    # Check if the .env file exists
    if [ -f "$ENV_FILE" ]; then
        # Search for an existing PRIVATE_KEY in the .env file
        EXISTING_KEY=$(grep -E "^PRIVATE_KEY=" "$ENV_FILE" | cut -d '=' -f2)

        if [ -n "$EXISTING_KEY" ]; then
            echo "PRIVATE_KEY already exists: $EXISTING_KEY"
            echo "No need to provide a new private key."
            return
        else
            echo "PRIVATE_KEY is not present. Please provide a new private key."
        fi
    else
        echo ".env file does not exist. Creating a new one with default values."
        # Create a new .env file with default values
        cat <<EOF > "$ENV_FILE"
PRIVATE_KEY=
BASE_RPC=https://base-sepolia-rpc.publicnode.com
BLAST_RPC=https://sepolia.blast.io
ARB_RPC=https://sepolia-rollup.arbitrum.io/rpc
OP_RPC=https://sepolia.optimism.io
EOF
    fi

    # Loop until the user enters a valid private key
    while true; do
        echo "Enter your new private key (must start with '0x'):"
        read -r PRIVATE_KEY

        # Check if the private key starts with "0x"
        if [[ $PRIVATE_KEY == 0x* ]]; then
            break
        else
            echo "Invalid private key! Ensure it starts with '0x'. Please try again."
        fi
    done

    # Update or append the PRIVATE_KEY in the .env file
    if grep -q "^PRIVATE_KEY=" "$ENV_FILE"; then
        sed -i.bak "s/^PRIVATE_KEY=.*/PRIVATE_KEY=$PRIVATE_KEY/" "$ENV_FILE"
    else
        echo "PRIVATE_KEY=$PRIVATE_KEY" >> "$ENV_FILE"
    fi

    echo "The private key has been successfully saved to $ENV_FILE."

    # Call the master function
    master
}


run_auto_Swap() {
    # Define the directory where the script is located
    FOLDER="/root/t3rn-swap"
    SCREEN_NAME="t3rn-swap"
    
    # Change to the specified directory
    if [ -d "$FOLDER" ]; then
        cd "$FOLDER" || exit
    else
        echo "Directory $FOLDER does not exist!"
        exit 1
    fi

    # Check if the screen session with the name already exists
    if screen -list | grep -q "$SCREEN_NAME"; then
        echo "Screen session named '$SCREEN_NAME' is already running."
        echo "To access the screen session, use: screen -r $SCREEN_NAME"
        return
    else
        # Create and start a new screen session if not already running
        echo "Starting a new screen session named '$SCREEN_NAME'..."
        screen -dmS "$SCREEN_NAME" bash -c "python3 main.py; exec bash"
        echo "The Python script 'main.py' is now running inside the screen session named '$SCREEN_NAME'."
        echo "To open the screen session, use: screen -r $SCREEN_NAME"
    fi

    # Call the master function
    master
}



# Function to display menu and prompt user for input
master() {
    print_info "=================================="
    print_info "    T3rn Auto Swap Tool Menu      "
    print_info "=================================="
    print_info ""
    print_info "1. Install-Dependency"
    print_info "2. Setup-T3rn-Swap"
    print_info "3. Set-Private-Key"
    print_info "4. Run-Auto-Swap"
    print_info "5. Exit"
    print_info ""
    print_info "==============================="
    print_info " Created By : CB-Master "
    print_info "==============================="
    print_info ""
    
    read -p "Enter your choice (1 or 5): " user_choice

    case $user_choice in
        1)
            install_dependency
            ;;
        2)
            setup_t3rn_swap
            ;;
        3) 
            handle_private_key
            ;;
        4)
            run_auto_Swap
            ;;
        5)
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
