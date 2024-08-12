UPDATE shift
SET status = 'open',
    approved_staff = 0;

UPDATE request
SET status = 'pending';

DELETE FROM conflict;
DELETE FROM compute_record;
