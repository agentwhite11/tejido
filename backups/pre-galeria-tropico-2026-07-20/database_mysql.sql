-- TEJIDO - Base de datos compatible con MySQL 8 / MySQL Workbench
-- Script no destructivo: puede ejecutarse otra vez sin borrar los datos existentes.
CREATE DATABASE IF NOT EXISTS tejido_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE tejido_db;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  type ENUM('HISTORIA','EVENTO','OPORTUNIDAD','TALENTO','INICIATIVA') NOT NULL,
  color CHAR(7) NOT NULL DEFAULT '#2F6B59',
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS organizations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  contact VARCHAR(190),
  active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_organizations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS publications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id BIGINT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  kind ENUM('HISTORIA','EVENTO','OPORTUNIDAD','TALENTO','INICIATIVA') NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  image VARCHAR(500),
  location VARCHAR(180),
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  link VARCHAR(500),
  featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('DRAFT','REVIEW','PUBLISHED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  moderation_note VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_publications_author FOREIGN KEY (author_id) REFERENCES users(id),
  CONSTRAINT fk_publications_category FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_publications_status (status, deleted),
  INDEX idx_publications_kind (kind),
  INDEX idx_publications_dates (start_date, end_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  publication_id BIGINT UNSIGNED NOT NULL UNIQUE,
  venue VARCHAR(180),
  capacity INT UNSIGNED,
  CONSTRAINT fk_events_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS opportunities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  publication_id BIGINT UNSIGNED NOT NULL UNIQUE,
  organization_name VARCHAR(180),
  deadline DATETIME NULL,
  CONSTRAINT fk_opportunities_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorites (
  user_id BIGINT UNSIGNED NOT NULL,
  publication_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, publication_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  publication_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status ENUM('OPEN','REVIEWED','CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suggestions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  message VARCHAR(1000) NOT NULL,
  status ENUM('NEW','REVIEWED','CLOSED') NOT NULL DEFAULT 'NEW',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  CONSTRAINT fk_suggestions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_suggestions_status (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(64) PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_expiration (expires_at)
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (name, description) VALUES
('ADMIN','Administración y moderación total'),
('GESTOR','Creación y gestión de contenidos'),
('CIUDADANO','Consulta, favoritos y reportes');

INSERT IGNORE INTO categories (name, type, color) VALUES
('Historias','HISTORIA','#805AD5'),
('Eventos','EVENTO','#F59E0B'),
('Oportunidades','OPORTUNIDAD','#16A085'),
('Talento','TALENTO','#EC4899'),
('Iniciativas','INICIATIVA','#3B82F6');

-- Comprobación final
SHOW TABLES;
