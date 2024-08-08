UPDATE shift
SET status = 'open',
    approved_staff = 0;

UPDATE request
SET status = 'pending';
