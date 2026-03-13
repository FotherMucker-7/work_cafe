// ==========================================================================
// 1. ESTADO DE LA APLICACIÓN (La memoria del Termómetro)
// ==========================================================================
// Aquí guardamos cuántos votos tiene cada barrera
const votosBarreras = {
    procedimental: 0,
    actitudinal: 0,
    fisica: 0,
    presupuesto: 0
};
let totalVotos = 0;

// ==========================================================================
// CONTROL DE LA CORTINA MÁGICA
// ==========================================================================
const btnReveal = document.getElementById('btn-reveal');
const overlay = document.getElementById('kanban-overlay');

btnReveal.addEventListener('click', () => {
    // Le agregamos la clase que hace que el CSS lo desvanezca
    overlay.classList.add('hidden');
});

// ==========================================================================
// BOTÓN DE DESTRUCCIÓN MASIVA (Con Modal Elegante)
// ==========================================================================
const btnNuke = document.getElementById('btn-nuke');
const modalNuke = document.getElementById('modal-nuke');
const btnCancelNuke = document.getElementById('btn-cancel-nuke');
const btnConfirmNuke = document.getElementById('btn-confirm-nuke');

// 1. Al presionar "Limpiar Tablero", solo abrimos el Modal
btnNuke.addEventListener('click', () => {
    modalNuke.showModal(); // Esta es la magia nativa de HTML5
});

// 2. Si se arrepiente y presiona "Cancelar", cerramos el Modal
btnCancelNuke.addEventListener('click', () => {
    modalNuke.close();
});

// 3. Si confirma la destrucción, disparamos a Supabase
btnConfirmNuke.addEventListener('click', async () => {
    // Cerramos el modal inmediatamente
    modalNuke.close();
    
    // Feedback visual en el botón principal
    btnNuke.textContent = "Borrando datos...";
    btnNuke.disabled = true;

    try {
        const { error } = await supabaseClient
            .from('respuestas')
            .delete()
            .not('id', 'is', null);

        if (error) throw error;

        // Limpieza exitosa, recargamos la página discretamente
        window.location.reload();

    } catch (error) {
        console.error("Error al borrar:", error);
        alert("❌ Hubo un error al intentar limpiar la base de datos."); // Aquí dejamos el alert normal por si hay un error crítico
        btnNuke.textContent = "⚠️ Limpiar Tablero (Nuevo Taller)";
        btnNuke.disabled = false;
    }
});

// ==========================================================================
// 2. FUNCIÓN: ACTUALIZAR EL TERMÓMETRO (Gráfico CSS)
// ==========================================================================
function actualizarTermometro(nuevaBarrera) {
    // 1. Sumamos el voto a la barrera correspondiente y al total
    if (votosBarreras[nuevaBarrera] !== undefined) {
        votosBarreras[nuevaBarrera]++;
        totalVotos++;
    }

    // 2. Recalculamos los porcentajes de todas las barras y actualizamos el CSS
    for (const barrera in votosBarreras) {
        const porcentaje = Math.round((votosBarreras[barrera] / totalVotos) * 100);
        
        // Buscamos la barra y el numerito en el HTML
        const barraElement = document.getElementById(`bar-${barrera}`);
        const valorElement = document.getElementById(`val-${barrera}`);
        
        if (barraElement && valorElement) {
            // La magia visual: cambiamos el width y el CSS hace la transición suave
            barraElement.style.width = `${porcentaje}%`;
            valorElement.textContent = `${porcentaje}%`;
        }
    }
}

// ==========================================================================
// 3. FUNCIÓN: CREAR Y AGREGAR POST-IT AL KANBAN
// ==========================================================================
function agregarTarjetaKanban(datos) {
    // Buscamos la columna correcta usando el id (ej: 'col-implementacion')
    const columna = document.getElementById(`col-${datos.etapa}`);
    
    if (!columna) {
        console.error(`⚠️ Columna no encontrada para la etapa: ${datos.etapa}`);
        return;
    }

    // Creamos el post-it en memoria
    const tarjeta = document.createElement('div');
    tarjeta.className = 'card';
    
    // Le inyectamos el HTML interno con el alias y el comentario
    tarjeta.innerHTML = `
        <div class="card-alias">🕵️‍♂️ ${datos.alias}</div>
        <div class="card-text">${datos.comentario}</div>
    `;

    // Lo metemos AL PRINCIPIO de la columna (prepend) para que los nuevos salgan arriba
    columna.prepend(tarjeta);
}

// ==========================================================================
// 4. CONEXIÓN EN TIEMPO REAL CON SUPABASE
// ==========================================================================

// Función para cargar los datos que ya existan al abrir el dashboard
async function cargarDatosIniciales() {
    console.log("Cargando datos históricos...");
    const { data, error } = await supabaseClient
        .from('respuestas')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error cargando datos:", error);
        return;
    }

    // Metemos los datos iniciales al tablero
    if (data && data.length > 0) {
        data.forEach(respuesta => {
            actualizarTermometro(respuesta.barrera);
            agregarTarjetaKanban(respuesta);
        });
    }
}

// Función para escuchar nuevos datos en vivo (Realtime)
function escucharNuevasRespuestas() {
    console.log("🎧 Escuchando nuevas respuestas en tiempo real...");
    
    supabaseClient
        .channel('cambios-en-respuestas')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'respuestas' },
            (payload) => {
                console.log("¡Nueva respuesta recibida!", payload.new);
                const nuevaRespuesta = payload.new;
                
                // Disparamos la magia visual
                actualizarTermometro(nuevaRespuesta.barrera);
                agregarTarjetaKanban(nuevaRespuesta);
            }
        )
        .subscribe();
}

// Arrancamos el motor al cargar la página
window.onload = () => {
    cargarDatosIniciales().then(() => {
        escucharNuevasRespuestas();
    });
};