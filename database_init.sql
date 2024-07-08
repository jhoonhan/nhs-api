-- database_init.sql
CREATE TABLE user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE nurse (
  user_id INT PRIMARY KEY,
  band INT NOT NULL,
  seniority INT NOT NULL DEFAULT 1,
  can_charge BOOLEAN NOT NULL,
  contract_type ENUM('full', 'part') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE month (
	month_id INT AUTO_INCREMENT PRIMARY KEY,
	month_num INT NOT NULL,
	year INT NOT NULL
);

CREATE TABLE day (
	day_id INT AUTO_INCREMENT PRIMARY KEY,
	month_id INT,
	day_num INT NOT NULL,
	FOREIGN KEY (month_id) REFERENCES month(month_id)
);

CREATE TABLE shift (
  shift_id INT AUTO_INCREMENT PRIMARY KEY,
  day_id DATE NOT NULL,
  approved_staff TIME NOT NULL,
  charge_nurse TIME NOT NULL,
  min_staff INT NOT NULL,
  max_staff INT NOT NULL,
  optimal_staff INT NOT NULL,
  status VARCHAR(20) ENUM('approved', 'pending', 'closed') NOT NULL DEFAULT 'closed',
  FOREIGN KEY (day_id) REFERENCES day(day_id),
  FOREIGN KEY (charge_nurse) REFERENCES nurse(user_id),
  INDEX day_id_index USING BTREE (day_id)
);

CREATE TABLE request (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  shift_id INT,
  user_id INT,
  priority INT NOT NULL,
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  FOREIGN KEY (shift_id) REFERENCES shift(shift_id),
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  INDEX shift_id_index USING BTREE (shift_id)
);

CREATE TABLE approved (
  request_id INT PRIMARY KEY,
  shift_id INT NOT NULL,
  status VARCHAR(20) ENUM('approved', 'pending') NOT NULL,
  approved_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_by INT NOT NULL,
  FOREIGN KEY (approved_by) REFERENCES user(user_id),
  FOREIGN KEY (shift_id) REFERENCES shift(shift_id),
  FOREIGN KEY (request_id) REFERENCES request(request_id)
);