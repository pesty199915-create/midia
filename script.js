// ============================================
// SCRIPT - LISTA MÍDIAS USANDO URL RAW (SEM API)
// ============================================

const mediaGrid = document.getElementById('mediaGrid');

// 🔽 CONFIGURAÇÃO DO SEU REPOSITÓRIO
const REPO_OWNER = 'pesty199915-create';
const REPO_NAME = 'midia-host';
const BRANCH = 'main';

// 🔽 PASTAS ONDE ESTÃO AS MÍDIAS
const PASTAS = ['images', 'videos'];

// 🔽 EXTENSÕES DE ARQUIVO QUE SERÃO EXIBIDAS
const EXTENSOES_MEDIA = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

// 🔽 LISTA MANUAL DOS ARQUIVOS (VOCÊ PRECISA MANTER ATUALIZADO)
// ⚠️ QUANDO ADICIONAR UM NOVO ARQUIVO, ADICIONE AQUI!
const ARQUIVOS_CONHECIDOS = [
    // 🖼️ IMAGENS (pasta "images")
    'images/38fa8ecfa730fb0a30873133541e9c38.jpg',
    'images/b8030a44728ea7ed854f2601de7bb110.jpg',
    'images/Clique em Acessar Site.png',
    'images/naye.jpg',
    
    // 🎬 VÍDEOS (pasta "videos")
    'videos/08111(14).mp4',
    'videos/08111(15).mp4',
    'videos/08111(16).mp4',
    'videos/08111(17).mp4',
];

// 🔽 FUNÇÃO PARA IDENTIFICAR O TIPO DE MÍDIA
function getMediaType(filename) {
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    if (videoExts.some(ext => filename.toLowerCase().endsWith(ext))) return 'video';
    if (imageExts.some(ext => filename.toLowerCase().endsWith(ext))) return 'image';
    return 'unknown';
}

// 🔽 FUNÇÃO PRINCIPAL - CARREGA AS MÍDIAS
function carregarMidias() {
    if (ARQUIVOS_CONHECIDOS.length === 0) {
        mediaGrid.innerHTML = `<p class="empty-msg">📭 Nenhuma mídia cadastrada. Adicione arquivos na lista ARQUIVOS_CONHECIDOS.</p>`;
        return;
    }

    const baseUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
    let cardsHTML = '';
    
    ARQUIVOS_CONHECIDOS.forEach(caminho => {
        const fileUrl = `${baseUrl}/${caminho}`;
        const fileName = caminho.split('/').pop();
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
