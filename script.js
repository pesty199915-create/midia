// ============================================
// SCRIPT - LISTA MÍDIAS COM LINKS DO SITE
// ============================================

const mediaGrid = document.getElementById('mediaGrid');

// 🔽 CONFIGURAÇÃO DO SEU REPOSITÓRIO
const CONFIG = {
    owner: 'pesty199915-create',
    repo: 'midia',
    branch: 'main',
    pastas: ['images', 'videos']
};

const EXTENSOES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

// 🔽 FUNÇÃO PARA BUSCAR ARQUIVOS
async function buscarArquivos(pasta) {
    try {
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${pasta}`;
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            if (resposta.status === 404) {
                console.warn(`⚠️ Pasta "${pasta}" não encontrada.`);
                return [];
            }
            throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
        }
        
        const arquivos = await resposta.json();
        return arquivos
            .filter(arquivo => 
                arquivo.type === 'file' && 
                EXTENSOES.some(ext => arquivo.name.toLowerCase().endsWith(ext))
            )
            .map(arquivo => ({
                nome: arquivo.name,
                caminho: arquivo.path,
            }));
    } catch (erro) {
        console.error(`Erro na pasta "${pasta}":`, erro);
        return [];
    }
}

// 🔽 FUNÇÃO PARA IDENTIFICAR O TIPO DE MÍDIA
function getTipoMidia(nome) {
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    if (videoExts.some(ext => nome.toLowerCase().endsWith(ext))) return 'video';
    if (imageExts.some(ext => nome.toLowerCase().endsWith(ext))) return 'image';
    return 'unknown';
}

// 🔽 FUNÇÃO PRINCIPAL
async function carregarMidias() {
    mediaGrid.innerHTML = `<p class="empty-msg">⏳ Carregando mídias...</p>`;

    try {
        const promessas = CONFIG.pastas.map(pasta => buscarArquivos(pasta));
        const resultados = await Promise.all(promessas);
        const todosArquivos = resultados.flat();
        
        if (todosArquivos.length === 0) {
            mediaGrid.innerHTML = `<p class="empty-msg">📭 Nenhuma imagem ou vídeo encontrado.</p>`;
            return;
        }

        todosArquivos.sort((a, b) => a.nome.localeCompare(b.nome));

        let cardsHTML = '';
        
        todosArquivos.forEach(arquivo => {
            const fileUrl = `/${arquivo.caminho}`;
            const linkCompleto = window.location.origin + fileUrl;
            const tipo = getTipoMidia(arquivo.nome);
            
            let previewHTML = '';
            if (tipo === 'video') {
                previewHTML = `
                    <video controls muted preload="metadata" style="width:100%;height:100%;object-fit:cover;background:#000;">
                        <source src="${fileUrl}" type="video/mp4" />
                        Seu navegador não suporta vídeo.
                    </video>
                `;
            } else if (tipo === 'image') {
                previewHTML = `<img src="${fileUrl}" alt="${arquivo.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'file-icon\\'>🖼️</span>'" />`;
            } else {
                previewHTML = `<span class="file-icon">📄</span>`;
            }

            cardsHTML += `
                <div class="media-card">
                    <div class="preview">${previewHTML}</div>
                    <div class="info">
                        <div class="filename" title="${arquivo.nome}">${arquivo.nome}</div>
                        <div class="link" title="${linkCompleto}">${linkCompleto}</div>
                        <div class="button-group">
                            <button class="btn-copy" onclick="copiarLink('${linkCompleto}', this)">📋 Copiar Link</button>
                            <button class="btn-open" onclick="abrirLink('${linkCompleto}')">🔗 Abrir</button>
                        </div>
                    </div>
                </div>
            `;
        });

        mediaGrid.innerHTML = cardsHTML;

    } catch (erro) {
        console.error(erro);
        mediaGrid.innerHTML = `<p class="empty-msg">❌ Erro: ${erro.message}</p>`;
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

// 🔽 FUNÇÃO PARA ABRIR EM NOVA ABA
function abrirLink(url) {
    window.open(url, '_blank');
}

// 🔽 CARREGA AUTOMATICAMENTE
window.addEventListener('DOMContentLoaded', carregarMidias);
