class ChatbotBubble {
  constructor(options = {}) {
    // 默认配置
    this.defaults = {
      name: '北京大玩家娱乐股份有限公司',
      iframeUrl: 'http://10.1.5.114:3000',
      buttonColor: '#1C64F2',
      buttonPosition: { right: '2rem', bottom: '2rem' },
      windowPosition: { right: '2rem', bottom: '6.5rem' },
      minWidth: '16rem',
      maxWidth: '24rem',
      minHeight: '20rem',
      maxHeight: '40rem'
    };

    // 合并配置
    this.config = { ...this.defaults, ...options };

    // 状态变量
    this.isResizing = false;
    this.animationFrameId = null;

    // 绑定方法
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    // 初始化
    this.init();
  }

  init() {
    // 创建DOM元素
    this.createElements();
    // 添加到body
    document.body.appendChild(this.bubbleBtn);
    document.body.appendChild(this.iframeContainer);
    // 绑定事件
    this.bindEvents();
  }

  createElements() {
    // 创建气泡按钮
    this.bubbleBtn = document.createElement('button');
    this.bubbleBtn.id = 'chatbot-bubble-btn';
    this.bubbleBtn.title = '展开聊天';
    this.bubbleBtn.style.backgroundColor = this.config.buttonColor;
    this.bubbleBtn.style.right = this.config.buttonPosition.right;
    this.bubbleBtn.style.bottom = this.config.buttonPosition.bottom;
    
    // 按钮SVG
    this.bubbleBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-width="2"/>
        <path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    // 创建iframe容器
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.id = 'chatbot-iframe-container';
    this.iframeContainer.style.right = this.config.windowPosition.right;
    this.iframeContainer.style.bottom = this.config.windowPosition.bottom;
    this.iframeContainer.style.minWidth = this.config.minWidth;
    this.iframeContainer.style.maxWidth = this.config.maxWidth;
    this.iframeContainer.style.minHeight = this.config.minHeight;
    this.iframeContainer.style.maxHeight = this.config.maxHeight;

    // iframe内容
    this.iframeContainer.innerHTML = `
      <div class="resize-handle" title="拖动调整大小">
        <svg viewBox="0 0 24 24">
          <path d="M5 19h14M9 15h10M13 11h6" stroke="#888" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <header>
        <button class="close-btn" title="关闭" aria-label="关闭">&times;</button>
      </header>
      <iframe
        id="chatbot-iframe"
        src="${this.config.iframeUrl}?query=${encodeURIComponent(this.config.name)}"
        allow="clipboard-write; microphone; camera"
        title="Chatbot"
      ></iframe>
    `;

    // 添加样式
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #chatbot-bubble-btn {
        position: fixed;
        width: 64px;
        height: 64px;
        background: #1C64F2;
        border-radius: 50%;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        transition: box-shadow 0.2s;
        border: none;
        outline: none;
      }
      #chatbot-bubble-btn:hover {
        box-shadow: 0 8px 32px rgba(28,100,242,0.18);
      }
      #chatbot-bubble-btn svg {
        width: 32px;
        height: 32px;
        fill: #fff;
      }

      #chatbot-iframe-container {
        display: none;
        position: fixed;
        width: 24rem;
        max-width: 96vw;
        min-width: 16rem;
        height: 40rem;
        max-height: 80vh;
        min-height: 20rem;
        background: #fff;
        border-radius: 1.5rem;
        box-shadow: 0 8px 32px rgba(28,100,242,0.18);
        overflow: hidden;
        z-index: 10000;
        flex-direction: column;
        animation: fadeIn 0.25s;
        resize: none;
      }
      #chatbot-iframe-container.resizing {
        transition: none !important;
        will-change: width, height;
      }
      #chatbot-iframe-container.open {
        display: flex;
      }
      #chatbot-iframe-container header {
        display: flex;
        justify-content: flex-end;
        background: #f4f6fb;
        padding: 0.5rem 1rem;
        cursor: default;
        user-select: none;
      }
      #chatbot-iframe-container .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        color: #666;
      }
      #chatbot-iframe {
        flex: 1;
        width: 100%;
        border: none;
        min-height: 0;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(32px);}
        to { opacity: 1; transform: translateY(0);}
      }

      /* 左上角缩放手柄 */
      .resize-handle {
        position: absolute;
        width: 32px;
        height: 32px;
        left: 0;
        top: 0;
        cursor: nwse-resize;
        z-index: 10;
        background: transparent;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        pointer-events: auto;
        user-select: none;
      }
      .resize-handle svg {
        width: 18px;
        height: 18px;
        opacity: 0.4;
        margin: 8px 0 0 8px;
        pointer-events: none;
        transform: rotate(180deg);
      }

      @media (max-width: 600px) {
        #chatbot-iframe-container {
          right: 0.5rem !important;
          bottom: 5.5rem !important;
          width: 98vw !important;
          height: 90vh !important;
          min-width: 180px;
          min-height: 160px;
          border-radius: 1rem;
          max-width: 100vw;
          max-height: 100vh;
        }
        #chatbot-bubble-btn {
          right: 0.5rem !important;
          bottom: 0.5rem !important;
          width: 56px;
          height: 56px;
        }
        .resize-handle {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    // 展开窗口
    this.bubbleBtn.addEventListener('click', () => {
      this.iframeContainer.classList.add('open');
    });

    // 关闭窗口
    this.iframeContainer.querySelector('.close-btn').addEventListener('click', () => {
      this.iframeContainer.classList.remove('open');
    });

    // 点击窗口外关闭
    document.addEventListener('mousedown', (e) => {
      if (
        this.iframeContainer.classList.contains('open') &&
        !this.iframeContainer.contains(e.target) &&
        !this.bubbleBtn.contains(e.target)
      ) {
        this.iframeContainer.classList.remove('open');
      }
    });

    // ESC关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === "Escape" && this.iframeContainer.classList.contains('open')) {
        this.iframeContainer.classList.remove('open');
      }
    });

    // 优化的拖拽缩放逻辑
    this.bindResizeEvents();
  }

  bindResizeEvents() {
    const resizeHandle = this.iframeContainer.querySelector('.resize-handle');
    
    // 鼠标事件
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.startResize(e);
      window.addEventListener('mousemove', this.handleMouseMove, { capture: true });
      window.addEventListener('mouseup', this.handleMouseUp, { capture: true });
    }, { capture: true });

    // 触摸事件
    resizeHandle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.startResize(e.touches[0]);
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false, capture: true });
      window.addEventListener('touchend', this.handleTouchEnd, { capture: true });
    }, { passive: false, capture: true });
  }

  startResize(e) {
    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.iframeContainer.offsetWidth;
    this.startHeight = this.iframeContainer.offsetHeight;
    
    this.iframeContainer.classList.add('resizing');
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
    
    const iframe = this.iframeContainer.querySelector('iframe');
    iframe.style.pointerEvents = 'none';
  }

  handleMouseMove(e) {
    if (!this.isResizing) return;
    e.preventDefault();
    e.stopPropagation();
    this.processResize(e.clientX, e.clientY);
  }

  handleTouchMove(e) {
    if (!this.isResizing) return;
    e.preventDefault();
    e.stopPropagation();
    this.processResize(e.touches[0].clientX, e.touches[0].clientY);
  }

  processResize(clientX, clientY) {
    const dx = this.startX - clientX;
    const dy = this.startY - clientY;
    
    const minWidth = parseFloat(this.config.minWidth);
    const minHeight = parseFloat(this.config.minHeight);
    const maxWidth = window.innerWidth * 0.98;
    const maxHeight = window.innerHeight * 0.95;
    
    const newWidth = Math.max(minWidth, Math.min(maxWidth, this.startWidth + dx));
    const newHeight = Math.max(minHeight, Math.min(maxHeight, this.startHeight + dy));
    
    this.iframeContainer.style.width = `${newWidth}px`;
    this.iframeContainer.style.height = `${newHeight}px`;
  }

  handleMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    this.endResize();
  }

  handleTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    this.endResize();
  }

  endResize() {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.iframeContainer.classList.remove('resizing');
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    const iframe = this.iframeContainer.querySelector('iframe');
    iframe.style.pointerEvents = 'auto';

    // 移除事件监听器
    window.removeEventListener('mousemove', this.handleMouseMove, { capture: true });
    window.removeEventListener('mouseup', this.handleMouseUp, { capture: true });
    window.removeEventListener('touchmove', this.handleTouchMove, { capture: true });
    window.removeEventListener('touchend', this.handleTouchEnd, { capture: true });
  }

  // 公开方法
  open() {
    this.iframeContainer.classList.add('open');
  }

  close() {
    this.iframeContainer.classList.remove('open');
  }

  updateName(name) {
    this.config.name = name;
    const iframe = this.iframeContainer.querySelector('#chatbot-iframe');
    iframe.src = `${this.config.iframeUrl}?query=${encodeURIComponent(name)}`;
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatbotBubble;
} else if (typeof window !== 'undefined') {
  window.ChatbotBubble = ChatbotBubble;
}
