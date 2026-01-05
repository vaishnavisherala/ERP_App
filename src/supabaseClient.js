import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mmqssrcxitvvtxjanxrh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcXNzcmN4aXR2dnR4amFueHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MjQ5MzcsImV4cCI6MjA4MzAwMDkzN30.ZjSPDiJOlH3zxWtcXP0l2OhpG2eH2oiYZ4oUyNW3OEM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
