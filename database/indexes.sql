USE mysql_facturacion;

-- Índice para consultar facturas por cliente y fecha de emisión,
CREATE INDEX idx_factura_cliente_fecha
    ON Factura_encabezado (cliente_id, fecha_emision);

-- Índice para consultar por RFC de los clientes y fecha de registro o creación
CREATE INDEX idx_receptor_rfc_fecha
    ON Receptor (rfc, fecha_creacion);

-- Para consultas de factura y servicio a la vez
CREATE INDEX idx_detalles_factura_servicio
    ON Factura_detalles (factura_id, servicio_id);

-- Consulta de factura y fecha de pago
CREATE INDEX idx_pagos_factura_fecha
    ON Pagos (factura_id, fecha_pago);


