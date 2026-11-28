CREATE DATABASE mysql_facturacion;
USE mysql_facturacion;

SELECT * FROM Emisor;





# Tabla de Categorias
CREATE TABLE Categorias (
                            categoria_id VARCHAR(20) PRIMARY KEY,
                            nombre VARCHAR(100) NOT NULL,
                            descripcion VARCHAR(255)
);

INSERT INTO Categorias (categoria_id, nombre, descripcion) VALUES
                            ('CAT-01', 'Consultoría Fiscal y Tributaria', 'Asesoría fiscal, planeación tributaria y cumplimiento SAT'),
                            ('CAT-02', 'Auditoría y Contabilidad', 'Auditoría contable, conciliación bancaria y dictámenes'),
                            ('CAT-03', 'Sistemas ERP y Timbrado CFDI', 'Soporte ERP, timbrado masivo CFDI y migración cloud'),
                            ('CAT-04', 'Gestión de Nómina y RRHH', 'Cálculo de nómina, retenciones ISR/IVA y seguridad social'),
                            ('CAT-05', 'Ciberseguridad y Análisis Financiero', 'Seguridad de datos contables y reportes ejecutivos');

# Tabla de Receptor (Clientes)
CREATE TABLE Receptor (
                          cliente_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          rfc VARCHAR(13) NOT NULL,
                          razon_social VARCHAR(150) NOT NULL,
                          email VARCHAR(100) NOT NULL,
                          direccion TEXT,
                          activo TINYINT(1) DEFAULT 1,
                          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

# Tabla de Usuarios
CREATE TABLE Usuarios (
                          usuario_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          nombre VARCHAR(100) NOT NULL,
                          apellido_paterno VARCHAR(100) NOT NULL,
                          apellido_materno VARCHAR(100),
                          genero VARCHAR(20),
                          telefono VARCHAR(20),
                          fecha_nacimiento DATE
);

# Tabla de Credenciales (con Clave Foránea a Usuarios)
CREATE TABLE Credenciales (
                              credencial_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              usuario_id BIGINT NOT NULL,
                              correo VARCHAR(100) NOT NULL UNIQUE,
                              contrasena VARCHAR(255) NOT NULL,
                              CONSTRAINT fk_credenciales_usuarios
                                  FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
                                      ON DELETE CASCADE
);




# Emisor
CREATE TABLE Emisor (
                        emisor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        usuario_id BIGINT NOT NULL,
                        rfc VARCHAR(13) NOT NULL UNIQUE,
                        razon_social VARCHAR(150) NOT NULL,
                        regimen_fiscal VARCHAR(100) NOT NULL,
                        email VARCHAR(100) NOT NULL,
                        direccion TEXT,
                        activo BOOLEAN DEFAULT 1,
                        CONSTRAINT fk_emisor_usuarios
                            FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
                                ON DELETE CASCADE
);

# Encabezado de facturas
CREATE TABLE Factura_encabezado (
                                    factura_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    emisor_id BIGINT NOT NULL,
                                    cliente_id BIGINT NOT NULL,
                                    folio VARCHAR(50) NOT NULL UNIQUE,
                                    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    subtotal DECIMAL(12, 2) NOT NULL,
                                    impuestos DECIMAL(12, 2) NOT NULL,
                                    total DECIMAL(12, 2) NOT NULL,
                                    CONSTRAINT fk_factura_emisor
                                        FOREIGN KEY (emisor_id) REFERENCES Emisor(emisor_id),
                                    CONSTRAINT fk_factura_receptor
                                        FOREIGN KEY (cliente_id) REFERENCES Receptor(cliente_id)
);

# Detalles de facturas
CREATE TABLE Factura_detalles (
                                  detalle_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  factura_id BIGINT NOT NULL,
                                  servicio_id VARCHAR(100) NOT NULL,
                                  cantidad INT NOT NULL DEFAULT 1,
                                  precio_unitario DECIMAL(12, 2) NOT NULL,
                                  subtotal DECIMAL(12, 2) NOT NULL,
                                  CONSTRAINT fk_detalles_factura
                                      FOREIGN KEY (factura_id) REFERENCES Factura_encabezado(factura_id)
                                          ON DELETE CASCADE
);

# Pagos
CREATE TABLE Pagos (
                       pago_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       factura_id BIGINT NOT NULL,
                       monto DECIMAL(12, 2) NOT NULL,
                       tipo_tarjeta VARCHAR(50),
                       fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_pagos_factura
                           FOREIGN KEY (factura_id) REFERENCES Factura_encabezado(factura_id)
                               ON DELETE CASCADE
);


CREATE DATABASE IF NOT EXISTS mysql_seguridad;
USE mysql_seguridad;

CREATE TABLE IF NOT EXISTS Usuarios (
                                        usuario_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    genero VARCHAR(20),
    telefono VARCHAR(20),
    fecha_nacimiento DATE
    );

CREATE TABLE IF NOT EXISTS Roles (
                                     rol_id INT AUTO_INCREMENT PRIMARY KEY,
                                     rol VARCHAR(50) NOT NULL UNIQUE
    );

CREATE TABLE IF NOT EXISTS Credenciales (
                                            credencial_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            usuario_id BIGINT NOT NULL,
                                            rol_id INT NOT NULL,
                                            correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    CONSTRAINT fk_credenciales_usuarios
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id)
    ON DELETE CASCADE,
    CONSTRAINT fk_credenciales_roles
    FOREIGN KEY (rol_id) REFERENCES Roles(rol_id)
    );

-- Insertar roles base para RBAC
INSERT IGNORE INTO Roles (rol_id, rol) VALUES (1, 'ADMIN'), (2, 'FACTURADOR'), (3, 'AUDITOR');


USE mysql_facturacion;

-- Limpiamos las llaves foráneas viejas hacia Usuarios para separar las BDs como en el diagrama
ALTER TABLE Emisor DROP FOREIGN KEY fk_emisor_usuarios;
DROP TABLE IF EXISTS Credenciales;
DROP TABLE IF EXISTS Usuarios;

-- Tabla de Impuestos Histórico (Nueva del diagrama)
CREATE TABLE IF NOT EXISTS Impuestos_Historico (
                                                   impuesto_id INT AUTO_INCREMENT PRIMARY KEY,
                                                   nombre_impuesto VARCHAR(50) NOT NULL,
    tasa_porcentaje DECIMAL(5, 2) NOT NULL,
    fecha_inicio_vigencia DATE NOT NULL,
    fecha_fin_vigencia DATE,
    activo TINYINT(1) DEFAULT 1
    );

INSERT IGNORE INTO Impuestos_Historico (impuesto_id, nombre_impuesto, tasa_porcentaje, fecha_inicio_vigencia, activo)
VALUES
(1, 'IVA General 16%', 16.00, '2024-01-01', 1),
(2, 'IVA Frontera 8%', 8.00, '2024-01-01', 1),
(3, 'Retención ISR 10%', 10.00, '2024-01-01', 1);


-- Columnas añadidad
ALTER TABLE Factura_encabezado
    ADD COLUMN retenciones DECIMAL(12, 2) DEFAULT 0.00 AFTER impuestos,
    ADD COLUMN estatus VARCHAR(20) DEFAULT 'PENDIENTE' AFTER total;

ALTER TABLE Factura_detalles
    ADD COLUMN impuesto_id INT DEFAULT 1 AFTER servicio_id,
    ADD CONSTRAINT fk_detalles_impuesto FOREIGN KEY (impuesto_id) REFERENCES Impuestos_Historico(impuesto_id);

USE mysql_seguridad;

INSERT INTO Usuarios (usuario_id, nombre, apellido_paterno, apellido_materno, genero, telefono, fecha_nacimiento) VALUES
    (1, 'Andrea', 'Aragón', 'Márquez', 'Femenino', '7771112233', '2005-06-09'),
    (2, 'Getsemani', 'Cruz', 'Millán', 'Femenino', '7772223344', '2006-06-16'),
    (3, 'Evelin', 'Mojica', 'Quintana', 'Femenino', '7773334455', '2005-03-30');

INSERT INTO Credenciales (usuario_id, rol_id, correo, contrasena) VALUES
    (1, 1, 'admin@utez.edu.mx', SHA2(CONCAT('Admin12345!', 'utez_cloud_salt'), 256)),
    (2, 2, 'facturador@utez.edu.mx', SHA2(CONCAT('Fact12345!', 'utez_cloud_salt'), 256)),
    (3, 3, 'auditor@utez.edu.mx', SHA2(CONCAT('Audit12345!', 'utez_cloud_salt'), 256));