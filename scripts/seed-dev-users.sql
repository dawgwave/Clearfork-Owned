-- Dev / recovery: two accounts (bcrypt 12 rounds, matches app).
-- Change passwords after use on any real host; do not commit real production creds.
--
-- Usage (use the same database as DB_DATABASE in .env.production or .env.staging):
--   docker compose exec -i mysql mysql -u clearfork_user -p clearfork-insurance < scripts/seed-dev-users.sql
--   docker compose exec -i mysql mysql -u clearfork_user -p clearfork-insurance-staging < scripts/seed-dev-users.sql
--
--   z@z.com                      role: user   password: team-wOrk1
--   admin@clearforkinsurance.com role: admin password: password123

SET NAMES utf8mb4;

-- Remove old role links for these emails (re-apply correct roles below)
DELETE ur FROM user_roles ur
INNER JOIN users u ON u.id = ur.user_id
WHERE u.email IN ('z@z.com', 'admin@clearforkinsurance.com');

-- Optional: clear sessions for those users (ignore if table empty)
DELETE s FROM sessions s
INNER JOIN users u ON u.id = s.user_id
WHERE u.email IN ('z@z.com', 'admin@clearforkinsurance.com');

INSERT INTO users (email, password_hash, first_name, last_name, email_verified)
VALUES
  (
    'z@z.com',
    '$2a$12$LBXH10NUYMLDp77eJAMpouH4K.U5rCjPyXhMr6gt6KB93UAg7AZvC',
    'Z',
    'User',
    TRUE
  ),
  (
    'admin@clearforkinsurance.com',
    '$2a$12$.40diPG620hMgDkYG7JcluESyDWcYGT6reD7o8nTmth9D3dDr.NqW',
    'Admin',
    'User',
    TRUE
  )
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  email_verified = VALUES(email_verified),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'user'
WHERE u.email = 'z@z.com';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'admin'
WHERE u.email = 'admin@clearforkinsurance.com';

SELECT u.id, u.email, r.name AS role
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email IN ('z@z.com', 'admin@clearforkinsurance.com')
ORDER BY u.email;
