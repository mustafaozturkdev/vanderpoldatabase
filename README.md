# Van der Pol Osilatörü Çözüm Projesi

Bu proje, Van der Pol osilatörünün sayısal çözümlerini elde etmek ve yönetmek için geliştirilmiştir.

## Kurulum

1. Bu repoyu klonlayın: git clone https://github.com/mustafaozturkdev/vanderpoldatabase

2. Proje dizinine gidin: cd repo_name (bilgisyara kaydettiğimiz klasör ismi)

3. Kurulum script'ini çalıştırın: sudo bash setup.sh

Not: Bu script root yetkisiyle çalıştırılmalıdır.

4. Kurulum tamamlandıktan sonra, projeyi başlatmak için: npm start

## Kurulum Detayları

Kurulum script'i (`setup.sh`) aşağıdaki işlemleri gerçekleştirir:

1. C++ kodunu derlemek ve çalıştırmak için gerekli paketleri yükler.
2. MySQL'i kurar (eğer kurulu değilse).
3. MySQL kullanıcısı ve veritabanını oluşturur, `vanderpoldatabase.sql` dosyasını import eder.
4. Node.js ve npm'i kurar (eğer kurulu değilse).
5. Gerekli npm paketlerini yükler.

## Gereksinimler

- Linux işletim sistemi (Ubuntu 18.04 veya üzeri önerilir)
- Root erişimi
- İnternet bağlantısı (gerekli paketlerin yüklenmesi için)

## Manuel Kurulum

Eğer otomatik kurulum script'ini kullanmak istemiyorsanız, lütfen `setup.sh` dosyasını inceleyerek gerekli adımları manuel olarak gerçekleştirin.

## Lisans





