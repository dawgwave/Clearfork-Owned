DB scripts for admin users:
-- Make a user admin (add admin role)
INSERT INTO user_roles (user_id, role_id)
SELECT [USER_ID], id FROM roles WHERE name = 'admin';

-- Remove admin from user
DELETE ur FROM user_roles ur
INNER JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = [USER_ID] AND r.name = 'admin';

-- Check all users and their roles
SELECT u.id, u.email, u.first_name, u.last_name,
      GROUP_CONCAT(r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.first_name, u.last_name;
