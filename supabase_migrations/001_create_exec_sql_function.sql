-- Create a function to execute dynamic SQL
-- This allows VisuBase to create tables programmatically

CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT) 
RETURNS TEXT --exec_sql takes one text input (a SQL command as a string) and returns a text message.
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION exec_sql(TEXT) IS 'Executes dynamic SQL statements for VisuBase schema creation';
