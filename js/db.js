// js/db.js
// 1. Inicializamos el cliente de Supabase
const supabaseUrl = 'https://gwshkhflhdmmemebmfma.supabase.co'; // CÁMBIALO POR TU URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c2hraGZsaGRtbWVtZWJtZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzE1NzIsImV4cCI6MjA4ODk0NzU3Mn0.MQfkeYgucLjhnmCSYphuUW4nw2fQH6nRsGCQfoQjWy8'; // CÁMBIALO POR TU ANON KEY

// Creamos la instancia global para que app.js y admin.js la puedan usar
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);