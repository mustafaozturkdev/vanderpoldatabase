-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Anamakine: localhost
-- Üretim Zamanı: 15 Haz 2024, 15:50:14
-- Sunucu sürümü: 8.0.35
-- PHP Sürümü: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `vanderpoldatabase`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `iteration`
--

CREATE TABLE `iteration` (
  `Id` int NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `odeId` int NOT NULL,
  `iterationInfo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `iterationCount` int NOT NULL,
  `iterationT` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `iterationVal` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ZamanDamgasi` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo için tablo yapısı `log`
--

CREATE TABLE `log` (
  `Id` int NOT NULL,
  `Url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `UserAgent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Ip` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ZamanDamgasi` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo için tablo yapısı `ode`
--

CREATE TABLE `ode` (
  `Id` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `iterasyon` int NOT NULL,
  `mu` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `baslangic1` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `baslangic2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ode` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mapStacking` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `initialVector` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `constructF` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `iterationTitle` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ZamanDamgasi` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo için tablo yapısı `rho`
--

CREATE TABLE `rho` (
  `Id` int NOT NULL,
  `odeId` int NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `rho` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `rhoStep` int NOT NULL,
  `rhoVal` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ZamanDamgasi` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `iteration`
--
ALTER TABLE `iteration`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `token` (`token`),
  ADD KEY `odeId` (`odeId`);

--
-- Tablo için indeksler `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`Id`);

--
-- Tablo için indeksler `ode`
--
ALTER TABLE `ode`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `token` (`token`);

--
-- Tablo için indeksler `rho`
--
ALTER TABLE `rho`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `odeId` (`odeId`),
  ADD KEY `token` (`token`),
  ADD KEY `rhoStep` (`rhoStep`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `iteration`
--
ALTER TABLE `iteration`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Tablo için AUTO_INCREMENT değeri `log`
--
ALTER TABLE `log`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Tablo için AUTO_INCREMENT değeri `ode`
--
ALTER TABLE `ode`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Tablo için AUTO_INCREMENT değeri `rho`
--
ALTER TABLE `rho`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
