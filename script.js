const MAX_DOWNLOADS = 3;
const STORAGE_KEY = 'nexdown_data';

// Abas
const tabs = document.querySelectorAll('.tab-button');
const sections = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.target;
    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === target);
    });
    clearStatusAndResults();
  });
});

function clearStatusAndResults() {
  document.querySelectorAll('.status').forEach(el => el.textContent = '');
  document.querySelectorAll('.result').forEach(el => el.innerHTML = '');
}

// Gerenciamento de limite diário
function getStorageData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const today = new Date().toDateString();
  if (!raw) {
    return { date: today, count: 0, historico: [] };
  }
  const data = JSON.parse(raw);
  if (data.date !== today) {
    return { date: today, count: 0, historico: [] };
  }
  return data;
}

function saveStorageData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  atualizarUI();
}

function podeBaixar() {
  const data = getStorageData();
  return data.count < MAX_DOWNLOADS;
}

function registrarDownload(tipo, url) {
  const data = getStorageData();
  data.count++;
  data.historico.push({ tipo, url, data: new Date().toLocaleString() });
  saveStorageData(data);
}

// Atualiza contador e histórico
function atualizarUI() {
  const data = getStorageData();
  document.getElementById('count').textContent = data.count;
  const msg = document.getElementById('limite-msg');
  msg.textContent = data.count >= MAX_DOWNLOADS
    ? '⛔ Você atingiu o limite de 3 downloads hoje.'
    : `Você ainda pode fazer ${MAX_DOWNLOADS - data.count} download(s).`;

  const lista = document.getElementById('historico-lista');
  lista.innerHTML = '';
  data.historico.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${entry.tipo}</strong> - ${entry.data} <br><a href="${entry.url}" target="_blank">${entry.url}</a>`;
    lista.appendChild(li);
  });
}

// Carregar ao iniciar
atualizarUI();

// Baixar MP3 do YouTube
document.getElementById('btnYtDownload').addEventListener('click', async () => {
  if (!podeBaixar()) return alert('Você atingiu o limite diário. Pague a versao premiu para baixa videos/musicas ilimatado');

  const url = document.getElementById('ytUrl').value.trim();
  const status = document.getElementById('ytStatus');
  const result = document.getElementById('ytResult');
  result.innerHTML = '';

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    showError(status, 'Por favor, cole um link válido do YouTube.');
    return;
  }

  showLoading(status);
  try {
    const response = await fetch(`https://yuxinze-apis.speedhosting.cloud/download/play-audio/v3?&url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (data.status && data.resultado.url) {
      status.textContent = '✅ Áudio pronto!';
      result.innerHTML = `
        <audio controls src="${data.resultado.url}"></audio>
        <a class="download-link" href="${data.resultado.url}" download="nexdown_audio.mp3">📥 Baixar MP3</a>
      `;
      registrarDownload('YouTube MP3', data.resultado.url);
    } else {
      showError(status, 'Não foi possível obter o áudio.');
    }
  } catch {
    showError(status, 'Erro na requisição da API.');
  }
});

// Baixar vídeo TikTok
document.getElementById('btnTtDownload').addEventListener('click', async () => {
  if (!podeBaixar()) return alert('Você atingiu o limite diário.');

  const url = document.getElementById('ttUrl').value.trim();
  const status = document.getElementById('ttStatus');
  const result = document.getElementById('ttResult');
  result.innerHTML = '';

  if (!url.includes('tiktok.com')) {
    showError(status, 'Por favor, cole um link válido do TikTok.');
    return;
  }

  showLoading(status);
  try {
    const response = await fetch(`https://yuxinze-apis.speedhosting.cloud/download/tiktok?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (data.status && data.resultado.video) {
      const r = data.resultado;
      status.textContent = `✅ Vídeo: ${r.titulo}`;
      result.innerHTML = `
        <video controls src="${r.video}" playsinline></video>
        <a class="download-link" href="${r.video}" download="nexdown_video.mp4">📥 Baixar Vídeo</a>
        <p><strong>Criador:</strong> ${r.criador.nome}</p>
        <p><strong>Likes:</strong> ${r.likes} | <strong>Visualizações:</strong> ${r.visualizacoes}</p>
      `;
      registrarDownload('TikTok Vídeo', r.video);
    } else {
      showError(status, 'Não foi possível obter o vídeo.');
    }
  } catch {
    showError(status, 'Erro na requisição da API.');
  }
});

function showLoading(el) {
  el.textContent = 'Carregando... ⏳';
}

function showError(el, msg) {
  el.textContent = '❌ ' + msg;
  }
