-- Add 'separated' to marital_status ENUM (form sends "Separated")
ALTER TABLE quote_requests
  MODIFY COLUMN marital_status
  ENUM('single', 'married', 'separated', 'divorced', 'widowed')
  NOT NULL;
