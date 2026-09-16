window.SITE_BOOTSTRAP = true;

window.loadResumeFromSupabase = async function () {
  const client = window.getSupabaseClient?.();
  if (!client) return null;
  const { data, error } = await client.from("site_content").select("data").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data?.data || null;
};

window.startSite = async function () {
  try {
    const remote = await window.loadResumeFromSupabase();
    if (remote) window.renderResume(remote);
  } catch (error) {
    console.warn("Currículo local em uso. Supabase indisponível:", error.message || error);
  }
  window.initCurriculumPage?.();
};
