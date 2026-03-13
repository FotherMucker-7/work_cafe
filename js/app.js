// ==========================================================================
// 1. GENERADOR DE ALIAS (La magia lúdica)
// ==========================================================================
const aliasList =[
    "Darth Vader", "Luke Skywalker", "Leia Organa", "Yoda", "Chewbacca",
    "Frodo Bolsón", "Gandalf", "Gollum", "Aragorn", "Legolas",
    "Batman", "Bruce Wayne", "Joker", "Mujer Maravilla", "Clark Kent",
    "Tony Stark", "Thanos", "Viuda Negra", "Spider-Man", "Groot",
    "Neo", "Morfeo", "Trinity", "Agente Smith",
    "Marty McFly", "Doc Brown", "Terminator", "Sarah Connor",
    "Ellen Ripley", "Furiosa", "John Wick", "Katniss Everdeen"
];

// Elegimos uno al azar usando matemáticas básicas de JS
const randomAlias = aliasList[Math.floor(Math.random() * aliasList.length)];

// ==========================================================================
// 2. REFERENCIAS AL DOM (Buscamos los elementos en el HTML)
// ==========================================================================
const stepIntro = document.getElementById('step-intro');
const stepForm = document.getElementById('step-form');
const stepThanks = document.getElementById('step-thanks');

const btnStart = document.getElementById('btn-start');
const form = document.getElementById('inclusion-form');
const textarea = document.getElementById('comentario');
const charCount = document.getElementById('char-count');

// ==========================================================================
// FUNCIÓN TOAST (Adiós alert de los 90)
// ==========================================================================
function showToast(message) {
    // Buscamos si ya existe el toast, si no, lo creamos
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Le ponemos el texto y lo mostramos
    toast.textContent = message;
    toast.classList.add('show');
    
    // Lo ocultamos automáticamente después de 3.5 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ==========================================================================
// 3. LÓGICA DE NAVEGACIÓN (El Wizard)
// ==========================================================================

// Cuando tocan "Empezar"
btnStart.addEventListener('click', () => {
    // Escondemos la intro
    stepIntro.classList.remove('active');
    setTimeout(() => {
        stepIntro.classList.add('hidden');
        
        // Mostramos el formulario
        stepForm.classList.remove('hidden');
        stepForm.classList.add('active');
        
        // OPCIONAL PERO RECOMENDADO: Mostrarle al usuario quién es.
        // Vamos a inyectar un mensajito justo antes de la primera pregunta.
        const badge = document.createElement('p');
        badge.className = 'highlight-box';
        badge.style.marginTop = '0'; // Pequeño ajuste visual rápido
        badge.innerHTML = `🕵️‍♂️ Para este ejercicio, tu alias secreto es: <strong>${randomAlias}</strong>`;
        
        form.insertBefore(badge, form.firstChild);

    }, 300); // Pequeño delay para que la animación fluya
});

// ==========================================================================
// 4. CONTADOR DE CARACTERES EN VIVO
// ==========================================================================
textarea.addEventListener('input', (e) => {
    const currentLength = e.target.value.length;
    const maxLength = e.target.maxLength;
    
    charCount.textContent = `${currentLength} / ${maxLength}`;
    
    // Si se acercan al límite (faltan 20 caracteres), lo ponemos rojo (Feedback visual)
    if (maxLength - currentLength <= 20) {
        charCount.style.color = 'var(--error-color)';
        charCount.style.fontWeight = 'bold';
    } else {
        charCount.style.color = '#AAA'; // Color normal original
        charCount.style.fontWeight = 'normal';
    }
});

// ==========================================================================
// 5. ENVÍO DEL FORMULARIO A SUPABASE
// ==========================================================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const barreraSeleccionada = formData.get('barrera');
    const etapaSeleccionada = formData.get('etapa');
    const comentarioIngresado = formData.get('comentario');

    if (!barreraSeleccionada || !etapaSeleccionada) {
        showToast("⚠️ Falta responder una de las preguntas.");
        return;
    }

    // Cambiamos el texto del botón para que sepan que está cargando
    const btnSubmit = document.getElementById('btn-submit');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = "Enviando...";
    btnSubmit.disabled = true; // Evitamos doble clic de los ansiosos

    try {
        // INSERCIÓN EN SUPABASE
        const { error } = await supabaseClient
            .from('respuestas')
            .insert([
                { 
                    alias: randomAlias, 
                    barrera: barreraSeleccionada, 
                    etapa: etapaSeleccionada, 
                    comentario: comentarioIngresado 
                }
            ]);

        if (error) throw error;

        // Si salió bien, pasamos a la pantalla final
        stepForm.classList.remove('active');
        setTimeout(() => {
            stepForm.classList.add('hidden');
            stepThanks.classList.remove('hidden');
            stepThanks.classList.add('active');
        }, 300);

    } catch (error) {
        console.error("Error al enviar:", error);
        showToast("❌ Hubo un error al enviar. Intenta de nuevo.");
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
});