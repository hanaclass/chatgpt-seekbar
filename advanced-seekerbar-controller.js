// ChatGPT 고급 시크바 컨트롤러 
// 드래그 가능하고 투명도 조절되는 버전
// 사용법: Chrome 개발자 콘솔에 아래 코드를 모두 복사해서 붙여넣고 실행하세요

(function() {
  // 오디오 요소 찾기
  const findAudioElement = () => document.querySelector('audio');
  let audioElement = findAudioElement();

  if (!audioElement) {
    console.log('오디오 요소를 찾는 중...');
    const observer = new MutationObserver((mutations) => {
      audioElement = findAudioElement();
      if (audioElement) {
        console.log('오디오 요소 발견!');
        observer.disconnect();
        createAdvancedSeekbar(audioElement);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    createAdvancedSeekbar(audioElement);
  }

  function createAdvancedSeekbar(audio) {
    if (document.getElementById('advanced-seekbar-controller')) return;
    
    // 스타일 설정
    const style = document.createElement('style');
    style.textContent = `
      #advanced-seekbar-controller {
        position: fixed;
        top: 20px;
        left: auto;
        width: 400px;
        max-width: 90%;
        background: rgba(52, 53, 65, 0.85);
        border: 1px solid #565869;
        border-radius: 12px;
        padding: 15px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 15px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        font-family: -apple-system, sans-serif;
        transition: height 0.3s ease, opacity 0.3s ease;
        backdrop-filter: blur(5px);
        cursor: move;
      }
      #advanced-seekbar-controller.minimized {
        height: 10px;
        padding: 0;
        opacity: 0.5;
        overflow: hidden;
      }
      #advanced-seekbar-controller:hover {
        opacity: 0.95;
      }
      #advanced-seekbar-controller.minimized:hover {
        height: auto;
        padding: 15px;
      }
      #waveform-container {
        width: 100%;
        height: 80px;
        background: rgba(42, 43, 54, 0.8);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
        cursor: pointer;
      }
      #waveform {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
      }
      .wave-bar {
        width: 3px;
        margin-right: 1px;
        background: #6e6e80;
        border-radius: 2px;
      }
      #progress-indicator {
        position: absolute;
        top: 0;
        left: 0;
        width: 2px;
        height: 100%;
        background: #10a37f;
        box-shadow: 0 0 10px rgba(16, 163, 127, 0.7);
        z-index: 2;
      }
      #progress-highlight {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0%;
        background: rgba(16, 163, 127, 0.2);
        z-index: 1;
      }
      #time-markers {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 12px;
        color: #ececf1;
      }
      .time-marker {
        position: relative;
      }
      .time-marker::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 1px;
        height: 5px;
        background: #565869;
      }
      #controls-container {
        display: flex;
        align-items: center;
        gap: 15px;
      }
      #time-display {
        font-size: 14px;
        color: #ececf1;
        min-width: 120px;
        text-align: center;
      }
      #button-row {
        display: flex;
        gap: 10px;
        flex-grow: 1;
        justify-content: center;
      }
      #advanced-seekbar-controller button {
        background: rgba(68, 70, 84, 0.8);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 15px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s, transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }
      #advanced-seekbar-controller button:hover {
        background: #565869;
      }
      #advanced-seekbar-controller button:active {
        transform: scale(0.97);
      }
      #playback-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      #speed-control {
        position: relative;
        display: flex;
        align-items: center;
      }
      #speed-display {
        padding: 8px 15px;
        background: rgba(68, 70, 84, 0.8);
        border-radius: 6px;
        cursor: pointer;
        color: white;
        min-width: 60px;
        text-align: center;
      }
      #speed-options {
        position: absolute;
        bottom: 100%;
        left: 0;
        width: 100%;
        background: rgba(52, 53, 65, 0.95);
        border: 1px solid #565869;
        border-radius: 6px;
        padding: 5px;
        display: none;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 5px;
        z-index: 3;
      }
      #speed-options.active {
        display: flex;
      }
      .speed-option {
        padding: 5px;
        cursor: pointer;
        text-align: center;
        border-radius: 4px;
      }
      .speed-option:hover {
        background: #444654;
      }
      #volume-container {
        display: flex;
        align-items: center;
        position: relative;
      }
      #volume-button {
        cursor: pointer;
        color: white;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #volume-slider-container {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(52, 53, 65, 0.95);
        border: 1px solid #565869;
        border-radius: 6px;
        padding: 15px 10px;
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        z-index: 3;
      }
      #volume-slider-container.active {
        display: flex;
      }
      #volume-slider {
        -webkit-appearance: slider-vertical;
        height: 100px;
        width: 8px;
      }
      #volume-value {
        font-size: 12px;
        color: #ececf1;
      }
      .handle-bar {
        width: 50px;
        height: 5px;
        background: #565869;
        border-radius: 3px;
        margin: 0 auto;
        cursor: ns-resize;
      }
      #jump-input-container {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      #jump-time-input {
        width: 40px;
        background: rgba(68, 70, 84, 0.8);
        border: 1px solid #565869;
        color: white;
        border-radius: 4px;
        padding: 5px;
        text-align: center;
      }
      #close-button {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 20px;
        height: 20px;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
        color: #ececf1;
        cursor: pointer;
        border-radius: 50%;
      }
      #close-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      #settings-dropdown {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(52, 53, 65, 0.95);
        border: 1px solid #565869;
        border-radius: 6px;
        padding: 10px;
        width: 200px;
        display: none;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 10px;
        z-index: 3;
      }
      #settings-dropdown.active {
        display: flex;
      }
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .setting-label {
        color: #ececf1;
        font-size: 14px;
      }
      .setting-toggle {
        position: relative;
        width: 40px;
        height: 20px;
        background: #444654;
        border-radius: 10px;
        cursor: pointer;
      }
      .setting-toggle::before {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: transform 0.2s;
      }
      .setting-toggle.active {
        background: #10a37f;
      }
      .setting-toggle.active::before {
        transform: translateX(20px);
      }
    `;
    document.head.appendChild(style);

    // 컨트롤러 엘리먼트 생성
    const controller = document.createElement('div');
    controller.id = 'advanced-seekbar-controller';

    // 닫기 버튼
    const closeButton = document.createElement('div');
    closeButton.id = 'close-button';
    closeButton.textContent = '✕';
    closeButton.title = '컨트롤러 닫기';
    controller.appendChild(closeButton);

    // 핸들 바
    const handleBar = document.createElement('div');
    handleBar.className = 'handle-bar';
    controller.appendChild(handleBar);

    // 웨이브폼 컨테이너
    const waveformContainer = document.createElement('div');
    waveformContainer.id = 'waveform-container';
    const waveform = document.createElement('div');
    waveform.id = 'waveform';

    // 웨이브폼 바 생성
    for (let i = 0; i < 300; i++) {
      const bar = document.createElement('div');
      bar.className = 'wave-bar';
      const height = Math.floor(20 + Math.random() * 40);
      bar.style.height = `${height}px`;
      waveform.appendChild(bar);
    }

    const progressIndicator = document.createElement('div');
    progressIndicator.id = 'progress-indicator';
    const progressHighlight = document.createElement('div');
    progressHighlight.id = 'progress-highlight';

    waveformContainer.appendChild(waveform);
    waveformContainer.appendChild(progressHighlight);
    waveformContainer.appendChild(progressIndicator);
    controller.appendChild(waveformContainer);

    // 시간 마커
    const timeMarkers = document.createElement('div');
    timeMarkers.id = 'time-markers';
    controller.appendChild(timeMarkers);

    // 컨트롤 컨테이너
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';
    
    const timeDisplay = document.createElement('div');
    timeDisplay.id = 'time-display';
    timeDisplay.textContent = '0:00 / 0:00';
    controlsContainer.appendChild(timeDisplay);

    const buttonRow = document.createElement('div');
    buttonRow.id = 'button-row';

    // 재생 컨트롤
    const playbackControls = document.createElement('div');
    playbackControls.id = 'playback-controls';

    // 점프 컨트롤
    const jumpInputContainer = document.createElement('div');
    jumpInputContainer.id = 'jump-input-container';

    const rewindButton = document.createElement('button');
    rewindButton.innerHTML = '◀◀';
    rewindButton.title = '뒤로 점프';

    const jumpTimeInput = document.createElement('input');
    jumpTimeInput.id = 'jump-time-input';
    jumpTimeInput.type = 'number';
    jumpTimeInput.min = '1';
    jumpTimeInput.max = '60';
    jumpTimeInput.value = '10';
    jumpTimeInput.title = '점프 시간(초)';

    const forwardButton = document.createElement('button');
    forwardButton.innerHTML = '▶▶';
    forwardButton.title = '앞으로 점프';

    jumpInputContainer.appendChild(rewindButton);
    jumpInputContainer.appendChild(jumpTimeInput);
    jumpInputContainer.appendChild(forwardButton);
    playbackControls.appendChild(jumpInputContainer);

    // 재생/일시정지 버튼
    const playPauseButton = document.createElement('button');
    playPauseButton.innerHTML = '❚❚';
    playPauseButton.title = '일시정지';
    playbackControls.appendChild(playPauseButton);

    buttonRow.appendChild(playbackControls);

    // 속도 제어
    const speedControl = document.createElement('div');
    speedControl.id = 'speed-control';

    const speedDisplay = document.createElement('div');
    speedDisplay.id = 'speed-display';
    speedDisplay.textContent = '1.0×';

    const speedOptions = 
    document.createElement('div');
    speedOptions.id = 'speed-options';

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    speeds.forEach(speed => {
      const option = document.createElement('div');
      option.className = 'speed-option';
      option.textContent = `${speed.toFixed(1)}×`;
      option.dataset.speed = speed;
      option.addEventListener('click', () => {
        audio.playbackRate = speed;
        speedDisplay.textContent = `${speed.toFixed(1)}×`;
        speedOptions.classList.remove('active');
      });
      speedOptions.appendChild(option);
    });

    speedControl.appendChild(speedDisplay);
    speedControl.appendChild(speedOptions);
    buttonRow.appendChild(speedControl);

    // 볼륨 컨트롤
    const volumeContainer = document.createElement('div');
    volumeContainer.id = 'volume-container';

    const volumeButton = document.createElement('div');
    volumeButton.id = 'volume-button';
    volumeButton.innerHTML = '🔊';
    volumeButton.title = '볼륨 조절';

    const volumeSliderContainer = document.createElement('div');
    volumeSliderContainer.id = 'volume-slider-container';

    const volumeSlider = document.createElement('input');
    volumeSlider.id = 'volume-slider';
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = audio.volume;
    volumeSlider.orient = 'vertical';

    const volumeValue = document.createElement('div');
    volumeValue.id = 'volume-value';
    volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;

    volumeSliderContainer.appendChild(volumeSlider);
    volumeSliderContainer.appendChild(volumeValue);
    volumeContainer.appendChild(volumeButton);
    volumeContainer.appendChild(volumeSliderContainer);
    buttonRow.appendChild(volumeContainer);

    // 고급 설정
    const advancedSettings = document.createElement('div');
    advancedSettings.id = 'advanced-settings';

    const settingsButton = document.createElement('button');
    settingsButton.innerHTML = '⚙️';
    settingsButton.title = '고급 설정';

    const settingsDropdown = document.createElement('div');
    settingsDropdown.id = 'settings-dropdown';

    // 자동 확장 설정
    const autoExpandSetting = document.createElement('div');
    autoExpandSetting.className = 'setting-item';
    const autoExpandLabel = document.createElement('div');
    autoExpandLabel.className = 'setting-label';
    autoExpandLabel.textContent = '호버 시 자동 확장';
    const autoExpandToggle = document.createElement('div');
    autoExpandToggle.className = 'setting-toggle active';
    autoExpandToggle.dataset.setting = 'autoExpand';

    autoExpandSetting.appendChild(autoExpandLabel);
    autoExpandSetting.appendChild(autoExpandToggle);
    settingsDropdown.appendChild(autoExpandSetting);

    // 키보드 단축키 설정
    const keyboardShortcutsSetting = document.createElement('div');
    keyboardShortcutsSetting.className = 'setting-item';
    const keyboardShortcutsLabel = document.createElement('div');
    keyboardShortcutsLabel.className = 'setting-label';
    keyboardShortcutsLabel.textContent = '키보드 단축키';
    const keyboardShortcutsToggle = document.createElement('div');
    keyboardShortcutsToggle.className = 'setting-toggle active';
    keyboardShortcutsToggle.dataset.setting = 'keyboardShortcuts';

    keyboardShortcutsSetting.appendChild(keyboardShortcutsLabel);
    keyboardShortcutsSetting.appendChild(keyboardShortcutsToggle);
    settingsDropdown.appendChild(keyboardShortcutsSetting);

    // 투명도 설정
    const opacitySetting = document.createElement('div');
    opacitySetting.className = 'setting-item';
    const opacityLabel = document.createElement('div');
    opacityLabel.className = 'setting-label';
    opacityLabel.textContent = '투명도: 보통';
    const opacityControls = document.createElement('div');
    opacityControls.style.display = 'flex';
    opacityControls.style.gap = '5px';

    const decreaseOpacity = document.createElement('button');
    decreaseOpacity.textContent = '-';
    decreaseOpacity.style.padding = '2px 8px';
    decreaseOpacity.style.minWidth = 'auto';

    const increaseOpacity = document.createElement('button');
    increaseOpacity.textContent = '+';
    increaseOpacity.style.padding = '2px 8px';
    increaseOpacity.style.minWidth = 'auto';

    opacityControls.appendChild(decreaseOpacity);
    opacityControls.appendChild(increaseOpacity);
    opacitySetting.appendChild(opacityLabel);
    opacitySetting.appendChild(opacityControls);
    settingsDropdown.appendChild(opacitySetting);

    let currentOpacity = 0.85;
    const opacityLevels = [
      { value: 0.5, label: '높음' },
      { value: 0.7, label: '중간' },
      { value: 0.85, label: '보통' },
      { value: 0.95, label: '낮음' },
      { value: 1, label: '없음' }
    ];
    let currentOpacityIndex = 2;

    increaseOpacity.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentOpacityIndex < opacityLevels.length - 1) {
        currentOpacityIndex++;
        updateOpacity();
      }
    });

    decreaseOpacity.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentOpacityIndex > 0) {
        currentOpacityIndex--;
        updateOpacity();
      }
    });

    function updateOpacity() {
      const level = opacityLevels[currentOpacityIndex];
      currentOpacity = level.value;
      opacityLabel.textContent = `투명도: ${level.label}`;
      controller.style.background = `rgba(52, 53, 65, ${currentOpacity})`;
    }

    advancedSettings.appendChild(settingsButton);
    advancedSettings.appendChild(settingsDropdown);
    buttonRow.appendChild(advancedSettings);

    controlsContainer.appendChild(buttonRow);
    controller.appendChild(controlsContainer);

    document.body.appendChild(controller);

    // 드래그 이동 기능
    let isDraggingController = false;
    let dragStartX, dragStartY;
    let initialX, initialY;

    controller.style.top = '20px';
    controller.style.right = '20px';

    controller.addEventListener('mousedown', (e) => {
      if (e.target === controller || e.target.id === 'controls-container' || e.target.id === 'button-row') {
        isDraggingController = true;
        const controllerRect = controller.getBoundingClientRect();
        initialX = controllerRect.left;
        initialY = controllerRect.top;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        controller.style.left = `${initialX}px`;
        controller.style.top = `${initialY}px`;
        controller.style.transform = 'none';
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDraggingController) return;
      const newX = initialX + (e.clientX - dragStartX);
      const newY = initialY + (e.clientY - dragStartY);
      const controllerWidth = controller.offsetWidth;
      const controllerHeight = controller.offsetHeight;
      const maxX = window.innerWidth - controllerWidth;
      const maxY = window.innerHeight - controllerHeight;
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      controller.style.left = `${boundedX}px`;
      controller.style.top = `${boundedY}px`;
    });

    document.addEventListener('mouseup', () => {
      isDraggingController = false;
    });

    // 이벤트 핸들러
    closeButton.addEventListener('click', () => {
      controller.remove();
    });

    waveformContainer.addEventListener('click', (e) => {
      const rect = waveformContainer.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      audio.currentTime = clickPosition * audio.duration;
    });

    waveformContainer.addEventListener('mousemove', (e) => {
      const rect = waveformContainer.getBoundingClientRect();
      const hoverPosition = (e.clientX - rect.left) / rect.width;
      if (e.buttons !== 1) {
        progressHighlight.style.width = `${hoverPosition * 100}%`;
      }
    });

    waveformContainer.addEventListener('mouseleave', () => {
      progressHighlight.style.width = '0%';
    });

    let isSeekDragging = false;

    waveformContainer.addEventListener('mousedown', (e) => {
      isSeekDragging = true;
      const rect = waveformContainer.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      audio.currentTime = clickPosition * audio.duration;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isSeekDragging) return;
      const rect = waveformContainer.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right) return;
      const dragPosition = (e.clientX - rect.left) / rect.width;
      audio.currentTime = dragPosition * audio.duration;
    });

    document.addEventListener('mouseup', () => {
      isSeekDragging = false;
    });

    playPauseButton.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playPauseButton.innerHTML = '❚❚';
        playPauseButton.title = '일시정지';
      } else {
        audio.pause();
        playPauseButton.innerHTML = '▶';
        playPauseButton.title = '재생';
      }
    });

    rewindButton.addEventListener('click', () => {
      const jumpTime = parseInt(jumpTimeInput.value) || 10;
      audio.currentTime = Math.max(0, audio.currentTime - jumpTime);
    });

    forwardButton.addEventListener('click', () => {
      const jumpTime = parseInt(jumpTimeInput.value) || 10;
      audio.currentTime = Math.min(audio.duration, audio.currentTime + jumpTime);
    });

    speedDisplay.addEventListener('click', () => {
      speedOptions.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!speedControl.contains(e.target)) {
        speedOptions.classList.remove('active');
      }
    });

    volumeButton.addEventListener('click', () => {
      volumeSliderContainer.classList.toggle('active');
    });

    volumeSlider.addEventListener('input', () => {
      const volume = parseFloat(volumeSlider.value);
      audio.volume = volume;
      volumeValue.textContent = `${Math.round(volume * 100)}%`;
      if (volume === 0) {
        volumeButton.innerHTML = '🔇';
      } else if (volume < 0.5) {
        volumeButton.innerHTML = '🔉';
      } else {
        volumeButton.innerHTML = '🔊';
      }
    });

    document.addEventListener('click', (e) => {
      if (!volumeContainer.contains(e.target)) {
        volumeSliderContainer.classList.remove('active');
      }
    });

    settingsButton.addEventListener('click', () => {
      settingsDropdown.classList.toggle('active');
    });

    document.querySelectorAll('.setting-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!advancedSettings.contains(e.target)) {
        settingsDropdown.classList.remove('active');
      }
    });

    handleBar.addEventListener('dblclick', () => {
      controller.classList.toggle('minimized');
    });

    audio.addEventListener('timeupdate', () => {
      const currentTime = formatTime(audio.currentTime);
      const duration = formatTime(audio.duration || 0);
      timeDisplay.textContent = `${currentTime} / ${duration}`;
      const progress = (audio.currentTime / audio.duration) * 100 || 0;
      progressIndicator.style.left = `${progress}%`;
    });

    document.addEventListener('keydown', (e) => {
      const keyboardShortcutsEnabled = keyboardShortcutsToggle.classList.contains('active');
      if (!keyboardShortcutsEnabled) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const rewindTime = e.shiftKey ? 30 : (parseInt(jumpTimeInput.value) || 10);
          audio.currentTime = Math.max(0, audio.currentTime - rewindTime);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const forwardTime = e.shiftKey ? 30 : (parseInt(jumpTimeInput.value) || 10);
          audio.currentTime = Math.min(audio.duration, audio.currentTime + forwardTime);
          break;
        case 'ArrowUp':
          e.preventDefault();
          audio.volume = Math.min(1, audio.volume + 0.1);
          volumeSlider.value = audio.volume;
          volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
          updateVolumeIcon();
          break;
        case 'ArrowDown':
          e.preventDefault();
          audio.volume = Math.max(0, audio.volume - 0.1);
          volumeSlider.value = audio.volume;
          volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
          updateVolumeIcon();
          break;
        case 'KeyM':
          e.preventDefault();
          if (audio.volume > 0) {
            audio.dataset.prevVolume = audio.volume;
            audio.volume = 0;
          } else {
            audio.volume = audio.dataset.prevVolume || 1;
          }
          volumeSlider.value = audio.volume;
          volumeValue.textContent = `${Math.round(audio.volume * 100)}%`;
          updateVolumeIcon();
          break;
      }
    });

    controller.addEventListener('mouseenter', () => {
      const autoExpandEnabled = autoExpandToggle.classList.contains('active');
      if (autoExpandEnabled) {
        controller.classList.remove('minimized');
      }
    });

    function formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateVolumeIcon() {
      if (audio.volume === 0) {
        volumeButton.innerHTML = '🔇';
      } else if (audio.volume < 0.5) {
        volumeButton.innerHTML = '🔉';
      } else {
        volumeButton.innerHTML = '🔊';
      }
    }

    function createTimeMarkers() {
      timeMarkers.innerHTML = '';
      const duration = audio.duration || 300;

      for (let i = 0; i <= 4; i++) {
        const percent = i * 25;
        const markerTime = (duration * percent) / 100;
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.textContent = formatTime(markerTime);
        timeMarkers.appendChild(marker);
      }
    }

    // 최초 상태 설정
    audio.addEventListener('canplay', () => {
      updateTimeDisplay();
      updateProgressIndicator();
      createTimeMarkers();
    });

    // 초기화 호출
    if (audio.readyState >= 1) {
      createTimeMarkers();
    }
  }
})();
