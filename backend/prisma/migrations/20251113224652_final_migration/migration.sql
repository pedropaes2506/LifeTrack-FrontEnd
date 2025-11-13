-- CreateTable
CREATE TABLE `tb_usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_usuario` VARCHAR(150) NOT NULL,
    `email_usuario` VARCHAR(255) NOT NULL,
    `senha_usuario` VARCHAR(255) NOT NULL,
    `cpf_usuario` CHAR(11) NOT NULL,
    `sexo_usuario` ENUM('M', 'F', 'O') NULL,
    `nivel_acesso` ENUM('USER', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'USER',
    `data_nasc_usuario` DATE NOT NULL,
    `data_criacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tb_usuario_email_usuario_key`(`email_usuario`),
    UNIQUE INDEX `tb_usuario_cpf_usuario_key`(`cpf_usuario`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_rotina` (
    `id_rotina` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_rotina` VARCHAR(100) NOT NULL,
    `meta_valor_padrao` INTEGER NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `data_criacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_modificacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tipo_unidade` ENUM('ML', 'HORAS', 'MINUTOS', 'UNIDADE', 'PASSOS') NOT NULL,

    UNIQUE INDEX `tb_rotina_nome_rotina_key`(`nome_rotina`),
    PRIMARY KEY (`id_rotina`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_adesao` (
    `id_adesao` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `rotina_id` INTEGER NOT NULL,
    `meta_pessoal_valor` DOUBLE NOT NULL,
    `data_adesao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status_adesao` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `tb_adesao_usuario_id_rotina_id_key`(`usuario_id`, `rotina_id`),
    PRIMARY KEY (`id_adesao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_registro_rotina` (
    `id_registro` INTEGER NOT NULL AUTO_INCREMENT,
    `adesao_id` INTEGER NOT NULL,
    `valor_registro` DOUBLE NOT NULL,
    `data_registro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `meta_cumprida` BOOLEAN NULL,

    PRIMARY KEY (`id_registro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_streak` (
    `id_streak` INTEGER NOT NULL AUTO_INCREMENT,
    `adesao_id` INTEGER NOT NULL,
    `contagem_atual` INTEGER NOT NULL DEFAULT 0,
    `data_inicio_streak` DATE NOT NULL,
    `data_ultimo_cumprimento` DATE NOT NULL,
    `data_modificacao` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tb_streak_adesao_id_key`(`adesao_id`),
    PRIMARY KEY (`id_streak`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_adesao` ADD CONSTRAINT `tb_adesao_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `tb_usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_adesao` ADD CONSTRAINT `tb_adesao_rotina_id_fkey` FOREIGN KEY (`rotina_id`) REFERENCES `tb_rotina`(`id_rotina`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_registro_rotina` ADD CONSTRAINT `tb_registro_rotina_adesao_id_fkey` FOREIGN KEY (`adesao_id`) REFERENCES `tb_adesao`(`id_adesao`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_streak` ADD CONSTRAINT `tb_streak_adesao_id_fkey` FOREIGN KEY (`adesao_id`) REFERENCES `tb_adesao`(`id_adesao`) ON DELETE RESTRICT ON UPDATE CASCADE;
