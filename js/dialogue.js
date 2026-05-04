/* ===== DIALOGUE SYSTEM - Typewriter, Choices, Glitch Text ===== */
(function() {
  'use strict';

  const Dialogue = {
    active: false,
    queue: [],
    currentText: '',
    displayedText: '',
    charIndex: 0,
    charTimer: 0,
    charSpeed: 0.035,
    choices: null,
    choiceIndex: 0,
    onComplete: null,
    speaker: '',
    isThought: false,
    waitingForInput: false,
    glitchText: false,

    /* Show a dialogue message */
    show(text, options) {
      options = options || {};
      this.active = true;
      this.currentText = text;
      this.displayedText = '';
      this.charIndex = 0;
      this.charTimer = 0;
      this.choices = options.choices || null;
      this.choiceIndex = 0;
      this.onComplete = options.onComplete || null;
      this.speaker = options.speaker || '';
      this.isThought = options.isThought || false;
      this.waitingForInput = false;
      this.glitchText = options.glitch || false;
    },

    /* Queue multiple messages */
    showSequence(messages) {
      if (!messages || messages.length === 0) return;
      this.queue = messages.slice(1);
      const first = messages[0];
      if (typeof first === 'string') {
        this.show(first);
      } else {
        this.show(first.text, first);
      }
    },

    update(dt, keys) {
      if (!this.active) return;

      // Typewriter effect
      if (this.charIndex < this.currentText.length) {
        this.charTimer += dt;
        while (this.charTimer >= this.charSpeed && this.charIndex < this.currentText.length) {
          this.charTimer -= this.charSpeed;
          this.displayedText += this.currentText[this.charIndex];
          this.charIndex++;
          // Play text sound every few chars
          if (this.charIndex % 3 === 0) G.Audio.sfx.text();
        }

        // Skip text on Enter/E/Space
        if (keys['Enter'] || keys['KeyE'] || keys['Space']) {
          this.displayedText = this.currentText;
          this.charIndex = this.currentText.length;
          keys['Enter'] = false;
          keys['KeyE'] = false;
          keys['Space'] = false;
        }
      } else if (!this.waitingForInput) {
        this.waitingForInput = true;
      }

      // Handle input when text is done
      if (this.waitingForInput) {
        if (this.choices) {
          // Navigate choices
          if (keys['ArrowUp'] || keys['KeyW']) {
            this.choiceIndex = Math.max(0, this.choiceIndex - 1);
            keys['ArrowUp'] = false;
            keys['KeyW'] = false;
            G.Audio.sfx.menuMove();
          }
          if (keys['ArrowDown'] || keys['KeyS']) {
            this.choiceIndex = Math.min(this.choices.length - 1, this.choiceIndex + 1);
            keys['ArrowDown'] = false;
            keys['KeyS'] = false;
            G.Audio.sfx.menuMove();
          }
          if (keys['Enter'] || keys['KeyE'] || keys['Space']) {
            keys['Enter'] = false;
            keys['KeyE'] = false;
            keys['Space'] = false;
            G.Audio.sfx.select();
            const choice = this.choices[this.choiceIndex];
            this.active = false;
            if (choice.action) choice.action();
            if (this.onComplete) this.onComplete(this.choiceIndex);
            return;
          }
        } else {
          // Advance on Enter/E/Space
          if (keys['Enter'] || keys['KeyE'] || keys['Space']) {
            keys['Enter'] = false;
            keys['KeyE'] = false;
            keys['Space'] = false;

            // Check queue
            if (this.queue.length > 0) {
              const next = this.queue.shift();
              if (typeof next === 'string') {
                this.show(next);
              } else {
                this.show(next.text, next);
              }
            } else {
              this.active = false;
              if (this.onComplete) this.onComplete();
            }
          }
        }
      }
    },

    render(ctx, coherence) {
      if (!this.active) return;

      const boxH = 48;
      const boxY = 180 - boxH - 4;
      const boxX = 4;
      const boxW = 312;

      // Background
      ctx.fillStyle = 'rgba(10, 10, 15, 0.92)';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // Border
      ctx.strokeStyle = this.isThought ? '#4a1942' : '#2d1b69';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

      // Speaker name
      if (this.speaker) {
        ctx.font = '6px "Press Start 2P"';
        ctx.fillStyle = '#c8a860';
        ctx.fillText(this.speaker, boxX + 6, boxY - 3);
      }

      // Text
      let textColor = this.isThought ? '#8a6ab0' : '#d4d4d4';
      ctx.font = '7px "Press Start 2P"';
      ctx.fillStyle = textColor;

      let displayText = this.displayedText;

      // Glitch text effect at low coherence
      if (this.glitchText || coherence < 40) {
        displayText = this._glitchifyText(displayText, coherence);
      }

      // Word wrap
      const maxWidth = boxW - 16;
      const lines = this._wrapText(ctx, displayText, maxWidth);

      for (let i = 0; i < Math.min(lines.length, 4); i++) {
        ctx.fillText(lines[i], boxX + 8, boxY + 12 + i * 10);
      }

      // Choices
      if (this.choices && this.waitingForInput) {
        const cy = boxY - 4 - this.choices.length * 14;
        ctx.fillStyle = 'rgba(10, 10, 15, 0.92)';
        ctx.fillRect(boxX, cy, boxW, this.choices.length * 14 + 4);
        ctx.strokeStyle = '#2d1b69';
        ctx.strokeRect(boxX + 0.5, cy + 0.5, boxW - 1, this.choices.length * 14 + 3);

        for (let i = 0; i < this.choices.length; i++) {
          const selected = i === this.choiceIndex;
          ctx.fillStyle = selected ? '#e94560' : '#6b6b6b';
          ctx.font = '7px "Press Start 2P"';
          const prefix = selected ? '> ' : '  ';
          ctx.fillText(prefix + this.choices[i].text, boxX + 8, cy + 12 + i * 14);
        }
      }

      // "Press Enter" indicator
      if (this.waitingForInput && !this.choices) {
        if (Math.floor(performance.now() / 500) % 2) {
          ctx.fillStyle = '#6b6b6b';
          ctx.font = '6px "Press Start 2P"';
          ctx.fillText('▼', boxX + boxW - 14, boxY + boxH - 6);
        }
      }
    },

    _wrapText(ctx, text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let current = '';
      for (const word of words) {
        const test = current ? current + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    },

    _glitchifyText(text, coherence) {
      const glitchChars = '░▒▓█▄▀│┤╡╢╣║╗╝¿⌐¬½¼';
      const intensity = Math.max(0, (60 - coherence) / 60);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < intensity * 0.15) {
          result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          result += text[i];
        }
      }
      return result;
    }
  };

  window.G = window.G || {};
  window.G.Dialogue = Dialogue;
})();
