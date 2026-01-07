(async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: signInResult, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'dev@example.com',
    password: 'password123',
  });
  console.log('signIn', signInResult, 'signInErr', signInErr);

  const { data, error } = await supabase.from('labs').select('id,slug');
  console.log({ data, error });
})();
