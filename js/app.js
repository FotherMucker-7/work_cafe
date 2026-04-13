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
// FUNCIÓN TOAST: definida en db.js (se carga antes que este archivo)
// ==========================================================================

// ==========================================================================
// 3. LÓGICA DE NAVEGACIÓN (El Wizard)
// ==========================================================================

// Cuando tocan "Empezar"
btnStart.addEventListener('click', () => {
    // Escondemos la intro
    stepIntro.classList.remove('active');
    setTimeout(() => {
        stepIntro.classList.add('hidden');
        stepIntro.setAttribute('aria-hidden', 'true');
        stepIntro.setAttribute('inert', ''); // Saca del tab order y del a11y tree

        // Mostramos el formulario
        stepForm.classList.remove('hidden');
        stepForm.removeAttribute('inert');
        stepForm.setAttribute('aria-hidden', 'false');
        stepForm.classList.add('active');
        
        // Indicamos el alias secreto del usuario
        const badge = document.createElement('p');
        badge.className = 'highlight-box';
        badge.style.marginTop = '0';
        badge.innerHTML = `<span class="badge-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span> Para este ejercicio, tu alias secreto es: <strong>${randomAlias}</strong>`;
        
        form.insertBefore(badge, form.firstChild);

    }, 300); // Pequeño delay para que la animación fluya
});

// ==========================================================================
// 4. CONTADOR DE CARACTERES EN VIVO
// ==========================================================================
const etapaSelect = document.getElementById('etapa-viaje');

// Limpia el error visual del select en cuanto el usuario elige algo
etapaSelect.addEventListener('change', () => {
    etapaSelect.classList.remove('is-invalid');
    etapaSelect.setAttribute('aria-invalid', 'false');
});

textarea.addEventListener('input', (e) => {
    const currentLength = e.target.value.length;
    const maxLength = e.target.maxLength;
    
    charCount.textContent = `${currentLength} / ${maxLength}`;
    
    // Si se acercan al límite (faltan 20 caracteres), lo ponemos en color de error
    if (maxLength - currentLength <= 20) {
        charCount.style.color = 'var(--error-color)';
        charCount.style.fontWeight = '700';
    } else {
        charCount.style.color = 'var(--muted-color)';
        charCount.style.fontWeight = '400';
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
        // Marcamos visualmente el select si es el campo faltante
        if (!etapaSeleccionada) {
            etapaSelect.classList.add('is-invalid');
            etapaSelect.setAttribute('aria-invalid', 'true');
            etapaSelect.focus(); // Llevamos el foco directo al campo problemático
        }
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
            stepForm.setAttribute('aria-hidden', 'true');
            stepForm.setAttribute('inert', '');

            stepThanks.classList.remove('hidden');
            stepThanks.removeAttribute('inert');
            stepThanks.setAttribute('aria-hidden', 'false');
            stepThanks.classList.add('active');
        }, 300);

    } catch (error) {
        console.error("Error al enviar:", error);
        showToast("❌ Hubo un error al enviar. Intenta de nuevo.");
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    }
});