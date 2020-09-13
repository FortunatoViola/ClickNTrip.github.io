-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ago 31, 2020 alle 16:16
-- Versione del server: 10.4.13-MariaDB
-- Versione PHP: 7.4.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sampledb`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `account`
--

CREATE TABLE `account` (
  `ID_ACCOUNT` int(11) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `Password` varchar(50) NOT NULL,
  `Nome` varchar(50) NOT NULL,
  `Cognome` varchar(50) NOT NULL,
  `DataNascita` varchar(10) NOT NULL,
  `Tipo` tinyint(1) NOT NULL,
  `Foto_account` varchar(80) NOT NULL DEFAULT 'uploads/default-avatar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `account`
--

INSERT INTO `account` (`ID_ACCOUNT`, `Email`, `Password`, `Nome`, `Cognome`, `DataNascita`, `Tipo`, `Foto_account`) VALUES
(1, 'violafortunato98@hotmail.com', 'Ninja2', 'Fortunato', 'Viola', '1998-09-25', 1, 'uploads/foto_utente-1596018001253'),
(2, 'galbo@gmail.com', 'Topo', 'Marco', 'Galgo', '2000-02-22', 0, 'uploads/foto_utente-1595608199674'),
(3, 'niccolo@niccolo.it', 'Peperonata98', 'Niccolo', 'Ditta', '1998-06-06', 0, 'uploads/default-avatar'),
(4, 'marcoStallone@gmail.it', 'Monsterhunter98@', 'Marco', 'Stallone', '1998-07-04', 0, 'uploads/default-avatar'),
(5, 'enza.babba@gmail.commmmm', 'Pippo05!', 'Enza', 'Nastasi', '2000-08-26', 0, 'uploads/foto_utente-1598285620024');

-- --------------------------------------------------------

--
-- Struttura della tabella `prenotazione`
--

CREATE TABLE `prenotazione` (
  `ID_PRENOTAZIONE` int(11) NOT NULL,
  `ref_id_account` int(11) NOT NULL,
  `ref_id_struttura` int(11) NOT NULL,
  `Nome` varchar(50) CHARACTER SET ascii NOT NULL,
  `Cognome` varchar(50) CHARACTER SET ascii NOT NULL,
  `DataNascita` varchar(10) NOT NULL,
  `TipoPagamento` tinyint(4) NOT NULL,
  `Numero` bigint(20) NOT NULL,
  `CVV` int(11) NOT NULL,
  `Scadenza` varchar(10) NOT NULL,
  `Datain` varchar(10) NOT NULL,
  `Dataout` varchar(10) NOT NULL,
  `NumeroClienti` int(80) NOT NULL,
  `EsenteTassa` int(40) NOT NULL,
  `Motivazione_Esente` text DEFAULT NULL,
  `Motivazione_Rifiuto` text DEFAULT NULL,
  `Singola` int(11) NOT NULL,
  `Doppia` int(11) NOT NULL,
  `Tripla` int(11) NOT NULL,
  `check` int(3) NOT NULL,
  `Totale` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `prenotazione`
--

INSERT INTO `prenotazione` (`ID_PRENOTAZIONE`, `ref_id_account`, `ref_id_struttura`, `Nome`, `Cognome`, `DataNascita`, `TipoPagamento`, `Numero`, `CVV`, `Scadenza`, `Datain`, `Dataout`, `NumeroClienti`, `EsenteTassa`, `Motivazione_Esente`, `Motivazione_Rifiuto`, `Singola`, `Doppia`, `Tripla`, `check`, `Totale`) VALUES
(4, 1, 26, 'Fortunato', 'Viola', '1998-09-25', 1, 10101010101101010, 223, '2023-03-20', '2020-07-20', '2020-07-24', 5, 3, 'lavoro', '', 0, 0, 0, 2, 0),
(5, 2, 26, 'Marco', 'Galbo', '1995-05-05', 0, 0, 0, '0000-00-00', '2020-02-23', '2020-03-27', 5, 3, 'motivi di salute', '', 0, 0, 0, 0, 0),
(6, 5, 31, 'vincenza', 'Nastasi', '2000-08-26', 0, 0, 0, '0000-00-00', '2020-08-26', '2020-08-27', 3, 1, '', NULL, 1, 1, 0, 0, 0),
(7, 1, 31, 'Niccolo', 'Ditta', '1998-08-28', 0, 0, 0, '', '2020-09-02', '2020-09-04', 8, 3, '', NULL, 0, 0, 0, 0, 0),
(8, 1, 31, 'Niccolo', 'Ditta', '2020-08-29', 0, 0, 0, '', '2020-08-29', '2020-08-30', 8, 4, '', NULL, 0, 0, 0, 0, 0),
(9, 3, 31, 'Casetta riva al mare', 'Galbo', '2020-08-19', 0, 0, 0, '', '2020-08-28', '2020-08-29', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(10, 3, 31, 'SnowHome', 'Viola', '2020-08-28', 0, 0, 0, '', '2020-08-28', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(11, 3, 31, 'SnowHome', 'Nastasi', '2020-08-20', 0, 0, 0, '', '2020-08-28', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(12, 3, 31, 'Fortunato', 'Galbo', '2020-08-19', 0, 0, 0, '', '2020-08-28', '2020-08-29', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(13, 3, 31, 'SnowHome', 'Galbo', '2020-08-20', 0, 0, 0, '', '2020-08-28', '2020-08-29', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(14, 3, 31, 'Fortunato', 'Galbo', '2020-08-13', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(15, 3, 31, 'Niccolo', 'Nastasi', '2020-08-19', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(16, 3, 31, 'Niccolo', 'Ditta', '2020-08-13', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(17, 3, 31, 'Fortunato', 'Nastasi', '2020-08-08', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(18, 3, 31, 'Casetta riva al mare', 'Ditta', '2020-08-14', 0, 0, 0, '', '2020-09-05', '2020-09-18', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(19, 3, 31, 'SnowHome', 'Ditta', '2020-08-22', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(20, 3, 31, 'Fortunato', 'Galbo', '2020-08-29', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 0, 0, 0, 0, 0),
(21, 1, 31, 'Fortunato', 'Stallone', '2020-08-13', 0, 0, 0, '', '2020-08-29', '2020-08-30', 5, 2, '', NULL, 1, 2, 0, 0, 275);

-- --------------------------------------------------------

--
-- Struttura della tabella `recensione`
--

CREATE TABLE `recensione` (
  `ref_id_account_recensione` int(11) NOT NULL,
  `ref_id_struttura_recensione` int(11) NOT NULL,
  `descrizione` text NOT NULL,
  `voto` int(5) NOT NULL,
  `data_recensione` date NOT NULL DEFAULT current_timestamp(),
  `ID_RECENSIONE` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `recensione`
--

INSERT INTO `recensione` (`ref_id_account_recensione`, `ref_id_struttura_recensione`, `descrizione`, `voto`, `data_recensione`, `ID_RECENSIONE`) VALUES
(1, 26, 'Bellissima struttura, la consiglio,', 3, '2020-07-23', 4),
(2, 26, 'ottima struttura,', 5, '2020-07-24', 5),
(2, 26, 'ottima struttura,', 3, '2020-07-24', 6),
(1, 26, 'struttura da favola,', 2, '2020-07-24', 7),
(1, 26, 'pessima struttura,', 1, '2020-07-24', 8),
(2, 26, 'Bellissima struttura, la consiglio,', 5, '2020-07-24', 9),
(1, 26, 'pessima scelta,', 1, '2020-07-24', 10);

-- --------------------------------------------------------

--
-- Struttura della tabella `struttura`
--

CREATE TABLE `struttura` (
  `ID_STRUTTURA` int(11) NOT NULL,
  `ref_id_account` int(11) NOT NULL,
  `NomeStruttura` text NOT NULL,
  `TipoStruttura` tinyint(1) NOT NULL,
  `Località` varchar(50) NOT NULL,
  `Indirizzo` text NOT NULL,
  `NSingole` int(11) NOT NULL,
  `PrezzoS` decimal(10,0) NOT NULL,
  `NDoppie` int(11) NOT NULL,
  `PrezzoD` decimal(10,0) NOT NULL,
  `NTriple` int(11) NOT NULL,
  `PrezzoT` decimal(10,0) NOT NULL,
  `NCamere` int(11) NOT NULL,
  `NPostiLetto` int(11) NOT NULL,
  `Prezzo` float NOT NULL,
  `TassaSoggiorno` float NOT NULL,
  `Descrizione` text NOT NULL,
  `Posizione` varchar(20) NOT NULL,
  `Wifi` tinyint(1) NOT NULL,
  `Parcheggio` tinyint(1) NOT NULL,
  `AriaCondizionata` tinyint(1) NOT NULL,
  `Piscina` tinyint(1) NOT NULL,
  `Foto_struttura` varchar(80) NOT NULL,
  `Voto` int(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dump dei dati per la tabella `struttura`
--

INSERT INTO `struttura` (`ID_STRUTTURA`, `ref_id_account`, `NomeStruttura`, `TipoStruttura`, `Località`, `Indirizzo`, `NSingole`, `PrezzoS`, `NDoppie`, `PrezzoD`, `NTriple`, `PrezzoT`, `NCamere`, `NPostiLetto`, `Prezzo`, `TassaSoggiorno`, `Descrizione`, `Posizione`, `Wifi`, `Parcheggio`, `AriaCondizionata`, `Piscina`, `Foto_struttura`, `Voto`) VALUES
(26, 1, 'Casetta riva al mare', 1, 'Palermo', 'Via Battaglia,69', 0, '0', 0, '0', 0, '0', 8, 10, 500, 25, 'Una casa adatta a chi vuole rilassarsi.', '1500m-2000m', 1, 0, 1, 1, 'uploads/foto_s-1596020063676', 2),
(29, 1, 'Casa Plus', 1, 'Selinunte', 'Via Ammiraglio', 0, '0', 0, '0', 0, '0', 5, 6, 200, 20, 'Casa per rilassarti', '2500m-3000m', 1, 0, 0, 0, 'uploads/foto_s-1593962212594', NULL),
(31, 1, 'HomeParadise', 0, 'Palermo', 'Via Baglioni', 4, '40', 5, '80', 0, '120', 0, 0, 0, 25, 'Casa che sembra un paradiso', '1500m-2000m', 1, 0, 1, 0, 'uploads/foto_s-1594053427177', NULL);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`ID_ACCOUNT`);

--
-- Indici per le tabelle `prenotazione`
--
ALTER TABLE `prenotazione`
  ADD PRIMARY KEY (`ID_PRENOTAZIONE`);

--
-- Indici per le tabelle `recensione`
--
ALTER TABLE `recensione`
  ADD PRIMARY KEY (`ID_RECENSIONE`);

--
-- Indici per le tabelle `struttura`
--
ALTER TABLE `struttura`
  ADD PRIMARY KEY (`ID_STRUTTURA`),
  ADD KEY `Possiede` (`ref_id_account`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `account`
--
ALTER TABLE `account`
  MODIFY `ID_ACCOUNT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la tabella `prenotazione`
--
ALTER TABLE `prenotazione`
  MODIFY `ID_PRENOTAZIONE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT per la tabella `recensione`
--
ALTER TABLE `recensione`
  MODIFY `ID_RECENSIONE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `struttura`
--
ALTER TABLE `struttura`
  MODIFY `ID_STRUTTURA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `struttura`
--
ALTER TABLE `struttura`
  ADD CONSTRAINT `Possiede` FOREIGN KEY (`ref_id_account`) REFERENCES `account` (`ID_ACCOUNT`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
