/* ===== DIALOGUE - Typewriter, Choices, Text Corruption ===== */
(function() {
  'use strict';

  const W = 480, H = 270;
  const BOX_X = 20, BOX_Y = H - 80, BOX_W = W - 40, BOX_H = 65;

  const Dialogue = {
    active: false,
    text: '',
    displayText: '',
    charIndex: 0,
    typeSpeed: 0.04,
    timer: 0,
    options: null,
    queue: [],
    selectedOption: 0,
    isThought: false,
    onComplete: null,

    show(text, opts) {
      this.active = true;
      this.text = text;
      this.displayText = '';
      this.charIndex = 0;
      this.timer = 0;
      this.isThought = opts && opts.isThought;
      this.options = (opts && opts.choices) ? opts.choices : null;
      this.selectedOption = 0;
    },

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

      // Typewriter
      if (this.charIndex < this.text.length) {
        this.timer += dt;
        if (this.timer >= this.typeSpeed) {
          this.timer = 0;
          this.charIndex++;
          this.displayText = this.text.substring(0, this.charIndex);
          if (this.charIndex % 3 === 0) G.Audio.sfx.text();
        }

        // Speed up on confirm
        if (keys['Enter'] || keys['KeyE'] || keys['Space']) {
          this.displayText = this.text;
          this.charIndex = this.text.length;
          keys['Enter'] = false; keys['KeyE'] = false; keys['Space'] = false;
        }
        return;
      }

      // Navigate choices
      if (this.options) {
        if (keys['ArrowUp'] || keys['KeyW']) {
          this.selectedOption = Math.max(0, this.selectedOption - 1);
          keys['ArrowUp'] = false; keys['KeyW'] = false;
          G.Audio.sfx.menuMove();
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
          this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
          keys['ArrowDown'] = false; keys['KeyS'] = false;
          G.Audio.sfx.menuMove();
        }
      }

      // Confirm
      if (keys['Enter'] || keys['KeyE'] || keys['Space']) {
        keys['Enter'] = false; keys['KeyE'] = false; keys['Space'] = false;

        if (this.options) {
          const choice = this.options[this.selectedOption];
          if (choice.effect) {
            if (choice.effect.flag) G.state.flags[choice.effect.flag] = true;
            if (choice.effect.sanity) G.Sanity.change(choice.effect.sanity, 'choice');
            if (choice.effect.ending) {
              G.state.ending = choice.effect.ending;
            }
          }
          G.Audio.sfx.select();
        }

        // Next in queue
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (typeof next === 'string') {
            this.show(next);
          } else {
            this.show(next.text, next);
          }
        } else {
          this.active = false;
          if (this.onComplete) {
            const cb = this.onComplete;
            this.onComplete = null;
            cb();
          }
        }
      }
    },

    render(ctx, sanity) {
      if (!this.active) return;

      // Dialogue box background
      ctx.fillStyle = this.isThought ? 'rgba(10,8,20,0.92)' : 'rgba(20,15,35,0.92)';
      ctx.fillRect(BOX_X, BOX_Y, BOX_W, BOX_H);

      // Border
      ctx.strokeStyle = this.isThought ? '#4a3880' : '#6a5a2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(BOX_X, BOX_Y, BOX_W, BOX_H);

      // Text with optional corruption
      let display = this.displayText;
      if (sanity < 50 && Math.random() < (50 - sanity) / 100) {
        display = this._corruptText(display, sanity);
      }

      ctx.font = '7px "Press Start 2P"';
      ctx.fillStyle = this.isThought ? '#9a8acc' : '#e8dcc0';

      // Word wrap
      const maxW = BOX_W - 24;
      const lines = this._wrapText(ctx, display, maxW);
      for (let i = 0; i < lines.length && i < 3; i++) {
        ctx.fillText(lines[i], BOX_X + 12, BOX_Y + 16 + i * 14);
      }

      // Choices
      if (this.options && this.charIndex >= this.text.length) {
        const choiceY = BOX_Y - this.options.length * 18 - 8;
        ctx.fillStyle = 'rgba(10,8,20,0.9)';
        ctx.fillRect(BOX_X + 40, choiceY, BOX_W - 80, this.options.length * 18 + 8);
        ctx.strokeStyle = '#6a5a2a';
        ctx.strokeRect(BOX_X + 40, choiceY, BOX_W - 80, this.options.length * 18 + 8);

        ctx.font = '7px "Press Start 2P"';
        for (let i = 0; i < this.options.length; i++) {
          const sel = i === this.selectedOption;
          if (sel) {
            const pulse = Math.sin(Date.now() * 0.006) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(233,69,96,${pulse})`;
            ctx.fillText('>', BOX_X + 50, choiceY + 14 + i * 18);
          }
          ctx.fillStyle = sel ? '#f0e6d3' : '#5a5a6a';
          ctx.fillText(this.options[i].text, BOX_X + 66, choiceY + 14 + i * 18);
        }
      }

      // Continue indicator
      if (!this.options && this.charIndex >= this.text.length) {
        const blink = Math.sin(Date.now() * 0.008) > 0;
        if (blink) {
          ctx.fillStyle = '#6a5a2a';
          ctx.fillText('v', BOX_X + BOX_W - 20, BOX_Y + BOX_H - 8);
        }
      }
    },

    _corruptText(text, sanity) {
      const glitchChars = '!@#$%&*=+<>?/|~';
      let result = '';
      for (const ch of text) {
        if (Math.random() < (50 - sanity) / 200) {
          result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          result += ch;
        }
      }
      return result;
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
  };

  window.G = window.G || {};
  window.G.Dialogue = Dialogue;
})();
