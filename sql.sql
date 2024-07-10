USE roster;

CREATE TABLE week (
  week_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  year INT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status enum('completed','pending') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (week_id, user_id),
  FOREIGN KEY (user_id) REFERENCES user (user_id),
  INDEX (user_id)
);