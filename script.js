// ============================================
// SCRIPT - GERENCIADOR DE MÍDIAS (SUPORTE EM MASSA + JSDELIVR)
// ============================================

const mediaGrid = document.getElementById('mediaGrid');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusMsg = document.getElementById('statusMsg');

const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const btnDeleteSelected = document.getElementById('btnDeleteSelected');
const selectedCountEl = document.getElementById('selectedCount');

const tokenInput = document.getElementById('githubTokenInput');
const saveTokenBtn = document.getElementById('saveTokenBtn');

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

// 🔽 CONFIGURAÇÃO DO TOKEN LOCAL
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

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
    };
    if (CONFIG.token) {
        headers['Authorization'] = `Bearer ${CONFIG.token}`;
    }
    return headers;
}

// 🔽 BUSCAR ARQUIVOS
async function buscarArquivos(pasta) {
    try {
        const timestamp = Date.now();
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${pasta}?ref=${CONFIG.branch}&t=${timestamp}`;
        
        const resposta = await fetch(url, { 
            headers: getHeaders(),
            cache: 'no-store' 
        });
        
        if (!resposta.ok) {
            if (resposta.status === 404) return [];
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
                url: `https://cdn.jsdelivr.net/gh/${CONFIG.owner}/${CONFIG.repo}@${CONFIG.branch}/${arquivo.path}`
            }));
    } catch (erro) {
        console.error(`Erro na pasta "${pasta}":`, erro);
        return [];
    }
}

function getTipoMidia(nome) {
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    if (videoExts.some(ext => nome.toLowerCase().endsWith(ext))) return 'video';
    if (imageExts.some(ext => nome.toLowerCase().endsWith(ext))) return 'image';
    return 'unknown';
}

// 🔽 CARREGAR MÍDIAS E GERENCIAR SELEÇÕES
async function carregarMidias() {
    mediaGrid.innerHTML = `<p class="empty-msg">⏳ Carregando mídias...</p>`;
    atualizarBarraAcoesMassa();

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
                    </video>
                `;
            } else if (tipo === 'image') {
                previewHTML = `<img src="${fileUrl}" alt="${arquivo.nome}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'file-icon\\'>🖼️</span>'" />`;
            } else {
                previewHTML = `<span class="file-icon">📄</span>`;
            }

            cardsHTML += `
                <div class="media-card" data-sha="${arquivo.sha}" data-caminho="${arquivo.caminho}" style="position: relative;">
                    <!-- Checkbox de Seleção Individual -->
                    <div style="position: absolute; top: 8px; left: 8px; z-index: 10; background: rgba(0,0,0,0.6); padding: 4px; border-radius: 4px;">
                        <input type="checkbox" class="select-media-checkbox" data-caminho="${arquivo.caminho}" data-sha="${arquivo.sha}" style="width: 18px; height: 18px; cursor: pointer;">
                    </div>

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
        configurarEventosSelecao();

    } catch (erro) {
        console.error(erro);
        mediaGrid.innerHTML = `<p class="empty-msg">❌ Erro: ${erro.message}</p>`;
    }
}

// 🔽 GERENCIAMENTO DE SELEÇÃO EM MASSA
function configurarEventosSelecao() {
    const checkboxes = document.querySelectorAll('.select-media-checkbox');

    checkboxes.forEach(chk => {
        chk.addEventListener('change', atualizarBarraAcoesMassa);
    });

    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.onclick = () => {
            checkboxes.forEach(chk => chk.checked = selectAllCheckbox.checked);
            atualizarBarraAcoesMassa();
        };
    }
}

function atualizarBarraAcoesMassa() {
    const selecionados = document.querySelectorAll('.select-media-checkbox:checked');
    const total = selecionados.length;

    if (selectedCountEl) selectedCountEl.textContent = total;

    if (btnDeleteSelected) {
        btnDeleteSelected.style.display = total > 0 ? 'inline-block' : 'none';
    }
}

// 🔽 EXCLUSÃO EM MASSA
async function deletarMídiasEmMassa() {
    if (!CONFIG.token) {
        alert('❌ Insira o seu Token do GitHub no topo da página e clique em "Salvar Chave".');
        return;
    }

    const selecionados = Array.from(document.querySelectorAll('.select-media-checkbox:checked')).map(chk => ({
        caminho: chk.dataset.caminho,
        sha: chk.dataset.sha
    }));

    if (selecionados.length === 0) return;

    if (!confirm(`Tem certeza que deseja excluir ${selecionados.length} mídia(s) selecionada(s)?`)) {
        return;
    }

    btnDeleteSelected.disabled = true;
    btnDeleteSelected.textContent = '⏳ Excluindo...';

    let sucessos = 0;
    let erros = 0;

    for (const item of selecionados) {
        try {
            const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${item.caminho}`;
            const resposta = await fetch(url, {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({
                    message: `Exclusão em massa do arquivo ${item.caminho}`,
                    sha: item.sha,
                    branch: CONFIG.branch
                })
            });

            if (resposta.ok) {
                sucessos++;
            } else {
                erros++;
            }
        } catch (erro) {
            erros++;
        }
    }

    alert(`Processo concluído!\n✅ Excluídos com sucesso: ${sucessos}\n❌ Erros: ${erros}`);
    btnDeleteSelected.disabled = false;
    carregarMidias();
}

if (btnDeleteSelected) {
    btnDeleteSelected.addEventListener('click', deletarMídiasEmMassa);
}

// 🔽 UPLOAD EM MASSA
async function fazerUploadEmMassa(arquivos, pasta) {
    if (!CONFIG.token) {
        alert('❌ Insira o seu Token do GitHub no topo da página e clique em "Salvar Chave".');
        return;
    }

    const total = arquivos.length;
    let enviados = 0;

    statusMsg.style.color = '#3b82f6';

    for (let i = 0; i < total; i++) {
        const arquivo = arquivos[i];
        statusMsg.textContent = `⏳ Enviando (${i + 1}/${total}): "${arquivo.name}"...`;

        try {
            const base64 = await converterParaBase64(arquivo);
            const caminho = `${pasta}/${arquivo.name}`;
            const shaExistente = await obterShaExistente(caminho);

            const bodyData = {
                message: `Upload em massa: ${arquivo.name}`,
                content: base64,
                branch: CONFIG.branch
            };

            if (shaExistente) bodyData.sha = shaExistente;

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

            enviados++;
        } catch (erro) {
            console.error(`Erro ao enviar ${arquivo.name}:`, erro);
        }
    }

    statusMsg.textContent = `✅ Upload concluído! ${enviados} de ${total} arquivo(s) enviado(s).`;
    statusMsg.style.color = '#10b981';

    setTimeout(() => {
        statusMsg.textContent = '';
        carregarMidias();
    }, 1500);
}

function converterParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(arquivo);
    });
}

async function obterShaExistente(caminho) {
    try {
        const timestamp = Date.now();
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${caminho}?ref=${CONFIG.branch}&t=${timestamp}`;
        const resposta = await fetch(url, { 
            headers: getHeaders(),
            cache: 'no-store' 
        });
        if (resposta.ok) {
            const dados = await resposta.json();
            return dados.sha;
        }
    } catch {
        return null;
    }
    return null;
}

// 🔽 EVENTOS DE UPLOAD
function configurarUpload() {
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const pastaEl = document.getElementById('pastaUpload');
            const pasta = pastaEl ? pastaEl.value : 'images';
            fazerUploadEmMassa(Array.from(this.files), pasta);
        }
        this.value = '';
    });

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
            const pastaEl = document.getElementById('pastaUpload');
            const pasta = pastaEl ? pastaEl.value : 'images';
            fazerUploadEmMassa(Array.from(e.dataTransfer.files), pasta);
        }
    });
}

function copiarLink(url, button) {
    navigator.clipboard.writeText(url).then(() => {
        button.textContent = '✅ Copiado!';
        setTimeout(() => button.textContent = '📋 Copiar Link', 2000);
    });
}

function abrirLink(url) {
    window.open(url, '_blank');
}

async function deletarArquivo(caminho, sha, button) {
    if (!CONFIG.token) {
        alert('❌ Insira o seu Token do GitHub.');
        return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${caminho}"?`)) return;

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

        if (!resposta.ok) throw new Error('Erro ao excluir arquivo.');

        alert(`✅ Arquivo excluído com sucesso!`);
        carregarMidias();
    } catch (erro) {
        alert(`❌ Falha: ${erro.message}`);
        button.textContent = '🗑️';
        button.disabled = false;
    }
}

window.addEventListener('DOMContentLoaded', function() {
    inicializarTokenLocal();
    carregarMidias();
    configurarUpload();
});
