#!/bin/bash

# Derleme ve çalıştırma yolları
SOURCE_FILE_PATH="data/main.cpp"
EXECUTABLE_PATH="data/main"
OUTPUT_FILE_PATH="data/output.txt"

# Eski yürütülebilir dosyayı kaldır
rm -f "$EXECUTABLE_PATH"

# C++ kodunu derle
g++ "$SOURCE_FILE_PATH" -std=c++14 -lgmp -lgmpxx -o "$EXECUTABLE_PATH"

if [ $? -eq 0 ]; then
    # Kod derlendi, şimdi çalıştır
    "$EXECUTABLE_PATH" > "$OUTPUT_FILE_PATH"
else
    echo "Kodu derlerken bir hata oluştu."
    exit 1
fi
