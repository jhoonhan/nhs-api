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


CREATE TABLE schedule_priority (
	priority_id INT not null,
	user_id INT not null,
	priority INT not null,
	PRIMARY KEY (priority_id, user_id),
	FOREIGN KEY (user_id) REFERENCES user (user_id)
);


SELECT * FROM request
WHERE shift_id = 1
ORDER BY priority DESC