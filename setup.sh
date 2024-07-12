#!/bin/bash

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonksiyon: Paket yükleme
install_package() {
    if ! dpkg -s "$1" >/dev/null 2>&1; then
        echo -e "${YELLOW}$1 yükleniyor...${NC}"
        sudo apt-get install -y "$1"
    else
        echo -e "${GREEN}$1 zaten yüklü.${NC}"
    fi
}

# Root yetkisi kontrolü
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Bu script root yetkisiyle çalıştırılmalıdır.${NC}" 
   exit 1
fi

# 1. C++ için gerekli paketlerin kurulumu
echo -e "${YELLOW}C++ için gerekli paketler yükleniyor...${NC}"
install_package "build-essential"
install_package "libgmp-dev"
install_package "libgmpxx4ldbl"

# 2. MySQL kurulumu
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}MySQL kuruluyor...${NC}"
    install_package "mysql-server"
    systemctl start mysql
    systemctl enable mysql
else
    echo -e "${GREEN}MySQL zaten kurulu.${NC}"
fi

# 3. MySQL kullanıcı ve veritabanı oluşturma
echo -e "${YELLOW}MySQL kullanıcı ve veritabanı oluşturuluyor...${NC}"
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS vanderpoldatabase;
CREATE USER IF NOT EXISTS 'vanderpoldatabase'@'localhost' IDENTIFIED BY 'vanderpoldatabase';
GRANT ALL PRIVILEGES ON vanderpoldatabase.* TO 'vanderpoldatabase'@'localhost';
FLUSH PRIVILEGES;
EOF

# vanderpoldatabase.sql dosyasını import etme
echo -e "${YELLOW}Veritabanı şeması import ediliyor...${NC}"
mysql -u vanderpoldatabase -pvanderpoldatabase vanderpoldatabase < vanderpoldatabase.sql

# 4. Node.js ve npm kurulumu
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js ve npm kuruluyor...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    install_package "nodejs"
else
    echo -e "${GREEN}Node.js zaten kurulu.${NC}"
fi

# NPM paketlerinin kurulumu
echo -e "${YELLOW}NPM paketleri yükleniyor...${NC}"
npm install

echo -e "${GREEN}Kurulum tamamlandı.${NC}"