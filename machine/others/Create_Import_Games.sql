-- ================================================
-- Projeto: Games Data Import (Azure MySQL)
-- Descrição: Criação da tabela e importação dos dados do arquivo games_blt3.csv
-- ================================================

-- Criar banco
CREATE DATABASE PI6DSM;
use PI6DSM;

-- Criat tabela
CREATE TABLE IF NOT EXISTS games_blt3 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    release_date DATE,
    required_age INT,
    price DECIMAL(10,2),
    header_image VARCHAR(300),
    positive INT,
    negative INT,
    recommendations INT,
    genres VARCHAR(255),
    categories VARCHAR(255),
    description TEXT
);

|-- ================================================
-- IMPORTAÇÃO DOS DADOS (rodar no prompt Mysql> ajuste o caminho conforme o local do CSV no servidor MySQL/Azure)
-- ================================================

LOAD DATA LOCAL INFILE '/var/lib/mysql-files/games_blt3.csv'
INTO TABLE games
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(name, @release_date_num, required_age, price, header_image, positive, negative, recommendations, genres, categories, description)
SET release_date = STR_TO_DATE(@release_date_num, '%Y%m%d');

|-- ================================================
-- SELECT DE CONFIRMAÇÃO WORKBENCH (Averiguar imports)
-- ================================================

SELECT * FROM games where id between 1 and 100;
