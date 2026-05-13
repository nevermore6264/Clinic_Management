/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bac_si`
--

DROP TABLE IF EXISTS `bac_si`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bac_si` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `bang_cap` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `chuyen_mon` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hoat_dong` bit(1) NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_nguoi_dung` bigint(20) DEFAULT NULL,
  `ma_chuyen_khoa` bigint(20) DEFAULT NULL,
  `ho_ten` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gioi_thieu` text COLLATE utf8_unicode_ci,
  `qua_trinh_cong_tac` text COLLATE utf8_unicode_ci,
  `thanh_tich_dat_duoc` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_528wdxnwhujoy5p66rkfanrpc` (`ma_nguoi_dung`),
  KEY `FKalfj6sw6fm095w9nuyjbeba6r` (`ma_chuyen_khoa`),
  CONSTRAINT `FKalfj6sw6fm095w9nuyjbeba6r` FOREIGN KEY (`ma_chuyen_khoa`) REFERENCES `chuyen_khoa` (`ma_chuyen_khoa`),
  CONSTRAINT `FKmmbe798j55hvfqf3mqcnmg05i` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bac_si`
--

LOCK TABLES `bac_si` WRITE;
/*!40000 ALTER TABLE `bac_si` DISABLE KEYS */;
INSERT INTO `bac_si` VALUES (1,'Bác sĩ đa khoa','2026-05-11 22:32:44.095970','Nội tổng quát',_binary '','2026-03-30 19:00:18.413355',3,1,NULL,NULL,NULL,NULL),(2,'Tiến sĩ','2026-05-02 18:16:32.037453',NULL,_binary '','2026-05-02 18:14:53.674536',6,8,NULL,NULL,NULL,NULL),(3,'Thạc sĩ','2026-05-02 18:23:15.659979',NULL,_binary '','2026-05-02 18:16:05.469015',7,4,NULL,NULL,NULL,NULL),(4,'Giáo sư','2026-05-11 08:21:11.960817',NULL,_binary '','2026-05-11 08:21:11.960817',NULL,1,'Trần Trung Dũng',NULL,NULL,NULL),(5,'Giáo sư, Tiến sĩ, Bác sĩ','2026-05-11 08:21:47.375290',NULL,_binary '','2026-05-11 08:21:47.375290',NULL,4,'Philippe Macaire',NULL,NULL,NULL),(6,'Thạc sĩ','2026-05-11 08:26:31.866454',NULL,_binary '','2026-05-11 08:26:31.866454',NULL,3,'Đào Xuân Cơ',NULL,NULL,NULL),(7,'Tiến sĩ - Bác Sĩ','2026-05-11 08:30:11.251797',NULL,_binary '','2026-05-11 08:30:11.251797',NULL,8,'Nguyễn Ngọc Đan',NULL,NULL,NULL),(8,'Tiến Sĩ - Bác Sĩ','2026-05-11 08:50:03.893170',NULL,_binary '','2026-05-11 08:49:26.791425',NULL,2,'Nguyễn Ngọc Cương','<p>2001 – 2007: Sinh viên trường Đại học Y Hà Nội</p><p>2007 – 2011: Bác sỹ nội trú bệnh viện Việt Đức, bệnh viện Bạch Mai</p><p>2010 – 2010: Bệnh viện Winterthur, Thụy Sỹ</p><p>2011 – 2014: Bệnh viện Trường Đại học Y Hà Nội</p><p>2014 – 2015: FFI Bệnh viện Hautte Pierre Strasbourg</p><p>2017 – 2020 : Nghiên cứu sinh chuyên ngành Chẩn đoán hình ảnh trường Đại học Y Hà Nội</p>','<p>2007 – 2008: Bác sỹ nội trú Chẩn đoán hình ảnh Bệnh viện Việt Đức</p><p>2008 – 2011: Bác sỹ nội trú Chẩn đoán hình ảnh Bệnh viện Bạch Mai</p><p>2011 – nay: Trưởng khoa Can thiệp điện quang, Trung tâm Chẩn đoán hình ảnh &amp; Can thiệp điện quang, Bệnh viện Đại học Y Hà Nội</p>','<p>– 2013: Bằng khen bộ trưởng Bộ Y tế: Hội thao sáng tạo tuổi trẻ ngành y tế khu vực Hà Nội đề tài: “Áp dụng kỹ thuật lấy máu tĩnh mạch vùng cổ định lượng PTH trên bệnh nhân cường cận giáp” (đề tài đạt giải nhất).</p><p>– 12.2013: Giấy khen của Hiệu trưởng trường Đại học Y Hà Nội về thành tích: đạt giải Ba trong “Hội nghị khoa học công nghệ tuổi trẻ trường đại học Y Hà Nội – 2013”</p><p>– 5.2014: Bằng khen của bí thư thứ nhất Trung ương đoàn TNCS Hồ Chí Minh: Giải nhất “Hội nghị khoa học công nghệ tuổi trẻ các trường Đại học, Cao đẳng Y dược Việt Nam lần thứ 1, năm 2014”</p><p>– 6.2014: Giấy khen của Hiệu trưởng trường Đại học Y Hà Nội về phong trào nghiên cứu khoa học</p><p>– 3/2017: Bằng khen của Bộ trưởng bộ Y tế: giải nhì hội thao kỹ thuật tuổi trẻ ngành y tế khu vực Hà Nội, đề tài “kỹ thuật tán sỏi thận qua da đường hầm nhỏ bằng laser dưới dướng dẫn của siêu âm”.</p><p>– 1/2020: Giấy khen Giám đốc bệnh viện Đại học Y Hà Nội khen thưởng “Cá nhân có thành tích xuất sắc của bệnh viện năm 2020”.</p>'),(9,'Bác Sĩ','2026-05-11 09:17:35.707815',NULL,_binary '','2026-05-11 09:17:35.707815',NULL,5,'Trần Quang Hưng','<p>- Đào tạo chuyên sâu tại Bệnh viện K Trung ương</p><p>- Đào tạo chuyên sâu tại Bệnh viện Hữu nghị Việt Tiệp</p><p>- 2021: Tốt nghiệp Thạc sĩ Đại học Y dược Hải Phòng</p>','<p>- 2015 - 2018: Khám chữa bệnh nội khoa, trực hồi sức cấp cứu - Bệnh viện Đa Khoa Mỹ Đức</p><p>- 2018 - 2020: Khám chữa bệnh nội khoa, hồi sức cấp cứu, nội soi tiêu hóa - Bệnh viện Đa khoa Phúc Lâm</p><p>- 2020 - 2021: Khám chữa bệnh nội khoa, hồi sức cấp cứu, nội soi tiêu hóa - Bệnh viện Đa Khoa Mỹ Đức</p><p>- 12/ 2021 - 8/2022: Khám chữa bệnh nội tiêu hóa, nội soi&nbsp;tiêu hóa - Bệnh viện Đa Khoa Hà Đông</p><p>- 9/2022 - 3/2023: Trưởng khoa hồi sức cấp cứu,&nbsp;Trưởng&nbsp;phòng&nbsp;nội&nbsp;soi tiêu hóa - Bệnh viện Đa khoa Phúc Lâm</p><p>- 4/2023 - 4/2024: Phó&nbsp;trưởng khoa Nội,&nbsp;Phó trưởng trung tâm nội soi - Bệnh viện Đa&nbsp;khoa Hà Nội – Đồng Văn</p><p>- 4/2024 - nay: Phụ trách phòng nội soi - CTCP Bệnh viện Quốc tế Vĩnh Phúc</p>','<p>- Hơn 10 năm kinh nghiệm về Nội soi chẩn đoán và can thiệp ung thư sớm đường Tiêu hoá</p><p>- Trưởng phòng nội soi Tiêu hóa Bệnh viện Đa khoa Phúc Lâm</p><p>- Nguyên Phó trưởng Trung tâm nội soi Bệnh viện Đa khoa Hà Nội</p>');
/*!40000 ALTER TABLE `bac_si` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `benh_nhan`
--

DROP TABLE IF EXISTS `benh_nhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benh_nhan` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `dia_chi` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ho_ten` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `hoat_dong` bit(1) NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `so_dien_thoai` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `thu_dien_tu` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ma_nguoi_dung` bigint(20) DEFAULT NULL,
  `di_ung` text COLLATE utf8_unicode_ci,
  `gioi_tinh` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nghe_nghiep` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nguoi_lien_he` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nhom_mau` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_cccd` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_dien_thoai_lien_he` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tien_su_benh` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_k89grjswul1ry1s51ug4ehpr3` (`ma_nguoi_dung`),
  CONSTRAINT `FKp5ept7omm9jkiip0srijh2k41` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benh_nhan`
--

LOCK TABLES `benh_nhan` WRITE;
/*!40000 ALTER TABLE `benh_nhan` DISABLE KEYS */;
INSERT INTO `benh_nhan` VALUES (1,'2026-05-02 13:48:23.068661','303 Lưu Văn Lang Hoà Hải Ngũ Hành Sơn Đà Nẵng','Nguyễn Văn Hiếu',_binary '','1997-03-14','0862478150','2026-04-30 22:01:26.103552','hieupikas2606@gmail.com',NULL,'Không','NAM','Nhân viên văn phòng','Tướng Thị Quế','A','168570382','0364982843','Không'),(2,'2026-05-02 18:30:01.762705','','Nguyễn Văn Quý',_binary '',NULL,'0364982843','2026-04-30 22:01:43.511145','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'2026-05-02 18:30:09.078467','','Phạm Văn Khoa',_binary '',NULL,'0984452108','2026-04-30 22:26:51.825181','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'2026-05-11 11:22:25.080740','Số 24 Trần Phú, Phường Hải Châu 1, Quận Hải Châu, TP. Đà Nẵng','Tướng Thị Quế',_binary '','2004-06-20','0364982843','2026-05-11 06:52:46.529828','nevermore6264@gmail.com',9,'Hải sản, đậu phộng, trứng, sữa.','NU','Thu ngân siêu thị','Tướng Chí Vỹ','A','168570382','0984452108','Cao huyết áp, đái tháo đường, bệnh tim mạch, hen suyễn, bệnh gan/thận....Thời gian phát hiện và phương pháp điều trị.'),(5,'2026-05-11 07:51:43.663492','','Trần Văn Vinh',_binary '',NULL,'','2026-05-11 07:51:43.663492','',NULL,'','','','','','','',''),(6,'2026-05-11 07:51:55.050083','','Nguyễn Văn Thoại',_binary '',NULL,'','2026-05-11 07:51:55.050083','',NULL,'','','','','','','',''),(7,'2026-05-11 07:52:03.792738','','Đào Văn Dũng',_binary '',NULL,'','2026-05-11 07:52:03.792738','',NULL,'','','','','','','',''),(8,'2026-05-11 07:52:15.624951','','Nguyễn Đăng Hải Hoàng',_binary '',NULL,'','2026-05-11 07:52:15.624951','',NULL,'','','','','','','',''),(9,'2026-05-11 07:55:41.551791','','Ngô Văn Đức',_binary '',NULL,'','2026-05-11 07:55:41.551791','',NULL,'','','','','','','',''),(10,'2026-05-11 07:55:55.855485','','Chế Văn Hoàng',_binary '',NULL,'','2026-05-11 07:55:55.855485','',NULL,'','','','','','','',''),(11,'2026-05-11 07:58:23.665901','','Lương Ngọc Hùng',_binary '',NULL,'','2026-05-11 07:58:23.665901','',NULL,'','','','','','','',''),(12,'2026-05-11 07:59:58.471664','','Bùi Thị Minh Quý',_binary '',NULL,'','2026-05-11 07:59:58.471664','',NULL,'','','','','','','',''),(13,'2026-05-11 19:33:10.721294','','Trần Võ Thành Nhân',_binary '',NULL,'','2026-05-11 19:33:10.721294','',NULL,'','','','','','','',''),(14,'2026-05-11 19:33:33.943842','','Lưu Diệp Phàm',_binary '',NULL,'','2026-05-11 19:33:33.943842','',NULL,'','','','','','','',''),(15,'2026-05-11 19:33:48.490868','','Âu Chúc Thanh Phương',_binary '',NULL,'','2026-05-11 19:33:48.490868','',NULL,'','','','','','','',''),(16,'2026-05-11 19:33:57.828628','','Nghệ Mạn Thiên',_binary '',NULL,'','2026-05-11 19:33:57.828628','',NULL,'','','','','','','',''),(17,'2026-05-11 19:34:07.669735','','Lưu Văn Châu Kỳ',_binary '',NULL,'','2026-05-11 19:34:07.669735','',NULL,'','','','','','','',''),(18,'2026-05-11 19:34:59.760996','','Phạm Thiên Kim',_binary '',NULL,'','2026-05-11 19:34:59.760996','',NULL,'','','','','','','',''),(19,'2026-05-11 19:35:30.359600','','Phạm Ngọc Mai',_binary '',NULL,'','2026-05-11 19:35:30.359600','',NULL,'','','','','','','',''),(20,'2026-05-11 19:35:37.447585','','Nguyễn Uyển Dư',_binary '',NULL,'','2026-05-11 19:35:37.447585','',NULL,'','','','','','','',''),(21,'2026-05-11 19:35:44.396580','','Hồ Hiếu An',_binary '',NULL,'','2026-05-11 19:35:44.396580','',NULL,'','','','','','','',''),(22,'2026-05-11 19:35:51.454748','','Lý Đăng Khoa',_binary '',NULL,'','2026-05-11 19:35:51.454748','',NULL,'','','','','','','',''),(23,'2026-05-11 19:35:58.828435','','Trần Thanh Phong',_binary '',NULL,'','2026-05-11 19:35:58.828435','',NULL,'','','','','','','',''),(24,'2026-05-11 19:36:17.549329','','Nguyễn Anh Khôi',_binary '',NULL,'','2026-05-11 19:36:17.549329','',NULL,'','','','','','','','');
/*!40000 ALTER TABLE `benh_nhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cau_hinh_nhac_lich`
--

DROP TABLE IF EXISTS `cau_hinh_nhac_lich`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cau_hinh_nhac_lich` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `bat_thu_dien_tu` bit(1) DEFAULT NULL,
  `bat_tin_nhan` bit(1) DEFAULT NULL,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `so_gio_truoc` int(11) NOT NULL,
  `so_ngay_truoc` int(11) NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cau_hinh_nhac_lich`
--

LOCK TABLES `cau_hinh_nhac_lich` WRITE;
/*!40000 ALTER TABLE `cau_hinh_nhac_lich` DISABLE KEYS */;
/*!40000 ALTER TABLE `cau_hinh_nhac_lich` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_don_thuoc`
--

DROP TABLE IF EXISTS `chi_tiet_don_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_don_thuoc` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `don_gia` decimal(15,2) DEFAULT NULL,
  `lieu_dung` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_luong` int(11) NOT NULL,
  `ma_ho_so_kham` bigint(20) NOT NULL,
  `ma_thuoc` bigint(20) NOT NULL,
  `ma_don_thuoc` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcl6odejgr99y2hydvtkia4mbi` (`ma_ho_so_kham`),
  KEY `FKel5h0l6cue78wbo96t36srrtf` (`ma_thuoc`),
  CONSTRAINT `FKcl6odejgr99y2hydvtkia4mbi` FOREIGN KEY (`ma_ho_so_kham`) REFERENCES `ho_so_kham` (`id`),
  CONSTRAINT `FKel5h0l6cue78wbo96t36srrtf` FOREIGN KEY (`ma_thuoc`) REFERENCES `thuoc` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_don_thuoc`
--

LOCK TABLES `chi_tiet_don_thuoc` WRITE;
/*!40000 ALTER TABLE `chi_tiet_don_thuoc` DISABLE KEYS */;
INSERT INTO `chi_tiet_don_thuoc` VALUES (10,0.00,'Sau ăn',1,1,1,0),(11,0.00,'Sau ăn',1,1,2,0),(12,0.00,'Trước ăn',1,1,3,0),(13,0.00,'Sau ăn',1,2,1,0);
/*!40000 ALTER TABLE `chi_tiet_don_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_hoa_don`
--

DROP TABLE IF EXISTS `chi_tiet_hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_hoa_don` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `don_gia` decimal(15,2) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `thanh_tien` decimal(15,2) NOT NULL,
  `ma_dich_vu` bigint(20) NOT NULL,
  `ma_hoa_don` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcosd9dsdme9663m1ors1jkqux` (`ma_dich_vu`),
  KEY `FKk49dolcd69qi88u6a25i9x2e` (`ma_hoa_don`),
  CONSTRAINT `FKcosd9dsdme9663m1ors1jkqux` FOREIGN KEY (`ma_dich_vu`) REFERENCES `dich_vu` (`id`),
  CONSTRAINT `FKk49dolcd69qi88u6a25i9x2e` FOREIGN KEY (`ma_hoa_don`) REFERENCES `hoa_don` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_hoa_don`
--

LOCK TABLES `chi_tiet_hoa_don` WRITE;
/*!40000 ALTER TABLE `chi_tiet_hoa_don` DISABLE KEYS */;
INSERT INTO `chi_tiet_hoa_don` VALUES (1,150000.00,1,150000.00,1,1),(2,180000.00,1,180000.00,3,1),(3,180000.00,1,180000.00,3,3);
/*!40000 ALTER TABLE `chi_tiet_hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chuyen_khoa`
--

DROP TABLE IF EXISTS `chuyen_khoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuyen_khoa` (
  `ma_chuyen_khoa` bigint(20) NOT NULL AUTO_INCREMENT,
  `ten_chuyen_khoa` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuyen_khoa`
--

LOCK TABLES `chuyen_khoa` WRITE;
/*!40000 ALTER TABLE `chuyen_khoa` DISABLE KEYS */;
INSERT INTO `chuyen_khoa` VALUES (1,'Da liễu'),(2,'Nội tổng quát'),(3,'Ngoại khoa'),(4,'Mắt'),(5,'Tai Mũi Họng'),(6,'Răng Hàm Mặt'),(7,'Sản phụ khoa'),(8,'Nhi khoa');
/*!40000 ALTER TABLE `chuyen_khoa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dich_vu`
--

DROP TABLE IF EXISTS `dich_vu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dich_vu` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `gia` decimal(15,2) NOT NULL,
  `hoat_dong` bit(1) NOT NULL,
  `mo_ta` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `ma_loai_dich_vu` bigint(20) DEFAULT NULL,
  `ma_chuyen_khoa` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7oi64ccvace8kk9h4wqw2dey` (`ma_loai_dich_vu`),
  KEY `FK7ymfs6miv7ryuqnsgrw5h5ewk` (`ma_chuyen_khoa`),
  CONSTRAINT `FK7oi64ccvace8kk9h4wqw2dey` FOREIGN KEY (`ma_loai_dich_vu`) REFERENCES `loai_dich_vu` (`ma_loai_dich_vu`),
  CONSTRAINT `FK7ymfs6miv7ryuqnsgrw5h5ewk` FOREIGN KEY (`ma_chuyen_khoa`) REFERENCES `chuyen_khoa` (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dich_vu`
--

LOCK TABLES `dich_vu` WRITE;
/*!40000 ALTER TABLE `dich_vu` DISABLE KEYS */;
INSERT INTO `dich_vu` VALUES (1,'2026-05-10 13:10:28.697222',150000.00,_binary '','Khám lâm sàng ban đầu, tư vấn hướng xử trí','2026-04-29 18:25:03.569315','Khám tổng quát',1,2),(2,'2026-04-29 18:25:28.182173',200000.00,_binary '','Khám chuyên khoa nội cho bệnh lý thường gặp\n','2026-04-29 18:25:28.182173','Khám nội tổng quát',1,2),(3,'2026-04-29 18:25:40.461472',180000.00,_binary '','Khám bệnh cho trẻ em\n','2026-04-29 18:25:40.461472','Khám nhi',1,8),(4,'2026-04-29 18:25:54.488173',220000.00,_binary '','Khám và tư vấn điều trị TMH\n','2026-04-29 18:25:54.488173','Khám tai mũi họng',1,5),(5,'2026-04-29 18:26:07.102598',220000.00,_binary '','Khám các bệnh lý da liễu cơ bản\n','2026-04-29 18:26:07.102598','Khám da liễu',1,1),(6,'2026-04-29 18:26:31.190999',120000.00,_binary '','Đánh giá hồng cầu, bạch cầu, tiểu cầu\n','2026-04-29 18:26:31.190999','Công thức máu (CBC)',2,2),(7,'2026-04-29 18:26:58.157430',70000.00,_binary '','Định lượng glucose máu\n','2026-04-29 18:26:46.428611','Đường huyết',2,2),(8,'2026-04-29 18:32:07.426149',100000.00,_binary '','Khám tái khám\n','2026-04-29 18:31:38.824636','Khám tái khám',1,2),(9,'2026-04-29 20:33:01.126652',400000.00,_binary '','Tiểu phẫu loại bỏ u bã đậu, nốt ruồi, mụn thịt, sinh thiết da. ','2026-04-29 20:33:01.126652','Thủ thuật da liễu',10,1),(10,'2026-04-29 20:33:22.654417',1000000.00,_binary '','Laser điều trị sắc tố, xóa xăm, trẻ hóa da, điều trị sẹo, chăm sóc da chuyên sâu.','2026-04-29 20:33:22.654417','Chăm sóc và Thẩm mỹ da',10,1),(11,'2026-05-12 16:43:58.059574',2000.00,_binary '','Dịch vụ lấy ráy tai','2026-05-12 16:43:58.059574','Dịch vụ lấy ráy tai',17,5),(12,'2026-05-13 01:56:52.000000',250000.00,_binary '','Theo dõi thai, siêu âm thai cơ bản, tư vấn dinh dưỡng thai kỳ','2026-05-13 01:56:52.000000','Khám sản khoa thai',1,7),(13,'2026-05-13 01:56:52.000000',280000.00,_binary '','Khám tầm soát bệnh lý tim mạch, huyết áp, nhịp tim','2026-05-13 01:56:52.000000','Khám tim mạch',1,2),(14,'2026-05-13 01:56:52.000000',260000.00,_binary '','Tư vấn và khám các bệnh dạ dày, gan, đường ruột','2026-05-13 01:56:52.000000','Khám tiêu hóa - gan mật',1,2),(15,'2026-05-13 01:56:52.000000',240000.00,_binary '','Đau lưng, khớp gối, viêm khớp, thoái hóa','2026-05-13 01:56:52.000000','Khám cơ xương khớp',1,3),(16,'2026-05-13 01:56:52.000000',200000.00,_binary '','Thị lực, nhãn áp, đáy mắt sơ bộ','2026-05-13 01:56:52.000000','Khám mắt tổng quát',1,4),(17,'2026-05-13 01:56:52.000000',350000.00,_binary '','GOT, GPT, creatinine, ure, điện giải đồ','2026-05-13 01:56:52.000000','Sinh hóa máu cơ bản',2,2),(18,'2026-05-13 01:56:52.000000',180000.00,_binary '','Đánh giá đường huyết trung bình 2–3 tháng','2026-05-13 01:56:52.000000','HbA1c',2,2),(19,'2026-05-13 01:56:52.000000',90000.00,_binary '','Protein, glucose, bạch cầu, nitrite…','2026-05-13 01:56:52.000000','Tổng phân tích nước tiểu',2,2),(20,'2026-05-13 01:56:52.000000',160000.00,_binary '','Sàng lọc cường/nhược giáp','2026-05-13 01:56:52.000000','Xét nghiệm chức năng tuyến giáp (TSH)',2,2),(21,'2026-05-13 01:56:52.000000',200000.00,_binary '','Trước thủ thuật hoặc theo chỉ định','2026-05-13 01:56:52.000000','Đông máu (PT, APTT)',2,2),(22,'2026-05-13 01:56:52.000000',120000.00,_binary '','Chụp X-quang phổi theo chỉ định','2026-05-13 01:56:52.000000','X-quang ngực thẳng/nghiêng',3,2),(23,'2026-05-13 01:56:52.000000',280000.00,_binary '','Gan, mật, tụy, thận, lách…','2026-05-13 01:56:52.000000','Siêu âm ổ bụng tổng quát',3,2),(24,'2026-05-13 01:56:52.000000',320000.00,_binary '','Theo dõi thai sớm','2026-05-13 01:56:52.000000','Siêu âm thai nhi trong 3 tháng đầu',3,7),(25,'2026-05-13 01:56:52.000000',2500000.00,_binary '','Giá tham khảo — theo chỉ định bác sĩ và vùng chụp','2026-05-13 01:56:52.000000','CT Scanner (theo vùng)',3,3),(26,'2026-05-13 01:56:52.000000',4500000.00,_binary '','Cộng hưởng từ — giá tham khảo','2026-05-13 01:56:52.000000','MRI (theo vùng)',3,3),(27,'2026-05-13 01:56:52.000000',80000.00,_binary '','Tháo chỉ sau phẫu thuật/thủ thuật','2026-05-13 01:56:52.000000','Cắt chỉ tại phòng khám',4,3),(28,'2026-05-13 01:56:52.000000',450000.00,_binary '','Xử trí áp-xe nông theo chỉ định','2026-05-13 01:56:52.000000','Dẫn lưu áp-xe nhỏ',4,3),(29,'2026-05-13 01:56:52.000000',550000.00,_binary '','Tham khám đường thở trên','2026-05-13 01:56:52.000000','Nội soi tai mũi họng',4,5),(30,'2026-05-13 01:56:52.000000',350000.00,_binary '','Tiêm theo mùa và chỉ định','2026-05-13 01:56:52.000000','Vaccine cúm mùa (inactivated)',5,8),(31,'2026-05-13 01:56:52.000000',180000.00,_binary '','Theo lịch tiêm chủng mở rộng / người lớn','2026-05-13 01:56:52.000000','Vaccine viêm gan B (mũi đơn)',5,8),(32,'2026-05-13 01:56:52.000000',120000.00,_binary '','Sau vết thương hở — theo chỉ định','2026-05-13 01:56:52.000000','Uốn ván (TT)',5,3),(33,'2026-05-13 01:56:52.000000',150000.00,_binary '','Ghi nhận nhịp tim, thiếu máu cục bộ','2026-05-13 01:56:52.000000','Điện tim (ECG) 12 chuyển đạo',7,2),(34,'2026-05-13 01:56:52.000000',1200000.00,_binary '','Theo dõi rối loạn nhịp theo chỉ định','2026-05-13 01:56:52.000000','Holter tim 24h',7,2),(35,'2026-05-13 01:56:52.000000',380000.00,_binary '','Đánh giá hạn chế luồng khí','2026-05-13 01:56:52.000000','Đo chức năng hô hấp (spirometry)',7,2),(36,'2026-05-13 01:56:52.000000',300000.00,_binary '','Theo dõi thai theo tuần','2026-05-13 01:56:52.000000','Siêu âm thai hệ thống',9,7),(37,'2026-05-13 01:56:52.000000',280000.00,_binary '','Tầm soát viêm nhiễm, u xơ tử cung','2026-05-13 01:56:52.000000','Khám phụ khoa định kỳ',9,7),(38,'2026-05-13 01:56:52.000000',500000.00,_binary '','Theo dõi sản khoa tại cơ sở','2026-05-13 01:56:52.000000','Theo dõi chuyển dạ',9,7),(39,'2026-05-13 01:56:52.000000',600000.00,_binary '','Theo liệu trình bác sĩ da liễu','2026-05-13 01:56:52.000000','Điều trị mụn trứng cá bằng peel',10,1),(40,'2026-05-13 01:56:52.000000',250000.00,_binary '','Khám và kê thuốc bôi/uống','2026-05-13 01:56:52.000000','Điều trị nấm da, eczema',10,1),(41,'2026-05-13 01:56:52.000000',500000.00,_binary '','Tham vấn phương án can thiệp','2026-05-13 01:56:52.000000','Tư vấn chỉnh hình thẩm mỹ',13,3),(42,'2026-05-12 22:45:31.954524',1500000.00,_binary '','Cắt bỏ u mỡ nhỏ tại phòng khám','2026-05-13 01:56:52.000000','Tiểu phẫu u mềm',13,3),(43,'2026-05-13 01:56:52.000000',300000.00,_binary '','Vệ sinh răng miệng định kỳ','2026-05-13 01:56:52.000000','Cạo vôi răng + đánh bóng',14,6),(44,'2026-05-13 01:56:52.000000',450000.00,_binary '','Trám composite răng cửa/hàm nhỏ','2026-05-13 01:56:52.000000','Trám răng thẩm mỹ',14,6),(45,'2026-05-13 01:56:52.000000',1200000.00,_binary '','Theo chỉ định và X-quang','2026-05-13 01:56:52.000000','Nhổ răng khôn đơn giản',14,6),(46,'2026-05-13 01:56:52.000000',350000.00,_binary '','Ổn định hô hấp, cầm máu, sốc nhẹ','2026-05-13 01:56:52.000000','Sơ cứu và xử trí cấp cứu ban đầu',15,3),(47,'2026-05-13 01:56:52.000000',250000.00,_binary '','Theo chỉ định bác sĩ','2026-05-13 01:56:52.000000','Tiêm truyền dịch tại phòng khám',15,2),(48,'2026-05-13 01:56:52.000000',450000.00,_binary '','Đo HA, đường huyết, thay băng đơn giản','2026-05-13 01:56:52.000000','Y tá thăm khám tại nhà (nội thành)',16,2),(49,'2026-05-13 01:56:52.000000',200000.00,_binary '','Theo chỉ định và gói xét nghiệm','2026-05-13 01:56:52.000000','Lấy máu xét nghiệm tại nhà',16,2),(50,'2026-05-13 01:56:52.000000',3500000.00,_binary '','Theo chỉ định và phác đồ gây tê','2026-05-13 01:56:52.000000','Nội soi dạ dày không đau (gây tê)',17,2),(51,'2026-05-13 01:56:52.000000',5000000.00,_binary '','Giá tham khảo — theo tình huống cấp cứu','2026-05-13 01:56:52.000000','Đặt nội khí quản / can thiệp hô hấp (chuyên khoa)',17,3);
/*!40000 ALTER TABLE `dich_vu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `don_thuoc`
--

DROP TABLE IF EXISTS `don_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_thuoc` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `noi_dung` text COLLATE utf8_unicode_ci,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_ho_so_kham` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_2v40hovd5j3k1v5399a93tpc2` (`ma_ho_so_kham`),
  CONSTRAINT `FKrwxwljx6mubt2633nbc5cdl7t` FOREIGN KEY (`ma_ho_so_kham`) REFERENCES `ho_so_kham` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_thuoc`
--

LOCK TABLES `don_thuoc` WRITE;
/*!40000 ALTER TABLE `don_thuoc` DISABLE KEYS */;
INSERT INTO `don_thuoc` VALUES (1,'2026-05-02 18:46:22.569234','Tuần 7 lần','2026-05-02 18:46:06.924128',1),(2,'2026-05-02 20:32:13.095748','Không','2026-05-02 20:32:13.095748',2);
/*!40000 ALTER TABLE `don_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giao_dich_thanh_toan`
--

DROP TABLE IF EXISTS `giao_dich_thanh_toan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giao_dich_thanh_toan` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ghi_chu` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `luc_thanh_toan` datetime(6) DEFAULT NULL,
  `ma_tham_chieu` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phuong_thuc` enum('TIEN_MAT','THE','CHUYEN_KHOAN','TRUC_TUYEN') COLLATE utf8_unicode_ci NOT NULL,
  `so_tien` decimal(15,2) NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_hoa_don` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKn9effvo3ncwqa58gyyyyme748` (`ma_hoa_don`),
  CONSTRAINT `FKn9effvo3ncwqa58gyyyyme748` FOREIGN KEY (`ma_hoa_don`) REFERENCES `hoa_don` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giao_dich_thanh_toan`
--

LOCK TABLES `giao_dich_thanh_toan` WRITE;
/*!40000 ALTER TABLE `giao_dich_thanh_toan` DISABLE KEYS */;
INSERT INTO `giao_dich_thanh_toan` VALUES (1,NULL,'2026-05-02 19:20:41.638637',NULL,'TIEN_MAT',330000.00,'2026-05-02 19:20:41.638637',1);
/*!40000 ALTER TABLE `giao_dich_thanh_toan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ho_so_kham`
--

DROP TABLE IF EXISTS `ho_so_kham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ho_so_kham` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `chan_doan` text COLLATE utf8_unicode_ci,
  `don_thuoc` text COLLATE utf8_unicode_ci,
  `ghi_chu` text COLLATE utf8_unicode_ci,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_lich_hen` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cqq8dw4gppaqjmuwdol7tvi8l` (`ma_lich_hen`),
  CONSTRAINT `FKlb04etpbagv4q3nskyye4e5sl` FOREIGN KEY (`ma_lich_hen`) REFERENCES `lich_hen` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ho_so_kham`
--

LOCK TABLES `ho_so_kham` WRITE;
/*!40000 ALTER TABLE `ho_so_kham` DISABLE KEYS */;
INSERT INTO `ho_so_kham` VALUES (1,'2026-05-02 18:46:22.569234','Viêm da cơ địa','Tuần 7 lần','Không','2026-05-02 18:46:06.924128',1),(2,'2026-05-02 20:32:13.095748','Sâu răng','Không','Không','2026-05-02 20:32:13.095748',2);
/*!40000 ALTER TABLE `ho_so_kham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `so_hoa_don` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_tien_da_tra` decimal(15,2) NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `tong_tien` decimal(15,2) NOT NULL,
  `trang_thai` enum('CHO_THANH_TOAN','MOT_PHAN','DA_THANH_TOAN','HUY') COLLATE utf8_unicode_ci NOT NULL,
  `ma_benh_nhan` bigint(20) NOT NULL,
  `ma_lich_hen` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_256fcldrfdnquqft2h46wjyqf` (`ma_lich_hen`),
  KEY `FKlrjsa6evj8wj1q4rqcifme2hf` (`ma_benh_nhan`),
  CONSTRAINT `FK9mtn33pej1vxmos28jxcscv65` FOREIGN KEY (`ma_lich_hen`) REFERENCES `lich_hen` (`id`),
  CONSTRAINT `FKlrjsa6evj8wj1q4rqcifme2hf` FOREIGN KEY (`ma_benh_nhan`) REFERENCES `benh_nhan` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don`
--

LOCK TABLES `hoa_don` WRITE;
/*!40000 ALTER TABLE `hoa_don` DISABLE KEYS */;
INSERT INTO `hoa_don` VALUES (1,'2026-05-02 19:20:41.686606','HD-1777748931198',330000.00,'2026-05-02 19:08:51.198420',330000.00,'DA_THANH_TOAN',1,1),(3,'2026-05-02 20:36:00.566186','HD-1777754160556',0.00,'2026-05-02 20:36:00.556188',180000.00,'CHO_THANH_TOAN',2,2);
/*!40000 ALTER TABLE `hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_hen`
--

DROP TABLE IF EXISTS `lich_hen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_hen` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `ghi_chu` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gio_hen` time(6) NOT NULL,
  `ngay_hen` date NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `trang_thai` enum('DA_DAT','DA_TIEP_NHAN','DANG_KHAM','XET_NGHIEM','DA_KE_DON','CHO_THANH_TOAN','DA_THANH_TOAN','HUY','VANG') COLLATE utf8_unicode_ci NOT NULL,
  `ma_bac_si` bigint(20) NOT NULL,
  `ma_benh_nhan` bigint(20) NOT NULL,
  `ma_dich_vu` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK14y4w4a4rs2x9yjwf02e6rhm4` (`ma_bac_si`),
  KEY `FK86nvsujvgwkrbud0vjuog5bpo` (`ma_benh_nhan`),
  KEY `FKbwl9gbpyfiheog25lkxh3y6nh` (`ma_dich_vu`),
  CONSTRAINT `FK14y4w4a4rs2x9yjwf02e6rhm4` FOREIGN KEY (`ma_bac_si`) REFERENCES `bac_si` (`id`),
  CONSTRAINT `FK86nvsujvgwkrbud0vjuog5bpo` FOREIGN KEY (`ma_benh_nhan`) REFERENCES `benh_nhan` (`id`),
  CONSTRAINT `FKbwl9gbpyfiheog25lkxh3y6nh` FOREIGN KEY (`ma_dich_vu`) REFERENCES `dich_vu` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_hen`
--

LOCK TABLES `lich_hen` WRITE;
/*!40000 ALTER TABLE `lich_hen` DISABLE KEYS */;
INSERT INTO `lich_hen` VALUES (1,'2026-05-03 08:44:06.521471',NULL,'08:00:00.000000','2026-05-02','2026-05-02 16:36:12.109381','CHO_THANH_TOAN',1,1,1),(2,'2026-05-02 20:36:00.565204',NULL,'08:00:00.000000','2026-05-02','2026-05-02 20:27:46.534410','DA_THANH_TOAN',3,2,3),(3,'2026-05-12 16:48:38.488257',NULL,'08:00:00.000000','2026-05-11','2026-05-11 09:25:29.296852','VANG',1,4,2),(4,'2026-05-12 05:00:00.031633',NULL,'07:30:00.000000','2026-05-12','2026-05-11 22:44:31.525597','VANG',2,24,3),(5,'2026-05-12 05:00:00.031633',NULL,'07:30:00.000000','2026-05-12','2026-05-11 22:44:46.201997','VANG',7,23,3),(6,'2026-05-12 05:00:00.031633',NULL,'07:30:00.000000','2026-05-12','2026-05-11 22:45:20.006236','VANG',4,22,9),(7,'2026-05-12 16:46:28.058102',NULL,'16:00:00.000000','2026-05-13','2026-05-11 22:47:44.775613','DA_TIEP_NHAN',8,5,1),(8,'2026-05-13 00:45:41.184335','Tai bị bẩn\n','07:30:00.000000','2026-05-13','2026-05-12 16:47:44.781915','VANG',6,2,11),(9,'2026-05-13 08:15:41.176183',NULL,'15:00:00.000000','2026-05-13','2026-05-12 22:55:31.794046','VANG',1,19,10);
/*!40000 ALTER TABLE `lich_hen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_lam_viec_bac_si`
--

DROP TABLE IF EXISTS `lich_lam_viec_bac_si`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_lam_viec_bac_si` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `khung_gio_bat_dau` time(6) NOT NULL,
  `khung_gio_ket_thuc` time(6) NOT NULL,
  `ngay_lich` date NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_bac_si` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKocsw8gdiax88ia6km8bscqld3` (`ma_bac_si`,`ngay_lich`,`khung_gio_bat_dau`),
  CONSTRAINT `FK5te1d9qlhubo98nimcemlt0mj` FOREIGN KEY (`ma_bac_si`) REFERENCES `bac_si` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_lam_viec_bac_si`
--

LOCK TABLES `lich_lam_viec_bac_si` WRITE;
/*!40000 ALTER TABLE `lich_lam_viec_bac_si` DISABLE KEYS */;
/*!40000 ALTER TABLE `lich_lam_viec_bac_si` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_lam_viec_co_dinh`
--

DROP TABLE IF EXISTS `lich_lam_viec_co_dinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_lam_viec_co_dinh` (
  `ma_lich_co_dinh` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `khung_gio_bat_dau` time(6) DEFAULT NULL,
  `khung_gio_ket_thuc` time(6) DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `thu_trong_tuan` int(11) DEFAULT NULL,
  `ma_bac_si` bigint(20) NOT NULL,
  `gia_ca` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`ma_lich_co_dinh`),
  KEY `FKn3ewmvt6u1oc3cmyuvc5nr08m` (`ma_bac_si`),
  CONSTRAINT `FKn3ewmvt6u1oc3cmyuvc5nr08m` FOREIGN KEY (`ma_bac_si`) REFERENCES `bac_si` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_lam_viec_co_dinh`
--

LOCK TABLES `lich_lam_viec_co_dinh` WRITE;
/*!40000 ALTER TABLE `lich_lam_viec_co_dinh` DISABLE KEYS */;
INSERT INTO `lich_lam_viec_co_dinh` VALUES (13,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,2,NULL),(14,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,2,NULL),(15,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,2,NULL),(16,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,2,NULL),(17,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,2,NULL),(18,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,2,NULL),(19,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,2,NULL),(20,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,2,NULL),(21,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,2,NULL),(22,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,2,NULL),(23,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,2,NULL),(24,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,2,NULL),(25,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,3,NULL),(26,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,3,NULL),(27,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,3,NULL),(28,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,3,NULL),(29,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,3,NULL),(30,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,3,NULL),(31,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,3,NULL),(32,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,3,NULL),(33,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,3,NULL),(34,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,3,NULL),(35,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,3,NULL),(36,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,3,NULL),(37,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,4,NULL),(38,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,4,NULL),(39,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,4,NULL),(40,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,4,NULL),(41,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,4,NULL),(42,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,4,NULL),(43,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,4,NULL),(44,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,4,NULL),(45,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,4,NULL),(46,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,4,NULL),(47,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,4,NULL),(48,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,4,NULL),(49,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,5,NULL),(50,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,5,NULL),(51,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,5,NULL),(52,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,5,NULL),(53,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,5,NULL),(54,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,5,NULL),(55,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,5,NULL),(56,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,5,NULL),(57,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,5,NULL),(58,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,5,NULL),(59,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,5,NULL),(60,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,5,NULL),(61,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,6,NULL),(62,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,6,NULL),(63,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,6,NULL),(64,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,6,NULL),(65,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,6,NULL),(66,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,6,NULL),(67,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,6,NULL),(68,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,6,NULL),(69,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,6,NULL),(70,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,6,NULL),(71,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,6,NULL),(72,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,6,NULL),(73,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,7,NULL),(74,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,7,NULL),(75,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,7,NULL),(76,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,7,NULL),(77,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,7,NULL),(78,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,7,NULL),(79,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,7,NULL),(80,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,7,NULL),(81,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,7,NULL),(82,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,7,NULL),(83,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,7,NULL),(84,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,7,NULL),(85,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,8,NULL),(86,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,8,NULL),(87,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,8,NULL),(88,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,8,NULL),(89,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,8,NULL),(90,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,8,NULL),(91,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,8,NULL),(92,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,8,NULL),(93,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,8,NULL),(94,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,8,NULL),(95,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,8,NULL),(96,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,8,NULL),(97,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,9,NULL),(98,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,9,NULL),(99,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,9,NULL),(100,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,9,NULL),(101,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,9,NULL),(102,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,9,NULL),(103,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,9,NULL),(104,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,9,NULL),(105,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,9,NULL),(106,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,9,NULL),(107,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,9,NULL),(108,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,9,NULL),(122,NULL,'07:30:00.000000','11:30:00.000000',NULL,1,1,NULL),(123,NULL,'13:00:00.000000','17:00:00.000000',NULL,1,1,NULL),(124,NULL,'07:30:00.000000','11:30:00.000000',NULL,2,1,NULL),(125,NULL,'13:00:00.000000','17:00:00.000000',NULL,2,1,NULL),(126,NULL,'07:30:00.000000','11:30:00.000000',NULL,3,1,NULL),(127,NULL,'13:00:00.000000','17:00:00.000000',NULL,3,1,NULL),(128,NULL,'07:30:00.000000','11:30:00.000000',NULL,4,1,NULL),(129,NULL,'13:00:00.000000','17:00:00.000000',NULL,4,1,NULL),(130,NULL,'07:30:00.000000','11:30:00.000000',NULL,5,1,NULL),(131,NULL,'13:00:00.000000','17:00:00.000000',NULL,5,1,NULL),(132,NULL,'07:30:00.000000','11:30:00.000000',NULL,6,1,NULL),(133,NULL,'13:00:00.000000','17:00:00.000000',NULL,6,1,NULL);
/*!40000 ALTER TABLE `lich_lam_viec_co_dinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_ngoai_le`
--

DROP TABLE IF EXISTS `lich_ngoai_le`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_ngoai_le` (
  `ma_ngoai_le` bigint(20) NOT NULL AUTO_INCREMENT,
  `ghi_chu` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gio_bat_dau` time(6) DEFAULT NULL,
  `gio_ket_thuc` time(6) DEFAULT NULL,
  `loai_ngoai_le` enum('NGHI','DOI_GIO') COLLATE utf8_unicode_ci DEFAULT NULL,
  `ngay_ngoai_le` date DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_bac_si` bigint(20) NOT NULL,
  PRIMARY KEY (`ma_ngoai_le`),
  KEY `FKc692wbq4w7r7m2gpwt36oxcqx` (`ma_bac_si`),
  CONSTRAINT `FKc692wbq4w7r7m2gpwt36oxcqx` FOREIGN KEY (`ma_bac_si`) REFERENCES `bac_si` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_ngoai_le`
--

LOCK TABLES `lich_ngoai_le` WRITE;
/*!40000 ALTER TABLE `lich_ngoai_le` DISABLE KEYS */;
INSERT INTO `lich_ngoai_le` VALUES (1,NULL,'08:00:00.000000','09:00:00.000000','DOI_GIO','2026-05-11',NULL,1),(2,NULL,'08:00:00.000000','09:00:00.000000','DOI_GIO','2026-05-12',NULL,5),(3,NULL,NULL,NULL,'NGHI','2026-05-17',NULL,2),(4,NULL,NULL,NULL,'NGHI','2026-05-16',NULL,2),(5,NULL,'06:00:00.000000','07:00:00.000000','DOI_GIO','2026-05-11',NULL,2);
/*!40000 ALTER TABLE `lich_ngoai_le` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_trang_thai_lich_hen`
--

DROP TABLE IF EXISTS `lich_su_trang_thai_lich_hen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_trang_thai_lich_hen` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ghi_chu` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ma_nguoi_dung` bigint(20) DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten_dang_nhap` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `trang_thai_cu` enum('DA_DAT','DA_TIEP_NHAN','DANG_KHAM','XET_NGHIEM','DA_KE_DON','CHO_THANH_TOAN','DA_THANH_TOAN','HUY','VANG') COLLATE utf8_unicode_ci DEFAULT NULL,
  `trang_thai_moi` enum('DA_DAT','DA_TIEP_NHAN','DANG_KHAM','XET_NGHIEM','DA_KE_DON','CHO_THANH_TOAN','DA_THANH_TOAN','HUY','VANG') COLLATE utf8_unicode_ci NOT NULL,
  `ma_lich_hen` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ls_ma_lich` (`ma_lich_hen`),
  KEY `idx_ls_tao_luc` (`tao_luc`),
  CONSTRAINT `FK94khg79huo7d8ko7c2rjbpbj` FOREIGN KEY (`ma_lich_hen`) REFERENCES `lich_hen` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_trang_thai_lich_hen`
--

LOCK TABLES `lich_su_trang_thai_lich_hen` WRITE;
/*!40000 ALTER TABLE `lich_su_trang_thai_lich_hen` DISABLE KEYS */;
INSERT INTO `lich_su_trang_thai_lich_hen` VALUES (1,NULL,1,'2026-05-02 18:43:43.944174','admin','DA_DAT','DA_TIEP_NHAN',1),(2,NULL,1,'2026-05-02 18:43:45.104393','admin','DA_TIEP_NHAN','DA_DAT',1),(3,NULL,1,'2026-05-02 18:43:45.648383','admin','DA_DAT','DA_TIEP_NHAN',1),(4,NULL,1,'2026-05-02 18:43:47.072023','admin','DA_TIEP_NHAN','DA_DAT',1),(5,NULL,1,'2026-05-02 18:43:47.712013','admin','DA_DAT','DA_TIEP_NHAN',1),(6,NULL,1,'2026-05-02 18:43:48.082623','admin','DA_TIEP_NHAN','DANG_KHAM',1),(7,NULL,1,'2026-05-02 18:43:53.001139','admin','DANG_KHAM','DA_DAT',1),(8,NULL,1,'2026-05-02 18:43:53.587524','admin','DA_DAT','DA_TIEP_NHAN',1),(9,NULL,1,'2026-05-02 18:43:53.968522','admin','DA_TIEP_NHAN','DANG_KHAM',1),(10,NULL,1,'2026-05-02 18:43:54.304529','admin','DANG_KHAM','XET_NGHIEM',1),(11,NULL,1,'2026-05-02 18:43:59.189878','admin','XET_NGHIEM','DA_KE_DON',1),(12,NULL,1,'2026-05-02 18:44:02.504169','admin','DA_KE_DON','DA_THANH_TOAN',1),(13,NULL,1,'2026-05-02 18:44:03.224277','admin','DA_THANH_TOAN','HUY',1),(14,NULL,1,'2026-05-02 18:44:03.634281','admin','HUY','VANG',1),(15,NULL,1,'2026-05-02 18:44:04.967316','admin','VANG','HUY',1),(16,NULL,1,'2026-05-02 18:44:05.376327','admin','HUY','DA_THANH_TOAN',1),(17,NULL,1,'2026-05-02 18:44:05.955878','admin','DA_THANH_TOAN','DA_KE_DON',1),(18,NULL,1,'2026-05-02 18:44:06.357512','admin','DA_KE_DON','XET_NGHIEM',1),(19,NULL,1,'2026-05-02 18:44:06.738511','admin','XET_NGHIEM','DANG_KHAM',1),(20,NULL,1,'2026-05-02 18:44:07.053510','admin','DANG_KHAM','DA_DAT',1),(21,NULL,1,'2026-05-02 18:44:07.470517','admin','DA_DAT','DA_TIEP_NHAN',1),(22,NULL,1,'2026-05-02 18:44:07.718511','admin','DA_TIEP_NHAN','DANG_KHAM',1),(23,NULL,1,'2026-05-02 18:44:08.267536','admin','DANG_KHAM','XET_NGHIEM',1),(24,NULL,1,'2026-05-02 18:44:08.590538','admin','XET_NGHIEM','DA_KE_DON',1),(25,NULL,1,'2026-05-02 18:44:09.485543','admin','DA_KE_DON','HUY',1),(26,NULL,1,'2026-05-02 18:44:09.954604','admin','HUY','VANG',1),(27,NULL,1,'2026-05-02 18:44:10.516236','admin','VANG','DA_THANH_TOAN',1),(28,NULL,1,'2026-05-02 18:44:18.281188','admin','DA_THANH_TOAN','DA_DAT',1),(29,NULL,1,'2026-05-02 19:20:41.671605','admin','DA_DAT','DA_THANH_TOAN',1),(30,NULL,1,'2026-05-02 20:31:51.022221','admin','DA_DAT','DA_KE_DON',2),(31,NULL,1,'2026-05-02 20:36:00.563188','admin','DA_KE_DON','DA_THANH_TOAN',2),(32,NULL,1,'2026-05-03 08:40:11.353334','admin','DA_THANH_TOAN','DA_DAT',1),(33,NULL,1,'2026-05-03 08:40:12.357869','admin','DA_DAT','DA_TIEP_NHAN',1),(34,NULL,1,'2026-05-03 08:40:12.926610','admin','DA_TIEP_NHAN','DANG_KHAM',1),(35,NULL,1,'2026-05-03 08:40:34.123263','admin','DANG_KHAM','XET_NGHIEM',1),(36,NULL,1,'2026-05-03 08:40:35.617213','admin','XET_NGHIEM','DA_KE_DON',1),(37,NULL,1,'2026-05-03 08:44:02.998530','admin','DA_KE_DON','CHO_THANH_TOAN',1),(38,NULL,1,'2026-05-03 08:44:06.041846','admin','CHO_THANH_TOAN','DA_KE_DON',1),(39,NULL,1,'2026-05-03 08:44:06.517472','admin','DA_KE_DON','CHO_THANH_TOAN',1),(40,'Tự động: quá giờ 12:00 mà chưa đi khám.',NULL,'2026-05-12 05:00:00.016665',NULL,'DA_DAT','VANG',4),(41,'Tự động: quá giờ 12:00 mà chưa đi khám.',NULL,'2026-05-12 05:00:00.031633',NULL,'DA_DAT','VANG',5),(42,'Tự động: quá giờ 12:00 mà chưa đi khám.',NULL,'2026-05-12 05:00:00.031633',NULL,'DA_DAT','VANG',6),(43,NULL,1,'2026-05-12 16:46:28.054232','admin','DA_DAT','DA_TIEP_NHAN',7),(44,NULL,1,'2026-05-12 16:48:38.478813','admin','DA_DAT','VANG',3),(45,NULL,1,'2026-05-13 00:45:41.174493','admin','DA_DAT','VANG',8),(46,NULL,1,'2026-05-13 08:15:41.168992','admin','DA_DAT','VANG',9);
/*!40000 ALTER TABLE `lich_su_trang_thai_lich_hen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loai_dich_vu`
--

DROP TABLE IF EXISTS `loai_dich_vu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loai_dich_vu` (
  `ma_loai_dich_vu` bigint(20) NOT NULL AUTO_INCREMENT,
  `ten_loai_dich_vu` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_loai_dich_vu`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loai_dich_vu`
--

LOCK TABLES `loai_dich_vu` WRITE;
/*!40000 ALTER TABLE `loai_dich_vu` DISABLE KEYS */;
INSERT INTO `loai_dich_vu` VALUES (1,'Khám bệnh'),(2,'Xét nghiệm'),(3,'Chẩn đoán hình ảnh'),(4,'Thủ thuật'),(5,'Tiêm chủng'),(6,'Tư  vấn'),(7,'Cận lâm sàng'),(9,'Sản phụ khoa'),(10,'Da liễu'),(13,'Chỉnh hình'),(14,'Răng hàm mặt'),(15,'Cấp cứu y tế'),(16,'Chăm sóc sức khỏe tại nhà'),(17,'Dịch vụ y tế chuyên khoa');
/*!40000 ALTER TABLE `loai_dich_vu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoi_dung`
--

DROP TABLE IF EXISTS `nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoi_dung` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `ho_ten` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hoat_dong` bit(1) NOT NULL,
  `mat_khau_bam` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten_dang_nhap` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `thu_dien_tu` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_o0s268lrp9is6o1e4ek6m1lc6` (`ten_dang_nhap`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoi_dung`
--

LOCK TABLES `nguoi_dung` WRITE;
/*!40000 ALTER TABLE `nguoi_dung` DISABLE KEYS */;
INSERT INTO `nguoi_dung` VALUES (1,'2026-04-30 21:28:06.217628','Quản trị viên',_binary '','$2a$10$/zw9vKfFfFJZ5T2QHSCQ/O2RSdV57wU5gbfGzLJEabrcwe40k2yru','0862478150','2026-03-30 19:00:18.247354','admin','Trần Trung Hiếu'),(2,'2026-03-30 19:00:18.346353','Lễ tân',_binary '','$2a$10$05zm5Lo5Shbc1I8kAQ6GrOqT/Tc2xBp.q2RpSumAlcsf6ehmfsHv2',NULL,'2026-03-30 19:00:18.346353','reception',NULL),(3,'2026-03-30 19:00:18.407358','Nguyễn Văn Vinh',_binary '','$2a$10$YRdC.eS8WdR1N1WfPF1MZ.psqwXeRf5y3cGeL43pjJwRRK/uUDVKG',NULL,'2026-03-30 19:00:18.407358','doctor1',NULL),(4,'2026-03-30 19:00:18.473353','Thu ngân',_binary '','$2a$10$i6BUD7eEbmXCHlRz.0HLLOVF9CpC1YFfUNyQjTQg7rdkDj2unroxG',NULL,'2026-03-30 19:00:18.473353','cashier',NULL),(5,'2026-04-29 21:29:32.231383','Quản trị dự phòng',_binary '','$2a$10$nE98uhud9E2IKQ1FsgHb1eSem2VCMp2FzUsML78XO3u128bo957i2',NULL,'2026-04-29 21:29:32.231383','admin123',NULL),(6,'2026-05-02 18:14:53.663533','Tướng Chí Vỹ',_binary '','$2a$10$B2iwsrT9JO0NKp.khb/d7u8LN0BTGwM/vCxvTlI1OHsMN3ivpxo3W',NULL,'2026-05-02 18:14:53.663533','vytc',NULL),(7,'2026-05-02 18:16:15.930114','Tướng Minh Tuân',_binary '','$2a$10$SYH/HkIvSgTiNt9aemO62eV.w5qK7KqZe7WyFqnHbet6CUc7.CXTG',NULL,'2026-05-02 18:16:05.468014','tuantm',NULL),(8,'2026-05-02 19:42:36.005763','Nguyễn Văn Hiếu',_binary '','$2a$10$ObiQQzl/kGfz5ftOvTvNLOfA/G3ShwF8lxklCk909a.QpzI0Z5ypK',NULL,'2026-05-02 19:42:36.005763','hieunv',NULL),(9,'2026-05-11 06:52:46.511800','Tướng Thị Quế',_binary '','$2a$10$mLhjia164snfJ9/4BjbpyOHown2NlAY/.pECTO0gxvZx50VnYBfl2','0364982843','2026-05-11 06:52:46.511800','quett','nevermore6264@gmail.com');
/*!40000 ALTER TABLE `nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhat_ky_he_thong`
--

DROP TABLE IF EXISTS `nhat_ky_he_thong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhat_ky_he_thong` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `gia_tri_cu` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gia_tri_moi` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hanh_dong` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `loai_thuc_the` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ma_nguoi_dung` bigint(20) DEFAULT NULL,
  `ma_thuc_the` bigint(20) DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten_dang_nhap` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhat_ky_he_thong`
--

LOCK TABLES `nhat_ky_he_thong` WRITE;
/*!40000 ALTER TABLE `nhat_ky_he_thong` DISABLE KEYS */;
INSERT INTO `nhat_ky_he_thong` VALUES (1,NULL,'tenLoaiDichVu=Răng hàm mặt','TAO','loai_dich_vu',1,14,'2026-04-29 20:31:40.319247','admin'),(2,NULL,'ten=Thủ thuật da liễu;gia=400000;maLoaiDichVu=10;hoatDong=true','TAO','dich_vu',1,9,'2026-04-29 20:33:01.131648','admin'),(3,NULL,'ten=Chăm sóc và Thẩm mỹ da;gia=1000000;maLoaiDichVu=10;hoatDong=true','TAO','dich_vu',1,10,'2026-04-29 20:33:22.656418','admin'),(4,NULL,'hoTen=Nguyễn Văn Hiếu','TAO','benh_nhan',1,1,'2026-04-30 22:01:26.118554','admin'),(5,NULL,'hoTen=Nguyễn Văn Quý','TAO','benh_nhan',1,2,'2026-04-30 22:01:43.513145','admin'),(6,'hoTen=Nguyễn Văn Hiếu;soDienThoai=','hoTen=Nguyễn Văn Hiếu;soDienThoai=','CAP_NHAT','benh_nhan',1,1,'2026-04-30 22:20:43.055230','admin'),(7,NULL,'hoTen=Phạm Văn Khoa','TAO','benh_nhan',1,3,'2026-04-30 22:26:51.827180','admin'),(8,'hoTen=Nguyễn Văn Hiếu;soDienThoai=','hoTen=Nguyễn Văn Hiếu;soDienThoai=0862478150','CAP_NHAT','benh_nhan',1,1,'2026-05-02 13:47:47.516050','admin'),(9,'hoTen=Nguyễn Văn Hiếu;soDienThoai=0862478150','hoTen=Nguyễn Văn Hiếu;soDienThoai=0862478150','CAP_NHAT','benh_nhan',1,1,'2026-05-02 13:48:23.065670','admin'),(10,'hoatDong=true','hoatDong=false','VO_HIEU','benh_nhan',1,3,'2026-05-02 13:53:09.271782','admin'),(11,'hoTen=Phạm Văn Khoa;soDienThoai=','hoTen=Phạm Văn Khoa;soDienThoai=','CAP_NHAT','benh_nhan',1,3,'2026-05-02 16:32:07.092365','admin'),(12,'hoTen=Nguyễn Văn Quý;soDienThoai=','hoTen=Nguyễn Văn Quý;soDienThoai=0364982843','CAP_NHAT','benh_nhan',1,2,'2026-05-02 18:30:01.750707','admin'),(13,'hoTen=Phạm Văn Khoa;soDienThoai=','hoTen=Phạm Văn Khoa;soDienThoai=0984452108','CAP_NHAT','benh_nhan',1,3,'2026-05-02 18:30:09.076467','admin'),(14,NULL,'tenLoaiDichVu=Cấp cứu y tế','TAO','loai_dich_vu',1,15,'2026-05-10 12:25:41.973581','admin'),(15,'ten=Khám tổng quát;gia=150000.00;maLoaiDichVu=1;hoatDong=true','ten=Khám nội tổng quát;gia=150000;maLoaiDichVu=1;hoatDong=true','CAP_NHAT','dich_vu',1,1,'2026-05-10 13:10:09.120825','admin'),(16,'ten=Khám nội tổng quát;gia=150000.00;maLoaiDichVu=1;hoatDong=true','ten=Khám tổng quát;gia=150000;maLoaiDichVu=1;hoatDong=true','CAP_NHAT','dich_vu',1,1,'2026-05-10 13:10:16.539252','admin'),(17,'ten=Khám tổng quát;gia=150000.00;maLoaiDichVu=1;hoatDong=true','ten=Khám nhi;gia=150000;maLoaiDichVu=1;hoatDong=true','CAP_NHAT','dich_vu',1,1,'2026-05-10 13:10:22.088515','admin'),(18,'ten=Khám nhi;gia=150000.00;maLoaiDichVu=1;hoatDong=true','ten=Khám tổng quát;gia=150000;maLoaiDichVu=1;hoatDong=true','CAP_NHAT','dich_vu',1,1,'2026-05-10 13:10:28.697222','admin'),(19,'ten=Khám tổng quát;gia=150000.00;maLoaiDichVu=1;hoatDong=true','ten=Khám tổng quát;gia=150000;maLoaiDichVu=1;hoatDong=true','CAP_NHAT','dich_vu',1,1,'2026-05-10 13:36:52.032786','admin'),(20,NULL,'tenLoaiDichVu=Chăm sóc sức khỏe tại nhà','TAO','loai_dich_vu',1,16,'2026-05-11 06:15:05.112984','admin'),(21,'hoTen=Tướng Thị Quế;soDienThoai=0364982843','hoTen=Tướng Thị Quế;soDienThoai=0364982843','CAP_NHAT','benh_nhan',9,4,'2026-05-11 06:53:32.953933','quett'),(22,'hoTen=Tướng Thị Quế;soDienThoai=0364982843','hoTen=Tướng Thị Quế;soDienThoai=0364982843','CAP_NHAT','benh_nhan',9,4,'2026-05-11 06:53:43.160903','quett'),(23,'hoTen=Tướng Thị Quế;soDienThoai=0364982843','hoTen=Tướng Thị Quế;soDienThoai=0364982843','CAP_NHAT','benh_nhan',9,4,'2026-05-11 06:57:52.700749','quett'),(24,NULL,'hoTen=Trần Văn Vinh','TAO','benh_nhan',1,5,'2026-05-11 07:51:43.667500','admin'),(25,NULL,'hoTen=Nguyễn Văn Thoại','TAO','benh_nhan',1,6,'2026-05-11 07:51:55.052082','admin'),(26,NULL,'hoTen=Đào Văn Dũng','TAO','benh_nhan',1,7,'2026-05-11 07:52:03.793738','admin'),(27,NULL,'hoTen=Nguyễn Đăng Hải Hoàng','TAO','benh_nhan',1,8,'2026-05-11 07:52:15.625971','admin'),(28,NULL,'hoTen=Ngô Văn Đức','TAO','benh_nhan',1,9,'2026-05-11 07:55:41.552801','admin'),(29,NULL,'hoTen=Chế Văn Hoàng','TAO','benh_nhan',1,10,'2026-05-11 07:55:55.856489','admin'),(30,NULL,'hoTen=Lương Ngọc Hùng','TAO','benh_nhan',1,11,'2026-05-11 07:58:23.666926','admin'),(31,NULL,'hoTen=Bùi Thị Minh Quý','TAO','benh_nhan',1,12,'2026-05-11 07:59:58.473663','admin'),(32,'hoTen=Tướng Thị Quế;soDienThoai=0364982843','hoTen=Tướng Thị Quế;soDienThoai=0364982843','CAP_NHAT','benh_nhan',9,4,'2026-05-11 11:12:35.778961','quett'),(33,'hoTen=Tướng Thị Quế;soDienThoai=0364982843','hoTen=Tướng Thị Quế;soDienThoai=0364982843','CAP_NHAT','benh_nhan',9,4,'2026-05-11 11:21:25.470779','quett'),(34,'hoTen=Tướng Thị Quế;soDienThoai=0364982843','hoTen=Tướng Thị Quế;soDienThoai=0364982843','CAP_NHAT','benh_nhan',9,4,'2026-05-11 11:22:25.079737','quett'),(35,NULL,'hoTen=Trần Võ Thành Nhân','TAO','benh_nhan',1,13,'2026-05-11 19:33:10.770018','admin'),(36,NULL,'hoTen=Lưu Diệp Phàm','TAO','benh_nhan',1,14,'2026-05-11 19:33:33.943842','admin'),(37,NULL,'hoTen=Âu Chúc Thanh Phương','TAO','benh_nhan',1,15,'2026-05-11 19:33:48.490868','admin'),(38,NULL,'hoTen=Nghệ Mạn Thiên','TAO','benh_nhan',1,16,'2026-05-11 19:33:57.830444','admin'),(39,NULL,'hoTen=Lưu Văn Châu Kỳ','TAO','benh_nhan',1,17,'2026-05-11 19:34:07.674003','admin'),(40,NULL,'hoTen=Phạm Thiên Kim','TAO','benh_nhan',1,18,'2026-05-11 19:34:59.763718','admin'),(41,NULL,'hoTen=Phạm Ngọc Mai','TAO','benh_nhan',1,19,'2026-05-11 19:35:30.363289','admin'),(42,NULL,'hoTen=Nguyễn Uyển Dư','TAO','benh_nhan',1,20,'2026-05-11 19:35:37.449742','admin'),(43,NULL,'hoTen=Hồ Hiếu An','TAO','benh_nhan',1,21,'2026-05-11 19:35:44.396580','admin'),(44,NULL,'hoTen=Lý Đăng Khoa','TAO','benh_nhan',1,22,'2026-05-11 19:35:51.454748','admin'),(45,NULL,'hoTen=Trần Thanh Phong','TAO','benh_nhan',1,23,'2026-05-11 19:35:58.828435','admin'),(46,NULL,'hoTen=Nguyễn Anh Khôi','TAO','benh_nhan',1,24,'2026-05-11 19:36:17.554369','admin'),(47,NULL,'tenLoaiDichVu=Dịch vụ y tế chuyên khoa','TAO','loai_dich_vu',1,17,'2026-05-12 16:43:34.480507','admin'),(48,NULL,'ten=Dịch vụ lấy ráy tai;gia=2000;maLoaiDichVu=17;hoatDong=true','TAO','dich_vu',1,11,'2026-05-12 16:43:58.069898','admin'),(49,'tenThuoc=Paracetamol 500mg;giaBan=0.00;tonKho=0;hoatDong=true','tenThuoc=Paracetamol 500mg;giaBan=2000;tonKho=0;hoatDong=true','CAP_NHAT','thuoc',1,1,'2026-05-12 17:39:35.188126','admin'),(50,'tenThuoc=Oresol;giaBan=0.00;tonKho=0;hoatDong=true','tenThuoc=Oresol;giaBan=2000;tonKho=0;hoatDong=true','CAP_NHAT','thuoc',1,2,'2026-05-12 17:48:39.123499','admin'),(51,'tenThuoc=Amoxicillin 250mg;giaBan=0.00;tonKho=0;hoatDong=true','tenThuoc=Amoxicillin 250mg;giaBan=10000;tonKho=0;hoatDong=true','CAP_NHAT','thuoc',1,3,'2026-05-12 17:51:24.868491','admin'),(52,'ten=Tiểu phẫu u mềm;gia=1500000.00;maLoaiDichVu=13;maChuyenKhoa=null;hoatDong=true','ten=Tiểu phẫu u mềm;gia=1500000;maLoaiDichVu=13;maChuyenKhoa=3;hoatDong=true','CAP_NHAT','dich_vu',1,42,'2026-05-12 22:45:31.921838','admin');
/*!40000 ALTER TABLE `nhat_ky_he_thong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhat_ky_nhac_lich`
--

DROP TABLE IF EXISTS `nhat_ky_nhac_lich`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhat_ky_nhac_lich` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `kenh` enum('THU_DIEN_TU','TIN_NHAN') COLLATE utf8_unicode_ci DEFAULT NULL,
  `luc_gui` datetime(6) DEFAULT NULL,
  `ma_lich_hen` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKj6awlsm1uj8eiu3esdku2xxfd` (`ma_lich_hen`),
  CONSTRAINT `FKj6awlsm1uj8eiu3esdku2xxfd` FOREIGN KEY (`ma_lich_hen`) REFERENCES `lich_hen` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhat_ky_nhac_lich`
--

LOCK TABLES `nhat_ky_nhac_lich` WRITE;
/*!40000 ALTER TABLE `nhat_ky_nhac_lich` DISABLE KEYS */;
/*!40000 ALTER TABLE `nhat_ky_nhac_lich` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pay_os_don_hang`
--

DROP TABLE IF EXISTS `pay_os_don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pay_os_don_hang` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `da_xu_ly_webhook` bit(1) NOT NULL,
  `ma_hoa_don` bigint(20) NOT NULL,
  `order_code` int(11) NOT NULL,
  `payment_link_id` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_tien_vnd` int(11) NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_5n6rh8q3aycamvxjf7h5fx8ry` (`order_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pay_os_don_hang`
--

LOCK TABLES `pay_os_don_hang` WRITE;
/*!40000 ALTER TABLE `pay_os_don_hang` DISABLE KEYS */;
INSERT INTO `pay_os_don_hang` VALUES (1,_binary '\0',3,854443052,'82e602b6c32b4954a8479a59d0fe9b57',180000,'2026-05-12 16:42:36.069433'),(2,_binary '\0',3,150890166,'86912c279ba34789a6ffec9a94c5be29',180000,'2026-05-12 20:43:40.082795');
/*!40000 ALTER TABLE `pay_os_don_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_chi`
--

DROP TABLE IF EXISTS `phieu_chi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_chi` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `loai` enum('VAT_TU','THIET_BI','LUONG','THUE','KHAC') COLLATE utf8_unicode_ci NOT NULL,
  `ma_nguoi_tao` bigint(20) DEFAULT NULL,
  `mo_ta` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `ngay_chi` date NOT NULL,
  `so_tien` decimal(15,2) NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten_dang_nhap_nguoi_tao` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chung_tu_tham_chieu` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pc_ngay` (`ngay_chi`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_chi`
--

LOCK TABLES `phieu_chi` WRITE;
/*!40000 ALTER TABLE `phieu_chi` DISABLE KEYS */;
INSERT INTO `phieu_chi` VALUES (1,'VAT_TU',1,'Chi mua sắm trang thiết bị y tế, vật tư tiêu hao','2026-05-11',100000.00,'2026-05-11 22:53:29.834174','admin',NULL),(2,'KHAC',1,'Tiền thuê mặt bằng','2026-05-11',10000000.00,'2026-05-11 22:53:45.311685','admin',NULL),(3,'KHAC',1,'Điện, nước, Internet','2026-05-11',30000000.00,'2026-05-11 22:54:04.692615','admin',NULL),(4,'VAT_TU',1,'Vệ sinh và bảo dưỡng','2026-05-11',2000000.00,'2026-05-11 22:54:26.382301','admin',NULL),(5,'THIET_BI',1,'Mua sắm Thiết bị thay thế','2026-05-11',1000000000.00,'2026-05-11 22:54:47.392249','admin',NULL),(6,'VAT_TU',NULL,'Mua găng tay y tế tháng 5','2026-05-10',850000.00,'2026-05-13 03:03:07.215287',NULL,NULL),(7,'THIET_BI',NULL,'Thay bóng đèn LED phòng khám','2026-05-11',320000.00,'2026-05-13 03:03:07.215287',NULL,NULL),(8,'LUONG',NULL,'Lương part-time lễ tân T5','2026-05-05',5500000.00,'2026-05-13 03:03:07.215287',NULL,NULL),(9,'THUE',NULL,'Thuế GTGT kỳ kê khai','2026-05-01',1200000.00,'2026-05-13 03:03:07.215287',NULL,NULL),(10,'KHAC',NULL,'Phí gửi rác y tế','2026-05-12',180000.00,'2026-05-13 03:03:07.215287',NULL,NULL),(11,'LUONG',1,'Trả lương cho bảo vệ T5','2026-05-12',7000000.00,'2026-05-12 20:37:06.866170','admin','/phieu-chi/chung-tu-anh/381a3a5c-846f-4145-b5bd-cd4a8f118b99.jpg');
/*!40000 ALTER TABLE `phieu_chi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thuoc`
--

DROP TABLE IF EXISTS `thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thuoc` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cap_nhat_luc` datetime(6) DEFAULT NULL,
  `don_vi` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gia_ban` decimal(15,2) DEFAULT NULL,
  `hoat_chat` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hoat_dong` bit(1) DEFAULT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten_thuoc` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `chi_dinh` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `chong_chi_dinh` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dang_bao_che` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `duong_dung` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gia_nhap` decimal(15,2) DEFAULT NULL,
  `ham_luong` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `han_su_dung` date DEFAULT NULL,
  `hang_san_xuat` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `muc_ton_toi_thieu` int(11) DEFAULT NULL,
  `nuoc_san_xuat` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_dang_ky` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_lo` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tac_dung_phu` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ton_kho` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuoc`
--

LOCK TABLES `thuoc` WRITE;
/*!40000 ALTER TABLE `thuoc` DISABLE KEYS */;
INSERT INTO `thuoc` VALUES (1,'2026-05-12 17:39:35.237828','Viên',2000.00,'Paracetamol',_binary '','2026-04-29 19:42:55.806549','Paracetamol 500mg','','','Viên','Uống',0.00,'500mg',NULL,'',0,'','','','',0),(2,'2026-05-12 17:48:39.127559','Gói',2000.00,'Điện giải',_binary '','2026-04-29 20:13:19.109574','Oresol','','','Bột pha','Pha uống',2000.00,'4,2g',NULL,'',0,'','','','',0),(3,'2026-05-12 17:51:24.868491','Viên',10000.00,'Amoxicillin',_binary '','2026-04-29 20:13:52.345233','Amoxicillin 250mg','','','Viên nang mềm','Uống',1000.00,'250mg',NULL,'',0,'','','','',0),(4,'2026-05-13 00:39:02.146443','Viên',1200.00,'Ibuprofen',_binary '','2026-05-13 00:39:02.146443','Brufen 400mg','Giảm đau, hạ sốt, viêm khớp nhẹ','Loét dạ dày tá tràng đang hoạt động, suy tim nặng','Viên bao phim','Uống',800.00,'400mg','2027-08-31','Abbott',40,'Úc','','LOT-IBU-01','Đau dạ dày, buồn nôn',220),(5,'2026-05-13 00:39:02.146443','Viên',3500.00,'Paracetamol + Codein',_binary '','2026-05-13 00:39:02.146443','Efferalgan Codein 500mg/30mg','Đau vừa đến nặng có chỉ định','Suy hô hấp, trẻ em < 12 tuổi','Viên sủi','Uống',2800.00,'500mg/30mg','2026-11-30','Bristol Myers Squibb',20,'Pháp','','LOT-PAC-02','Buồn ngủ, táo bón',85),(6,'2026-05-13 00:39:02.146443','Viên',2500.00,'Loratadin',_binary '','2026-05-13 00:39:02.146443','Clarityne 10mg','Viêm mũi dị ứng, mày đay','Quá mẫn loratadin','Viên','Uống',1800.00,'10mg','2027-03-31','Merck',30,'Mỹ','','LOT-LOR-01','Buồn ngủ nhẹ, khô miệng',150),(7,'2026-05-13 00:39:02.146443','Viên',1800.00,'Cetirizin',_binary '','2026-05-13 00:39:02.146443','Zyrtec 10mg','Dị ứng, viêm mũi, mày đay','Suy thận nặng (cần chỉnh liều)','Viên','Uống',1200.00,'10mg','2027-01-15','UCB',35,'Bỉ','','LOT-CET-03','Buồn ngủ',310),(8,'2026-05-13 00:39:02.146443','Viên',4500.00,'Omeprazol',_binary '','2026-05-13 00:39:02.146443','Losec MUPS 20mg','Loét dạ dày tá tràng, trào ngược dạ dày-thực quản','Mẫn cảm benzimidazol','Viên vi bao tiêu trong ruột','Uống',3200.00,'20mg','2027-05-31','AstraZeneca',25,'Thụy Điển','','LOT-OME-12','Đau đầu, tiêu chảy nhẹ',95),(9,'2026-05-13 00:39:02.146443','Viên',2800.00,'Domperidon',_binary '','2026-05-13 00:39:02.146443','Motilium M 10mg','Buồn nôn, nôn, đầy hơi','Xuất huyết tiêu hóa, prolactinoma','Viên','Uống',1900.00,'10mg','2026-12-31','Janssen',30,'Bỉ','','LOT-DOM-04','Đau vú nam giới hiếm gặp',140),(10,'2026-05-13 00:39:02.146443','Viên',3200.00,'Metronidazol',_binary '','2026-05-13 00:39:02.146443','Flagyl 250mg','Ký sinh trùng, nhiễm khuẩn kỵ khí','Tam cá nguyệt đầu','Viên','Uống',2100.00,'250mg','2027-02-28','Sanofi',40,'Pháp','','LOT-MET-07','Vị kim loại, buồn nôn',200),(11,'2026-05-13 00:39:02.146443','Viên',8500.00,'Azithromycin',_binary '','2026-05-13 00:39:02.146443','Zithromax 500mg','Nhiễm khuẩn đường hô hấp, da mềm','Dị ứng macrolid','Viên bao phim','Uống',6200.00,'500mg','2026-10-31','Pfizer',15,'Mỹ','','LOT-AZI-05','Đau bụng, tiêu chảy',60),(12,'2026-05-13 00:39:02.146443','Viên',1500.00,'Doxycyclin',_binary '','2026-05-13 00:39:02.146443','Doxycyclin 100mg Stada','Nhiễm khuẩn hô hấp, da','Trẻ < 8 tuổi, thai kỳ','Viên nang','Uống',900.00,'100mg','2027-04-30','Stada',50,'Đức','','LOT-DOX-09','Viêm dạ dày, nhạy sáng',400),(13,'2026-05-13 00:39:02.146443','Ống',12000.00,'Ceftriaxon',_binary '','2026-05-13 00:39:02.146443','Rocephin 1g IM/IV','Nhiễm khuẩn nặng theo chỉ định BS','Trẻ sơ sinh vàng da Kernicterus','Bột pha tiêm','Tiêm',9500.00,'1g','2027-07-31','Roche',10,'Thụy Sĩ','','LOT-CEF-11','Phản ứng tại chỗ tiêm',35),(14,'2026-05-13 00:39:02.146443','Viên',2200.00,'Clarithromycin',_binary '','2026-05-13 00:39:02.146443','Klacid 250mg','Viêm họng, viêm xoang, HP dạ dày (phối hợp)','Loạn nhịp tim kéo dài QT','Viên bao phim','Uống',1600.00,'250mg','2027-06-30','Abbott',25,'Úc','','LOT-CLA-02','Vị đắng, đau bụng',75),(15,'2026-05-13 00:39:02.146443','Viên',1800.00,'Salbutamol',_binary '','2026-05-13 00:39:02.146443','Ventolin 4mg','Hen, co thắt phế quản','Rối loạn nhịp tim nặng','Viên','Uống',1100.00,'4mg','2026-09-30','GSK',45,'Anh','','LOT-SAL-08','Run tay, tim đập nhanh',180),(16,'2026-05-13 00:39:02.146443','Viên',5500.00,'Montelukast',_binary '','2026-05-13 00:39:02.146443','Singulair 10mg','Hen dị ứng, viêm mũi kèm hen','Đang điều trị cấp hen nặng đơn độc','Viên bao phim','Uống',4100.00,'10mg','2027-12-31','Merck',20,'Mỹ','','LOT-MON-03','Đau đầu, ác mộng hiếm',55),(17,'2026-05-13 00:39:02.146443','Viên',900.00,'Vitamin C',_binary '','2026-05-13 00:39:02.146443','Vitamin C 500mg OPC','Thiếu vitamin C, hỗ trợ miễn dịch','Sỏi thận oxalat (dùng liều cao kéo dài)','Viên nén','Uống',400.00,'500mg','2028-01-31','OPC',80,'Việt Nam','','LOT-VC-500','Chướng bụng nhẹ',600),(18,'2026-05-13 00:39:02.146443','Viên',1600.00,'Multivitamin',_binary '','2026-05-13 00:39:02.146443','Centrum Silver','Bổ sung vitamin khoáng người lớn','Tăng canxi máu','Viên bao phim','Uống',1100.00,'Theo công thức','2027-11-30','Pfizer',25,'Mỹ','','LOT-MV-22','Nước tiểu vàng do vitamin B',90),(19,'2026-05-13 00:39:02.146443','Viên',1300.00,'Magnesi B6',_binary '','2026-05-13 00:39:02.146443','Magne B6 Sanofi','Co thắt cơ, căng thẳng nhẹ','Suy thận nặng','Viên bao phim','Uống',800.00,'Magnesi + B6','2027-02-28','Sanofi',40,'Pháp','','LOT-MB6-01','Tiêu chảy nhẹ',170),(20,'2026-05-13 00:39:02.146443','Viên',4000.00,'Acid folic',_binary '','2026-05-13 00:39:02.146443','Acid Folic 5mg','Thiếu máu thiếu sắt kèm, phòng dị tật thai nhi','U ác tuyến (che giấu)','Viên','Uống',2500.00,'5mg','2028-03-31','DHG',30,'Việt Nam','','LOT-AF-5','Ít gặp',240),(21,'2026-05-13 00:39:02.146443','Viên',1900.00,'Sắt (Fumarat sắt)',_binary '','2026-05-13 00:39:02.146443','Feroglobin B12','Thiếu máu thiếu sắt','Thalassemia không thiếu sắt','Viên bao phim','Uống',1200.00,'Sắt + Acid folic + B12','2027-09-30','Vitabiotics',35,'Anh','','LOT-FE-44','Táo bón, phân đen',130),(22,'2026-05-13 00:39:02.146443','Viên',2600.00,'Ginkgo biloba',_binary '','2026-05-13 00:39:02.146443','Tanakan 40mg','Rối loạn tuần hoàn não nhẹ, ù tai','Đang dùng thuốc chống đông (thận trọng)','Viên bao phim','Uống',1800.00,'40mg EGb761','2027-04-30','Beaufour Ipsen',20,'Pháp','','LOT-GK-40','Đau đầu nhẹ',45),(23,'2026-05-13 00:39:02.146443','Viên',2100.00,'Mequitazine',_binary '','2026-05-13 00:39:02.146443','Primalan 10mg','Dị ứng da, viêm mũi','Quá mẫn','Viên','Uống',1400.00,'10mg','2026-12-15','Sanofi',25,'Pháp','','LOT-PRM-10','Buồn ngủ',110),(24,'2026-05-13 00:39:02.146443','Viên',3800.00,'Fluconazol',_binary '','2026-05-13 00:39:02.146443','Diflucan 150mg','Nấm Candida (đơn liều theo chỉ định)','Dị ứng azol','Viên nang cứng','Uống',2600.00,'150mg','2027-08-15','Pfizer',15,'Mỹ','','LOT-FLU-150','Buồn nôn, đau đầu',40),(25,'2026-05-13 00:39:02.146443','Tuýp',5500.00,'Mometason',_binary '','2026-05-13 00:39:02.146443','Elocon cream 0.1%','Viêm da dị ứng, chàm','Nhiễm virus da, lao da','Kem bôi','Bôi ngoài da',3800.00,'0,1%','2027-01-31','Merck',15,'Mỹ','','LOT-ELO-01','Teo da nếu lạm dụng',28),(26,'2026-05-13 00:39:02.146443','Chai',45000.00,'Natri clorid 0,9%',_binary '','2026-05-13 00:39:02.146443','Nước muối sinh lý 500ml','Rửa vết thương, pha thuốc tiêm','Phù phổi cấp do tăng thể tích','Dung dịch truyền/ rửa','Rửa / truyền',32000.00,'0,9% 500ml','2028-06-30','Otsuka',20,'Việt Nam','','LOT-NACL-09','Quá tải dịch nếu truyền sai chỉ định',120),(27,'2026-05-13 00:39:02.146443','Viên',1700.00,'Bisolvon',_binary '','2026-05-13 00:39:02.146443','Bisolvon 8mg','Long đờm kèm ho có đờm','Không dùng đơn độc cho ho không đờm','Viên','Uống',1000.00,'8mg Bromhexin tương đương','2027-07-31','Sanofi',40,'Đức','','LOT-BIS-8','Buồn nôn hiếm',260),(28,'2026-05-13 00:39:02.146443','Viên',1400.00,'Acetylcystein',_binary '','2026-05-13 00:39:02.146443','Fluimucil 200mg','Long đờm, bảo vệ gan (liều đặc biệt)','Loét dạ dày đang hoạt động','Viên bao phim','Uống',900.00,'200mg','2027-05-15','Zambon',35,'Ý','','LOT-ACC-200','Khó chịu dạ dày',155),(29,'2026-05-13 00:39:02.146443','Viên',6000.00,'Levothyroxin',_binary '','2026-05-13 00:39:02.146443','Euthyrox 100mcg','Suy giáp','Cường giáp không điều trị','Viên nén','Uống',4200.00,'100mcg','2028-02-28','Merck',15,'Đức','','LOT-EU-100','Loạn nhịp nếu liều cao',42),(30,'2026-05-13 00:39:02.146443','Viên',2900.00,'Glucophage',_binary '','2026-05-13 00:39:02.146443','Glucophage XR 500mg','Đái tháo đường typ 2','Suy thận nặng, toan máu','Viên bao phim giải phóng chậm','Uống',2000.00,'500mg','2027-10-31','Merck',30,'Pháp','','LOT-GXR-5','Tiêu chảy, buồn nôn',88),(31,'2026-05-13 00:39:02.146443','Viên',4800.00,'Amlodipin',_binary '','2026-05-13 00:39:02.146443','Norvasc 5mg','Tăng huyết áp, đau thắt ngực','Tụt huyết áp nặng','Viên','Uống',3300.00,'5mg','2027-12-15','Pfizer',25,'Mỹ','','LOT-NOR-5','Phù mắt cá chân',72),(32,'2026-05-13 00:39:02.146443','Viên',5200.00,'Losartan',_binary '','2026-05-13 00:39:02.146443','Cozaar 50mg','Tăng huyết áp, bảo vệ thận','Thai kỳ','Viên bao phim','Uống',3700.00,'50mg','2027-11-20','Merck',25,'Mỹ','','LOT-COZ-50','Chóng mặt',64),(33,'2026-05-13 00:39:02.146443','Viên',1100.00,'Oresol (ORS)',_binary '','2026-05-13 00:39:02.146443','Oresol vị cam','Tiêu chảy, mất nước','Phù, suy thận không kiểm soát','Gói bột','Pha uống',600.00,'4,27g/gói','2028-04-30','OPC',100,'Việt Nam','','LOT-ORS-24','Đầy hơi',500),(34,'2026-05-13 00:39:02.146443','Viên',800.00,'Paracetamol',_binary '','2026-05-13 00:39:02.146443','Hapacol 500mg','Giảm đau, hạ sốt','Quá mẫn paracetamol','Viên nén','Uống',450.00,'500mg','2028-08-31','DHG',120,'Việt Nam','','LOT-HAP-500','Buồn ngủ hiếm',800),(35,'2026-05-13 00:39:02.146443','Viên',950.00,'Paracetamol',_binary '','2026-05-13 00:39:02.146443','Efferalgan 500mg','Đau nhẹ, sốt','Suy gan nặng','Viên sủi','Uống',650.00,'500mg','2027-06-30','UPSA',80,'Pháp','','LOT-EFF-500','Buồn nôn hiếm',340),(36,'2026-05-13 00:39:02.146443','Viên',1600.00,'Diclofenac',_binary '','2026-05-13 00:39:02.146443','Voltaren 50mg','Viêm khớp, đau cơ xương','Loét dạ dày, suy tim nặng','Viên bao phim','Uống',1100.00,'50mg','2027-04-30','Novartis',45,'Thụy Sĩ','','LOT-VOL-50','Đau bụng, ợ nóng',190),(37,'2026-05-13 00:39:02.146443','Viên',1400.00,'Meloxicam',_binary '','2026-05-13 00:39:02.146443','Mobic 7.5mg','Viêm khớp','Loét dạ dày hoạt động','Viên','Uống',900.00,'7,5mg','2027-09-15','Boehringer',35,'Đức','','LOT-MOB-75','Chóng mặt',125),(38,'2026-05-13 00:39:02.146443','Viên',2200.00,'Naproxen',_binary '','2026-05-13 00:39:02.146443','Naprosyn 500mg','Viêm khớp, đau kinh','Loét dạ dày, tam cá nguyệt cuối','Viên bao phim','Uống',1500.00,'500mg','2027-03-20','Roche',30,'Thụy Sĩ','','LOT-NAP-500','Ợ nóng',88),(39,'2026-05-13 00:39:02.146443','Viên',3500.00,'Esomeprazol',_binary '','2026-05-13 00:39:02.146443','Nexium 40mg','Trào ngược, loét dạ dày','Mẫn cảm','Viên vi bao','Uống',2500.00,'40mg','2027-12-01','AstraZeneca',25,'Thụy Điển','','LOT-NEX-40','Đau đầu',56),(40,'2026-05-13 00:39:02.146443','Viên',3200.00,'Pantoprazol',_binary '','2026-05-13 00:39:02.146443','Controloc 40mg','Trào ngược, loét','Mẫn cảm','Viên','Uống',2200.00,'40mg','2027-08-20','Takeda',28,'Đức','','LOT-CON-40','Tiêu chảy',74),(41,'2026-05-13 00:39:02.146443','Viên',900.00,'Famotidin',_binary '','2026-05-13 00:39:02.146443','Pepcid AC 20mg','Ợ nóng, trào ngược nhẹ','Quá mẫn','Viên','Uống',550.00,'20mg','2028-01-10','Merck',50,'Mỹ','','LOT-PEP-20','Đau đầu hiếm',200),(42,'2026-05-13 00:39:02.146443','Viên',650.00,'Loperamid',_binary '','2026-05-13 00:39:02.146443','Imodium 2mg','Tiêu chảy cấp không nhiễm trùng','Viêm đại tràng giả mạc','Viên nang','Uống',380.00,'2mg','2027-11-30','Janssen',60,'Bỉ','','LOT-IMO-2','Táo bón, đầy hơi',420),(43,'2026-05-13 00:39:02.146443','Gói',4500.00,'Diosmectit',_binary '','2026-05-13 00:39:02.146443','Smecta vị cam','Tiêu chảy, đầy hơi','Tắc ruột','Bột','Uống',3000.00,'3g/gói','2028-05-31','Ipsen',40,'Pháp','','LOT-SME-03','Táo bón nếu quá liều',180),(44,'2026-05-13 00:39:02.146443','Viên',4200.00,'Mebeverin',_binary '','2026-05-13 00:39:02.146443','Duspatalin 135mg','Hội chứng ruột kích thích','Paralytic ileus','Viên bao phim','Uống',2800.00,'135mg','2027-07-15','Abbott',30,'Ireland','','LOT-DUS-135','Chóng mặt hiếm',95),(45,'2026-05-13 00:39:02.146443','Viên',1800.00,'Fexofenadin',_binary '','2026-05-13 00:39:02.146443','Telfast 120mg','Viêm mũi dị ứng','Quá mẫn','Viên bao phim','Uống',1200.00,'120mg','2027-10-01','Sanofi',35,'Pháp','','LOT-TEL-120','Khô họng',140),(46,'2026-05-13 00:39:02.146443','Viên',2400.00,'Desloratadin',_binary '','2026-05-13 00:39:02.146443','Aerius 5mg','Dị ứng, mày đay','Quá mẫn','Viên','Uống',1700.00,'5mg','2027-12-20','Merck',28,'Mỹ','','LOT-AER-5','Mệt mỏi nhẹ',102),(47,'2026-05-13 00:39:02.146443','Viên',1100.00,'Chlorpheniramin',_binary '','2026-05-13 00:39:02.146443','Telergin 4mg','Cảm, dị ứng','Góc phối hợp MAOI','Viên','Uống',600.00,'4mg','2027-02-28','DHG',70,'Việt Nam','','LOT-TEL-4','Buồn ngủ',500),(48,'2026-05-13 00:39:02.146443','Viên',1500.00,'Phenylephrin + Paracetamol',_binary '','2026-05-13 00:39:02.146443','Decolgen ND','Cảm, sổ mũi, đau đầu','Tăng huyết áp nặng không kiểm soát','Viên nang','Uống',900.00,'Theo công thức','2028-03-15','Mega We care',50,'Thái Lan','','LOT-DEC-ND','Khô miệng',260),(49,'2026-05-13 00:39:02.146443','Viên',1300.00,'Guaifenesin + Dextromethorphan',_binary '','2026-05-13 00:39:02.146443','Robitussin CF','Ho kèm đờm (theo chỉ định)','Trẻ nhỏ không phù hợp','Siro dạng viên','Uống',800.00,'Theo nhãn','2027-05-30','Pfizer',40,'Mỹ','','LOT-ROB-CF','Buồn ngủ',75),(50,'2026-05-13 00:39:02.146443','Viên',2100.00,'Cefalexin',_binary '','2026-05-13 00:39:02.146443','Cefalexin 500mg DHG','Nhiễm khuẩn da, tiết niệu nhẹ','Dị ứng cephalosporin','Viên nang','Uống',1300.00,'500mg','2027-08-31','DHG',45,'Việt Nam','','LOT-CEX-500','Tiêu chảy',310),(51,'2026-05-13 00:39:02.146443','Viên',6800.00,'Cefuroxim',_binary '','2026-05-13 00:39:02.146443','Zinnat 500mg','Viêm xoang, viêm phổi','Dị ứng penicillin nặng','Viên bao phim','Uống',4800.00,'500mg','2027-01-31','GSK',20,'Anh','','LOT-ZIN-500','Vị đắng',48),(52,'2026-05-13 00:39:02.146443','Viên',3200.00,'Levofloxacin',_binary '','2026-05-13 00:39:02.146443','Cravit 500mg','Nhiễm khuẩn theo chỉ định','Động kinh, trẻ em','Viên bao phim','Uống',2400.00,'500mg','2027-06-15','Santen',18,'Nhật','','LOT-CRA-500','Mệt mỏi, đau khớp',33),(53,'2026-05-13 00:39:02.146443','Viên',1800.00,'Ciprofloxacin',_binary '','2026-05-13 00:39:02.146443','Ciprobay 500mg','Tiết niệu, đường ruột','Trẻ em đang lớn','Viên bao phim','Uống',1200.00,'500mg','2027-04-10','Bayer',35,'Đức','','LOT-CIP-500','Buồn nôn',120),(54,'2026-05-13 00:39:02.146443','Viên',900.00,'Trimethoprim + Sulfamethoxazol',_binary '','2026-05-13 00:39:02.146443','Biseptol 480mg','Nhiễm khuẩn đường tiết niệu','Thiếu máu nặng, thai kỳ','Viên','Uống',550.00,'80/400mg','2027-09-30','Egis',40,'Hungary','','LOT-BIS-480','Phát ban',155),(55,'2026-05-13 00:39:02.146443','Viên',4500.00,'Oseltamivir',_binary '','2026-05-13 00:39:02.146443','Tamiflu 75mg','Cúm theo chỉ định BS','Suy thận nặng (chỉnh liều)','Viên nang cứng','Uống',3300.00,'75mg','2027-12-31','Roche',12,'Thụy Sĩ','','LOT-TAM-75','Buồn nôn',24),(56,'2026-05-13 00:39:02.146443','Viên',800.00,'Albendazol',_binary '','2026-05-13 00:39:02.146443','Zentel 400mg','Giun, sán theo chỉ định','Thai kỳ đầu','Viên nén','Uống',450.00,'400mg','2028-02-28','GSK',35,'Anh','','LOT-ZEN-400','Đau bụng nhẹ',190),(57,'2026-05-13 00:39:02.146443','Viên',1200.00,'Metoclopramid',_binary '','2026-05-13 00:39:02.146443','Primperan 10mg','Buồn nôn, trào ngược','Phối hợp levodopa','Viên','Uống',700.00,'10mg','2027-03-31','Sanofi',40,'Pháp','','LOT-PRI-10','Liệt khẩn cấp hiếm',85),(58,'2026-05-13 00:39:02.146443','Viên',5500.00,'Prednisolon',_binary '','2026-05-13 00:39:02.146443','Solupred 20mg','Viêm khớp, dị ứng nặng theo BS','Nhiễm nấm hệ thống không điều trị','Viên eff','Uống',3800.00,'20mg','2027-07-31','Sanofi',15,'Pháp','','LOT-SOL-20','Tăng đường huyết',22),(59,'2026-05-13 00:39:02.146443','Viên',3800.00,'Atorvastatin',_binary '','2026-05-13 00:39:02.146443','Lipitor 20mg','Rối loạn lipid máu','Bệnh gan hoạt động','Viên bao phim','Uống',2600.00,'20mg','2028-01-15','Pfizer',25,'Mỹ','','LOT-LIP-20','Đau cơ hiếm',66),(60,'2026-05-13 00:39:02.146443','Viên',4200.00,'Rosuvastatin',_binary '','2026-05-13 00:39:02.146443','Crestor 10mg','Tăng cholesterol','Bệnh gan hoạt động','Viên bao phim','Uống',3000.00,'10mg','2027-11-30','AstraZeneca',22,'Anh','','LOT-CRE-10','Đau đầu',58),(61,'2026-05-13 00:39:02.146443','Viên',2500.00,'Clopidogrel',_binary '','2026-05-13 00:39:02.146443','Plavix 75mg','Phòng huyết khối sau stent','Xuất huyết đang hoạt động','Viên bao phim','Uống',1800.00,'75mg','2027-10-20','Sanofi',20,'Pháp','','LOT-PLA-75','Chảy máu chân răng',41),(62,'2026-05-13 00:39:02.146443','Viên',500.00,'Acetylsalicylic acid',_binary '','2026-05-13 00:39:02.146443','Aspirin 81mg','Phòng cục máu đông theo chỉ định','Loét dạ dày, hen','Viên bao tan trong ruột','Uống',280.00,'81mg','2028-06-30','Bayer',60,'Đức','','LOT-ASP-81','Ợ nóng',300),(63,'2026-05-13 00:39:02.146443','Viên',3100.00,'Bisoprolol',_binary '','2026-05-13 00:39:02.146443','Concor 5mg','Tăng huyết áp, suy tim','Block AV độ 2-3 không máy tạo nhịp','Viên','Uống',2100.00,'5mg','2027-08-31','Merck',28,'Đức','','LOT-CON-5','Mệt mỏi',47),(64,'2026-05-13 00:39:02.146443','Viên',3600.00,'Carvedilol',_binary '','2026-05-13 00:39:02.146443','Dilatrend 25mg','Suy tim, tăng huyết áp','Hen phế quản nặng','Viên','Uống',2500.00,'25mg','2027-05-15','Roche',22,'Thụy Sĩ','','LOT-DIL-25','Chóng mặt',39),(65,'2026-05-13 00:39:02.146443','Viên',1900.00,'Spironolacton',_binary '','2026-05-13 00:39:02.146443','Aldactone 25mg','Phù, suy tim (theo BS)','Suy thận nặng, tăng kali máu','Viên','Uống',1200.00,'25mg','2027-12-10','Pfizer',30,'Mỹ','','LOT-ALD-25','Vú to nam',52),(66,'2026-05-13 00:39:02.146443','Viên',850.00,'Vitamin B1 B6 B12',_binary '','2026-05-13 00:39:02.146443','Neurobion','Viêm dây thần kinh nhẹ, mệt mỏi','Quá mẫn','Viên bao phim','Uống',500.00,'Theo công thức','2028-07-31','Merck',55,'Đức','','LOT-NEU-01','Khó chịu dạ dày hiếm',400),(67,'2026-05-13 00:39:02.146443','Viên',1200.00,'Calci carbonat + Vitamin D3',_binary '','2026-05-13 00:39:02.146443','Calci-D 500mg','Thiếu calci, loãng xương hỗ trợ','Tăng calci máu','Viên nén','Uống',750.00,'500mg + D3','2028-02-15','Merck',45,'Đức','','LOT-CAD-500','Táo bón',210),(68,'2026-05-13 00:39:02.146443','Viên',4500.00,'Omega-3 acid ethyl esters',_binary '','2026-05-13 00:39:02.146443','Omacor 1000mg','Rối loạn lipid (theo BS)','Dị ứng cá','Viên nang mềm','Uống',3200.00,'1000mg','2027-09-30','AbbVie',15,'Đức','','LOT-OMA-1G','Ợ cá',28),(69,'2026-05-13 00:39:02.146443','Viên',1700.00,'Gabapentin',_binary '','2026-05-13 00:39:02.146443','Neurontin 300mg','Đau thần kinh, động kinh (theo BS)','Suy hô hấp do opioid phối hợp','Viên nang cứng','Uống',1100.00,'300mg','2027-04-30','Pfizer',20,'Mỹ','','LOT-NEU-300','Buồn ngủ, chóng mặt',35),(70,'2026-05-13 00:44:16.360891','Viên',2400.00,'Sitagliptin',_binary '','2026-05-13 00:44:16.360891','Januvia 100mg','ĐTĐ typ 2','Typ 1','Viên bao phim','Uống',1700.00,'100mg','2027-08-31','Merck',20,'Mỹ','','LOT-JAN-100','Viêm mũi hiếm',44),(71,'2026-05-13 00:44:16.360891','Viên',5200.00,'Empagliflozin',_binary '','2026-05-13 00:44:16.360891','Jardiance 10mg','ĐTĐ typ 2, bảo vệ thận/tim (theo BS)','Suy thận nặng','Viên bao phim','Uống',3800.00,'10mg','2027-12-31','Boehringer',15,'Đức','','LOT-JAR-10','Tiểu đường âm đạo hiếm',26),(72,'2026-05-13 00:44:16.360891','Viên',1800.00,'Gliclazid',_binary '','2026-05-13 00:44:16.360891','Diamicron MR 30mg','ĐTĐ typ 2','Đái tháo đường typ 1 đơn độc','Viên MR','Uống',1100.00,'30mg','2027-06-30','Servier',35,'Pháp','','LOT-DIA-30','Hạ đường huyết',90),(73,'2026-05-13 00:44:16.360891','Viên',2100.00,'Repaglinid',_binary '','2026-05-13 00:44:16.360891','Novonorm 2mg','ĐTĐ typ 2 sau ăn','Typ 1','Viên','Uống',1400.00,'2mg','2027-05-20','Novo Nordisk',25,'Đan Mạch','','LOT-NOV-2','Hạ đường',38),(74,'2026-05-13 00:44:16.360891','Viên',1600.00,'Allopurinol',_binary '','2026-05-13 00:44:16.360891','Zyloric 300mg','Gút, tăng acid uric','Suy gan nặng','Viên','Uống',900.00,'300mg','2028-01-31','Aspen',30,'Pháp','','LOT-ZYL-300','Phát ban',72),(75,'2026-05-13 00:44:16.360891','Viên',2800.00,'Febuxostat',_binary '','2026-05-13 00:44:16.360891','Adenuric 80mg','Gút mạn (theo BS)','Đang điều trị mercaptopurin','Viên bao phim','Uống',2000.00,'80mg','2027-10-15','Menarini',12,'Ý','','LOT-ADE-80','Đau cơ',18),(76,'2026-05-13 00:44:16.360891','Viên',1300.00,'Colchicin',_binary '','2026-05-13 00:44:16.360891','Colchicin 1mg Stada','Cơn gút cấp','Suy gan thận nặng','Viên','Uống',800.00,'1mg','2027-04-30','Stada',25,'Đức','','LOT-COL-1','Tiêu chảy',55),(77,'2026-05-13 00:44:16.360891','Viên',900.00,'Tranexamic acid',_binary '','2026-05-13 00:44:16.360891','Transamin 250mg','Chảy máu do rong kinh, sau mổ (theo BS)','Huyết khối tĩnh mạch đang hoạt động','Viên bao phim','Uống',550.00,'250mg','2027-09-30','Mitsubishi Tanabe',40,'Nhật','','LOT-TRA-250','Buồn nôn',120),(78,'2026-05-13 00:44:16.360891','Viên',4500.00,'Rivaroxaban',_binary '','2026-05-13 00:44:16.360891','Xarelto 15mg','Phòng huyết khối (theo BS)','Xuất huyết não đang hoạt động','Viên bao phim','Uống',3300.00,'15mg','2027-11-30','Bayer',14,'Đức','','LOT-XAR-15','Chảy máu',20),(79,'2026-05-13 00:44:16.360891','Viên',3800.00,'Apixaban',_binary '','2026-05-13 00:44:16.360891','Eliquis 5mg','Rung nhĩ, huyết khối (theo BS)','Xuất huyết nặng','Viên bao phim','Uống',2800.00,'5mg','2027-07-31','Pfizer',14,'Mỹ','','LOT-ELI-5','Chảy máu mũi',16),(80,'2026-05-13 00:44:16.360891','Viên',2200.00,'Warfarin',_binary '','2026-05-13 00:44:16.360891','Marevan 5mg','Phòng/tri huyết khối (theo BS)','Chảy máu, thai không kiểm soát','Viên','Uống',1400.00,'5mg','2028-03-31','Orion',20,'Phần Lan','','LOT-MAR-5','Chảy máu nướu',33),(81,'2026-05-13 00:44:16.360891','Viên',1900.00,'Digoxin',_binary '','2026-05-13 00:44:16.360891','Lanoxin 0.25mg','Suy tim, rung nhĩ chậm (theo BS)','Block nhĩ thất','Viên','Uống',1200.00,'0,25mg','2027-12-15','Aspen',18,'Ireland','','LOT-LAN-025','Buồn nôn, nhìn vàng xanh',25),(82,'2026-05-13 00:44:16.360891','Viên',2700.00,'Furosemid',_binary '','2026-05-13 00:44:16.360891','Lasix 40mg','Phù, suy tim (theo BS)','Suy thận không tiểu được','Viên','Uống',1600.00,'40mg','2027-08-31','Sanofi',30,'Pháp','','LOT-LAS-40','Tụt huyết áp, tăng acid uric',68),(83,'2026-05-13 00:44:16.360891','Viên',1400.00,'Hydrochlorothiazid',_binary '','2026-05-13 00:44:16.360891','Esidrex 25mg','Tăng huyết áp, phù nhẹ','Suy thận nặng, tăng kali','Viên','Uống',850.00,'25mg','2027-05-31','Novartis',40,'Thụy Sĩ','','LOT-ESI-25','Chóng mặt',95),(84,'2026-05-13 00:44:16.360891','Viên',3200.00,'Tamsulosin',_binary '','2026-05-13 00:44:16.360891','Flomax 0.4mg','Phì đại lành tính tuyến tiền liệt','Tụt huyết áp khi đứng','Viên MR','Uống',2300.00,'0,4mg','2027-09-20','Astellas',22,'Nhật','','LOT-FLO-04','Chóng mặt',41),(85,'2026-05-13 00:44:16.360891','Viên',4100.00,'Finasterid',_binary '','2026-05-13 00:44:16.360891','Proscar 5mg','Phì đại tuyến tiền liệt','Phụ nữ có thai','Viên bao phim','Uống',2800.00,'5mg','2028-02-28','Merck',15,'Mỹ','','LOT-PRO-5','Giảm ham muốn tình dục',19),(86,'2026-05-13 00:44:16.360891','Viên',2600.00,'Solifenacin',_binary '','2026-05-13 00:44:16.360891','Vesicare 10mg','Tiểu không tự chủ do bàng quang tăng hoạt động','Bí tiểu, glaucoma góc đóng','Viên bao phim','Uống',1800.00,'10mg','2027-06-15','Astellas',18,'Nhật','','LOT-VES-10','Khô miệng, táo bón',27),(87,'2026-05-13 00:44:16.360891','Viên',1500.00,'Oxymetazolin',_binary '','2026-05-13 00:44:16.360891','Otrivin 0.1% xịt','Nghẹt mũi','Viêm mũi khô','Dung dịch xịt','Xịt mũi',900.00,'0,1%','2027-12-31','Novartis',35,'Thụy Sĩ','','LOT-OTR-01','Chảy máu cam nếu lạm dụng',85),(88,'2026-05-13 00:44:16.360891','Viên ngậm',1200.00,'Amylmetacresol + Dichlorobenzyl alcohol',_binary '','2026-05-13 00:44:16.360891','Strepsils chanh mật ong','Đau họng nhẹ','Quá mẫn','Viên ngậm','Ngậm',700.00,'Theo nhãn','2028-05-31','Reckitt',50,'Anh','','LOT-STR-HO','Rát lưỡi',200),(89,'2026-05-13 00:44:16.360891','Lọ',8500.00,'Tobramycin',_binary '','2026-05-13 00:44:16.360891','Tobrex nhỏ mắt 5ml','Viêm kết mạc do khuẩn','Quá mẫn aminoglycosid','Nhỏ mắt','Nhỏ mắt',5500.00,'0,3%','2027-11-15','Novartis',20,'Thụy Sĩ','','LOT-TOB-5','Ngứa mắt',42),(90,'2026-05-13 00:44:16.360891','Chai',3200.00,'Povidon iod',_binary '','2026-05-13 00:44:16.360891','Betadine 10% 125ml','Sát khuẩn da, vết thương','Quá mẫn iod','Dung dịch','Rửa ngoài da',2100.00,'10%','2028-08-31','Mundipharma',25,'Đức','','LOT-BET-125','Kích ứng da',60),(91,'2026-05-13 00:44:16.360891','Chai',1500.00,'Hydrogen peroxide',_binary '','2026-05-13 00:44:16.360891','Oxy già 3% 100ml','Rửa vết thương','Không nuốt','Dung dịch','Rửa ngoài',600.00,'3%','2028-12-31','OPC',40,'Việt Nam','','LOT-OXY-100','Kích ứng da',150),(92,'2026-05-13 00:44:16.360891','Tuýp',4200.00,'Fusidic acid',_binary '','2026-05-13 00:44:16.360891','Fucidin cream 2%','Nhiễm khuẩn da nông','Quá mẫn','Kem','Bôi da',2800.00,'2%','2027-10-31','Leo Pharma',18,'Đan Mạch','','LOT-FUC-2','Ngứa da',31),(93,'2026-05-13 00:44:16.360891','Tuýp',3800.00,'Mupirocin',_binary '','2026-05-13 00:44:16.360891','Bactroban 2% 15g','Viêm da nhiễm khuẩn','Quá mẫn','Kem','Bôi da',2500.00,'2%','2027-04-30','GSK',16,'Anh','','LOT-BAC-15','Rát da',22),(94,'2026-05-13 00:44:16.360891','Tuýp',2800.00,'Hydrocortison',_binary '','2026-05-13 00:44:16.360891','HC cream 1%','Viêm da nhẹ, côn trùng đốt','Nhiễm virus/lao da','Kem','Bôi da',1700.00,'1%','2027-07-31','Stiefel',22,'Mỹ','','LOT-HC-1','Teo da nếu lạm dụng',40),(95,'2026-05-13 00:44:16.360891','Tuýp',5200.00,'Betamethason + Gentamicin',_binary '','2026-05-13 00:44:16.360891','Diprogenta cream','Viêm da có nhiễm khuẩn kèm (theo BS)','Herpes da rộng','Kem','Bôi da',3600.00,'Theo nhãn','2027-09-30','Merck',12,'Đức','','LOT-DIP-01','Teo da',15),(96,'2026-05-13 00:44:16.360891','Viên',1100.00,'Orlistat',_binary '','2026-05-13 00:44:16.360891','Xenical 120mg','Béo phì (theo BS)','Hội chứng hấp thu kém mạn','Viên nang cứng','Uống',750.00,'120mg','2027-08-15','Roche',15,'Thụy Sĩ','','LOT-XEN-120','Tiêu chảy mỡ',28),(97,'2026-05-13 00:44:16.360891','Viên',4500.00,'Dutasterid + Tamsulosin',_binary '','2026-05-13 00:44:16.360891','Duodart','Phì đại tuyến tiền liệt (theo BS)','Phụ nữ','Viên MR','Uống',3200.00,'0,5mg + 0,4mg','2027-12-01','GSK',10,'Anh','','LOT-DUO-01','Chóng mặt',12),(98,'2026-05-13 00:44:16.360891','Viên',1600.00,'Clotrimazol',_binary '','2026-05-13 00:44:16.360891','Canesten 500mg','Nấm âm đạo đơn liều (theo chỉ định)','Quá mẫn','Viên đạn','Đặt',1000.00,'500mg','2027-06-30','Bayer',20,'Đức','','LOT-CAN-500','Kích ứng cục bộ',35),(99,'2026-05-13 00:44:16.360891','Viên',900.00,'Metronidazol',_binary '','2026-05-13 00:44:16.360891','Flagyl 250mg (lọ 20 viên)','Viêm âm đạo do Trichomonas (theo BS)','Tam cá nguyệt đầu','Viên','Uống',600.00,'250mg','2027-05-31','Sanofi',45,'Pháp','','LOT-FLG-250','Vị kim loại',200),(100,'2026-05-13 00:44:16.360891','Viên',1300.00,'Nystatin',_binary '','2026-05-13 00:44:16.360891','Nystatin 500000 IU','Nấm Candida miệng-ruột','Quá mẫn','Viên','Uống',800.00,'500000 IU','2028-01-31','Teva',30,'Israel','','LOT-NYS-5','Buồn nôn',55),(101,'2026-05-13 00:44:16.360891','Viên',1700.00,'Pyrantel pamoat',_binary '','2026-05-13 00:44:16.360891','Combantrin 250mg','Giun kim, giun đũa','Viêm gan cấp','Viên nén','Uống',1000.00,'250mg','2027-11-30','Pfizer',35,'Mỹ','','LOT-COM-250','Buồn nôn',70),(102,'2026-05-13 00:44:16.360891','Viên',2100.00,'Mebendazol',_binary '','2026-05-13 00:44:16.360891','Vermox 100mg','Nhiễm giun','Thai kỳ đầu','Viên nén','Uống',1300.00,'100mg','2027-09-15','Janssen',30,'Bỉ','','LOT-VER-100','Đau bụng',45),(103,'2026-05-13 00:44:16.360891','Viên',800.00,'Activated charcoal',_binary '','2026-05-13 00:44:16.360891','Than hoạt tính 250mg','Hấp phụ độc chất cấp (theo BS)','Tắc ruột','Viên nén','Uống',400.00,'250mg','2028-06-30','DHG',50,'Việt Nam','','LOT-TH-250','Phân đen',180),(104,'2026-05-13 00:44:16.360891','Gói',3500.00,'Racecadotril',_binary '','2026-05-13 00:44:16.360891','Hidrasec 100mg','Tiêu chảy cấp (kèm ORS)','Suy mạn không dùng','Gói hạt nhỏ','Uống',2400.00,'100mg','2027-07-31','Biocodex',25,'Pháp','','LOT-HID-100','Phát ban hiếm',40),(105,'2026-05-13 00:44:16.360891','Viên',1900.00,'Hyoscine butylbromide',_binary '','2026-05-13 00:44:16.360891','Buscopan 10mg','Co thắt ruột, đau bụng kinh','Glaucoma góc đóng','Viên bao phim','Uống',1200.00,'10mg','2027-12-31','Boehringer',40,'Đức','','LOT-BUS-10','Khô miệng',130),(106,'2026-05-13 00:44:16.360891','Viên',2300.00,'Trimebutin maleat',_binary '','2026-05-13 00:44:16.360891','Spasmaverine 200mg','Đau bụng do co thắt','Paralytic ileus','Viên','Uống',1500.00,'200mg','2027-08-20','Recordati',30,'Ý','','LOT-SPA-200','Buồn ngủ hiếm',62),(107,'2026-05-13 00:44:16.360891','Viên',1400.00,'Sulpirid',_binary '','2026-05-13 00:44:16.360891','Dogmatil 50mg','Rối loạn tiêu hóa chức năng, lo âu nhẹ','Phaeochromocytoma','Viên bao phim','Uống',900.00,'50mg','2027-04-30','Abbott',25,'Pháp','','LOT-DOG-50','Buồn ngủ',48),(108,'2026-05-13 00:44:16.360891','Viên',2600.00,'Sertralin',_binary '','2026-05-13 00:44:16.360891','Zoloft 50mg','Trầm cảm, lo âu (theo BS)','Pha I MAOI','Viên bao phim','Uống',1800.00,'50mg','2028-03-31','Pfizer',15,'Mỹ','','LOT-ZOL-50','Buồn nôn, rối loạn cương',22),(109,'2026-05-13 00:44:16.360891','Viên',1800.00,'Amitriptylin',_binary '','2026-05-13 00:44:16.360891','Tryptizol 25mg','Đau thần kinh, trầm cảm (theo BS)','Block tim cận tại, glaucoma góc đóng','Viên bao phim','Uống',1100.00,'25mg','2027-10-31','Merck',18,'Đức','','LOT-TRY-25','Khô miệng, buồn ngủ',30),(110,'2026-05-13 00:44:16.360891','Viên',3400.00,'Quetiapin',_binary '','2026-05-13 00:44:16.360891','Seroquel 25mg','Rối loạn tâm thần (theo BS)','Hạ huyết áp tư thế','Viên bao phim','Uống',2500.00,'25mg','2027-06-30','AstraZeneca',10,'Anh','','LOT-SER-25','Buồn ngủ, tăng cân',14),(111,'2026-05-13 00:44:16.360891','Viên',1200.00,'Zolpidem',_binary '','2026-05-13 00:44:16.360891','Stilnox 10mg','Mất ngủ ngắn hạn (theo BS)','Suy hô hấp nặng','Viên bao phim','Uống',800.00,'10mg','2027-05-31','Sanofi',12,'Pháp','','LOT-STI-10','Buồn ngủ ban ngày',18),(112,'2026-05-13 00:44:16.360891','Viên',950.00,'Dimenhydrinat',_binary '','2026-05-13 00:44:16.360891','Vomisin 50mg','Say tàu xe, buồn nôn','Glaucoma góc đóng','Viên','Uống',550.00,'50mg','2027-09-30','DHG',45,'Việt Nam','','LOT-VOM-50','Buồn ngủ',160),(113,'2026-05-13 00:44:16.360891','Viên',700.00,'Zinc gluconat',_binary '','2026-05-13 00:44:16.360891','Zinc 15mg OPC','Bổ sung kẽm','Quá mẫn','Viên','Uống',350.00,'15mg','2028-09-30','OPC',70,'Việt Nam','','LOT-ZN-15','Buồn nôn hiếm',320),(114,'2026-05-13 00:44:16.360891','Viên',1100.00,'Vitamin D3',_binary '','2026-05-13 00:44:16.360891','Vitamin D3 1000 IU','Thiếu vitamin D','Tăng calci máu','Viên mềm','Uống',600.00,'1000 IU','2028-04-30','Kirkland',60,'Mỹ','','LOT-VD3-1K','Táo bón hiếm',400),(115,'2026-05-13 00:44:16.360891','Viên',1600.00,'Alpha cholecalciferol',_binary '','2026-05-13 00:44:16.360891','One-Alpha 0.25mcg','Hạ calci máu thứ phát CKD','Tăng calci máu','Viên nang mềm','Uống',1100.00,'0,25mcg','2027-11-30','Teva',20,'Israel','','LOT-OAC-025','Đau đầu',25),(116,'2026-05-13 00:44:16.360891','Viên',2200.00,'Sắt liposomal',_binary '','2026-05-13 00:44:16.360891','Sideral forte','Thiếu sắt (hỗ trợ)','Thalassemia không thiếu sắt','Viên','Uống',1400.00,'Theo nhãn','2027-12-31','Pharmanutra',30,'Ý','','LOT-SID-F','Táo bón',55),(117,'2026-05-13 00:44:16.360891','Viên',1300.00,'Probiotic blend',_binary '','2026-05-13 00:44:16.360891','Enterogermina Plus','Rối loạn tiêu hóa sau kháng sinh','Dị ứng sữa','Viên nang','Uống',800.00,'Theo nhãn','2028-02-28','Sanofi',45,'Ý','','LOT-ENT-P','Đầy hơi',90),(118,'2026-05-13 00:44:16.360891','Gói',600.00,'Electrolyte + Zinc',_binary '','2026-05-13 00:44:16.360891','Oresol Kids cam','Tiêu chảy trẻ em kèm ORS','Bất tỉnh không uống được','Gói bột','Pha uống',350.00,'Theo nhãn','2028-05-31','OPC',90,'Việt Nam','','LOT-ORS-K','Nôn nếu uống quá nhanh',450),(119,'2026-05-13 00:44:16.360891','Viên',2500.00,'Telmisartan',_binary '','2026-05-13 00:44:16.360891','Micardis 40mg','Tăng huyết áp','Thai kỳ','Viên','Uống',1700.00,'40mg','2027-08-15','Boehringer',25,'Đức','','LOT-MIC-40','Chóng mặt',58),(120,'2026-05-13 00:44:16.360891','Viên',2900.00,'Perindopril',_binary '','2026-05-13 00:44:16.360891','Coversyl 5mg','Tăng huyết áp, suy tim','Phù mạch di truyền','Viên bao phim','Uống',2000.00,'5mg','2027-10-31','Servier',28,'Pháp','','LOT-COV-5','Ho khan',64),(121,'2026-05-13 00:44:16.360891','Viên',2400.00,'Valsartan',_binary '','2026-05-13 00:44:16.360891','Diovan 80mg','Tăng huyết áp','Thai kỳ','Viên bao phim','Uống',1600.00,'80mg','2027-07-20','Novartis',26,'Thụy Sĩ','','LOT-DIO-80','Chóng mặt',51),(122,'2026-05-13 00:44:16.360891','Viên',1800.00,'Metoprolol',_binary '','2026-05-13 00:44:16.360891','Betaloc ZOK 50mg','Tăng huyết áp, loạn nhịp','Block AV độ 2-3','Viên MR','Uống',1200.00,'50mg','2027-09-10','AstraZeneca',30,'Thụy Điển','','LOT-BET-Z50','Mệt mỏi',73),(123,'2026-05-13 00:44:16.360891','Viên',2700.00,'Dapagliflozin',_binary '','2026-05-13 00:44:16.360891','Forxiga 10mg','ĐTĐ typ 2, suy tim (theo BS)','Typ 1','Viên bao phim','Uống',1900.00,'10mg','2027-12-20','AstraZeneca',18,'Anh','','LOT-FOR-10','Tiểu nhiều',36),(124,'2026-05-13 00:44:16.360891','Viên',1600.00,'Linagliptin',_binary '','2026-05-13 00:44:16.360891','Trajenta 5mg','ĐTĐ typ 2','Typ 1','Viên','Uống',1100.00,'5mg','2027-11-15','Boehringer',22,'Đức','','LOT-TRA-5','Ho nhẹ',41),(125,'2026-05-13 00:44:16.360891','Viên',1400.00,'Acarbose',_binary '','2026-05-13 00:44:16.360891','Glucobay 50mg','ĐTĐ typ 2 sau ăn','Viêm ruột, tắc ruột','Viên','Uống',900.00,'50mg','2027-06-30','Bayer',30,'Đức','','LOT-GLU-50','Đầy hơi, tiêu chảy',67),(126,'2026-05-13 00:44:16.360891','Bút',3300.00,'Insulin glargine',_binary '','2026-05-13 00:44:16.360891','Lantus Solostar 100IU/ml','ĐTĐ (theo BS)','Hạ đường huyết không kiểm soát','Bút tiêm dựng sẵn','Tiêm dưới da',2500.00,'100 IU/ml','2027-08-31','Sanofi',8,'Pháp','','LOT-LAN-SO','Gồ cứng mỡ',14),(127,'2026-05-13 00:44:16.360891','Viên',900.00,'Salicylic acid (topical)',_binary '','2026-05-13 00:44:16.360891','Aspisol gel 2%','Mụn cóc, vảy nến da nhẹ','Vết thương hở rộng','Gel','Bôi da',500.00,'2%','2027-12-31','Stiefel',25,'Mỹ','','LOT-ASP-G2','Kích ứng da',55),(128,'2026-05-13 00:44:16.360891','Chai',4800.00,'Chlorhexidin',_binary '','2026-05-13 00:44:16.360891','Savacol 0.2% 200ml','Súc miệng sau nhổ răng','Nuốt nhiều','Dung dịch','Súc miệng',3100.00,'0,2%','2028-01-31','Colgate-Palmolive',20,'Thái Lan','','LOT-SAV-02','Nhuộm răng tạm',38),(129,'2026-05-13 00:44:16.360891','Viên',1250.00,'Erythromycin',_binary '','2026-05-13 00:44:16.360891','Erythrocin 250mg','Nhiễm khuẩn nhạy cảm','Dị ứng macrolid','Viên bao phim','Uống',800.00,'250mg','2027-05-31','Abbott',35,'Úc','','LOT-ERY-250','Buồn nôn',88);
/*!40000 ALTER TABLE `thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tin_nhan`
--

DROP TABLE IF EXISTS `tin_nhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tin_nhan` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ma_phong` bigint(20) DEFAULT NULL,
  `noi_dung` varchar(2000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ma_nguoi_gui` bigint(20) NOT NULL,
  `ma_nguoi_nhan` bigint(20) DEFAULT NULL,
  `dinh_kem_duong_dan` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dinh_kem_loai` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dinh_kem_ten` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phan_ung_json` varchar(4000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdfdbpidd2mc7v6hoknxvbn8lm` (`ma_nguoi_gui`),
  KEY `FKa0ebupe71wprqyn1gui8hdxpf` (`ma_nguoi_nhan`),
  CONSTRAINT `FKa0ebupe71wprqyn1gui8hdxpf` FOREIGN KEY (`ma_nguoi_nhan`) REFERENCES `nguoi_dung` (`id`),
  CONSTRAINT `FKdfdbpidd2mc7v6hoknxvbn8lm` FOREIGN KEY (`ma_nguoi_gui`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tin_nhan`
--

LOCK TABLES `tin_nhan` WRITE;
/*!40000 ALTER TABLE `tin_nhan` DISABLE KEYS */;
INSERT INTO `tin_nhan` VALUES (1,1,'Xin chào','2026-05-02 19:41:54.965217',1,NULL,NULL,NULL,NULL,NULL),(2,1,'Chào bạn','2026-05-02 19:43:03.404488',8,NULL,NULL,NULL,NULL,NULL),(3,0,'Chào bạn','2026-05-03 08:45:48.551405',1,7,NULL,NULL,NULL,NULL),(4,0,'Chào bạn','2026-05-03 08:46:32.921924',7,1,NULL,NULL,NULL,NULL),(5,0,'Xin chào','2026-05-03 08:46:36.639388',1,7,NULL,NULL,NULL,NULL),(6,0,'Có gì ko','2026-05-03 08:46:46.109454',7,1,NULL,NULL,NULL,NULL),(7,0,'Đi ăn cơm ko','2026-05-03 08:46:54.301021',1,7,NULL,NULL,NULL,NULL),(8,0,'Cười nào','2026-05-03 08:51:18.245018',1,7,NULL,NULL,NULL,NULL),(9,0,'Đúng rồi','2026-05-03 08:51:31.961081',7,1,NULL,NULL,NULL,NULL),(10,0,'123 zo','2026-05-03 08:51:33.705099',7,1,NULL,NULL,NULL,NULL),(11,0,'123123','2026-05-03 08:51:42.719133',7,1,NULL,NULL,NULL,NULL),(12,0,'312','2026-05-03 08:51:43.074146',7,1,NULL,NULL,NULL,NULL),(13,0,'3','2026-05-03 08:51:43.194133',7,1,NULL,NULL,NULL,NULL),(14,0,'12','2026-05-03 08:51:43.363132',7,1,NULL,NULL,NULL,NULL),(15,0,'31','2026-05-03 08:51:43.519134',7,1,NULL,NULL,NULL,NULL),(16,0,'231','2026-05-03 08:51:43.728258',7,1,NULL,NULL,NULL,NULL),(17,0,'3','2026-05-03 08:51:43.885252',7,1,NULL,NULL,NULL,NULL),(18,0,'1','2026-05-03 08:51:44.067397',7,1,NULL,NULL,NULL,NULL),(19,0,'123','2026-05-03 09:39:01.364888',1,7,NULL,NULL,NULL,NULL),(20,0,'123','2026-05-03 09:39:01.621886',1,7,NULL,NULL,NULL,NULL),(21,0,'12','2026-05-03 09:39:01.832887',1,7,NULL,NULL,NULL,NULL),(22,0,'31','2026-05-03 09:39:02.015884',1,7,NULL,NULL,NULL,NULL),(23,0,'23','2026-05-03 09:39:02.186894',1,7,NULL,NULL,NULL,NULL),(24,0,'1','2026-05-03 09:39:02.344889',1,7,NULL,NULL,NULL,NULL),(25,0,'23','2026-05-03 09:39:03.461520',1,7,NULL,NULL,NULL,NULL),(26,0,'❌❌❌❌❌','2026-05-03 10:20:57.558390',1,7,NULL,NULL,NULL,'{\"1\":\"❤️\"}'),(27,0,'Chào bạn','2026-05-11 11:10:40.038894',9,6,NULL,NULL,NULL,'{\"9\":\"?\"}'),(28,0,'Xin chào việt nam','2026-05-11 11:10:43.545479',9,6,NULL,NULL,NULL,'{\"9\":\"❤️\"}');
/*!40000 ALTER TABLE `tin_nhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tin_nhan_chat`
--

DROP TABLE IF EXISTS `tin_nhan_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tin_nhan_chat` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ma_nguoi_gui` bigint(20) NOT NULL,
  `ma_phong` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `noi_dung` varchar(2000) COLLATE utf8_unicode_ci NOT NULL,
  `tao_luc` datetime(6) DEFAULT NULL,
  `ten_nguoi_gui` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tin_nhan_chat`
--

LOCK TABLES `tin_nhan_chat` WRITE;
/*!40000 ALTER TABLE `tin_nhan_chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `tin_nhan_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vai_tro_nguoi_dung`
--

DROP TABLE IF EXISTS `vai_tro_nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vai_tro_nguoi_dung` (
  `ma_nguoi_dung` bigint(20) NOT NULL,
  `vai_tro` enum('QUAN_TRI','LE_TAN','BAC_SI','THU_NGAN','BENH_NHAN') COLLATE utf8_unicode_ci DEFAULT NULL,
  KEY `FKp4xopafv6hdqgqb0cumu3ovdd` (`ma_nguoi_dung`),
  CONSTRAINT `FKp4xopafv6hdqgqb0cumu3ovdd` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vai_tro_nguoi_dung`
--

LOCK TABLES `vai_tro_nguoi_dung` WRITE;
/*!40000 ALTER TABLE `vai_tro_nguoi_dung` DISABLE KEYS */;
INSERT INTO `vai_tro_nguoi_dung` VALUES (2,'LE_TAN'),(3,'BAC_SI'),(4,'THU_NGAN'),(5,'QUAN_TRI'),(1,'QUAN_TRI'),(6,'BAC_SI'),(7,'BAC_SI'),(8,'BENH_NHAN'),(9,'BENH_NHAN');
/*!40000 ALTER TABLE `vai_tro_nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-14  1:35:37
