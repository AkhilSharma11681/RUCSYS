-- Drop the original CHECK constraint. In PostgreSQL, the constraint is typically named {table_name}_{column_name}_check.
ALTER TABLE students DROP CONSTRAINT students_email_check;

-- Add the new CHECK constraint that allows both domains.
ALTER TABLE students ADD CONSTRAINT students_email_check CHECK (email like '%@rishihood.edu.in' or email like '%@nst.rishihood.edu.in');

-- Note: The instructions mentioned updating a handle_new_user() trigger, but it was not present in the initial schema.
