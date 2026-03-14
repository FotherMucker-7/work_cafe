// js/db.js
// 1. Inicializamos el cliente de Supabase
// NOTA DE SEGURIDAD: Esta es la clave 'anon' (pública) de Supabase.
// Es segura para el cliente siempre que las políticas de Row Level Security (RLS)
// estén activas en el proyecto de Supabase. NO compartir la 'service_role' key.
const supabaseUrl = 'https://gwshkhflhdmmemebmfma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c2hraGZsaGRtbWVtZWJtZm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzE1NzIsImV4cCI6MjA4ODk0NzU3Mn0.MQfkeYgucLjhnmCSYphuUW4nw2fQH6nRsGCQfoQjWy8';

// Creamos la instancia global para que app.js y admin.js la puedan usar
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================================================
// UTILIDAD COMPARTIDA: Toast de notificación (reemplaza al alert nativo)
// Disponible para app.js y admin.js en cuanto se carga este archivo.
// ==========================================================================
function showToast(message, type = 'error') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    // Color según el tipo: 'error' (rojo, por defecto) o 'success' (verde)
    toast.style.backgroundColor = type === 'success' ? '#388E3C' : '';

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.style.backgroundColor = ''; // Reseteamos para el próximo toast
    }, 3500);
}