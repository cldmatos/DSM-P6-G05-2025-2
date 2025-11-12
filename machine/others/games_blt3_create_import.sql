
-- ================================================
-- Projeto: Games Data Import (Azure MySQL)
-- Descrição: Criação da tabela e importação dos dados do arquivo games_blt3.csv
-- ================================================

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

-- ================================================
-- IMPORTAÇÃO DOS DADOS (ajuste o caminho conforme o local do CSV no servidor MySQL/Azure)
-- ================================================

LOAD DATA INFILE '/var/lib/mysql-files/games_blt3.csv'
INTO TABLE games_blt3
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(name, @release_date_num, required_age, price, header_image, positive, negative, recommendations, genres, categories, description)
SET release_date = STR_TO_DATE(@release_date_num, '%Y%m%d');
