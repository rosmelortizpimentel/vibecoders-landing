
DELETE FROM user_subscriptions WHERE user_id = 'f1959bb1-f3a2-4c35-b055-c587a178889b';

INSERT INTO user_subscriptions (user_id, tier, founder_number, price)
SELECT id, 'founder', ROW_NUMBER() OVER (ORDER BY created_at ASC)::integer, 0
FROM profiles
WHERE id != 'f1959bb1-f3a2-4c35-b055-c587a178889b'
ON CONFLICT (user_id) DO UPDATE SET
  tier = 'founder',
  founder_number = EXCLUDED.founder_number;

INSERT INTO user_subscriptions (user_id, tier, founder_number, price)
VALUES ('f1959bb1-f3a2-4c35-b055-c587a178889b', 'founder', 76, 0)
ON CONFLICT (user_id) DO UPDATE SET
  tier = 'founder',
  founder_number = 76;
