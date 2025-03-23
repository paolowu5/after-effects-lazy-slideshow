#!/usr/bin/env python3
import os
import time
import sys
import shutil
import subprocess
import colorama
from colorama import Fore, Back, Style

colorama.init(autoreset=True)

class RetroColors:
    TITLE = Fore.YELLOW + Style.BRIGHT
    HEADER = Fore.CYAN + Style.BRIGHT
    SUCCESS = Fore.GREEN + Style.BRIGHT
    WARNING = Fore.RED + Style.BRIGHT
    INFO = Fore.BLUE + Style.BRIGHT
    PROMPT = Fore.YELLOW
    SECTION = Fore.CYAN + Style.BRIGHT
    MENU_ITEM = Fore.GREEN
    BORDER = Fore.YELLOW + Style.BRIGHT

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def show_banner():
    print(RetroColors.TITLE + """
╔════════════════════════════════════════╗
║             GITHELPER                  ║
║                                        ║
╚════════════════════════════════════════╝
    """)

def print_border():
    return RetroColors.BORDER + "═" * 40

def run_git_command(command, silent=False):
    """Execute a Git command and return the result."""
    result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if not silent and result.returncode != 0:
        print(RetroColors.WARNING + f"\n[!] Error: {result.stderr.strip()}")
    return result

def git_status():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Repository Status")
    os.system("git status")
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_log():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Commit History")
    num = input(RetroColors.PROMPT + "Number of commits to display (default: 30): ")
    cmd = f"git log --oneline -n {num}" if num else "git log --oneline -n 30"
    print("\n" + os.popen(cmd).read())
    if not num:
        print(RetroColors.INFO + "\n[i] Displaying last 30 commits.")
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_init():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Initialize Repository")
    if input(RetroColors.PROMPT + "Proceed with initialization? (y/n): ").lower() == 'y':
        run_git_command("git init")
        run_git_command("git branch -M main")
        print(RetroColors.SUCCESS + "\n[✓] Repository initialized with 'main' branch.")
        if input(RetroColors.PROMPT + "\nStage files and commit? (y/n): ").lower() == 'y':
            run_git_command("git add .")
            msg = input(RetroColors.PROMPT + "Commit message (default: Initial commit): ") or "Initial commit"
            run_git_command(f'git commit -m "{msg}"')
            print(RetroColors.SUCCESS + f"\n[✓] Commit created: '{msg}'")
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_add_remote():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Manage Remote Origin")
    os.system("git remote -v")
    if input(RetroColors.PROMPT + "\nRemove existing origins? (y/n): ").lower() == 'y':
        run_git_command("git remote remove origin")
        print(RetroColors.SUCCESS + "\n[✓] Existing origins removed.")
    else:
        input(RetroColors.INFO + "\n[i] Press Enter to return...")
        return
    username = input(RetroColors.PROMPT + "\nGitHub username: ")
    repo = input(RetroColors.PROMPT + "Repository name: ")
    url = f"https://github.com/{username}/{repo}.git"
    run_git_command(f"git remote add origin {url}")
    print(RetroColors.SUCCESS + f"\n[✓] Origin added: {url}")
    os.system("git remote -v")
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_create_branch():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Branch Management")
    print(RetroColors.HEADER + "\nCurrent branches:")
    os.system("git branch")
    if run_git_command("git log -1", silent=True).returncode != 0:
        print(RetroColors.WARNING + "\n[!] Repository is empty. Create a commit first.")
        input(RetroColors.INFO + "\n[i] Press Enter to return...")
        return
    choice = input(RetroColors.PROMPT + "\nCreate new branch (c), switch branch (s), or Enter to cancel: ").lower()
    if choice == "c":
        branch = input(RetroColors.PROMPT + "Branch name: ").strip()
        if branch and run_git_command(f"git branch {branch}").returncode == 0:
            if run_git_command(f"git checkout {branch}").returncode == 0:
                print(RetroColors.SUCCESS + f"\n[✓] Branch '{branch}' created and checked out.")
    elif choice == "s":
        branch = input(RetroColors.PROMPT + "Branch name: ").strip()
        if branch and run_git_command(f"git checkout {branch}").returncode == 0:
            print(RetroColors.SUCCESS + f"\n[✓] Switched to branch '{branch}'.")
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_reset():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Reset Local Repository")
    if not os.path.exists(".git"):
        print(RetroColors.WARNING + "\n[!] No Git repository found.")
        input(RetroColors.INFO + "\n[i] Press Enter to return...")
        return
    print(RetroColors.WARNING + "\n[!] Warning: This will delete the local .git directory.")
    if input(RetroColors.PROMPT + "Confirm deletion? (y/n): ").lower() == 'y':
        try:
            shutil.rmtree(".git")
            print(RetroColors.SUCCESS + "\n[✓] Local repository deleted.")
        except PermissionError as e:
            print(RetroColors.WARNING + f"\n[!] Permission error: {e}")
            if os.name == 'nt':
                os.system("rmdir /s /q .git")
                if not os.path.exists(".git"):
                    print(RetroColors.SUCCESS + "\n[✓] Deleted using alternative command.")
                else:
                    print(RetroColors.WARNING + "\n[!] Deletion failed. Remove '.git' manually.")
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_add_all():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Stage All Files")
    run_git_command("git add .")
    print(RetroColors.SUCCESS + "\n[✓] All files staged.")
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_commit():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Create Commit")
    msg = input(RetroColors.PROMPT + "Commit message (default: Update): ") or "Update"
    run_git_command(f'git commit -m "{msg}"')
    print(RetroColors.SUCCESS + f"\n[✓] Commit created: '{msg}'")
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def git_push():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Push to Remote")
    print(RetroColors.HEADER + "\nCurrent branches:")
    os.system("git branch")
    branch = input(RetroColors.PROMPT + "\nBranch to push (default: main): ").strip() or "main"
    if input(RetroColors.PROMPT + f"Confirm push to '{branch}'? (y/n): ").lower() == 'y':
        # Check if remote branch exists
        check_remote = run_git_command(f"git ls-remote --heads origin {branch}", silent=True)
        if check_remote.returncode == 0 and check_remote.stdout.strip():
            # Remote branch exists, safe to pull
            print(RetroColors.HEADER + f"\n[+] Fetching changes from '{branch}'...")
            run_git_command(f"git fetch origin {branch}")
            print(RetroColors.HEADER + f"\n[+] Pulling changes from '{branch}'...")
            pull_result = run_git_command(f"git pull origin {branch}")
            if pull_result.returncode != 0:
                print(RetroColors.WARNING + "\n[!] Pull failed. Resolve conflicts manually and try again.")
                time.sleep(1)
                input(RetroColors.INFO + "\n[i] Press Enter to return...")
                return
        else:
            # No remote branch, inform user
            print(RetroColors.INFO + f"\n[i] Remote branch '{branch}' not found. Will create it on push.")
        
        # Push (with -u if it's a first push)
        print(RetroColors.HEADER + f"\n[+] Pushing to '{branch}'...")
        
        # Ask if force push is needed
        if check_remote.returncode == 0 and check_remote.stdout.strip():
            force_push = input(RetroColors.PROMPT + "Remote branch exists. Use force push? (y/n): ").lower() == 'y'
        else:
            force_push = False
            
        if check_remote.returncode != 0 or not check_remote.stdout.strip():
            # First push - use -u to set upstream
            push_cmd = f"git push -u origin {branch}"
            if force_push:
                push_cmd = f"git push -u -f origin {branch}"
            push_result = run_git_command(push_cmd)
        else:
            # Normal push
            push_cmd = f"git push origin {branch}"
            if force_push:
                push_cmd = f"git push -f origin {branch}"
            push_result = run_git_command(push_cmd)
            
        if push_result.returncode == 0:
            print(RetroColors.SUCCESS + "\n[✓] Push completed.")
        else:
            print(RetroColors.WARNING + "\n[!] Push failed. Check the error message above.")
    
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")
    
def quick_update():
    clear_screen()
    show_banner()
    print(RetroColors.HEADER + "\n[+] Quick Update")
    run_git_command("git add .")
    msg = input(RetroColors.PROMPT + "\nCommit message (default: Update): ") or "Update"
    run_git_command(f'git commit -m "{msg}"')
    branch = input(RetroColors.PROMPT + "\nBranch (default: main): ") or "main"
    if input(RetroColors.PROMPT + f"Push to '{branch}'? (y/n): ").lower() == 'y':
        # Check if remote branch exists
        check_remote = run_git_command(f"git ls-remote --heads origin {branch}", silent=True)
        
        # Ask if force push is needed
        if check_remote.returncode == 0 and check_remote.stdout.strip():
            force_push = input(RetroColors.PROMPT + "Remote branch exists. Use force push? (y/n): ").lower() == 'y'
        else:
            force_push = False
            
        if check_remote.returncode == 0 and check_remote.stdout.strip():
            # Normal push
            push_cmd = f"git push origin {branch}"
            if force_push:
                push_cmd = f"git push -f origin {branch}"
            push_result = run_git_command(push_cmd)
        else:
            # First push - use -u to set upstream
            print(RetroColors.INFO + f"\n[i] Remote branch '{branch}' not found. Creating it...")
            push_cmd = f"git push -u origin {branch}"
            if force_push:
                push_cmd = f"git push -u -f origin {branch}"
            push_result = run_git_command(push_cmd)
            
        if push_result.returncode == 0:
            print(RetroColors.SUCCESS + "\n[✓] Update completed.")
        else:
            print(RetroColors.WARNING + "\n[!] Push failed. Check the error message above.")
    
    time.sleep(1)
    input(RetroColors.INFO + "\n[i] Press Enter to return...")

def main_menu():
    while True:
        clear_screen()
        show_banner()
        border = print_border()
        print(border)
        print(RetroColors.SECTION + "          COMMAND MENU")
        print(border)
        print(RetroColors.SECTION + "\n[INFO]")
        print(RetroColors.MENU_ITEM + "1. Repository Status")
        print(RetroColors.MENU_ITEM + "2. Commit History")
        print(RetroColors.SECTION + "\n[SETUP]")
        print(RetroColors.MENU_ITEM + "3. Initialize Repository")
        print(RetroColors.MENU_ITEM + "4. Manage Remote Origin")
        print(RetroColors.MENU_ITEM + "5. Branch Management")
        print(RetroColors.MENU_ITEM + "10. Reset Local Repository")
        print(RetroColors.SECTION + "\n[UPDATE]")
        print(RetroColors.MENU_ITEM + "6. Stage All Files")
        print(RetroColors.MENU_ITEM + "7. Create Commit")
        print(RetroColors.MENU_ITEM + "8. Push to Remote")
        print(RetroColors.MENU_ITEM + "9. Quick Update")
        print(border)
        print(RetroColors.MENU_ITEM + "0. Exit")
        print(border)
        
        choice = input(RetroColors.PROMPT + "\nSelect an option: ")
        if choice == '1': git_status()
        elif choice == '2': git_log()
        elif choice == '3': git_init()
        elif choice == '4': git_add_remote()
        elif choice == '5': git_create_branch()
        elif choice == '6': git_add_all()
        elif choice == '7': git_commit()
        elif choice == '8': git_push()
        elif choice == '9': quick_update()
        elif choice == '10': git_reset()
        elif choice == '0':
            clear_screen()
            print(RetroColors.TITLE + "Thank you for using GitHelper!")
            sys.exit(0)
        else:
            print(RetroColors.WARNING + "\n[!] Invalid option.")
            time.sleep(1)

if __name__ == "__main__":
    main_menu()