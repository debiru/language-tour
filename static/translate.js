(function() {
  'use strict';

  const NS = {
    path: location.pathname,
    html: document.documentElement,
    head: document.head,
    styleId: 0,
  };
  window.NS = NS;

  const Main = {
    setNS() {
      NS.toc = document.getElementById('toc');
      NS.navbar = document.querySelector('.navbar');
    },
    tocAlways() {
      if (/^\/table-of-contents\//.test(NS.path)) return;
      NS.toc.removeAttribute('hidden');
      Sub.addStyle([
        '#toc { overflow: auto; padding: var(--gap); border-bottom: 2px solid var(--color-pink); }',
        '#toc > :first-child { margin-top: 0; }',
        '@media (min-width: 600px) {',
        '  #playground { display: flex; }',
        '  #toc { width: 20vw; border-right: 2px solid var(--color-pink); }',
        '  #left, #right { position: static; width: 40vw; }',
        '}',
      ]);
    },
    translateElements() {
      const elems = document.querySelectorAll('[data-translate]');
      for (const elem of elems) {
        const lang = elem.getAttribute('data-translate');
        elem.setAttribute('lang', lang);
      }

      Sub.addStyle([
        'div[data-note] { padding: 10px; border-width: 1px; border-style: solid; border-radius: 6px; }',
        'div[data-note]::before { float: left; margin: -10px 10px 0 -10px; padding: 1px 8px; border-width: 0 1px 1px 0; border-style: solid; border-radius: 0 0 6px 0; }',
        'div[data-note] > :first-child { margin-top: 0; }',
        'div[data-note] > :last-child { margin-bottom: 0; }',
        'div[data-note="info"] { border-color: #99f; background: #eef; }',
        'div[data-note="info"]::before { content: "Info"; border-color: #99f; background: #ccf; color: #00c; }',
      ]);
    },
    originalTextSwitcher() {
      const HTML_ATTR = 'data-show-original-text';
      const STORAGE_KEY = 'translate__show-original-text';
      const customControls = Util.createElement('div', {id: 'customControl'});
      const switcherButton = Util.createElement('button', {type: 'button'}, '原語を表示する');
      customControls.append(switcherButton);
      NS.navbar.append(customControls);

      NS.html.setAttribute(HTML_ATTR, 'false');
      Util.addEvent(switcherButton, 'click', () => {
        Sub.toggleAttribute(NS.html, HTML_ATTR);
        const value = Sub.getLogicalAttribute(NS.html, HTML_ATTR);
        switcherButton.textContent = value ? '原語を表示しない' : '原語を表示する';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      });
      const storageValue = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (storageValue) Util.triggerEvent(switcherButton, 'click');

      Sub.addStyle([
        'html[data-show-original-text="false"] #left > p:has(+ p[data-translate]) { display: none; }',
        'html[data-show-original-text="true"] #left > p:has(+ p[data-translate]) { padding-left: 8px; border-left: 4px solid #999; }',
        'button { cursor: pointer; }',
      ]);
    },
    targetBlank() {
      const elems = document.querySelectorAll('#left a');
      for (const elem of elems) {
        const isNavLink = elem.closest('nav.prev-next') != null;
        if (isNavLink) continue;
        elem.setAttribute('target', '_blank');
      }
    },
  };

  const Sub = {
    addStyle(cssText) {
      const style = Util.createElement('style', {id: Util.sprintf('customStyle-%s', ++NS.styleId)});
      if (Array.isArray(cssText)) cssText = cssText.join('\n');
      style.textContent = cssText;
      NS.head.append(style);
    },
    getLogicalAttribute(elem, attr) {
      return elem.getAttribute(attr).toLowerCase() === 'true';
    },
    toggleAttribute(elem, attr) {
      const value = Sub.getLogicalAttribute(elem, attr);
      elem.setAttribute(attr, String(!value));
    },
  };

  const Util = {
    execObjectRoutine(obj) {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'function') {
          const retval = obj[key]();
          if (retval != null) return retval;
        }
      }
    },
    empty(arg) {
      let isEmpty = arg == null || arg === false || arg === '';
      if (!isEmpty) {
        if (Array.isArray(arg) && arg.length === 0) isEmpty = true;
        if (Object.getPrototypeOf(arg).constructor.name === 'Object' && Object.keys(arg).length === 0) isEmpty = true;
      }
      return isEmpty;
    },
    delegateEvent(selector, type, listener, options) {
      if (options == null) options = false;
      document.addEventListener(type, evt => {
        for (let elem = evt.target; elem && elem !== document; elem = elem.parentNode) {
          if (elem.matches(selector)) return listener.call(elem, evt);
        }
      }, options);
    },
    createElement(elemName, attrs, content) {
      const elem = document.createElement(elemName);
      for (const attrKey of Object.keys(attrs)) {
        const attrVal = attrs[attrKey];
        elem.setAttribute(attrKey, attrVal);
      }
      if (content != null) elem.textContent = content;
      return elem;
    },
    addEvent(elems, type, listener, options) {
      if (Util.empty(elems)) return null;
      if (!elems.forEach) elems = [elems];
      if (options == null) options = false;
      elems.forEach((elem, idx) => elem.addEventListener(type, evt => { listener.call(elem, evt, idx); }, options));
    },
    triggerEvent(elems, type, options) {
      if (Util.empty(elems)) return null;
      if (!elems.forEach) elems = [elems];
      const event = new Event(type, options);
      elems.forEach(elem => elem.dispatchEvent(event));
    },
    sprintf(format, ...args) {
      let p = 0;
      return format.replace(/%./g, function(m) {
        if (m === '%%') return '%';
        if (m === '%s') return args[p++];
        return m;
      });
    },
  };
  NS.Util = Util;

  Util.addEvent(document, 'DOMContentLoaded', () => {
    Util.execObjectRoutine(Main);
  });

  Util.addEvent(window, 'unload', () => {});
}());
