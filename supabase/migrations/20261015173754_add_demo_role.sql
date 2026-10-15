-- Read-only demo role: can view the admin area, cannot write.
-- Kept in its own migration: a new enum value cannot be used in the transaction that adds it.
alter type public.user_role add value if not exists 'demo';
