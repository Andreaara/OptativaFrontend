USE mysql_facturacion;

DELIMITER //

CREATE PROCEDURE sp_generar_folio_atomico(IN p_serie VARCHAR(10), OUT p_nuevo_folio VARCHAR(50))
BEGIN
    DECLARE v_consecutivo BIGINT;
SELECT IFNULL(MAX(factura_id), 0) + 1 INTO v_consecutivo FROM Factura_encabezado FOR UPDATE;
SET p_nuevo_folio = CONCAT(p_serie, '-', LPAD(v_consecutivo, 6, '0'));
END //

CREATE PROCEDURE sp_calcular_totales_factura(IN p_factura_id BIGINT, IN p_aplica_retencion TINYINT)
BEGIN
    DECLARE v_subtotal DECIMAL(12,2);
    DECLARE v_iva DECIMAL(12,2);
    DECLARE v_retencion DECIMAL(12,2) DEFAULT 0.00;

SELECT IFNULL(SUM(subtotal), 0) INTO v_subtotal FROM Factura_detalles WHERE factura_id = p_factura_id;
SET v_iva = ROUND(v_subtotal * 0.16, 2);
    IF p_aplica_retencion = 1 THEN
        SET v_retencion = ROUND(v_subtotal * 0.10, 2);
END IF;

UPDATE Factura_encabezado
SET subtotal = v_subtotal, impuestos = v_iva, retenciones = v_retencion, total = (v_subtotal + v_iva - v_retencion)
WHERE factura_id = p_factura_id;
END //

CREATE PROCEDURE sp_aplicar_descuento_volumen(IN p_factura_id BIGINT)
BEGIN
    DECLARE v_subtotal DECIMAL(12,2);
    DECLARE v_descuento DECIMAL(5,2) DEFAULT 0.00;

SELECT subtotal INTO v_subtotal FROM Factura_encabezado WHERE factura_id = p_factura_id;

IF v_subtotal >= 50000 THEN SET v_descuento = 0.15;
    ELSEIF v_subtotal >= 20000 THEN SET v_descuento = 0.10;
    ELSEIF v_subtotal >= 10000 THEN SET v_descuento = 0.05;
END IF;

    IF v_descuento > 0 THEN
UPDATE Factura_encabezado
SET subtotal = ROUND(subtotal * (1 - v_descuento), 2),
    impuestos = ROUND((subtotal * (1 - v_descuento)) * 0.16, 2),
    total = ROUND((subtotal * (1 - v_descuento)) * 1.16 - retenciones, 2)
WHERE factura_id = p_factura_id;
END IF;
END //

CREATE PROCEDURE sp_cancelar_factura(IN p_factura_id BIGINT)
BEGIN
START TRANSACTION;
UPDATE Factura_encabezado
SET estatus = 'CANCELADA', subtotal = 0.00, impuestos = 0.00, retenciones = 0.00, total = 0.00
WHERE factura_id = p_factura_id;
DELETE FROM Pagos WHERE factura_id = p_factura_id;
COMMIT;
END //

CREATE PROCEDURE sp_cierre_fiscal(IN p_periodo VARCHAR(20))
BEGIN
SELECT
    p_periodo AS periodo_fiscal,
    COUNT(factura_id) AS total_facturas_emitidas,
    IFNULL(SUM(subtotal), 0.00) AS total_subtotal,
    IFNULL(SUM(impuestos), 0.00) AS total_iva_trasladado,
    IFNULL(SUM(retenciones), 0.00) AS total_isr_retenido,
    IFNULL(SUM(total), 0.00) AS gran_total_neto
FROM Factura_encabezado
WHERE estatus != 'CANCELADA'
      AND DATE_FORMAT(fecha_emision, '%Y-%m') = p_periodo;
END //

CREATE PROCEDURE sp_validar_estado_pago(IN p_factura_id BIGINT)
BEGIN
    DECLARE v_total_factura DECIMAL(12,2);
    DECLARE v_total_pagado DECIMAL(12,2);

SELECT total INTO v_total_factura FROM Factura_encabezado WHERE factura_id = p_factura_id;
SELECT IFNULL(SUM(monto), 0) INTO v_total_pagado FROM Pagos WHERE factura_id = p_factura_id;

IF v_total_pagado >= v_total_factura AND v_total_factura > 0 THEN
UPDATE Factura_encabezado SET estatus = 'PAGADA' WHERE factura_id = p_factura_id;
END IF;
END //

CREATE PROCEDURE sp_reporte_antiguedad_saldos()
BEGIN
SELECT
    f.factura_id, f.folio, r.razon_social AS cliente, f.total,
    DATEDIFF(NOW(), f.fecha_emision) AS dias_antiguedad,
    CASE
        WHEN DATEDIFF(NOW(), f.fecha_emision) <= 30 THEN 'Vigente (0-30 días)'
        WHEN DATEDIFF(NOW(), f.fecha_emision) <= 60 THEN 'Vencida (31-60 días)'
        ELSE 'Morosidad Crítica (+60 días)'
        END AS categoria_vencimiento
FROM Factura_encabezado f
         JOIN Receptor r ON f.cliente_id = r.cliente_id
WHERE f.estatus = 'PENDIENTE';
END //

CREATE PROCEDURE sp_generar_estructura_cfdi(IN p_factura_id BIGINT)
BEGIN
SELECT
    f.folio, f.fecha_emision, f.subtotal, f.impuestos, f.retenciones, f.total, f.estatus,
    e.rfc AS emisor_rfc, e.razon_social AS emisor_nombre, e.regimen_fiscal,
    r.rfc AS receptor_rfc, r.razon_social AS receptor_nombre
FROM Factura_encabezado f
         JOIN Emisor e ON f.emisor_id = e.emisor_id
         JOIN Receptor r ON f.cliente_id = r.cliente_id
WHERE f.factura_id = p_factura_id;
END //

CREATE PROCEDURE sp_asignar_impuesto_masivo(IN p_factura_id BIGINT, IN p_impuesto_id INT)
BEGIN
UPDATE Factura_detalles
SET impuesto_id = p_impuesto_id
WHERE factura_id = p_factura_id;
END //

CREATE PROCEDURE sp_actualizar_tasa_impuesto(IN p_impuesto_id INT, IN p_nueva_tasa DECIMAL(5,2))
BEGIN
START TRANSACTION;
UPDATE Impuestos_Historico SET fecha_fin_vigencia = CURDATE(), activo = 0 WHERE impuesto_id = p_impuesto_id;
INSERT INTO Impuestos_Historico (nombre_impuesto, tasa_porcentaje, fecha_inicio_vigencia, activo)
SELECT nombre_impuesto, p_nueva_tasa, CURDATE(), 1 FROM Impuestos_Historico WHERE impuesto_id = p_impuesto_id;
COMMIT;
END //

DELIMITER ;