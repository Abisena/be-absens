-- AlterTable
ALTER TABLE `absensi` ADD COLUMN `status` ENUM('Hadir', 'Sakit', 'Izin', 'Tugas', 'Tidak_ada_keterangan') NOT NULL DEFAULT 'Hadir';
