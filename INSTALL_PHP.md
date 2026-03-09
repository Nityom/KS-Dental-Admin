# Installing PHP on Windows

## Quick Install (Recommended)

### Option 1: Using Chocolatey (Easiest)

1. **Install Chocolatey** (if you don't have it):
   - Open PowerShell as Administrator
   - Run:
     ```powershell
     Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
     ```

2. **Install PHP**:
   ```powershell
   choco install php -y
   ```

3. **Verify**:
   ```powershell
   php --version
   ```

4. **Restart your terminal** and try `.\start-backend.bat` again

---

### Option 2: Manual Installation

1. **Download PHP**:
   - Go to: https://windows.php.net/download/
   - Download **"VS16 x64 Thread Safe"** ZIP file (latest version)

2. **Extract PHP**:
   - Extract to: `C:\php`
   - You should have `C:\php\php.exe`

3. **Add to PATH**:
   - Search "Environment Variables" in Windows
   - Click "Environment Variables"
   - Under "System variables", select "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\php`
   - Click "OK" on all dialogs

4. **Create php.ini**:
   - In `C:\php`, copy `php.ini-development` to `php.ini`

5. **Restart PowerShell** and verify:
   ```powershell
   php --version
   ```

---

### Option 3: XAMPP (Includes Apache, MySQL, PHP)

1. Download XAMPP: https://www.apachefriends.org/
2. Install it
3. Add PHP to PATH:
   - Add: `C:\xampp\php` to Windows PATH
4. Restart PowerShell

---

## After Installing PHP

1. **Verify PHP is installed**:
   ```powershell
   php --version
   ```
   You should see something like: `PHP 8.x.x`

2. **Enable required extensions** (edit `C:\php\php.ini`):
   - Find and uncomment (remove `;`):
     ```ini
     extension=pdo_mysql
     extension=mysqli
     extension=openssl
     ```

3. **Restart your terminal**

4. **Try starting the backend again**:
   ```powershell
   .\start-backend.bat
   ```

---

## Quick Check

Run this to verify everything:
```powershell
php --version
mysql --version
node --version
```

All three should show version numbers.

---

## Still Having Issues?

Try running the backend manually to see detailed errors:
```powershell
cd php-backend
php -S localhost:8000 -t .
```

This will show you exactly what's wrong.
