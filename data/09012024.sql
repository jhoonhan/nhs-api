CREATE DATABASE  IF NOT EXISTS `roster` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `roster`;
-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (arm64)
--
-- Host: 127.0.0.1    Database: roster
-- ------------------------------------------------------
-- Server version	8.0.38

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
-- Table structure for table `approved`
--

DROP TABLE IF EXISTS `approved`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approved` (
  `shift_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('approved','pending') NOT NULL,
  `approved_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` int NOT NULL,
  PRIMARY KEY (`shift_id`,`user_id`),
  KEY `approved_by` (`approved_by`),
  KEY `shift_id` (`shift_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `approved_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `user` (`user_id`),
  CONSTRAINT `approved_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`shift_id`),
  CONSTRAINT `approved_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approved`
--

LOCK TABLES `approved` WRITE;
/*!40000 ALTER TABLE `approved` DISABLE KEYS */;
/*!40000 ALTER TABLE `approved` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compute_record`
--

DROP TABLE IF EXISTS `compute_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compute_record` (
  `month` int NOT NULL,
  `year` int NOT NULL,
  `iteration` int NOT NULL,
  `record_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`month`,`year`,`iteration`),
  UNIQUE KEY `record_id` (`record_id`),
  UNIQUE KEY `unique_record_id` (`record_id`),
  KEY `record_id_index` (`record_id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compute_record`
--

LOCK TABLES `compute_record` WRITE;
/*!40000 ALTER TABLE `compute_record` DISABLE KEYS */;
INSERT INTO `compute_record` VALUES (8,2024,1,100),(8,2024,2,101),(8,2024,3,102),(8,2024,4,103),(8,2024,5,104);
/*!40000 ALTER TABLE `compute_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conflict`
--

DROP TABLE IF EXISTS `conflict`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conflict` (
  `record_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`record_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conflict_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `compute_record` (`record_id`),
  CONSTRAINT `conflict_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conflict`
--

LOCK TABLES `conflict` WRITE;
/*!40000 ALTER TABLE `conflict` DISABLE KEYS */;
/*!40000 ALTER TABLE `conflict` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `day`
--

DROP TABLE IF EXISTS `day`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `day` (
  `day_id` int NOT NULL AUTO_INCREMENT,
  `week_id` int DEFAULT NULL,
  `day_num` int NOT NULL,
  `month` int DEFAULT NULL,
  `status` enum('closed','pending') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`day_id`),
  KEY `week_id` (`week_id`),
  CONSTRAINT `day_ibfk_1` FOREIGN KEY (`week_id`) REFERENCES `week` (`week_id`),
  CONSTRAINT `day_chk_1` CHECK (((`month` >= 1) and (`month` <= 12)))
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `day`
--

LOCK TABLES `day` WRITE;
/*!40000 ALTER TABLE `day` DISABLE KEYS */;
INSERT INTO `day` VALUES (1,34,4,8,'pending'),(2,34,5,8,'pending'),(3,34,6,8,'pending'),(4,34,7,8,'pending'),(5,34,8,8,'pending'),(6,34,9,8,'pending'),(7,34,10,8,'pending'),(8,35,11,8,'pending'),(9,35,12,8,'pending'),(10,35,13,8,'pending'),(11,35,14,8,'pending'),(12,35,15,8,'pending'),(13,35,16,8,'pending'),(14,35,17,8,'pending'),(15,36,18,8,'pending'),(16,36,19,8,'pending'),(17,36,20,8,'pending'),(18,36,21,8,'pending'),(19,36,22,8,'pending'),(20,36,23,8,'pending'),(21,36,24,8,'pending'),(22,37,25,8,'pending'),(23,37,26,8,'pending'),(24,37,27,8,'pending'),(25,37,28,8,'pending'),(26,37,29,8,'pending'),(27,37,30,8,'pending'),(28,37,31,8,'pending'),(29,38,1,9,'pending'),(30,38,2,9,'pending'),(31,38,3,9,'pending'),(32,38,4,9,'pending'),(33,38,5,9,'pending'),(34,38,6,9,'pending'),(35,38,7,9,'pending'),(36,39,8,9,'pending'),(37,39,9,9,'pending'),(38,39,10,9,'pending'),(39,39,11,9,'pending'),(40,39,12,9,'pending'),(41,39,13,9,'pending'),(42,39,14,9,'pending');
/*!40000 ALTER TABLE `day` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nurse`
--

DROP TABLE IF EXISTS `nurse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nurse` (
  `user_id` int NOT NULL,
  `band` int NOT NULL,
  `seniority` int NOT NULL DEFAULT '1',
  `can_charge` tinyint(1) NOT NULL,
  `contract_type` enum('full','part') NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `nurse_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nurse`
--

LOCK TABLES `nurse` WRITE;
/*!40000 ALTER TABLE `nurse` DISABLE KEYS */;
INSERT INTO `nurse` VALUES (1,6,13,1,'full'),(2,6,2,1,'full'),(3,5,1,0,'full'),(4,5,1,0,'full'),(5,5,3,0,'full'),(6,5,5,1,'full'),(7,6,7,1,'full'),(8,5,8,1,'full'),(9,5,1,0,'full'),(10,5,1,0,'full'),(11,5,2,0,'full'),(12,5,3,0,'full'),(13,5,4,0,'full'),(14,7,10,1,'full'),(15,5,1,0,'full'),(26,4,1,0,'full'),(27,4,1,0,'full'),(28,5,3,0,'full');
/*!40000 ALTER TABLE `nurse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request`
--

DROP TABLE IF EXISTS `request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request` (
  `shift_id` int NOT NULL,
  `user_id` int NOT NULL,
  `priority_user` int NOT NULL,
  `priority_computed` int DEFAULT '0',
  `request_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('approved','pending','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`shift_id`,`user_id`),
  KEY `shift_id_index` (`shift_id`) USING BTREE,
  KEY `request_ibfk_2` (`user_id`),
  CONSTRAINT `request_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`shift_id`),
  CONSTRAINT `request_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request`
--

LOCK TABLES `request` WRITE;
/*!40000 ALTER TABLE `request` DISABLE KEYS */;
INSERT INTO `request` VALUES (2,1,12,12,'2024-08-22 08:52:42','approved'),(2,2,12,12,'2024-08-22 08:52:29','approved'),(4,1,11,11,'2024-08-22 08:52:42','approved'),(4,2,8,8,'2024-08-22 08:52:50','approved'),(16,2,11,11,'2024-08-22 08:52:29','approved'),(18,2,10,10,'2024-08-22 08:52:29','approved'),(21,7,9,0,'2024-09-01 20:49:46','pending'),(22,2,3,3,'2024-08-31 19:56:13','approved'),(23,3,12,12,'2024-08-31 19:56:24','approved'),(23,7,12,12,'2024-09-01 20:49:18','approved'),(33,5,12,12,'2024-08-31 19:55:59','approved'),(34,7,11,11,'2024-09-01 20:49:18','approved'),(36,2,9,9,'2024-08-22 08:53:27','approved'),(36,7,10,10,'2024-09-01 20:49:18','approved'),(38,2,4,4,'2024-08-22 08:53:34','approved'),(40,2,2,2,'2024-08-31 19:56:13','approved'),(47,2,7,7,'2024-08-22 08:53:27','approved'),(49,2,6,6,'2024-08-22 08:53:27','approved'),(51,2,5,5,'2024-08-22 08:53:27','approved');
/*!40000 ALTER TABLE `request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_priority`
--

DROP TABLE IF EXISTS `schedule_priority`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_priority` (
  `priority_id` int NOT NULL,
  `user_id` int NOT NULL,
  `priority` int NOT NULL,
  PRIMARY KEY (`priority_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `schedule_priority_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_priority`
--

LOCK TABLES `schedule_priority` WRITE;
/*!40000 ALTER TABLE `schedule_priority` DISABLE KEYS */;
INSERT INTO `schedule_priority` VALUES (1,1,1),(1,2,2),(1,3,3),(1,4,4),(1,5,5),(1,6,6),(1,7,7),(1,8,8),(1,9,9),(1,10,10),(1,11,11),(1,12,12),(1,13,13),(1,14,14),(1,15,15),(1,26,16),(2,1,15),(2,2,14),(2,3,13),(2,4,12),(2,5,11),(2,6,10),(2,7,9),(2,8,8),(2,9,7),(2,10,6),(2,11,5),(2,12,4),(2,13,3),(2,14,2),(2,15,1),(2,26,16),(3,1,1),(3,2,2),(3,3,3),(3,4,4),(3,5,5),(3,6,6),(3,7,7),(3,8,8),(3,9,9),(3,10,10),(3,11,11),(3,12,12),(3,13,13),(3,14,14),(3,15,15);
/*!40000 ALTER TABLE `schedule_priority` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shift`
--

DROP TABLE IF EXISTS `shift`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shift` (
  `shift_id` int NOT NULL AUTO_INCREMENT,
  `day_id` int NOT NULL,
  `priority_id` int NOT NULL,
  `is_day` tinyint(1) NOT NULL DEFAULT '1',
  `approved_staff` int NOT NULL DEFAULT '0',
  `charge_nurse` int DEFAULT NULL,
  `min_staff` int NOT NULL,
  `max_staff` int NOT NULL,
  `optimal_staff` int NOT NULL,
  `status` enum('approved','open','closed') NOT NULL DEFAULT 'closed',
  PRIMARY KEY (`shift_id`),
  KEY `charge_nurse` (`charge_nurse`),
  KEY `day_id_index` (`day_id`) USING BTREE,
  KEY `shift_ibfk_2` (`priority_id`),
  CONSTRAINT `shift_ibfk_1` FOREIGN KEY (`day_id`) REFERENCES `day` (`day_id`),
  CONSTRAINT `shift_ibfk_2` FOREIGN KEY (`priority_id`) REFERENCES `schedule_priority` (`priority_id`),
  CONSTRAINT `shift_ibfk_3` FOREIGN KEY (`charge_nurse`) REFERENCES `nurse` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shift`
--

LOCK TABLES `shift` WRITE;
/*!40000 ALTER TABLE `shift` DISABLE KEYS */;
INSERT INTO `shift` VALUES (1,1,1,1,0,NULL,3,5,4,'open'),(2,1,1,0,2,NULL,2,4,3,'closed'),(3,2,1,1,0,NULL,3,5,4,'open'),(4,2,1,0,2,NULL,2,4,3,'closed'),(5,3,1,1,0,NULL,3,5,4,'open'),(6,3,1,0,0,NULL,2,4,3,'open'),(7,4,1,1,0,NULL,3,5,4,'open'),(8,4,1,0,0,NULL,2,4,3,'open'),(9,5,1,1,0,NULL,3,5,4,'open'),(10,5,1,0,0,NULL,2,4,3,'open'),(11,6,1,1,0,NULL,3,5,4,'open'),(12,6,1,0,0,NULL,2,4,3,'open'),(13,7,1,1,0,NULL,3,5,4,'open'),(14,7,1,0,0,NULL,2,4,3,'open'),(15,8,1,1,0,NULL,3,5,4,'open'),(16,8,1,0,1,NULL,2,4,3,'open'),(17,9,1,1,0,NULL,3,5,4,'open'),(18,9,1,0,1,NULL,2,4,3,'open'),(19,10,1,1,0,NULL,3,5,4,'open'),(20,10,1,0,1,NULL,2,4,3,'open'),(21,11,1,1,0,NULL,3,5,4,'open'),(22,11,1,0,1,NULL,2,4,3,'open'),(23,12,1,1,2,NULL,3,5,4,'open'),(24,12,1,0,0,NULL,2,4,3,'open'),(25,13,1,1,0,NULL,3,5,4,'open'),(26,13,1,0,0,NULL,2,4,3,'open'),(27,14,1,1,0,NULL,3,5,4,'open'),(28,14,1,0,0,NULL,2,4,3,'open'),(29,15,1,1,0,NULL,3,5,4,'open'),(30,15,1,0,0,NULL,2,4,3,'open'),(31,16,1,1,0,NULL,3,5,4,'open'),(32,16,1,0,0,NULL,2,4,3,'open'),(33,17,1,1,1,NULL,3,5,4,'open'),(34,17,1,0,1,NULL,2,4,3,'open'),(35,18,1,1,0,NULL,3,5,4,'open'),(36,18,2,0,2,NULL,2,4,3,'closed'),(37,19,2,1,0,NULL,3,5,4,'open'),(38,19,2,0,1,NULL,2,4,3,'open'),(39,20,2,1,0,NULL,3,5,4,'open'),(40,20,2,0,1,NULL,2,4,3,'open'),(41,21,2,1,0,NULL,3,5,4,'open'),(42,21,2,0,0,NULL,2,4,3,'open'),(43,22,2,1,0,NULL,3,5,4,'open'),(44,22,2,0,0,NULL,2,4,3,'open'),(45,23,2,1,0,NULL,3,5,4,'open'),(46,23,2,0,0,NULL,2,4,3,'open'),(47,24,2,1,1,NULL,3,5,4,'open'),(48,24,2,0,0,NULL,2,4,3,'open'),(49,25,2,1,1,NULL,3,5,4,'open'),(50,25,2,0,0,NULL,2,4,3,'open'),(51,26,2,1,1,NULL,3,5,4,'open'),(52,26,2,0,0,NULL,2,4,3,'open'),(53,27,2,1,0,NULL,3,5,4,'open'),(54,27,2,0,0,NULL,2,4,3,'open'),(55,28,2,1,0,NULL,3,5,4,'open'),(56,28,2,0,0,NULL,2,4,3,'open'),(57,29,2,1,0,NULL,3,5,4,'open'),(58,29,2,0,0,NULL,2,4,3,'open'),(59,30,2,1,0,NULL,3,5,4,'open'),(60,30,2,0,0,NULL,2,4,3,'open'),(61,31,2,1,0,NULL,3,5,4,'open'),(62,31,2,0,0,NULL,2,4,3,'open'),(63,32,2,1,0,NULL,3,5,4,'open'),(64,32,2,0,0,NULL,2,4,3,'open'),(65,33,2,1,0,NULL,3,5,4,'open'),(66,33,2,0,0,NULL,2,4,3,'open'),(67,34,2,1,0,NULL,3,5,4,'open'),(68,34,2,0,0,NULL,2,4,3,'open'),(69,35,2,1,0,NULL,3,5,4,'open'),(70,35,2,0,0,NULL,2,4,3,'open'),(71,36,3,1,0,NULL,3,5,4,'open'),(72,36,3,0,0,NULL,2,4,3,'open'),(73,37,3,1,0,NULL,3,5,4,'open'),(74,37,3,0,0,NULL,2,4,3,'open'),(75,38,3,1,0,NULL,3,5,4,'open'),(76,38,3,0,0,NULL,2,4,3,'open'),(77,39,3,1,0,NULL,3,5,4,'open'),(78,39,3,0,0,NULL,2,4,3,'open'),(79,40,3,1,0,NULL,3,5,4,'open'),(80,40,3,0,0,NULL,2,4,3,'open'),(81,41,3,1,0,NULL,3,5,4,'open'),(82,41,3,0,0,NULL,2,4,3,'open'),(83,42,3,1,0,NULL,3,5,4,'open'),(84,42,3,0,0,NULL,2,4,3,'open');
/*!40000 ALTER TABLE `shift` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `ms_id` varchar(36) NOT NULL DEFAULT '0',
  `authority` int NOT NULL DEFAULT '0',
  `user_status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`user_id`),
  KEY `idx_ms_id` (`ms_id`) USING BTREE,
  KEY `idx_email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'joe','han','jhoon.han@outlook.com','37568687-3010-490a-a12e-da0e5a57734e',1,'active'),(2,'yeweon','kim','oliviayw92@outlook.com','630133a5-f489-4736-a97e-e9c13311ba0c',2,'active'),(3,'jayne','white','3@t.com','0',1,'active'),(4,'donald','smith','4@t.com','0',1,'active'),(5,'joe','leigh','5@t.com','0',1,'active'),(6,'betty','ohio','6@t.com','0',1,'active'),(7,'davis','sithideth','7@t.com','0',1,'active'),(8,'dimitri','nakos','8@t.com','0',1,'active'),(9,'lindsey','lawless','9@t.com','0',1,'active'),(10,'halley','wang','2323@t.com','0',1,'active'),(11,'juan','hernendez','11@t.com','0',1,'active'),(12,'lando','borghi','12@t.com','0',1,'active'),(13,'paul','beck','13@t.com','0',1,'active'),(14,'nobby','nataka','14@t.com','0',1,'active'),(15,'lindsey','xhao','15@t.com','0',1,'active'),(26,'Junghoon','Han','hanj1112@outlook.com','5b70e515-c9db-4e64-9600-ce00dd409d6c',1,'active'),(27,'jane','alexa','jhoon.han@gmail.com','0',0,'inactive'),(28,'Jango','Haan','jxh1537@student.bham.ac.uk','0',0,'pending');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `week`
--

DROP TABLE IF EXISTS `week`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `week` (
  `week_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `priority_id` int NOT NULL,
  `month` int DEFAULT NULL,
  `year` int NOT NULL,
  `week_start` date NOT NULL,
  `week_end` date NOT NULL,
  `status` enum('completed','pending') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`week_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `week_ibfk_2` (`priority_id`),
  CONSTRAINT `week_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `week_ibfk_2` FOREIGN KEY (`priority_id`) REFERENCES `schedule_priority` (`priority_id`),
  CONSTRAINT `week_chk_1` CHECK (((`month` >= 1) and (`month` <= 12)))
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `week`
--

LOCK TABLES `week` WRITE;
/*!40000 ALTER TABLE `week` DISABLE KEYS */;
INSERT INTO `week` VALUES (34,1,1,8,2024,'2024-08-04','2024-08-10','pending'),(35,1,1,8,2024,'2024-08-11','2024-08-17','pending'),(36,1,1,8,2024,'2024-08-12','2024-08-24','pending'),(37,1,1,8,2024,'2024-08-25','2024-08-31','pending'),(38,1,2,9,2024,'2024-09-01','2024-09-07','pending'),(39,1,2,9,2024,'2024-09-08','2024-09-14','pending');
/*!40000 ALTER TABLE `week` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-01 22:14:05
