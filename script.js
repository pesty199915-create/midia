// ============================================
// SCRIPT - CARREGA MÍDIAS E COPIA LINK COMPLETO
// ============================================

const mediaGrid = document.getElementById('mediaGrid');

// 🔽 LISTA DE ARQUIVOS (ATUALIZE QUANDO ADICIONAR/REMOVER MÍDIAS)
const arquivos = [
    // 🖼️ IMAGENS
    { nome: 'images/38fa8ecfa730fb0a30873133541e9c38.jpg', tipo: 'image' },
    { nome: 'images/b8030a44728ea7ed854f2601de7bb110.jpg', tipo: 'image' },
    { nome: 'images/Clique em Acessar Site.png', tipo: 'image' },
    { nome: 'images/naye.jpg', tipo: 'image' },
    
    // 🎬 VÍDEOS
    { nome: 'videos/08111(14).mp4', tipo: 'video' },
    { nome: 'videos/08111(15).mp4', tipo: 'video' },
    { nome: 'videos/08111(16).mp4', tipo: 'video' },
    { nome: 'videos/08111(17).mp4', tipo: 'video' },
];

// 🔽 Função para carregar e exibir as mídias
function carregarMidias() {
    if (arquivos.length === 0) {
        mediaGrid.innerHTML = `<p class="empty-msg">📭 Nenhuma mídia encontrada.</p>`;
        return;
    }

    let cardsHTML = '';
    
    arquivos.forEach(arquivo => {
        // 🔽 CRIA O LINK COMPLETO (COM O DOMÍNIO)
        const fileUrl = window.location.origin + '/' + arquivo.nome;
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
        // Fallback para navegadores antigos
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

// 🔽 Carregar automaticamente ao abrir a página
window.addEventListener('DOMContentLoaded', carregarMidias);
