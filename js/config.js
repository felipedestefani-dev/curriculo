(function () {
  const FILE_URL = "https://ejmnhlqzdetjjmwmqgae.supabase.co";
  const FILE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqbW5obHF6ZGV0aGptd21xZ2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MTQxOTAsImV4cCI6MjEwNTA5MDE5MH0.VLCbgcFarueiCrGpkWZvO7REl10yKMjLAvucCFEG2YE";

  function readStored() {
    try {
      return JSON.parse(localStorage.getItem("cv-supabase-config") || "{}");
    } catch {
      return {};
    }
  }

  const stored = readStored();

  window.SITE_CONFIG = {
    supabaseUrl: stored.supabaseUrl || FILE_URL,
    supabaseAnonKey: stored.supabaseAnonKey || FILE_KEY,
    adminEmail: "felipedestefanidasilva@gmail.com",
  };

  window.saveSupabaseConfig = function (url, key) {
    window.SITE_CONFIG.supabaseUrl = String(url || "").trim();
    window.SITE_CONFIG.supabaseAnonKey = String(key || "").trim();
    localStorage.setItem(
      "cv-supabase-config",
      JSON.stringify({
        supabaseUrl: window.SITE_CONFIG.supabaseUrl,
        supabaseAnonKey: window.SITE_CONFIG.supabaseAnonKey,
      })
    );
    window.__supabase = null;
  };

  window.getSupabaseClient = function () {
    const { supabaseUrl, supabaseAnonKey } = window.SITE_CONFIG;
    if (!supabaseUrl || !supabaseAnonKey || !window.supabase?.createClient) return null;
    const stamp = supabaseUrl + "::" + supabaseAnonKey;
    if (!window.__supabase || window.__supabaseStamp !== stamp) {
      window.__supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      window.__supabaseStamp = stamp;
    }
    return window.__supabase;
  };
})();
