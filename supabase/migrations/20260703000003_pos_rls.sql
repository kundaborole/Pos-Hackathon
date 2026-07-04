-- Add RLS policies for pos_sessions and pos_terminals

-- Terminals
CREATE POLICY "Enable read access for authenticated users on pos_terminals" 
ON pos_terminals FOR SELECT 
TO authenticated 
USING (true);

-- Sessions
CREATE POLICY "Enable read access for authenticated users on pos_sessions" 
ON pos_sessions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users on pos_sessions" 
ON pos_sessions FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users on pos_sessions" 
ON pos_sessions FOR UPDATE 
TO authenticated 
USING (true);
