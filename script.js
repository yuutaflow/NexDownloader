// Troca de abas do menu
const tabs = document.querySelectorAll('.tab-button');
const sections = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.target;
    sections.forEach(sec => {
      if (sec.id === target) sec.classList.add('active');
      else sec.classList.remove('active');
    });
    clearStatusAndResults();
  });
});

const clearStatusAndResults = () => {
  document.querySelectorAll('.status').forEach(el => el.textContent = '');
  document.querySelectorAll('.result').forEach(el => el.innerHTML = '');
}

// Função para mostrar loading
const showLoading = (el) => {
  el.textContent = 'Carregando... ⏳';
}

// Função para mostrar erro
const showError = (el, msg) => {
  el.textContent = '❌ ' + msg;
}

// Baixar MP3 YouTube
document.getElementById('btnYtDownload').addEventListener('click', async () => {
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
    } else {
      showError(status, 'Não foi possível obter o áudio.');
    }
  } catch {
    showError(status, 'Erro na requisição da API.');
  }
});

// Baixar vídeo TikTok
document.getElementById('btnTtDownload').addEventListener('click', async () => {
  const url = document.getElementById('ttUrl').value.trim();
  const status = document.getElementById('ttStatus');
  const result = document.getElementById('ttResult');
  result.innerHTML = '';

  if (!url || !url.includes('tiktok.com')) {
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
    } else {
      showError(status, 'Não foi possível obter o vídeo.');
    }
  } catch {
    showError(status, 'Erro na requisição da API.');
  }
});