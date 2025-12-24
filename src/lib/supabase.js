import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxyjwicegitdubrxumgl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4eWp3aWNlZ2l0ZHVicnh1bWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1ODEzNjgsImV4cCI6MjA4MjE1NzM2OH0.Yk5F3Cm3OqdfXTG3aKnmb3KXtVrZDxTm7-QSG3heFmw'
export const supabase = createClient(supabaseUrl, supabaseKey)
