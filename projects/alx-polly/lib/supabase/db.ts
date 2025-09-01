'''import { createClient } from '@/lib/supabase/client';

export const createPollsTable = async () => {
  const supabase = createClient();
  const {
    data,
    error
  } = await supabase.rpc('create_polls_table');

  if (error) {
    console.error('Error creating polls table:', error);
    return null;
  }

  return data;
};
'''