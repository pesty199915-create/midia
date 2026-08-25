// ============================================
// SCRIPT - CARREGA MÍDIAS DA PASTA PUBLIC
// ============================================

const mediaGrid = document.getElementById('mediaGrid');

// 🔽 URL BASE DA PASTA PUBLIC NA VERCEL
const BASE_URL = '/public/';

// 🔽 LISTA DE ARQUIVOS (VOCÊ VAI ADICIONAR/REMOVER AQUI)
const arquivos = [
    // 🖼️ IMAGENS
    { nome: 'images/001.png', tipo: 'image' },
    { nome: 'images/002.png', tipo: 'image' },
    { nome: 'images/Design sem nome.png', tipo: 'image' },
    { nome: 'images/Cópia de UNIVERSITARIAS (5).png', tipo: 'image' },
    { nome: 'images/9fe3a63585c536792ffffac77598bc9d.jpg', tipo: 'image' },
    
    // 🎬 VÍDEOS
    { nome: 'videos/0803(11).mp4', tipo: 'video' },
    { nome: 'videos/0811(15).mp4', tipo: 'video' },
    { nome: 'videos/12321fdsfsdps.mp4', tipo: 'video' },
];

// 🔽 Função para carregar e exibir as mídias
function carregarMidias() {
    if (arquivos.length === 0) {
        mediaGrid.innerHTML = `<p class="empty-msg">📭 Nenhuma mídia encontrada. Adicione arquivos na lista.</p>`;
        return;
    }

    let cardsHTML = '';
    
    arquivos.forEach(arquivo => {
        const fileUrl = BASE_URL + arquivo.nome;
        const fileName = arquivo.nome.split('/').pop();
        const mediaType = arquivo.tipo;
        
        let previewHTML = '';
        if (mediaType === 'video') {
            previewHTML = `<video controls muted preload="metadata"><source src="${fileUrl}" type="video/mp4" /></video>`;
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

// 🔽 Função para copiar link
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
        }, 2000);
    });
}

// 🔽 Carregar automaticamente ao abrir a página
window.addEventListener('DOMContentLoaded', carregarMidias);