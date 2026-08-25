// ============================================
// SCRIPT - LISTA MÍDIAS AUTOMATICAMENTE VIA API DO GITHUB
// ============================================

const mediaGrid = document.getElementById('mediaGrid');

// 🔽 CONFIGURAÇÃO DO SEU REPOSITÓRIO (VOCÊ SÓ MUDA AQUI!)
const REPO_OWNER = 'pesty199915-create';
const REPO_NAME = 'midia-host';
const BRANCH = 'main';

// 🔽 PASTAS ONDE ESTÃO AS MÍDIAS (VOCÊ PODE ADICIONAR MAIS)
const PASTAS = ['images', 'videos'];

// 🔽 EXTENSÕES DE ARQUIVO QUE SERÃO EXIBIDAS
const EXTENSOES_MEDIA = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

// 🔽 FUNÇÃO PARA BUSCAR ARQUIVOS DE UMA PASTA VIA API DO GITHUB
async function buscarArquivosDaPasta(pasta) {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${pasta}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`⚠️ Pasta "${pasta}" não encontrada.`);
                return [];
            }
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const files = await response.json();
        return files.filter(file => {
            return file.type === 'file' && EXTENSOES_MEDIA.some(ext => file.name.toLowerCase().endsWith(ext));
        });
    } catch (error) {
        console.error(`Erro ao buscar pasta "${pasta}":`, error);
        return [];
    }
}

// 🔽 FUNÇÃO PARA IDENTIFICAR O TIPO DE MÍDIA
function getMediaType(filename) {
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    if (videoExts.some(ext => filename.toLowerCase().endsWith(ext))) return 'video';
    if (imageExts.some(ext => filename.toLowerCase().endsWith(ext))) return 'image';
    return 'unknown';
}

// 🔽 FUNÇÃO PRINCIPAL - CARREGA TODAS AS MÍDIAS
async function carregarMidias() {
    mediaGrid.innerHTML = `<p class="empty-msg">⏳ Carregando mídias...</p>`;

    try {
        // 🔽 BUSCA ARQUIVOS EM TODAS AS PASTAS CONFIGURADAS
        const todasAsPromises = PASTAS.map(pasta => buscarArquivosDaPasta(pasta));
        const resultados = await Promise.all(todasAsPromises);
        
        // 🔽 Junta todos os arquivos em uma lista única
        const todosArquivos = resultados.flat();
        
        if (todosArquivos.length === 0) {
            mediaGrid.innerHTML = `<p class="empty-msg">📭 Nenhuma imagem ou vídeo encontrado nas pastas: ${PASTAS.join(', ')}</p>`;
            return;
        }

        // 🔽 ORDENA POR NOME
        todosArquivos.sort((a, b) => a.name.localeCompare(b.name));

        // 🔽 CONSTRÓI OS CARDS
        let cardsHTML = '';
        const baseUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
        
        todosArquivos.forEach(arquivo => {
            const fileUrl = `${baseUrl}/${arquivo.path}`;
            const fileName = arquivo.name;
            const mediaType = getMediaType(fileName);
            
            let previewHTML = '';
            if (mediaType === 'video') {
                previewHTML = `
                    <video controls muted preload="metadata" style="width:100%;height:100%;object-fit:cover;background:#000;">
                        <source src="${fileUrl}" type="video/mp4" />
                        Seu navegador não suporta vídeo.
                    </video>
                `;
            } else if (mediaType === 'image') {
                previewHTML = `<img src="${fileUrl}" alt="${fileName}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'file-icon\\'>🖼️</span>'" />`;
            } else {
                previewHTML = `<span class="file-icon">📄</span>`;
            }

            cardsHTML += `
                <div class="media-card">
                    <div class="preview">
                        ${previewHTML}
                    </div>
                    <div class="info">
                        <div class="filename" title="${fileName}">${fileName}</div>
                        <div class="link" title="${fileUrl}">${fileUrl}</div>
                        <button class="btn-copy" onclick="copiarLink('${fileUrl}', this)">📋 Copiar Link</button>
                    </div>
                </div>
            `;
        });

        mediaGrid.innerHTML = cardsHTML;

    } catch (error) {
        console.error(error);
        mediaGrid.innerHTML = `<p class="empty-msg">❌ Erro ao carregar mídias: ${error.message}</p>`;
    }
}

// 🔽 FUNÇÃO PARA COPIAR LINK
function copiarLink(url, button) {
    navigator.clipboard.writeText(url).then(() => {
        button.textContent = '✅ Copiado!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = '📋 Copiar Link';
            button.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        button.textContent = '✅ Copiado!';
        setTimeout(() => {
            button.textContent = '📋 Copiar Link';
            button.classList.remove('copied');
        }, 2000);
    });
}

// 🔽 CARREGAR AUTOMATICAMENTE AO ABRIR A PÁGINA
window.addEventListener('DOMContentLoaded', carregarMidias);
