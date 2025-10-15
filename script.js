// -------------------------------------------
// 1. SETUP INICIAL E ESTRUTURA MODULAR
// -------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa as funcionalidades após o carregamento completo do DOM
    console.log("CONECTA App Inicializado.");

    // Verifica se estamos na página de Cadastro para aplicar funcionalidades específicas
    if (document.body.id === 'cadastro-page') {
        initFormInteractivity();
    }
    
    // Inicia a navegação básica de SPA (para a página projetos.html)
    initSPABasic();
});

/**
 * Aplica máscaras e listeners de validação ao formulário complexo.
 */
function initFormInteractivity() {
    const form = document.getElementById('cadastro-form');
    if (!form) return; // Garante que o script só execute onde o formulário existe

    // Aplicação das máscaras de entrada
    applyMasks();
    
    // Listener de validação de consistência ao tentar enviar
    form.addEventListener('submit', handleFormSubmission);

    // Adiciona feedback visual de erro/sucesso enquanto o usuário digita
    const requiredInputs = form.querySelectorAll('input:required, textarea:required');
    requiredInputs.forEach(input => {
        input.addEventListener('input', () => validateInputDynamically(input));
        input.addEventListener('blur', () => validateInputDynamically(input));
    });
}

// -------------------------------------------
// 2. FUNÇÃO: MÁSCARAS DE INPUT
// -------------------------------------------

/**
 * Aplica máscaras simples usando expressões regulares para CPF, CEP e Telefone.
 */
function applyMasks() {
    // Função utilitária de máscara
    const mask = (input, pattern) => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
            let formattedValue = '';
            let i = 0;

            // Aplica o padrão
            for (let char of pattern) {
                if (value.length === 0) break;
                
                if (char === '#') {
                    formattedValue += value[i];
                    i++;
                } else {
                    formattedValue += char;
                }
            }
            e.target.value = formattedValue;
        });
    };

    // Aplica a máscara ao CPF: ###.###.###-##
    const inputCPF = document.getElementById('cpf');
    if (inputCPF) mask(inputCPF, '###.###.###-##');

    // Aplica a máscara ao CEP: #####-###
    const inputCEP = document.getElementById('cep');
    if (inputCEP) mask(inputCEP, '#####-###');

    // Aplica a máscara ao Telefone (10 ou 11 dígitos): (##) #####-####
    const inputTelefone = document.getElementById('telefone');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let pattern = '';
            
            if (value.length <= 10) { // Telefone fixo ou celular antigo (8 ou 9 dígitos no final)
                pattern = '(##) ####-####';
            } else { // Celular com 9º dígito
                pattern = '(##) #####-####';
            }

            let formattedValue = '';
            let i = 0;
            for (let char of pattern) {
                if (value.length === 0 || i >= value.length) break;
                
                if (char === '#') {
                    formattedValue += value[i];
                    i++;
                } else {
                    formattedValue += char;
                }
            }
            e.target.value = formattedValue;
        });
    }
}

// -------------------------------------------
// 3. FUNÇÃO: VALIDAÇÃO DE CONSISTÊNCIA E FEEDBACK
// -------------------------------------------

/**
 * Cria e exibe uma mensagem de feedback (simulando um 'toast' ou 'alert' estilizado).
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - 'success' ou 'error'.
 */
function displayToast(message, type) {
    const container = document.body;
    
    // Verifica se já existe um toast e remove para não acumular
    let existingToast = document.querySelector('.app-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `app-toast toast-${type}`;
    toast.textContent = message;

    // Estilo básico para o toast (idealmente no CSS)
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 6px;
        color: white;
        font-weight: bold;
        z-index: 2000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.5s ease;
    `;
    
    // Cores definidas para o JavaScript
    if (type === 'success') {
        toast.style.backgroundColor = '#28A745'; // Verde
    } else if (type === 'error') {
        toast.style.backgroundColor = '#DC3545'; // Vermelho
    }

    container.appendChild(toast);

    // Animação de entrada e saída
    setTimeout(() => toast.style.opacity = 1, 100);
    setTimeout(() => {
        toast.style.opacity = 0;
        toast.addEventListener('transitionend', () => toast.remove());
    }, 5000); // Fica visível por 5 segundos
}


/**
 * Valida um input individualmente e mostra feedback abaixo dele.
 * @param {HTMLElement} input - O elemento de input a ser validado.
 */
function validateInputDynamically(input) {
    const isValid = input.checkValidity();
    const parent = input.closest('div, fieldset');
    
    // Remove qualquer feedback anterior
    let feedback = parent.querySelector('.input-feedback');
    if (feedback) feedback.remove();

    if (!isValid) {
        // Cria feedback de erro
        feedback = document.createElement('p');
        feedback.className = 'input-feedback error-message';
        feedback.textContent = input.validationMessage || "Campo inválido ou incompleto.";
        
        // Estiliza o erro (idealmente no CSS)
        feedback.style.color = '#DC3545';
        feedback.style.fontSize = '1.2rem';
        feedback.style.marginTop = '0.4rem';
        
        input.after(feedback);
    }
    
    // Adiciona classes CSS para estilização (opcional, já coberto pelo CSS puro)
    // input.classList.toggle('is-invalid', !isValid);
    // input.classList.toggle('is-valid', isValid && input.value.length > 0);
}


/**
 * Verifica a consistência de dados e avisa o usuário.
 * @param {Event} e - O evento de submissão do formulário.
 */
function handleFormSubmission(e) {
    e.preventDefault(); // Impede o envio padrão

    const form = e.target;
    
    // 1. Validação nativa geral (incluindo o pattern de CPF/CEP)
    if (!form.checkValidity()) {
        displayToast('Por favor, verifique os campos obrigatórios e os formatos (CPF, Telefone, CEP).', 'error');
        // Foca no primeiro campo inválido
        form.querySelector(':invalid').focus(); 
        return;
    }

    // 2. Lógica de Consistência Simples (Exemplo: Verificação de Idade)
    const dataNascimento = document.getElementById('data-nascimento').value;
    const idadeMinima = 18;
    
    if (dataNascimento) {
        const dataNasc = new Date(dataNascimento);
        const hoje = new Date();
        const idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mes = hoje.getMonth() - dataNasc.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
            idade--;
        }

        if (idade < idadeMinima) {
            displayToast(`É necessário ter pelo menos ${idadeMinima} anos para se cadastrar.`, 'error');
            document.getElementById('data-nascimento').focus();
            return;
        }
    }
    
    // Se tudo estiver OK, simula o envio de dados
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Armazenamento Simulado (Poderia ser um Fetch para API)
    console.log("Dados do Formulário (simulado):", data);
    
    displayToast('✅ Cadastro enviado com sucesso! Agradecemos seu interesse.', 'success');
    form.reset();
}


// -------------------------------------------
// 4. ESTRUTURA: SINGLE PAGE APPLICATION (SPA) BÁSICO E TEMPLATES
// -------------------------------------------
/*
* Simulação de Templates e Carregamento de Conteúdo Dinâmico via URL Hash.
*/

const mainContent = document.querySelector('main');

/**
 * Sistema de Templates Simples (Gera HTML baseado em dados).
 * @param {string} title - Título do Projeto.
 * @param {string} description - Descrição do Projeto.
 * @returns {string} HTML gerado.
 */
function generateProjectTemplate(title, description) {
    return `
        <section class="container">
            <h2>Detalhes do Projeto: ${title}</h2>
            <p>${description}</p>
            <p><strong>Status:</strong> Em Andamento</p>
            <a href="projetos.html" class="btn btn-secondary" onclick="event.preventDefault(); window.location.hash='';">Voltar aos Projetos</a>
        </section>
    `;
}

/**
 * Gerencia a navegação básica (simulação SPA) baseada na URL hash.
 */
function initSPABasic() {
    // Escuta mudanças na URL hash (ex: #detalhes-projeto-acolher)
    window.addEventListener('hashchange', loadContentByHash);
    
    // Carrega o conteúdo na primeira visita (se houver hash)
    loadContentByHash();
}

/**
 * Carrega o template dinâmico se a hash for detectada.
 */
function loadContentByHash() {
    const hash = window.location.hash.slice(1); // Remove o '#'
    
    // Mapa de Conteúdo (Simula dados de uma API) - APENAS PROJETO ACOLHER
    const contentMap = {
        'detalhes-projeto-acolher': {
            title: "Projeto Acolher (Educação)",
            description: "Foco na educação e futuro. Oferecemos aulas de reforço e atividades socioemocionais para mais de 50 crianças, combatendo o trabalho infantil e a evasão escolar na comunidade. Com o Projeto Acolher, investimos diretamente no potencial de cada criança, oferecendo-lhes um ambiente seguro e estimulante para o aprendizado."
        }
    };

    if (contentMap[hash]) {
        // Encontra o conteúdo
        const contentData = contentMap[hash];
        const newHtml = generateProjectTemplate(contentData.title, contentData.description);
        
        // Substitui o conteúdo principal (simulação de carregamento de página)
        if (mainContent) {
            mainContent.innerHTML = newHtml;
        }
        window.scrollTo(0, 0); // Rola para o topo
    } else {
        // Se a hash for limpa ou inválida
        if (mainContent && mainContent.innerHTML.includes('<h2>Detalhes do Projeto:')) {
            // Se o conteúdo principal foi substituído, recarrega para voltar ao HTML original
            window.location.reload(); 
        }
    }
}
