// ==================================================
// あいうえお ひろば - アプリケーションロジック
// ==================================================

// --- グローバル状態管理 ---
let soundEnabled = true;
let currentMode = 'chart';
let selectedChar = 'あ';
let quizScore = 0;
let quizStreak = 0;
let currentQuestion = null;

// なぞりがき状態
let isDrawing = false;
let currentStrokeIdx = 0;
let currentPointIdx = 0;
let completedStrokes = []; // 描き終わったストロークの描画点配列
let currentStrokePoints = []; // 現在描いているストロークの座標
let guideProgress = 0; // なぞり書きガイド星のアニメーション進捗
let guideTimerId = null;

// 音声・オーディオコンテキスト
let audioCtx = null;
let jaVoice = null;


// 濁音・半濁音のデータリスト
const dakuonData = {
  'が': { word: 'がっこう', emoji: '🏫', pronounce: '学校' },
  'ぎ': { word: 'ぎたー', emoji: '🎸', pronounce: 'ギター' },
  'ぐ': { word: 'ぐんて', emoji: '🧤', pronounce: '軍手' },
  'げ': { word: 'げーむ', emoji: '🎮', pronounce: 'ゲーム' },
  'ご': { word: 'ごりら', emoji: '🦍', pronounce: 'ゴリラ' },
  'ざ': { word: 'ざりがに', emoji: '🦞', pronounce: 'ザリガニ' },
  'じ': { word: 'じてんしゃ', emoji: '🚲', pronounce: '自転車' },
  'ず': { word: 'ずぼん', emoji: '👖', pronounce: 'ズボン' },
  'ぜ': { word: 'ぜりー', emoji: '🍮', pronounce: 'ゼリー' },
  'ぞ': { word: 'ぞう', emoji: '🐘', pronounce: 'ゾウ' },
  'だ': { word: 'だんご', emoji: '🍡', pronounce: '団子' },
  'ぢ': { word: 'ぢ（じ）', emoji: '🎈', pronounce: 'ぢ' },
  'づ': { word: 'づ（ず）', emoji: '👟', pronounce: 'づ' },
  'で': { word: 'でんしゃ', emoji: '🚃', pronounce: '電車' },
  'ど': { word: 'どーなつ', emoji: '🍩', pronounce: 'ドーナツ' },
  'ば': { word: 'ばなな', emoji: '🍌', pronounce: 'バナナ' },
  'び': { word: 'びじゅつ', emoji: '🎨', pronounce: '美術' },
  'ぶ': { word: 'ぶどう', emoji: '🍇', pronounce: 'ブドウ' },
  'べ': { word: 'べんとう', emoji: '🍱', pronounce: '弁当' },
  'ぼ': { word: 'ぼうし', emoji: '👒', pronounce: '帽子' },
  'ぱ': { word: 'ぱんだ', emoji: '🐼', pronounce: 'パンダ' },
  'ぴ': { word: 'ぴあの', emoji: '🎹', pronounce: 'ピアノ' },
  'ぷ': { word: 'ぷりん', emoji: '🍮', pronounce: 'プリン' },
  'ぺ': { word: 'ぺんぎん', emoji: '🐧', pronounce: 'ペンギン' },
  'ぽ': { word: 'ぽすと', emoji: '📮', pronounce: 'ポスト' }
};

// 拗音データリスト
const youonData = {
  'きゃ': { word: 'きゃべつ', emoji: '🥬', pronounce: 'キャベツ' },
  'きゅ': { word: 'きゅうり', emoji: '🥒', pronounce: 'キュウリ' },
  'きょ': { word: 'きょうりゅう', emoji: '🦖', pronounce: '恐竜' },
  'しゃ': { word: 'しゃぼんだま', emoji: '🫧', pronounce: 'シャボン玉' },
  'しゅ': { word: 'しゅわしゅわ', emoji: '🥤', pronounce: 'シュワシュワ' },
  'しょ': { word: 'しょうぼうしゃ', emoji: '🚒', pronounce: '消防車' },
  'ちゃ': { word: 'ちゃわん', emoji: '🍚', pronounce: '茶碗' },
  'ちゅ': { word: 'ちゅうりっぷ', emoji: '🌷', pronounce: 'チューリップ' },
  'ちょ': { word: 'ちょこれーと', emoji: '🍫', pronounce: 'チョコレート' },
  'にゃ': { word: 'にゃーご（ねこ）', emoji: '🐱', pronounce: 'ニャーゴ' },
  'にゅ': { word: 'にゅうにゃく（みるく）', emoji: '🥛', pronounce: 'ミルク' },
  'にょ': { word: 'にょきにょき', emoji: '🌱', pronounce: 'ニョキニョキ' },
  'ひゃ': { word: 'ひゃくえん', emoji: '🪙', pronounce: '百円' },
  'ひゅ': { word: 'ひゅう（かぜ）', emoji: '🍃', pronounce: 'ヒュー' },
  'ひょ': { word: 'ひょう', emoji: '🐆', pronounce: 'ヒョウ' },
  'みゃ': { word: 'みゃー（ねこ）', emoji: '🐱', pronounce: 'ミャー' },
  'みゅ': { word: 'みゅーじっく', emoji: '🎵', pronounce: 'ミュージック' },
  'みょ': { word: 'みょうが', emoji: '🧅', pronounce: 'ミョウガ' },
  'りゃ': { word: 'りゃく（ちず）', emoji: '🗺️', pronounce: '略地図' },
  'りゅ': { word: 'りゅっく', emoji: '🎒', pronounce: 'リュック' },
  'りょ': { word: 'りょこう', emoji: '🧳', pronounce: '旅行' }
};

// --- オーディオ機能の実装 (Web Audio API) ---
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// 効果音：クリック・ポップ音
function playClickSound() {
  if (!soundEnabled) return;
  initAudioContext();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(350, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);
  
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}

// 効果音：なぞり書き中（キラキラシャラシャラ）
let lastSparkleTime = 0;
function playSparkleSound() {
  if (!soundEnabled) return;
  initAudioContext();
  const now = audioCtx.currentTime;
  if (now - lastSparkleTime < 0.08) return; // 再生頻度を制限してうるさくならないようにする
  lastSparkleTime = now;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  const freq = 1300 + Math.random() * 900;
  osc.frequency.setValueAtTime(freq, now);
  
  gain.gain.setValueAtTime(0.02, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}

// 効果音：ストローク完了（ピローン♪）
function playStrokeSuccessSound() {
  if (!soundEnabled) return;
  initAudioContext();
  const now = audioCtx.currentTime;
  const notes = [659.25, 783.99]; // E5, G5
  
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.08, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.22);
  });
}

// 効果音：正解チャイム（ピポピポピピーン！🌟）
function playSuccessChime() {
  if (!soundEnabled) return;
  initAudioContext();
  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.07);
    
    gain.gain.setValueAtTime(0.12, now + idx * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now + idx * 0.07);
    osc.stop(now + idx * 0.07 + 0.4);
  });
}

// 効果音：不正解・おしい音（ぽよん〜）
function playWrongSound() {
  if (!soundEnabled) return;
  initAudioContext();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.linearRampToValueAtTime(130, now + 0.28);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.35);
}

// --- 音声合成 (Web Speech API) ---
function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  const jaVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
  
  if (jaVoices.length === 0) return;
  
  // 高品質な日本語音声を優先して検索
  const naturalVoice = jaVoices.find(v => v.name.includes('Natural'));
  const googleVoice = jaVoices.find(v => v.name.includes('Google'));
  
  jaVoice = naturalVoice || googleVoice || jaVoices[0];
}

if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();

let currentUtterance = null;
let safetyTimeoutId = null;

// テキスト発話関数
function speak(text, callback) {
  if (!soundEnabled) {
    if (callback) callback();
    return;
  }
  
  // 以前のセーフティタイマーがあればクリア
  if (safetyTimeoutId) {
    clearTimeout(safetyTimeoutId);
    safetyTimeoutId = null;
  }
  
  // 以前の発話オブジェクトのイベントハンドラを解除
  if (currentUtterance) {
    currentUtterance.onend = null;
    currentUtterance.onerror = null;
    currentUtterance = null;
  }
  
  // 再生中の音声をストップ
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;
  
  if (jaVoice) {
    utterance.voice = jaVoice;
  }
  utterance.lang = 'ja-JP';
  utterance.rate = 1.0; // 標準速度で流暢に発話させる
  utterance.pitch = 1.05; // 自然で聞き取りやすい少し高めのトーン
  
  if (callback) {
    const handleEnd = () => {
      if (safetyTimeoutId) {
        clearTimeout(safetyTimeoutId);
        safetyTimeoutId = null;
      }
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
      utterance.onend = null;
      utterance.onerror = null;
      callback();
    };
    
    utterance.onend = handleEnd;
    utterance.onerror = handleEnd;
    
    // 発話終了イベントが稀にブラウザバグで火を吹かない場合のセーフティ
    safetyTimeoutId = setTimeout(() => {
      if (utterance.onend) {
        if (currentUtterance === utterance) {
          currentUtterance = null;
        }
        utterance.onend = null;
        utterance.onerror = null;
        callback();
      }
    }, 4000);
  }
  
  window.speechSynthesis.speak(utterance);
}

let passwordBuffer = '';

// --- 画面初期化とイベント設定 ---
document.addEventListener('DOMContentLoaded', () => {
  // --- パスワードロックのキーパッド処理 ---
  const passwordOverlay = document.getElementById('password-overlay');
  const passwordDisplay = document.getElementById('password-display');
  const passwordError = document.getElementById('password-error');
  const passwordDots = passwordDisplay.querySelectorAll('.password-dot');
  
  const updatePasswordDisplay = () => {
    passwordDots.forEach((dot, idx) => {
      dot.classList.toggle('filled', idx < passwordBuffer.length);
    });
  };
  
  const checkPassword = () => {
    if (passwordBuffer === '0210') {
      playSuccessChime();
      passwordOverlay.classList.add('hidden');
    } else {
      playWrongSound();
      passwordError.classList.remove('hidden');
      passwordError.style.animation = 'none';
      passwordError.offsetHeight; // リフロー
      passwordError.style.animation = 'shake 0.4s ease';
      
      setTimeout(() => {
        passwordBuffer = '';
        updatePasswordDisplay();
        passwordError.classList.add('hidden');
      }, 1200);
    }
  };

  const keypadKeys = document.querySelectorAll('.btn-key');
  keypadKeys.forEach(key => {
    key.addEventListener('click', (e) => {
      const val = e.currentTarget.getAttribute('data-val');
      playClickSound();
      
      if (val === 'clear') {
        passwordBuffer = '';
        updatePasswordDisplay();
      } else if (val === 'ok') {
        checkPassword();
      } else {
        if (passwordBuffer.length < 4) {
          passwordBuffer += val;
          updatePasswordDisplay();
          
          if (passwordBuffer.length === 4) {
            setTimeout(checkPassword, 250);
          }
        }
      }
    });
  });

  // はじめるボタン
  document.getElementById('btn-start-app').addEventListener('click', () => {
    initAudioContext();
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Welcome音声
    speak("あいうえお広場へようこそ！一緒にひらがなで遊ぼう！");
    
    // 五十音グリッドの初期生成
    renderChart('seion');
    // なぞり書きカルーセルの初期生成
    renderTraceSelector();
    // キャンバス初期化
    initTraceCanvas();
  });

  // クイズ問題文表示トグル
  const chkShowQuestion = document.getElementById('chk-show-question');
  if (chkShowQuestion) {
    chkShowQuestion.addEventListener('change', (e) => {
      playClickSound();
      const qText = document.getElementById('quiz-question-text');
      if (currentQuestion) {
        if (e.target.checked) {
          qText.innerHTML = currentQuestion.questionText;
        } else {
          qText.innerText = '👂 (みみで きいてね！)';
        }
      }
    });
  }

  // クイズ休憩のつづけるボタン
  const btnQuizBreakContinue = document.getElementById('btn-quiz-break-continue');
  if (btnQuizBreakContinue) {
    btnQuizBreakContinue.addEventListener('click', () => {
      playClickSound();
      document.getElementById('quiz-break-overlay').classList.add('hidden');
      startNewQuiz();
    });
  }
  
  // ナビゲーションの切り替え
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const mode = e.currentTarget.getAttribute('data-mode');
      switchMode(mode);
    });
  });

  // 音声切り替えボタン
  const soundBtn = document.getElementById('btn-sound-toggle');
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.querySelector('.sound-icon-on').classList.toggle('hidden', !soundEnabled);
    document.querySelector('.sound-icon-off').classList.toggle('hidden', soundEnabled);
    playClickSound();
  });
  
  // 五十音表サブカテゴリタブ切り替え
  const subTabs = document.querySelectorAll('.sub-tab');
  subTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      playClickSound();
      subTabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const chartType = e.currentTarget.getAttribute('data-chart-type');
      renderChart(chartType);
    });
  });

  // モダールを閉じる
  document.getElementById('btn-modal-close').addEventListener('click', () => {
    playClickSound();
    document.getElementById('char-modal').classList.add('hidden');
  });
  document.getElementById('char-modal-overlay').addEventListener('click', () => {
    document.getElementById('char-modal').classList.add('hidden');
  });

  // なぞり書きへ行くボタン
  document.getElementById('btn-modal-go-trace').addEventListener('click', () => {
    playClickSound();
    document.getElementById('char-modal').classList.add('hidden');
    switchMode('trace');
    selectTraceChar(selectedChar);
  });

  // おとをきくボタン（モダール内）
  document.getElementById('btn-modal-speak').addEventListener('click', () => {
    const wordData = getCharWordData(selectedChar);
    speak(`${selectedChar}。${wordData.pronounce || wordData.word}`);
  });

  // カルーセルスクロール
  const carousel = document.getElementById('trace-char-selector');
  document.getElementById('btn-trace-scroll-left').addEventListener('click', () => {
    carousel.scrollLeft -= 120;
    playClickSound();
  });
  document.getElementById('btn-trace-scroll-right').addEventListener('click', () => {
    carousel.scrollLeft += 120;
    playClickSound();
  });

  // なぞり書きコントロールボタン
  document.getElementById('btn-trace-sound').addEventListener('click', () => {
    const data = hiraganaData[selectedChar];
    speak(`${selectedChar}。${data.pronounce || data.word}`);
  });
  document.getElementById('btn-trace-clear').addEventListener('click', () => {
    playClickSound();
    clearTraceBoard();
  });

  // クイズ用の読み上げボタン
  document.getElementById('btn-quiz-speak-question').addEventListener('click', () => {
    if (currentQuestion) {
      speak(currentQuestion.voicePrompt);
    }
  });

  // できたお祝いを閉じるボタン
  document.getElementById('btn-celebration-close').addEventListener('click', () => {
    playClickSound();
    document.getElementById('celebration-overlay').classList.add('hidden');
    
    // 次の文字へ進む
    const keys = Object.keys(hiraganaData);
    const curIdx = keys.indexOf(selectedChar);
    const nextIdx = (curIdx + 1) % keys.length;
    selectTraceChar(keys[nextIdx]);
  });
});

// モード切り替え処理
// モード切り替え処理
function switchMode(mode) {
  if (currentMode === mode) return;
  playClickSound();
  
  currentMode = mode;
  
  // タブのアクティブ表示切替
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
  });
  
  // ビューの表示切替
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.toggle('active', view.getAttribute('id') === `view-${mode}`);
  });

  // 各モードに応じた処理
  if (mode === 'trace') {
    selectTraceChar(selectedChar);
  } else if (mode === 'quiz') {
    startNewQuiz();
  }
}

// キャラクターの単語＆絵文字を取得
function getCharWordData(char) {
  if (hiraganaData[char]) {
    return hiraganaData[char];
  } else if (dakuonData[char]) {
    return dakuonData[char];
  } else if (youonData[char]) {
    return youonData[char];
  }
  return { word: '', emoji: '❓' };
}

// 50音表の座標配置定義 (行と列: 右から左へ あ→わ)
const seionGrid = [
  { char: 'あ', col: 10, row: 1 }, { char: 'い', col: 10, row: 2 }, { char: 'う', col: 10, row: 3 }, { char: 'え', col: 10, row: 4 }, { char: 'お', col: 10, row: 5 },
  { char: 'か', col: 9, row: 1 }, { char: 'き', col: 9, row: 2 }, { char: 'く', col: 9, row: 3 }, { char: 'け', col: 9, row: 4 }, { char: 'こ', col: 9, row: 5 },
  { char: 'さ', col: 8, row: 1 }, { char: 'し', col: 8, row: 2 }, { char: 'す', col: 8, row: 3 }, { char: 'せ', col: 8, row: 4 }, { char: 'そ', col: 8, row: 5 },
  { char: 'た', col: 7, row: 1 }, { char: 'ち', col: 7, row: 2 }, { char: 'つ', col: 7, row: 3 }, { char: 'て', col: 7, row: 4 }, { char: 'と', col: 7, row: 5 },
  { char: 'な', col: 6, row: 1 }, { char: 'に', col: 6, row: 2 }, { char: 'ぬ', col: 6, row: 3 }, { char: 'ね', col: 6, row: 4 }, { char: 'の', col: 6, row: 5 },
  { char: 'は', col: 5, row: 1 }, { char: 'ひ', col: 5, row: 2 }, { char: 'ふ', col: 5, row: 3 }, { char: 'へ', col: 5, row: 4 }, { char: 'ほ', col: 5, row: 5 },
  { char: 'ま', col: 4, row: 1 }, { char: 'み', col: 4, row: 2 }, { char: 'む', col: 4, row: 3 }, { char: 'め', col: 4, row: 4 }, { char: 'も', col: 4, row: 5 },
  { char: 'や', col: 3, row: 1 },                                 { char: 'ゆ', col: 3, row: 3 },                                 { char: 'よ', col: 3, row: 5 },
  { char: 'ら', col: 2, row: 1 }, { char: 'り', col: 2, row: 2 }, { char: 'る', col: 2, row: 3 }, { char: 'れ', col: 2, row: 4 }, { char: 'ろ', col: 2, row: 5 },
  { char: 'わ', col: 1, row: 1 },                                                                                                { char: 'を', col: 1, row: 4 },
                                                                                                                                 { char: 'ん', col: 1, row: 5 }
];

const dakuonGrid = [
  { char: 'が', col: 5, row: 1 }, { char: 'ぎ', col: 5, row: 2 }, { char: 'ぐ', col: 5, row: 3 }, { char: 'げ', col: 5, row: 4 }, { char: 'ご', col: 5, row: 5 },
  { char: 'ざ', col: 4, row: 1 }, { char: 'じ', col: 4, row: 2 }, { char: 'ず', col: 4, row: 3 }, { char: 'ぜ', col: 4, row: 4 }, { char: 'ぞ', col: 4, row: 5 },
  { char: 'だ', col: 3, row: 1 }, { char: 'ぢ', col: 3, row: 2 }, { char: 'づ', col: 3, row: 3 }, { char: 'で', col: 3, row: 4 }, { char: 'ど', col: 3, row: 5 },
  { char: 'ば', col: 2, row: 1 }, { char: 'び', col: 2, row: 2 }, { char: 'ぶ', col: 2, row: 3 }, { char: 'べ', col: 2, row: 4 }, { char: 'ぼ', col: 2, row: 5 },
  { char: 'ぱ', col: 1, row: 1 }, { char: 'ぴ', col: 1, row: 2 }, { char: 'ぷ', col: 1, row: 3 }, { char: 'ぺ', col: 1, row: 4 }, { char: 'ぽ', col: 1, row: 5 }
];

const youonGrid = [
  { char: 'きゃ', col: 11, row: 1 }, { char: 'きゅ', col: 11, row: 2 }, { char: 'きょ', col: 11, row: 3 },
  { char: 'しゃ', col: 10, row: 1 }, { char: 'しゅ', col: 10, row: 2 }, { char: 'しょ', col: 10, row: 3 },
  { char: 'ちゃ', col: 9, row: 1 }, { char: 'ちゅ', col: 9, row: 2 }, { char: 'ちょ', col: 9, row: 3 },
  { char: 'にゃ', col: 8, row: 1 }, { char: 'にゅ', col: 8, row: 2 }, { char: 'にょ', col: 8, row: 3 },
  { char: 'ひゃ', col: 7, row: 1 }, { char: 'ひゅ', col: 7, row: 2 }, { char: 'ひょ', col: 7, row: 3 },
  { char: 'みゃ', col: 6, row: 1 }, { char: 'みゅ', col: 6, row: 2 }, { char: 'みょ', col: 6, row: 3 },
  { char: 'りゃ', col: 5, row: 1 }, { char: 'りゅ', col: 5, row: 2 }, { char: 'りょ', col: 5, row: 3 },
  { char: 'ぎゃ', col: 4, row: 1 }, { char: 'ぎゅ', col: 4, row: 2 }, { char: 'ぎょ', col: 4, row: 3 },
  { char: 'じゃ', col: 3, row: 1 }, { char: 'じゅ', col: 3, row: 2 }, { char: 'じょ', col: 3, row: 3 },
  { char: 'びゃ', col: 2, row: 1 }, { char: 'びゅ', col: 2, row: 2 }, { char: 'びょ', col: 2, row: 3 },
  { char: 'ぴゃ', col: 1, row: 1 }, { char: 'ぴゅ', col: 1, row: 2 }, { char: 'ぴょ', col: 1, row: 3 }
];

// --- ① 五十音表ビューの実装 ---
function renderChart(type) {
  const container = document.getElementById('chart-grid-container');
  container.innerHTML = '';
  
  if (type === 'seion') {
    container.className = 'chart-grid-container seion';
    
    seionGrid.forEach(item => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.style.gridColumn = item.col;
      card.style.gridRow = item.row;
      
      const data = hiraganaData[item.char] || { emoji: '❓', word: '' };
      const mediaHtml = data.image 
        ? `<img src="${data.image}" alt="${data.word}">`
        : data.emoji;
      
      card.innerHTML = `
        <span class="card-letter">${item.char}</span>
        <span class="card-emoji">${mediaHtml}</span>
        <span class="card-word">${data.word}</span>
      `;
      card.addEventListener('click', () => openCharDetail(item.char));
      container.appendChild(card);
    });
  } else if (type === 'dakuon') {
    container.className = 'chart-grid-container dakuon';
    
    dakuonGrid.forEach(item => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.style.gridColumn = item.col;
      card.style.gridRow = item.row;
      
      const data = dakuonData[item.char] || { emoji: '❓', word: '' };
      const mediaHtml = data.image 
        ? `<img src="${data.image}" alt="${data.word}">`
        : data.emoji;

      card.innerHTML = `
        <span class="card-letter">${item.char}</span>
        <span class="card-emoji">${mediaHtml}</span>
        <span class="card-word">${data.word}</span>
      `;
      card.addEventListener('click', () => openCharDetail(item.char));
      container.appendChild(card);
    });
  } else if (type === 'youon') {
    container.className = 'chart-grid-container youon';
    
    youonGrid.forEach(item => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.style.gridColumn = item.col;
      card.style.gridRow = item.row;
      
      const data = youonData[item.char] || { emoji: '❓', word: '' };
      const mediaHtml = data.image 
        ? `<img src="${data.image}" alt="${data.word}">`
        : data.emoji;

      card.innerHTML = `
        <span class="card-letter" style="font-size: 1.6rem;">${item.char}</span>
        <span class="card-emoji">${mediaHtml}</span>
        <span class="card-word">${data.word}</span>
      `;
      card.addEventListener('click', () => openCharDetail(item.char));
      container.appendChild(card);
    });
  }
}

// 詳細ポップアップを開く
function openCharDetail(char) {
  playClickSound();
  selectedChar = char;
  
  const modal = document.getElementById('char-modal');
  const modalChar = document.getElementById('modal-char');
  const modalEmoji = document.getElementById('modal-emoji');
  const modalWord = document.getElementById('modal-word');
  const btnGoTrace = document.getElementById('btn-modal-go-trace');
  
  const data = getCharWordData(char);
  
  modalChar.innerText = char;
  if (data.image) {
    modalEmoji.innerHTML = `<img src="${data.image}" alt="${data.word}">`;
  } else {
    modalEmoji.innerText = data.emoji;
  }
  modalWord.innerText = data.word;
  
  // 濁音・拗音はなぞり書きデータがないため、なぞり書きへ行くボタンを非表示にする
  if (hiraganaData[char]) {
    btnGoTrace.classList.remove('hidden');
  } else {
    btnGoTrace.classList.add('hidden');
  }
  
  modal.classList.remove('hidden');
  
  // 自動発音
  speak(`${char}。${data.pronounce || data.word}`);
}

// --- ② なぞりがきビューの実装 ---
const canvas = document.getElementById('trace-canvas');
const ctx = canvas.getContext('2d');
const traceOverlay = document.getElementById('trace-overlay');

// カルーセルの文字ボタン生成
function renderTraceSelector() {
  const container = document.getElementById('trace-char-selector');
  container.innerHTML = '';
  
  Object.keys(hiraganaData).forEach(char => {
    const btn = document.createElement('button');
    btn.className = `selector-char-btn ${char === selectedChar ? 'active' : ''}`;
    btn.id = `btn-select-char-${char}`;
    btn.innerText = char;
    btn.addEventListener('click', () => {
      playClickSound();
      selectTraceChar(char);
    });
    container.appendChild(btn);
  });
}

// なぞる文字の選択
function selectTraceChar(char) {
  selectedChar = char;
  
  // カルーセルボタンのアクティブクラス更新
  document.querySelectorAll('.selector-char-btn').forEach(btn => {
    btn.classList.toggle('active', btn.innerText === char);
  });
  
  // 対象のボタンまでスクロール
  const targetBtn = document.getElementById(`btn-select-char-${char}`);
  if (targetBtn) {
    const container = document.getElementById('trace-char-selector');
    container.scrollLeft = targetBtn.offsetLeft - container.offsetWidth / 2 + targetBtn.offsetWidth / 2;
  }
  
  // イラスト・言葉の更新
  const data = hiraganaData[char];
  const emojiEl = document.getElementById('trace-current-emoji');
  if (data.image) {
    emojiEl.innerHTML = `<img src="${data.image}" alt="${data.word}">`;
  } else {
    emojiEl.innerText = data.emoji;
  }
  document.getElementById('trace-current-word').innerText = data.word;
  
  // ボード初期化
  clearTraceBoard();
  
  // 発音
  speak(char);
}

// ボードのクリア（書き直し）
function clearTraceBoard() {
  isDrawing = false;
  currentStrokeIdx = 0;
  currentPointIdx = 0;
  completedStrokes = [];
  currentStrokePoints = [];
  
  // アニメーション用進捗リセット
  guideProgress = 0;
  
  drawCanvasBackground();
  startGuideAnimation();
}

// キャンバスの背景とお手本文字の描画
function drawCanvasBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 十字補助線（薄いグレー）
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  
  ctx.setLineDash([]); // 点線リセット
  
  // お手本文字（極薄いグレー）をキャンバス背後にテキストとして描画
  ctx.font = `bold ${canvas.width * 0.68}px 'Zen Maru Gothic'`;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(selectedChar, canvas.width / 2, canvas.height / 2 + 10);
  
  // 描き順ガイド線の描画（全ストロークを薄い点線で描画）
  const charInfo = hiraganaData[selectedChar];
  if (!charInfo) return;
  
  charInfo.strokes.forEach((stroke, idx) => {
    // 既に書き終えたストロークは描かない（または半透明のまま）
    if (idx < currentStrokeIdx) {
      // 描き終えたものはすでに色付きで描画されている
      return;
    }
    
    // ガイド点線
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)'; // やや薄い青グレー
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([4, 10]);
    
    ctx.beginPath();
    stroke.forEach((pt, pIdx) => {
      const cx = (pt[0] / 100) * canvas.width;
      const cy = (pt[1] / 100) * canvas.height;
      if (pIdx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 各ストロークの開始番号丸と数字（未達の場合のみ表示）
    if (idx >= currentStrokeIdx) {
      const startPt = stroke[0];
      const sx = (startPt[0] / 100) * canvas.width;
      const sy = (startPt[1] / 100) * canvas.height;
      
      // 番号丸
      ctx.fillStyle = idx === currentStrokeIdx ? 'var(--color-primary)' : '#94a3b8';
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      
      // 白文字で数字
      ctx.fillStyle = 'white';
      ctx.font = "bold 15px 'Fredoka'";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((idx + 1).toString(), sx, sy);
    }
  });
}

// 描き終わった線の再描画
function redrawAllUserStrokes() {
  // 背景とお手本
  drawCanvasBackground();
  
  // 過去に描き終えた線の描画（カラフルな極太線）
  completedStrokes.forEach((strokePoints) => {
    ctx.strokeStyle = 'var(--color-primary)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    strokePoints.forEach((pt, pIdx) => {
      if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
  });
  
  // 現在描いている線
  if (currentStrokePoints.length > 0) {
    ctx.strokeStyle = '#fda4af'; // 描き中の淡いピンク
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    currentStrokePoints.forEach((pt, pIdx) => {
      if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
  }
}

// なぞり書きお手本（星が流れる）のアニメーション制御
function startGuideAnimation() {
  if (guideTimerId) {
    cancelAnimationFrame(guideTimerId);
  }
  
  const charInfo = hiraganaData[selectedChar];
  if (!charInfo) return;
  
  function animate() {
    // 描画中、またはストロークを全て終えているなら星を非表示に
    if (isDrawing || currentStrokeIdx >= charInfo.strokes.length) {
      document.getElementById('trace-finger-guide').classList.add('hidden');
      guideTimerId = requestAnimationFrame(animate);
      return;
    }
    
    const curStroke = charInfo.strokes[currentStrokeIdx];
    if (!curStroke) return;
    
    const numPoints = curStroke.length;
    // 進捗率を更新
    guideProgress += 0.02; // アニメーション速度
    if (guideProgress >= numPoints - 1) {
      guideProgress = 0; // 最初に戻る
    }
    
    // 現在位置の算出
    const segIdx = Math.floor(guideProgress);
    const ratio = guideProgress - segIdx;
    const p1 = curStroke[segIdx];
    const p2 = curStroke[segIdx + 1] || p1;
    
    const x = p1[0] * (1 - ratio) + p2[0] * ratio;
    const y = p1[1] * (1 - ratio) + p2[1] * ratio;
    
    // キャンバス上の絶対座標
    const absX = (x / 100) * canvas.width;
    const absY = (y / 100) * canvas.height;
    
    // 指ガイドの配置（CanvasのOffset考慮）
    const fingerGuide = document.getElementById('trace-finger-guide');
    fingerGuide.classList.remove('hidden');
    fingerGuide.style.left = `${absX - 10}px`;
    fingerGuide.style.top = `${absY - 10}px`;
    
    guideTimerId = requestAnimationFrame(animate);
  }
  
  guideTimerId = requestAnimationFrame(animate);
}

// なぞり書きイベント処理のセットアップ
function initTraceCanvas() {
  // pointerイベントをサポート（マウス・指の両方を統一処理）
  canvas.addEventListener('pointerdown', handleTraceStart);
  canvas.addEventListener('pointermove', handleTraceMove);
  canvas.addEventListener('pointerup', handleTraceEnd);
  canvas.addEventListener('pointerleave', handleTraceEnd);
}

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  // キャンバスの拡大縮小を考慮して座標計算
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

function handleTraceStart(e) {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  
  const charInfo = hiraganaData[selectedChar];
  if (!charInfo) return;
  
  const curStroke = charInfo.strokes[currentStrokeIdx];
  if (!curStroke) return;
  
  const pos = getPointerPos(e);
  
  // 最初の座標判定
  const startPt = curStroke[0];
  const startX = (startPt[0] / 100) * canvas.width;
  const startY = (startPt[1] / 100) * canvas.height;
  
  // 開始位置に近いか（判定許容値: canvas幅の12%程度）
  const dist = Math.hypot(pos.x - startX, pos.y - startY);
  const threshold = canvas.width * 0.12; 
  
  if (dist <= threshold) {
    isDrawing = true;
    currentPointIdx = 1; // 次の通過ターゲットポイント
    currentStrokePoints = [pos];
    playSparkleSound();
    
    // 指ガイドを隠す
    document.getElementById('trace-finger-guide').classList.add('hidden');
  } else {
    // 開始点が違う場合に優しいアニメ効果（開始円を光らせるなど）
    playClickSound();
    showTraceHint(startX, startY);
  }
}

function handleTraceMove(e) {
  if (!isDrawing) return;
  e.preventDefault();
  
  const charInfo = hiraganaData[selectedChar];
  if (!charInfo) return;
  
  const curStroke = charInfo.strokes[currentStrokeIdx];
  if (!curStroke) return;
  
  const pos = getPointerPos(e);
  currentStrokePoints.push(pos);
  
  // キラキラ音
  playSparkleSound();
  
  // 通過判定
  const targetPt = curStroke[currentPointIdx];
  if (targetPt) {
    const tx = (targetPt[0] / 100) * canvas.width;
    const ty = (targetPt[1] / 100) * canvas.height;
    const dist = Math.hypot(pos.x - tx, pos.y - ty);
    
    // 各通過点のチェック（判定許容値: canvas幅の13%程度）
    const threshold = canvas.width * 0.13;
    if (dist <= threshold) {
      currentPointIdx++;
      // 星を描画して進捗を示す
      drawSuccessSparkle(tx, ty);
    }
  }
  
  // 全ストローク点通過かつ末尾付近まで描いたか
  if (currentPointIdx >= curStroke.length) {
    // ストローク描き終わり
    isDrawing = false;
    completedStrokes.push([...currentStrokePoints]);
    currentStrokePoints = [];
    
    currentStrokeIdx++;
    currentPointIdx = 0;
    
    if (currentStrokeIdx >= charInfo.strokes.length) {
      // 💯 文字全体の完成！
      playSuccessChime();
      redrawAllUserStrokes();
      setTimeout(showCelebration, 500);
    } else {
      // 1ストローク完了
      playStrokeSuccessSound();
      redrawAllUserStrokes();
      guideProgress = 0; // 次のストローク用にアニメ進捗リセット
    }
  } else {
    redrawAllUserStrokes();
  }
}

function handleTraceEnd(e) {
  if (!isDrawing) return;
  isDrawing = false;
  
  // ストロークを途中で諦めた場合は、描きかけの線をクリアして最初からやり直しにする（4歳児用にシンプルに）
  currentStrokePoints = [];
  redrawAllUserStrokes();
  guideProgress = 0;
}

// 開始位置が間違っているときに小さな波紋を出す
function showTraceHint(x, y) {
  redrawAllUserStrokes();
  ctx.strokeStyle = 'var(--color-primary)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.stroke();
}

// 判定ポイント通過時のキラキラ星描画
function drawSuccessSparkle(x, y) {
  ctx.fillStyle = 'var(--color-tertiary)';
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

// 完成時のお祝いアニメーション表示
function showCelebration() {
  const overlay = document.getElementById('celebration-overlay');
  const displayChar = document.getElementById('celebration-char-display');
  
  displayChar.innerText = selectedChar;
  overlay.classList.remove('hidden');
  
  // 「できた！」の可愛い音声
  speak(`できた！すごい！すごーい！『${selectedChar}』が書けたね！`);
}

// --- ③ えあわせクイズビューの実装 ---
const quizFlowerEmojis = ['🌸', '🌷', '🌹', '🌻', '🌼', '🌺', '🍀', '🍎', '🍓', '🍊'];

function startNewQuiz() {
  // 前のクイズボタンをクリア
  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = '';
  
  // 全文字キーからランダムに問題文字を決定
  const keys = Object.keys(hiraganaData);
  const correctChar = keys[Math.floor(Math.random() * keys.length)];
  const correctData = hiraganaData[correctChar];
  
  // クイズタイプを決定:
  // 0: 音を聞いて文字を選択（例: 「あ」はどれかな？）
  // 1: 絵（単語）から頭文字を選択（例: 「いちご」の「い」はどれかな？）
  // 2: 文字に合う絵を選択（例: 「う」からはじまるものはどれかな？）
  const quizType = Math.floor(Math.random() * 3);
  
  // 選択肢の数（正解ストリークが長いと4つ、最初は2つ）
  const numOptions = quizStreak >= 5 ? 4 : (quizStreak >= 2 ? 3 : 2);
  
  // 誤答の選択肢をランダム選出
  const wrongChoices = [];
  while (wrongChoices.length < numOptions - 1) {
    const wrongChar = keys[Math.floor(Math.random() * keys.length)];
    if (wrongChar !== correctChar && !wrongChoices.includes(wrongChar)) {
      wrongChoices.push(wrongChar);
    }
  }
  
  // 選択肢の配列作成
  const choices = [correctChar, ...wrongChoices];
  // シャッフル
  choices.sort(() => Math.random() - 0.5);
  
  // 問題文の作成
  let questionText = '';
  let voicePrompt = '';
  
  const correctMedia = correctData.image 
    ? `<img src="${correctData.image}" alt="${correctData.word}" style="width: 32px; height: 32px; vertical-align: middle; border-radius: 4px; display: inline-block; margin-right: 5px;">`
    : correctData.emoji;

  if (quizType === 0) {
    // 音声から文字
    questionText = `「${correctChar}」は どれかな？`;
    voicePrompt = `『${correctChar}』はどれかな？`;
  } else if (quizType === 1) {
    // 絵・単語から頭文字
    const mediaPart = correctData.image ? correctMedia : correctData.emoji;
    questionText = `「${mediaPart} ${correctData.word}」の 「${correctChar}」は どれかな？`;
    voicePrompt = `『${correctData.pronounce || correctData.word}』の、『${correctChar}』はどれかな？`;
  } else {
    // 文字から絵
    questionText = `「${correctChar}」から はじまる ものは どれかな？`;
    voicePrompt = `『${correctChar}』から始まるものはどれかな？`;
  }
  
  currentQuestion = {
    type: quizType,
    correctChar: correctChar,
    voicePrompt: voicePrompt,
    questionText: questionText,
    choices: choices
  };
  
  // トグルスイッチの状態に応じてテキストを出し分ける
  const showQuestionChk = document.getElementById('chk-show-question');
  const qTextEl = document.getElementById('quiz-question-text');
  if (showQuestionChk && !showQuestionChk.checked) {
    qTextEl.innerText = '👂 (みみで きいてね！)';
  } else {
    qTextEl.innerHTML = questionText;
  }
  
  // 選択肢ボタンの生成
  choices.forEach(char => {
    const btn = document.createElement('button');
    btn.className = 'btn-quiz-option';
    
    const charData = hiraganaData[char];
    
    if (quizType === 2) {
      // 文字から絵：ボタンに画像/絵文字と言葉を乗せる
      const optionMedia = charData.image 
        ? `<img src="${charData.image}" alt="${charData.word}">`
        : charData.emoji;
      btn.innerHTML = `
        <span class="option-emoji">${optionMedia}</span>
        <span class="option-word">${charData.word}</span>
      `;
    } else {
      // それ以外：ボタンに大きくひらがなを乗せる
      btn.innerHTML = char;
    }
    
    btn.addEventListener('click', (e) => handleQuizAnswer(char, e.currentTarget));
    optionsContainer.appendChild(btn);
  });
  
  // ストリーク星の描画
  updateQuizStreakStars();
  
  // 音声読み上げ
  setTimeout(() => {
    speak(voicePrompt);
  }, 100);
}

// クイズ回答処理
function handleQuizAnswer(selected, buttonEl) {
  // すでに回答済みの場合は処理しない
  if (buttonEl.classList.contains('correct') || buttonEl.classList.contains('wrong')) return;
  
  const isCorrect = selected === currentQuestion.correctChar;
  
  // 選択された文字/言葉の読み上げテキストを決定
  const selData = hiraganaData[selected] || { word: selected };
  const selectedPronounce = (currentQuestion.type === 2 && selData.word !== '') 
    ? (selData.pronounce || selData.word)
    : selected;

  if (isCorrect) {
    buttonEl.classList.add('correct');
    playSuccessChime();
    
    // スコア＆ストリーク加算
    quizScore++;
    quizStreak++;
    
    document.getElementById('quiz-flower-count').innerText = quizScore;
    
    // お庭にお花を咲かせる
    plantFlowerInGarden();
    
    // 正解ボイス
    const praises = [
      '当たり！すごいすごい！',
      '正解！やったね！',
      '大正解！天才！',
      '当たり！その調子！',
      'ピンポン！すごい、大正解！',
      '素晴らしい！よくできました！',
      'やったー！大正解！',
      'すごいすごい！おめでとう！',
      '正解！やるねー！',
      '当たり！かっこいい！',
      'ピンポン！やったね、嬉しいな！',
      'すごい！大正解！拍手！',
      '正解！素晴らしい！',
      'やったね！大成功！'
    ];
    const voicePraise = praises[Math.floor(Math.random() * praises.length)];
    
    // 選択肢を全部無効化
    document.querySelectorAll('.btn-quiz-option').forEach(btn => {
      if (!btn.classList.contains('correct')) btn.style.opacity = 0.5;
      btn.disabled = true;
    });
    
    // まず選択した答えを発音してから、正解ボイスへ
    speak(selectedPronounce, () => {
      setTimeout(() => {
        speak(voicePraise, () => {
          // 30問クリア判定
          if (quizScore > 0 && quizScore % 30 === 0) {
            setTimeout(showQuizBreak, 800);
          } else {
            setTimeout(startNewQuiz, 1000);
          }
        });
      }, 300);
    });
  } else {
    buttonEl.classList.add('wrong');
    playWrongSound();
    
    // ストリークリセット
    quizStreak = 0;
    updateQuizStreakStars();
    
    // 不正解ボイス（優しく促す）
    const tries = ['惜しい！もう一回！', '違うのを押してみてね！', '頑張って！どれかな？'];
    const voiceTry = tries[Math.floor(Math.random() * tries.length)];
    
    // まず選択した答えを発音してから、不正解ボイスへ
    speak(selectedPronounce, () => {
      setTimeout(() => {
        speak(voiceTry);
      }, 300);
    });
    
    // 間違えたボタンは半透明にして非活性化（再選択は可能）
    buttonEl.style.opacity = 0.5;
  }
}

// クイズ休憩画面の表示
function showQuizBreak() {
  const overlay = document.getElementById('quiz-break-overlay');
  overlay.classList.remove('hidden');
  
  speak("すごい！30問正解！大変よくできました！少しお茶を飲んで、一息つこうね！");
}

// ストリーク数表示の星マーク
function updateQuizStreakStars() {
  const starContainer = document.getElementById('quiz-streak-stars');
  starContainer.innerHTML = '';
  
  const count = Math.min(quizStreak, 5); // 最大5個まで表示
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.innerText = '⭐';
    star.style.fontSize = '1.2rem';
    star.style.margin = '0 2px';
    starContainer.appendChild(star);
  }
}

// お庭にお花を咲かせる
function plantFlowerInGarden() {
  const garden = document.getElementById('quiz-garden');
  
  const flower = document.createElement('span');
  flower.className = 'garden-flower';
  
  // ランダムにお花を選ぶ
  const emoji = quizFlowerEmojis[Math.floor(Math.random() * quizFlowerEmojis.length)];
  flower.innerText = emoji;
  
  // ランダムに少し傾けたり大きさを変えて自然さを出す
  const scale = 0.8 + Math.random() * 0.4;
  const rotate = -20 + Math.random() * 40;
  flower.style.display = 'inline-block';
  flower.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
  
  garden.appendChild(flower);
  
  // 下部へスクロール
  garden.scrollTop = garden.scrollHeight;
}
