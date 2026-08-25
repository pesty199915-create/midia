// ============================================
// SCRIPT - GERENCIADOR DE MÍDIAS COM LOCALSTORAGE
// ============================================

const mediaGrid = document.getElementById('mediaGrid');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusMsg = document.getElementById('statusMsg');

// Elementos da chave de acesso
const tokenInput = document.getElementById('githubTokenInput');
const saveTokenBtn = document.getElementById('saveTokenBtn');

// 🔽 CONFIGURAÇÃO (Lê a chave diretamente do navegador)
const CONFIG = {
    owner: 'pesty199915-create',
    repo: 'midia',
    branch: 'main',
    pastas: ['images', 'videos'],
    get token() {
        return localStorage.getItem('gh_token') || '';
    }
};

const EXTENSOES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

// 🔽 CONFIGURAÇÃO E GERENCIAMENTO DO TOKEN LOCAL
function inicializarTokenLocal() {
    if (tokenInput && saveTokenBtn) {
        tokenInput.value = CONFIG.token;

        saveTokenBtn.addEventListener('click', () => {
            const novoToken = tokenInput.value.trim();
            if (novoToken) {
                localStorage.setItem('gh_token', novoToken);
                alert('✅ Token salvo no seu navegador!');
                carregarMidias();
            } else {
                localStorage.removeItem('gh_token');
                alert('⚠️ Token removido do navegador.');
            }
        });
    }
}

// 🔽 HEADERS DE AUTENTICAÇÃO
function getHeaders() {
    return {
        'Authorization': `Bearer ${CONFIG.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
    };
}

// 🔽 FUNÇÃO PARA BUSCAR ARQUIVOS
async function buscarArquivos(pasta) {
    try {
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${pasta}?ref=${CONFIG.branch}`;
        const resposta = await fetch(url);
        
        if (!resposta.ok) {
            if (resposta.status === 404) {
                console.warn(`⚠️ Pasta "${pasta}" não encontrada.`);
                return [];
            }
            throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
        }
        
        const arquivos = await resposta.json();
        if (!Array.isArray(arquivos)) return [];

        return arquivos
            .filter(arquivo => 
                arquivo.type === 'file' && 
                EXTENSOES.some(ext => arquivo.name.toLowerCase().endsWith(ext))
            )
            .map(arquivo => ({
                nome: arquivo.name,
                caminho: arquivo.path,
                sha: arquivo.sha,
                url: `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${arquivo.path}`
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

// 🔽 FUNÇÃO PARA CARREGAR MÍDIAS
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
            const fileUrl = arquivo.url;
            const tipo = getTipoMidia(arquivo.nome);
            
            let previewHTML = '';
            if (tipo === 'video') {
                previewHTML = `
                    <video controls muted preload="metadata" style="width:100%;height:100%;object-fit:cover;background:#000;">
                        <source src="${fileUrl}" />
                        Seu navegador não suporta vídeo.
                    </video>
                `;
            } else if (tipo === 'image') {
                previewHTML = `<img src="${fileUrl}" alt="${arquivo.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'file-icon\\'>🖼️</span>'" />`;
            } else {
                previewHTML = `<span class="file-icon">📄</span>`;
            }

            cardsHTML += `
                <div class="media-card" data-sha="${arquivo.sha}" data-caminho="${arquivo.caminho}">
                    <div class="preview">${previewHTML}</div>
                    <div class="info">
                        <div class="filename" title="${arquivo.nome}">${arquivo.nome}</div>
                        <div class="link" title="${fileUrl}">${fileUrl}</div>
                        <div class="button-group">
                            <button class="btn-copy" onclick="copiarLink('${fileUrl}', this)">📋 Copiar Link</button>
                            <button class="btn-open" onclick="abrirLink('${fileUrl}')">🔗 Abrir</button>
                            <button class="btn-delete" onclick="deletarArquivo('${arquivo.caminho}', '${arquivo.sha}', this)">🗑️</button>
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

// 🔽 FUNÇÃO PARA DELETAR ARQUIVO
async function deletarArquivo(caminho, sha, button) {
    if (!CONFIG.token) {
        alert('❌ Insira o seu Token do GitHub no topo da página e clique em "Salvar Chave".');
        return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${caminho}"?`)) {
        return;
    }

    button.textContent = '⏳';
    button.disabled = true;

    try {
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${caminho}`;
        const resposta = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(),
            body: JSON.stringify({
                message: `Exclusão do arquivo ${caminho}`,
                sha: sha,
                branch: CONFIG.branch
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.message || 'Erro ao excluir arquivo.');
        }

        alert(`✅ Arquivo "${caminho}" excluído com sucesso!`);
        carregarMidias();

    } catch (erro) {
        console.error(erro);
        alert(`❌ Falha ao excluir: ${erro.message}`);
        button.textContent = '🗑️';
        button.disabled = false;
    }
}

// 🔽 BUSCA SHA CASO O ARQUIVO JÁ EXISTA
async function obterShaExistente(caminho) {
    try {
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${caminho}?ref=${CONFIG.branch}`;
        const resposta = await fetch(url);
        if (resposta.ok) {
            const dados = await resposta.json();
            return dados.sha;
        }
    } catch {
        return null;
    }
    return null;
}

// 🔽 FUNÇÃO PARA FAZER UPLOAD
async function fazerUpload(arquivo, pasta) {
    if (!CONFIG.token) {
        alert('❌ Insira o seu Token do GitHub no topo da página e clique em "Salvar Chave".');
        return;
    }

    statusMsg.textContent = `⏳ Enviando "${arquivo.name}"...`;
    statusMsg.style.color = '#3b82f6';

    const reader = new FileReader();
    reader.onload = async function(event) {
        const base64 = event.target.result.split(',')[1];
        const caminho = `${pasta}/${arquivo.name}`;

        try {
            const shaExistente = await obterShaExistente(caminho);

            const bodyData = {
                message: `Upload do arquivo ${arquivo.name}`,
                content: base64,
                branch: CONFIG.branch
            };

            if (shaExistente) {
                bodyData.sha = shaExistente;
            }

            const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${caminho}`;
            const resposta = await fetch(url, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(bodyData)
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.message || 'Erro ao realizar upload.');
            }

            statusMsg.textContent = `✅ "${arquivo.name}" enviado com sucesso!`;
            statusMsg.style.color = '#10b981';
            
            setTimeout(() => {
                statusMsg.textContent = '';
                carregarMidias();
            }, 1500);

        } catch (erro) {
            console.error(erro);
            statusMsg.textContent = `❌ Erro: ${erro.message}`;
            statusMsg.style.color = '#ef4444';
        }
    };
    reader.readAsDataURL(arquivo);
}

// 🔽 CONFIGURAR EVENTOS DE UPLOAD
function configurarUpload() {
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const arquivo = this.files[0];
            const pastaEl = document.getElementById('pastaUpload');
            const pasta = pastaEl ? pastaEl.value : 'images';
            fazerUpload(arquivo, pasta);
        }
        this.value = '';
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#8b5cf6';
        this.style.background = '#1c1c28';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#2d2d33';
        this.style.background = 'transparent';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#2d2d33';
        this.style.background = 'transparent';
        
        if (e.dataTransfer.files.length > 0) {
            const arquivo = e.dataTransfer.files[0];
            const pastaEl = document.getElementById('pastaUpload');
            const pasta = pastaEl ? pastaEl.value : 'images';
            fazerUpload(arquivo, pasta);
        }
    });
}

// 🔽 INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', function() {
    inicializarTokenLocal();
    carregarMidias();
    configurarUpload();
});
