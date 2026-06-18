-- Adminer 4.8.1 MySQL 10.4.32-MariaDB dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `banners_publicitarios`;
CREATE TABLE `banners_publicitarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) DEFAULT NULL,
  `imagen_url` text NOT NULL,
  `link_destino` text DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `precio_mxn` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `banners_publicitarios` (`id`, `titulo`, `imagen_url`, `link_destino`, `fecha_inicio`, `fecha_fin`, `precio_mxn`, `estado`) VALUES
(1,	'Clases de Pintura',	'/uploads/banners/banner_1777950850844-685862464.jpg',	NULL,	'2026-05-04',	'2027-12-31',	5000.00,	'activo'),
(2,	'Gatosss',	'/uploads/banners/banner_1777954310967-843505297.jpg',	NULL,	'2026-05-04',	'2028-01-01',	100000.00,	'activo'),
(3,	'Classssss',	'/uploads/banners/banner_1778115903804-516446869.jpg',	NULL,	'2026-05-06',	'2027-06-06',	99999999.99,	'activo');

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
  `fecha_publicacion` date DEFAULT (CURDATE()),
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `idx_catalogos_propietario` (`propietario_id`),
  CONSTRAINT `catalogos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `catalogos_ibfk_2` FOREIGN KEY (`propietario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`) VALUES
(1,	'Arte Visual',	'Pintura, dibujo, grabado y otras formas de arte visual'),
(2,	'Arte Digital',	'Ilustración digital, modelado 3D, NFT y arte generativo'),
(3,	'Fotografía',	'Fotografía artística, retrato, paisaje y fotografía conceptual'),
(4,	'Escultura',	'Esculturas en piedra, metal, madera y técnicas mixtas'),
(5,	'Artesanías',	'Artesanías tradicionales y contemporáneas'),
(6,	'Coleccionables',	'Figuras, ediciones limitadas y objetos de colección');

DROP TABLE IF EXISTS `configuracion_global`;
CREATE TABLE `configuracion_global` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` text DEFAULT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `configuracion_global` (`id`, `clave`, `valor`, `tipo`, `descripcion`) VALUES
(1,	'politicas_documento_url',	'/src/documento/politicas_1776121972315-110309783.pdf',	'texto',	NULL),
(2,	'politicas_documento_nombre',	'Ficha de pago.pdf',	'texto',	NULL),
(3,	'politicas_documento_fecha',	'2026-04-13 17:12:52',	'fecha',	NULL);

DROP TABLE IF EXISTS `estados`;
CREATE TABLE `estados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_estado` (`nombre`,`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `estados` (`id`, `nombre`, `tipo`) VALUES
(15,	'Aceptada',	'peticion'),
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
(16,	'Rechazada',	'peticion'),
(10,	'Rechazada',	'subasta'),
(6,	'Rechazado',	'articulo'),
(2,	'Suspendido',	'usuario'),
(5,	'Vendido',	'articulo');

DROP TABLE IF EXISTS `favoritos`;
CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `referencia_id` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorito` (`usuario_id`,`referencia_id`,`tipo`),
  KEY `idx_favoritos_usuario` (`usuario_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `paquetes_tickets`;
CREATE TABLE `paquetes_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `cantidad_tickets` int(11) NOT NULL,
  `tickets_extra` int(11) NOT NULL,
  `precio_mxn` decimal(10,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `paquetes_tickets` (`id`, `nombre`, `cantidad_tickets`, `tickets_extra`, `precio_mxn`, `descripcion`) VALUES
(1,	'Explorador',	50,	0,	119.00,	'Ideal para explorar la plataforma y hacer tus primeras publicaciones'),
(2,	'Coleccionista',	100,	30,	199.00,	'Perfecto para coleccionistas activos que participan en subastas'),
(3,	'Inversionista',	150,	80,	299.00,	'Para artistas y coleccionistas profesionales que publican frecuentemente');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(11,	'peticiones.crear',	'Crear Peticiones',	'Puede crear peticiones',	'peticiones',	'2026-03-27 10:30:56');

DROP TABLE IF EXISTS `peticiones`;
CREATE TABLE `peticiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `presupuesto_min_mxn` decimal(10,2) DEFAULT NULL,
  `presupuesto_max_mxn` decimal(10,2) DEFAULT NULL,
  `plazo_entrega_semanas` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `estilo` varchar(50) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `reglas_consumo`;
CREATE TABLE `reglas_consumo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accion` varchar(30) NOT NULL,
  `costo_tickets` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accion` (`accion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `reglas_consumo` (`id`, `accion`, `costo_tickets`) VALUES
(1,	'publicar_subasta',	50),
(2,	'publicar_articulo',	30),
(3,	'publicar_catalogo',	10),
(4,	'publicar_peticion',	5),
(5,	'pujar',	10),
(6,	'enviar_propuesta',	5);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `rol` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `rol` (`id_rol`, `rol`, `descripcion`, `fecha_creacion`) VALUES
(1,	'Administrador',	'Acceso total al sistema',	'2026-03-27 10:30:56'),
(2,	'Usuario',	'Acceso básico: ver, comprar, vender',	'2026-03-27 10:30:56'),
(3,	'Artista',	'Acceso para crear y vender obras',	'2026-03-27 10:30:56'),
(4,	'Moderador',	'Acceso para revisar y aprobar contenido',	'2026-03-27 10:30:56');

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
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `ganador_id` (`ganador_id`),
  KEY `idx_subastas_vendedor` (`vendedor_id`),
  KEY `idx_subastas_estado` (`estado_id`),
  CONSTRAINT `subastas_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `subastas_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subastas_ibfk_3` FOREIGN KEY (`ganador_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `subastas_ibfk_4` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2026-05-19 18:27:34
