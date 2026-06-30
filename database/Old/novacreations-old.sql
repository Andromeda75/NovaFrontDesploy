-- Adminer 5.3.0 MariaDB 10.4.32-MariaDB dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `novacreations`;
CREATE DATABASE `novacreations` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `novacreations`;

DELIMITER ;;

CREATE PROCEDURE `ejecutar_actualizacion_subastas` ()
BEGIN
    -- Activar subastas pendientes
    UPDATE subastas s
    SET s.estado_id = 8
    WHERE s.estado_id = 7
    AND s.fecha_inicio <= NOW()
    AND s.fecha_fin > NOW();
    
    -- Actualizar ganadores
    UPDATE subastas s
    SET s.ganador_id = (
        SELECT p.usuario_id 
        FROM pujas p 
        WHERE p.subasta_id = s.id 
        ORDER BY p.monto_mxn DESC 
        LIMIT 1
    )
    WHERE s.estado_id = 8
    AND s.fecha_fin <= NOW();
    
    -- Finalizar subastas
    UPDATE subastas s
    SET s.estado_id = 9
    WHERE s.estado_id = 8
    AND s.fecha_fin <= NOW();
    
    SELECT 'Actualización completada' as mensaje;
END;;

CREATE FUNCTION `tiempo_restante_subasta` (`subasta_id` int) RETURNS varchar(50) CHARACTER SET 'utf8mb4' LANGUAGE SQL
COLLATE utf8mb4_general_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_fecha_fin DATETIME;
    DECLARE v_diff INT;
    DECLARE v_dias INT;
    DECLARE v_horas INT;
    DECLARE v_minutos INT;
    DECLARE v_resultado VARCHAR(50);
    
    SELECT fecha_fin INTO v_fecha_fin
    FROM subastas
    WHERE id = subasta_id;
    
    IF v_fecha_fin IS NULL THEN
        RETURN 'No disponible';
    END IF;
    
    SET v_diff = TIMESTAMPDIFF(SECOND, NOW(), v_fecha_fin);
    
    IF v_diff <= 0 THEN
        RETURN 'Finalizada';
    END IF;
    
    SET v_dias = FLOOR(v_diff / 86400);
    SET v_horas = FLOOR((v_diff % 86400) / 3600);
    SET v_minutos = FLOOR((v_diff % 3600) / 60);
    
    SET v_resultado = CONCAT(
        LPAD(v_dias, 2, '0'), 'd:',
        LPAD(v_horas, 2, '0'), 'h:',
        LPAD(v_minutos, 2, '0'), 'm'
    );
    
    RETURN v_resultado;
END;;

CREATE EVENT `actualizar_estado_subastas` ON SCHEDULE EVERY 1 MINUTE STARTS '2026-04-11 18:28:59' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id INT;
    DECLARE v_fecha_fin DATETIME;
    DECLARE v_estado_actual INT;
    
    -- Declarar cursor para subastas activas que deben finalizar
    DECLARE cur_finalizar CURSOR FOR
        SELECT s.id, s.fecha_fin, s.estado_id
        FROM subastas s
        WHERE s.estado_id = 8  -- Estado Activa
        AND s.fecha_fin <= NOW();
    
    -- Declarar cursor para subastas en espera que deben activarse
    DECLARE cur_activar CURSOR FOR
        SELECT s.id, s.fecha_fin
        FROM subastas s
        WHERE s.estado_id = 7  -- Estado En espera
        AND s.fecha_inicio <= NOW()
        AND s.fecha_fin > NOW();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- =====================================================
    -- PASO 1: ACTIVAR SUBASTAS QUE DEBEN EMPEZAR
    -- (Cambiar de estado 7 "En espera" a estado 8 "Activa")
    -- =====================================================
    UPDATE subastas s
    SET s.estado_id = 8
    WHERE s.estado_id = 7
    AND s.fecha_inicio <= NOW()
    AND s.fecha_fin > NOW();
    
    -- Registrar en log las subastas activadas
    INSERT INTO subastas_log (subasta_id, estado_anterior, estado_nuevo)
    SELECT s.id, 7, 8
    FROM subastas s
    WHERE s.estado_id = 8
    AND s.fecha_inicio <= NOW()
    AND s.fecha_fin > NOW()
    AND NOT EXISTS (
        SELECT 1 FROM subastas_log l 
        WHERE l.subasta_id = s.id 
        AND l.estado_nuevo = 8 
        AND DATE(l.fecha_cambio) = CURDATE()
    );
    
    -- =====================================================
    -- PASO 2: FINALIZAR SUBASTAS QUE YA TERMINARON
    -- =====================================================
    
    -- 2.1 Actualizar el ganador de las subastas que terminaron
    OPEN cur_finalizar;
    SET done = FALSE;
    
    read_finalizar_loop: LOOP
        FETCH cur_finalizar INTO v_id, v_fecha_fin, v_estado_actual;
        IF done THEN
            LEAVE read_finalizar_loop;
        END IF;
        
        -- Actualizar el ganador (usuario con la puja más alta)
        UPDATE subastas s
        SET s.ganador_id = (
            SELECT p.usuario_id 
            FROM pujas p 
            WHERE p.subasta_id = v_id 
            ORDER BY p.monto_mxn DESC 
            LIMIT 1
        )
        WHERE s.id = v_id;
        
    END LOOP;
    
    CLOSE cur_finalizar;
    
    -- 2.2 Cambiar el estado a Finalizada
    UPDATE subastas s
    SET s.estado_id = 9
    WHERE s.estado_id = 8
    AND s.fecha_fin <= NOW();
    
    -- Registrar en log las subastas finalizadas
    INSERT INTO subastas_log (subasta_id, estado_anterior, estado_nuevo)
    SELECT s.id, 8, 9
    FROM subastas s
    WHERE s.estado_id = 9
    AND s.fecha_fin <= NOW()
    AND NOT EXISTS (
        SELECT 1 FROM subastas_log l 
        WHERE l.subasta_id = s.id 
        AND l.estado_nuevo = 9 
        AND DATE(l.fecha_cambio) = CURDATE()
    );
    
END;;

DELIMITER ;

DROP TABLE IF EXISTS `articulos`;
CREATE TABLE `articulos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_mxn` decimal(10,2) NOT NULL,
  `foto1_url` longtext DEFAULT NULL,
  `foto2_url` longtext DEFAULT NULL,
  `foto3_url` longtext DEFAULT NULL,
  `video_url` longtext DEFAULT NULL,
  `documento_url` longtext DEFAULT NULL,
  `fecha_publicacion` date DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `vendedor_id` int(11) NOT NULL,
  `comprador_id` int(11) DEFAULT NULL,
  `estado_id` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_venta` datetime DEFAULT NULL,
  `metodo_pago_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `comprador_id` (`comprador_id`),
  KEY `idx_articulos_vendedor` (`vendedor_id`),
  KEY `idx_articulos_estado` (`estado_id`),
  CONSTRAINT `articulos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `articulos_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `articulos_ibfk_3` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `articulos_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `banners_publicitarios`;
CREATE TABLE `banners_publicitarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) DEFAULT NULL,
  `imagen_url` text NOT NULL,
  `link_destino` text DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `precio_mxn` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `catalogos`;
CREATE TABLE `catalogos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `portada_url` longtext DEFAULT NULL,
  `imagenes_extra` longtext DEFAULT NULL,
  `visibilidad` varchar(10) DEFAULT 'publico',
  `propietario_id` int(11) NOT NULL,
  `fecha_publicacion` date DEFAULT curdate(),
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `idx_catalogos_propietario` (`propietario_id`),
  CONSTRAINT `catalogos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `catalogos_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `catalogo_obras`;
CREATE TABLE `catalogo_obras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `catalogo_id` int(11) NOT NULL,
  `obra_id` int(11) NOT NULL,
  `obra_tipo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `catalogo_id` (`catalogo_id`),
  CONSTRAINT `catalogo_obras_ibfk_1` FOREIGN KEY (`catalogo_id`) REFERENCES `catalogos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
(1,	'Arte Visual',	'Pintura, dibujo, grabado y otras formas de arte visual'),
(2,	'Arte Digital',	'Ilustración digital, modelado 3D, NFT y arte generativo'),
(3,	'Fotografía',	'Fotografía artística, retrato, paisaje y fotografía conceptual'),
(4,	'Escultura',	'Esculturas en piedra, metal, madera y técnicas mixtas'),
(5,	'Artesanías',	'Artesanías tradicionales y contemporáneas'),
(6,	'Coleccionables',	'Figuras, ediciones limitadas y objetos de colección')
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `nombre` = VALUES(`nombre`), `descripcion` = VALUES(`descripcion`);

DROP TABLE IF EXISTS `configuracion_global`;
CREATE TABLE `configuracion_global` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` text DEFAULT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `estados`;
CREATE TABLE `estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_estado` (`nombre`,`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `estados` (`id`, `nombre`, `tipo`) VALUES
(8,	'Activa',	'subasta'),
(1,	'Activo',	'usuario'),
(14,	'Cancelada',	'peticion'),
(7,	'En espera',	'subasta'),
(12,	'En proceso',	'peticion'),
(3,	'En revisión',	'articulo'),
(13,	'Finalizada',	'peticion'),
(9,	'Finalizada',	'subasta'),
(11,	'Publicada',	'peticion'),
(4,	'Publicado',	'articulo'),
(10,	'Rechazada',	'subasta'),
(6,	'Rechazado',	'articulo'),
(2,	'Suspendido',	'usuario'),
(5,	'Vendido',	'articulo')
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `nombre` = VALUES(`nombre`), `tipo` = VALUES(`tipo`);

DROP TABLE IF EXISTS `favoritos`;
CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `favorito_id` int(11) NOT NULL,
  `favorito_tipo` varchar(20) NOT NULL,
  `fecha_guardado` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorito` (`usuario_id`,`favorito_id`,`favorito_tipo`),
  KEY `idx_favoritos_usuario` (`usuario_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=249 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `metodos_pago`;
CREATE TABLE `metodos_pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nombre_titular` varchar(100) NOT NULL,
  `numero_tarjeta_enmascarado` varchar(25) NOT NULL,
  `token_pago` varchar(255) DEFAULT NULL,
  `fecha_expiracion` date NOT NULL,
  `es_principal` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `metodos_pago_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `paquetes_tickets`;
CREATE TABLE `paquetes_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `cantidad_tickets` int(11) NOT NULL,
  `tickets_extra` int(11) NOT NULL,
  `precio_mxn` decimal(10,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `paquetes_tickets` (`id`, `nombre`, `cantidad_tickets`, `tickets_extra`, `precio_mxn`, `descripcion`) VALUES
(1,	'Explorador',	50,	0,	119.00,	'Ideal para dar tus primeros pasos en el mundo del arte digital, descubrir piezas únicas y participar en tus primeras subastas.'),
(2,	'Coleccionista',	100,	30,	199.00,	'Ideal para quienes buscan más oportunidades, mayor visibilidad y comenzar a construir una colección con piezas únicas.'),
(3,	'Evelyn',	150,	80,	299.00,	'Diseñado para usuarios con visión estratégica que desean acceder a piezas exclusivas y maximizar sus oportunidades dentro de la plataforma.'),
(5,	'Mau',	9999,	90,	99999999.99,	NULL)
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `nombre` = VALUES(`nombre`), `cantidad_tickets` = VALUES(`cantidad_tickets`), `tickets_extra` = VALUES(`tickets_extra`), `precio_mxn` = VALUES(`precio_mxn`), `descripcion` = VALUES(`descripcion`);

DROP TABLE IF EXISTS `permiso`;
CREATE TABLE `permiso` (
  `id_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `modulo` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `permiso` (`id_permiso`, `clave`, `nombre`, `descripcion`, `modulo`, `fecha_creacion`) VALUES
(1,	'dashboard.ver',	'Ver Dashboard',	'Acceso al panel principal',	'general',	'2026-03-27 10:30:56'),
(2,	'usuarios.ver',	'Ver Usuarios',	'Puede ver lista de usuarios',	'usuarios',	'2026-03-27 10:30:56'),
(3,	'usuarios.editar',	'Editar Usuarios',	'Puede editar usuarios',	'usuarios',	'2026-03-27 10:30:56'),
(4,	'subastas.crear',	'Crear Subastas',	'Puede crear nuevas subastas',	'subastas',	'2026-03-27 10:30:56'),
(5,	'subastas.editar',	'Editar Subastas',	'Puede editar subastas',	'subastas',	'2026-03-27 10:30:56'),
(6,	'subastas.eliminar',	'Eliminar Subastas',	'Puede eliminar subastas',	'subastas',	'2026-03-27 10:30:56'),
(7,	'articulos.crear',	'Crear Artículos',	'Puede crear nuevos artículos',	'articulos',	'2026-03-27 10:30:56'),
(8,	'articulos.editar',	'Editar Artículos',	'Puede editar artículos',	'articulos',	'2026-03-27 10:30:56'),
(9,	'articulos.eliminar',	'Eliminar Artículos',	'Puede eliminar artículos',	'articulos',	'2026-03-27 10:30:56'),
(10,	'catalogos.crear',	'Crear Catálogos',	'Puede crear nuevos catálogos',	'catalogos',	'2026-03-27 10:30:56'),
(11,	'peticiones.crear',	'Crear Peticiones',	'Puede crear peticiones',	'peticiones',	'2026-03-27 10:30:56')
ON DUPLICATE KEY UPDATE `id_permiso` = VALUES(`id_permiso`), `clave` = VALUES(`clave`), `nombre` = VALUES(`nombre`), `descripcion` = VALUES(`descripcion`), `modulo` = VALUES(`modulo`), `fecha_creacion` = VALUES(`fecha_creacion`);

DROP TABLE IF EXISTS `peticiones`;
CREATE TABLE `peticiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `presupuesto_min_mxn` decimal(10,2) DEFAULT NULL,
  `presupuesto_max_mxn` decimal(10,2) DEFAULT NULL,
  `plazo_entrega_semanas` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `creador_id` int(11) NOT NULL,
  `artista_asignado_id` int(11) DEFAULT NULL,
  `estado_id` int(11) DEFAULT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `artista_asignado_id` (`artista_asignado_id`),
  KEY `estado_id` (`estado_id`),
  KEY `idx_peticiones_creador` (`creador_id`),
  CONSTRAINT `peticiones_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `peticiones_ibfk_2` FOREIGN KEY (`creador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `peticiones_ibfk_3` FOREIGN KEY (`artista_asignado_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `peticiones_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `propuestas`;
CREATE TABLE `propuestas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `peticion_id` int(11) NOT NULL,
  `artista_id` int(11) NOT NULL,
  `mensaje` text DEFAULT NULL,
  `precio_oferta_mxn` decimal(10,2) NOT NULL,
  `tiempo_entrega_semanas` int(11) NOT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `artista_id` (`artista_id`),
  KEY `idx_propuestas_peticion` (`peticion_id`),
  CONSTRAINT `propuestas_ibfk_1` FOREIGN KEY (`peticion_id`) REFERENCES `peticiones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `propuestas_ibfk_2` FOREIGN KEY (`artista_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `pujas`;
CREATE TABLE `pujas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subasta_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `monto_mxn` decimal(10,2) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_puja` (`subasta_id`,`usuario_id`,`monto_mxn`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_pujas_subasta` (`subasta_id`),
  CONSTRAINT `pujas_ibfk_1` FOREIGN KEY (`subasta_id`) REFERENCES `subastas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pujas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=473 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `reglas_consumo`;
CREATE TABLE `reglas_consumo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accion` varchar(30) NOT NULL,
  `costo_tickets` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accion` (`accion`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `reglas_consumo` (`id`, `accion`, `costo_tickets`) VALUES
(1,	'publicar_subasta',	50),
(2,	'publicar_articulo',	30),
(3,	'publicar_catalogo',	10),
(4,	'publicar_peticion',	5),
(5,	'pujar',	6),
(6,	'propuesta',	5)
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`), `accion` = VALUES(`accion`), `costo_tickets` = VALUES(`costo_tickets`);

DROP TABLE IF EXISTS `resenas`;
CREATE TABLE `resenas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `autor_id` int(11) NOT NULL,
  `destinatario_id` int(11) NOT NULL,
  `compra_venta_id` int(11) NOT NULL,
  `compra_venta_tipo` varchar(20) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `comentario` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `autor_id` (`autor_id`),
  KEY `idx_resenas_destinatario` (`destinatario_id`),
  CONSTRAINT `resenas_ibfk_1` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resenas_ibfk_2` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`calificacion` >= 1 and `calificacion` <= 5)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `rol` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `rol` (`id_rol`, `rol`, `descripcion`, `fecha_creacion`) VALUES
(1,	'Administrador',	'Acceso total al sistema',	'2026-03-27 10:30:56'),
(2,	'Usuario',	'Acceso básico: ver, comprar, vender',	'2026-03-27 10:30:56'),
(3,	'Artista',	'Acceso para crear y vender obras',	'2026-03-27 10:30:56'),
(4,	'Moderador',	'Acceso para revisar y aprobar contenido',	'2026-03-27 10:30:56')
ON DUPLICATE KEY UPDATE `id_rol` = VALUES(`id_rol`), `rol` = VALUES(`rol`), `descripcion` = VALUES(`descripcion`), `fecha_creacion` = VALUES(`fecha_creacion`);

DROP TABLE IF EXISTS `rolxpermiso`;
CREATE TABLE `rolxpermiso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rol_permiso` (`id_rol`,`id_permiso`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `rolxpermiso_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `rolxpermiso_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `subastas`;
CREATE TABLE `subastas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_inicial_mxn` decimal(10,2) NOT NULL,
  `puja_minima_mxn` decimal(10,2) NOT NULL,
  `duracion_horas` int(11) NOT NULL DEFAULT 72,
  `foto1_url` longtext DEFAULT NULL,
  `foto2_url` longtext DEFAULT NULL,
  `foto3_url` longtext DEFAULT NULL,
  `video_url` longtext DEFAULT NULL,
  `documento_url` longtext DEFAULT NULL,
  `fecha_inicio` timestamp NULL DEFAULT NULL,
  `fecha_fin` timestamp NULL DEFAULT NULL,
  `puja_actual_mxn` decimal(10,2) DEFAULT 0.00,
  `categoria_id` int(11) DEFAULT NULL,
  `vendedor_id` int(11) NOT NULL,
  `ganador_id` int(11) DEFAULT NULL,
  `estado_id` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `pago_realizado` tinyint(1) DEFAULT 0,
  `fecha_pago` datetime DEFAULT NULL,
  `metodo_pago_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `ganador_id` (`ganador_id`),
  KEY `idx_subastas_vendedor` (`vendedor_id`),
  KEY `idx_subastas_estado` (`estado_id`),
  KEY `metodo_pago_id` (`metodo_pago_id`),
  CONSTRAINT `subastas_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `subastas_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subastas_ibfk_3` FOREIGN KEY (`ganador_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `subastas_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`),
  CONSTRAINT `subastas_ibfk_5` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `subastas_log`;
CREATE TABLE `subastas_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subasta_id` int(11) NOT NULL,
  `estado_anterior` int(11) DEFAULT NULL,
  `estado_nuevo` int(11) DEFAULT NULL,
  `fecha_cambio` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `subasta_id` (`subasta_id`),
  CONSTRAINT `subastas_log_ibfk_1` FOREIGN KEY (`subasta_id`) REFERENCES `subastas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `transacciones_financieras`;
CREATE TABLE `transacciones_financieras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo` varchar(20) NOT NULL,
  `monto_mxn` decimal(10,2) NOT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `referencia_tipo` varchar(20) DEFAULT NULL,
  `metodo_pago_id` int(11) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `metodo_pago_id` (`metodo_pago_id`),
  CONSTRAINT `transacciones_financieras_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `transacciones_financieras_ibfk_2` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `transacciones_tickets`;
CREATE TABLE `transacciones_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `concepto` varchar(100) NOT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `referencia_tipo` varchar(20) DEFAULT NULL,
  `tickets` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_transacciones_tickets_usuario` (`usuario_id`),
  CONSTRAINT `transacciones_tickets_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `interes` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `foto_perfil_url` text DEFAULT NULL,
  `twitter_handle` varchar(50) DEFAULT NULL,
  `instagram_handle` varchar(50) DEFAULT NULL,
  `facebook_handle` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `calificacion_promedio` decimal(2,1) DEFAULT 0.0,
  `total_resenas` int(11) DEFAULT 0,
  `saldo_tickets` int(11) DEFAULT 0,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_ultimo_acceso` timestamp NULL DEFAULT NULL,
  `estado_id` int(11) DEFAULT NULL,
  `id_rol` int(11) DEFAULT 2 COMMENT 'Por defecto rol de usuario normal (2)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `estado_id` (`estado_id`),
  KEY `idx_usuarios_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2026-04-14 00:43:12 UTC