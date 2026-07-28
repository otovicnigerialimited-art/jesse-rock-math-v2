import re

with open('src/lib/schoolDb.ts', 'r') as f:
    content = f.read()

new_schema = """-- Jesse's Math Arena SQL Schema (Supabase / Postgres)
-- Run this in your Supabase SQL Editor to create the correct tables & relationships!

-- 1. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  teacher_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. School Students Table
CREATE TABLE IF NOT EXISTS school_students (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  real_first_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  school_math_progress JSONB NOT NULL DEFAULT '{"highScore": 0, "xp": 100, "coins": 100, "solved": 0, "correctAnswers": 0, "currentLevel": 1}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for rapid teacher student queries
CREATE INDEX IF NOT EXISTS idx_school_students_teacher ON school_students(teacher_id);
"""

# Extract the block to replace using regex
pattern = r"export const SUPABASE_SQL_SCHEMA = `(.*?)`;"
content = re.sub(pattern, f"export const SUPABASE_SQL_SCHEMA = `{new_schema}`;", content, flags=re.DOTALL)

with open('src/lib/schoolDb.ts', 'w') as f:
    f.write(content)

