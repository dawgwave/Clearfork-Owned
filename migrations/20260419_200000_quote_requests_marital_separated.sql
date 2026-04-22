-- UP
-- quote_requests.marital_status may be VARCHAR from legacy data — normalize then tighten to ENUM.
UPDATE quote_requests
SET marital_status = 'single'
WHERE marital_status IS NULL OR TRIM(COALESCE(marital_status, '')) = '';

UPDATE quote_requests
SET marital_status = LOWER(TRIM(marital_status));

UPDATE quote_requests
SET marital_status = 'separated'
WHERE marital_status IN ('seperated');

UPDATE quote_requests
SET marital_status = 'single'
WHERE marital_status NOT IN ('single', 'married', 'separated', 'divorced', 'widowed');

ALTER TABLE quote_requests
  MODIFY COLUMN marital_status
  ENUM('single', 'married', 'separated', 'divorced', 'widowed')
  NOT NULL;

-- DOWN
ALTER TABLE quote_requests
  MODIFY COLUMN marital_status VARCHAR(50) NULL;
