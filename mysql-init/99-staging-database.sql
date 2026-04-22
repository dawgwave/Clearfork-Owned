-- Staging database (separate from production). On first MySQL init this runs automatically.
-- On existing volumes where MySQL already initialized: run as root once:
--   docker exec -i <mysql-container> mysql -uroot -p"$ROOT_PW" < mysql-init/99-staging-database.sql
-- Then load schema into staging (from /opt/clearfork-insurance on the droplet):
--   cat mysql-init/setup-production-db.sql | docker exec -i <mysql> mysql -u... -p... clearfork-insurance-staging
-- Then apply newer SQL migrations not baked into setup (see migrations/*.sql), e.g.:
--   20260420_100000_align_blog_posts_app_schema.sql, 20260419_200000_quote_requests_marital_separated.sql
CREATE DATABASE IF NOT EXISTS `clearfork-insurance-staging`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `clearfork-insurance-staging`.* TO 'clearfork_user'@'%';
FLUSH PRIVILEGES;
