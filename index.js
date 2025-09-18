import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hpqndtbdnklvjgnqpmpw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcW5kdGJkbmtsdmpnbnFwbXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzE5NTUsImV4cCI6MjA3MjE0Nzk1NX0.hortstRsxIat61d4MwS_ydHQeg3WI5iDee-PouOyiI0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const { data, error } = await supabase.from('my_table').select('*')
  console.log(data, error)
}

run()

