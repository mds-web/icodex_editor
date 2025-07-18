// import {} from 'module';

import { importFiles } from './module/importFile.js';
import {
  FileContentStorage,
  openDb,
  updateProject,
  getAllProjects,
  addProject,
  addPreferences,
} from './module/FileContentStorage.js';

const translations = {
  en: {
    appearance: 'Appearance',
    editor: 'Editor',
    'tree-view': 'Tree View',
    language: 'Language',
    theme: 'Theme',
    background: 'Background',
    textSize: 'Text Size',
    nightMode: 'Night Mode',
    autocomplete: 'Autocomplete',
    showHints: 'Show Hints',
    cursorStyle: 'Cursor Style',
    editorFontSize: 'Editor Font Size',
    editorFontWeight: 'Editor Font Weight',
    showtreeindent: 'Show Tree Indent',
    'light-themes': 'Light Themes',
    'dark-themes': 'Dark Themes',

    copy: 'Copy',
    cut: 'Cut',
    rename: 'Rename',
    copy_path: 'Copy Path',
    delete: 'Delete',
    import_files: 'Import Files',
    download: 'Download',
    new_file: 'New File',
    new_folder: 'New Folder',
    placeholder1: 'Enter Name or Path',
    buttonCreate: 'Create',
    buttonCancel: 'Cancel',
  },
  id: {
    appearance: 'Tampilan',
    editor: 'Editor',
    'tree-view': 'Tampilan Pohon',
    language: 'Bahasa',
    theme: 'Tema',
    background: 'Latar Belakang',
    textSize: 'Ukuran Teks',
    nightMode: 'Mode Malam',
    autocomplete: 'Pelengkapan Otomatis',
    showHints: 'Tampilkan Petunjuk',
    cursorStyle: 'Gaya Kursor',
    editorFontSize: 'Ukuran Font Editor',
    editorFontWeight: 'Tebal Font Editor',
    showtreeindent: 'Tampilkan Indentasi Pohon',
    'light-themes': 'Tema Terang',
    'dark-themes': 'Tema Gelap',
    copy: 'Salin',
    cut: 'Potong',
    rename: 'Ubah Nama',
    copy_path: 'Salin Path',
    delete: 'Hapus',
    import_files: 'Impor Berkas',
    download: 'Unduh',
    new_file: 'Berkas Baru',
    new_folder: 'Folder Baru',
    placeholder1: 'Masukan Nama atau Path',
    buttonCreate: 'Buat',
    buttonCancel: 'Batal',
  },
};

let currentLang = localStorage.getItem('lang') || 'en';

const i18n = {
  t(key) {
    return translations?.[currentLang]?.[key] || key;
  },

  setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translateAll();
  },

  translateAll() {
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.dataset.lang;
      if (el.hasAttribute('placeholder')) {
        el.placeholder = this.t(key);
      } else if (el.hasAttribute('title')) {
        el.title = this.t(key);
      } else {
        el.textContent = this.t(key);
      }
    });
  },

  getLang() {
    return currentLang;
  },
};

const state = {
  openedFilePaths: [],
  unpinnedTabs: [],
  currentFilePath: null,
};

const DB_NAME = 'Editor_code8',
  PROJECT_STORE_NAME = 'projects';
const DB_VERSION = 22;
const TREE_STORE_NAME = 'Tree';
const APP_SETTINGS_NAME = 'Preferences-settings';

window.Icodex = window.Icodex || {};
const Icodex = window.Icodex;

class Input {
  constructor(placeholder = '') {
    (this.input = document.createElement('input')),
      (this.input.spellcheck = !1),
      (this.input.autocomplete = 'off'),
      (this.input.placeholder = placeholder),
      (this.input.type = 'text'),
      (this.input.maxLength = 50),
      (this.input.value = ''),
      (this.input.className = 'form-input');
  }
  set value(val) {
    this.input.value = val;
  }
  set placeholder(placeholder = '') {
    this.input.placeholder = placeholder;
  }
  get value() {
    return this.input.value;
  }
  focus() {
    return this.input.focus();
  }
  blur() {
    return this.input.blur();
  }
  select() {
    this.input.select();
  }
  trim() {
    return this.input.value.trim();
  }
  onInput(callback) {
    this.input.addEventListener('input', callback);
  }
}
class Button {
  constructor(className = 'btn', icon = '') {
    (this.button = document.createElement('button')),
      (this.button.className = className),
      (this.button.innerHTML = icon);
  }
  setOnclickListener(callBack) {
    this.button.addEventListener('click', callBack);
  }
}
window.IcodexEditor = {
  dialog_containers: document.createElement('div'),
};
const dialogWrap = window.IcodexEditor.dialog_containers;
class Dialog {
  dialog = document.createElement('div');
  _dialogHeader;
  _dialogTitle;
  _dialogBody;
  _dialogFooter;
  _buttonCreate;

  constructor(dialogTitle = 'Dialog Header', container) {
    this.dialogTitle = dialogTitle;
    this._container = container;
    this.dialog.className = 'dialog-overlay';
    this.#init();
    this.children = {
      body: this.#createProxyList('body'),
      footer: this.#createProxyList('footer'),
    };
    this.classList = this.dialog.classList;
  }

  render(render = false) {
    if (render === true || render === 1) {
      this._container.innerHTML = '';
      this._container.appendChild(this.dialog);
    } else {
      this._container.innerHTML = '';
    }
  }

  #createProxyList(type) {
    const self = this;
    return new Proxy([], {
      set(target, prop, value) {
        const isIndex = !isNaN(prop);
        const result = Reflect.set(target, prop, value);
        if (isIndex && value instanceof HTMLElement) {
          const targetElement =
            type === 'body' ? self._dialogBody : self._dialogFooter;
          if (targetElement) {
            targetElement.appendChild(value);
          } else {
            console.warn(
              `Attempted to append to ${type} before it was initialized.`
            );
          }
        }
        return result;
      },
    });
  }

  #init() {
    const container = document.createElement('div');
    const header = document.createElement('div');
    const body = document.createElement('div');
    const footer = document.createElement('div');

    header.className = 'dialog-header';
    body.className = 'dialog-body';
    footer.className = 'dialog-footer';
    container.className = 'dialog-container';

    const title = document.createElement('span');
    title.className = 'dialog-title';
    title.innerText = this.dialogTitle;

    header.appendChild(title);
    container.append(header, body, footer);
    this.dialog.appendChild(container);

    this._dialogHeader = header;
    this._dialogTitle = title;
    this._dialogBody = body;
    this._dialogFooter = footer;
  }
}
function createElement(tag, attrs = {}) {
  const el = document.createElement(tag);
  for (const key in attrs)
    key in el ? (el[key] = attrs[key]) : el.setAttribute(key, attrs[key]);
  return el;
}
function DropdownPosition(target, handle, show = !1) {
  if (!0 === show || 1 === show) {
    const handleY = handle.getBoundingClientRect().y;
    (target.style.top = handleY + 'px'), console.log(handleY + 'px');
  }
}
document.body.appendChild(dialogWrap);
class ixScrollManager {
  constructor(target, mode = 'both') {
    (this.target = target),
      (this.mode = mode),
      (this.handlers = {
        wheel: this._blockEvent.bind(this),
        touchmove: this._blockEvent.bind(this),
      });
  }
  _blockEvent(e) {
    e.preventDefault(), e.stopPropagation();
  }
  lock() {
    this.target &&
      (('both' !== this.mode && 'desktop' !== this.mode) ||
        this.target.addEventListener('wheel', this.handlers.wheel, {
          passive: !1,
        }),
      ('both' !== this.mode && 'mobile' !== this.mode) ||
        this.target.addEventListener('touchmove', this.handlers.touchmove, {
          passive: !1,
        }));
  }
  unlock() {
    this.target &&
      (this.target.removeEventListener('wheel', this.handlers.wheel),
      this.target.removeEventListener('touchmove', this.handlers.touchmove));
  }
}
class CustomDialog extends Dialog {
  constructor(container) {
    super('', container);

    this._container = container;
    this._title = '';
    this._placeholder = 'Masukan Nama atau Path';

    this.input = new Input(this._placeholder);

    this.#initCustomDialog();
  }
  updateLanguage() {
    if (this.titleElement && this._title) {
      this.titleElement.textContent = i18n.t(this._title); // ← translate judul
    }

    // Jika button sudah ada, update text-nya pakai key dari data-lang
    if (this.buttonNegative?.button?.dataset.lang) {
      const key = this.buttonNegative.button.dataset.lang;
      this.buttonNegative.button.textContent = i18n.t(key);
    }
    if (this.buttonPositive?.button?.dataset.lang) {
      const key = this.buttonPositive.button.dataset.lang;
      this.buttonPositive.button.textContent = i18n.t(key);
    }

    // Placeholder input
    if (this.input?.input?.dataset.lang) {
      const key = this.input.input.dataset.lang;
      this.input.input.placeholder = i18n.t(key);
    }
  }

  set title(value) {
    this._title = value;
    if (this.titleElement) {
      this.titleElement.textContent = value;
    }
  }
  get title() {
    return this._title;
  }

  set placeholder(value) {
    this._placeholder = value;
    if (this.input?.input) {
      this.input.input.placeholder = value;
      this.input.input.dataset.lang = 'placeholder1'; // Optional jika ingin translate placeholder otomatis
    }
  }
  get placeholder() {
    return this._placeholder;
  }

  get value() {
    return this.input.value;
  }
  set value(val) {
    this.input.value = val;
  }

  focus() {
    this.input.focus();
  }
  blur() {
    this.input.blur();
  }

  #initCustomDialog() {
    this.titleElement = this.dialog.querySelector('.dialog-title');

    if (this.titleElement && this._title) {
      this.titleElement.textContent = this._title;
    }

    const buttonNegative = new Button(
      'btn button-negative',
      i18n.t('buttonCancel')
    );
    buttonNegative.button.dataset.lang = 'buttonCancel'; // <- untuk auto translate

    const buttonPositive = new Button(
      'btn button-positive',
      i18n.t('buttonCreate')
    );
    buttonPositive.button.dataset.lang = 'buttonCreate'; // <- untuk auto translate

    this.buttonNegative = buttonNegative;
    this.buttonPositive = buttonPositive;

    this.children.body.push(this.input.input);
    this.children.footer.push(buttonNegative.button);
    this.children.footer.push(buttonPositive.button);
  }

  show(state = false) {
    if (state) {
      if (!this.dialog.isConnected && this._container) {
        this.render(true);
      }
      this.dialog.classList.add('open');
      this.input.focus();
    } else {
      this.dialog.classList.remove('open');
      setTimeout(() => this.render(false), 250);
    }
  }
}

class Dropdown extends EventTarget {
  dropdown = document.createElement('div');
  #onoptionclick = null;
  constructor(
    group = [
      {
        label: 'group1',
        option: [
          {
            value: 'Berkas Baru',
            valueLangKey: 'new_file', // ✅ Tambah key
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 15 15">	<path fill="currentColor" fill-rule="evenodd" d="M3.5 2a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V4.707L9.293 2zM2 2.5A1.5 1.5 0 0 1 3.5 1h6a.5.5 0 0 1 .354.146l2.926 2.927c.141.14.22.332.22.53V12.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2 12.5zm2.75 5a.5.5 0 0 1 .5-.5H7V5.25a.5.5 0 0 1 1 0V7h1.75a.5.5 0 0 1 0 1H8v1.75a.5.5 0 0 1-1 0V8H5.25a.5.5 0 0 1-.5-.5" clip-rule="evenodd" stroke-width="0.3" stroke="currentColor" /></svg>',
            id: 'new-file',
          },
          {
            value: 'Folder Baru',
            valueLangKey: 'new_folder', // ✅ Tambah key
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-plus-icon lucide-folder-plus"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
            id: 'new-folder',
          },
        ],
      },
    ]
  ) {
    super();
    this._group = group;
  }

  fragmentRender(render = false) {
    const fragment = document.createDocumentFragment();
    this.dropdown.className = 'dropdown';

    this._group.forEach(group => {
      const ul = document.createElement('ul');

      // Buat unique ID untuk list
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const uniqueId = `icodex_${randomArray[0].toString(36).slice(0, 10)}`;
      ul.id = uniqueId;

      group.option.forEach(opt => {
        const li = document.createElement('li');
        const opt_icon = document.createElement('span');

        if (opt.icon.startsWith('bi') || opt.icon.startsWith('codicon'))
          opt_icon.className = opt.icon;
        else opt_icon.innerHTML = opt.icon;

        const opt_title = document.createElement('span');
        // 🟢 Perubahan penting: ambil teks dari valueLangKey jika ada
        const key = opt.valueLangKey || opt.value || '';
        opt_title.textContent = i18n?.t?.(key) || key;
        if (opt.valueLangKey) {
          opt_title.dataset.lang = key;
        }

        li.append(opt_icon, opt_title);

        li.addEventListener('click', e => {
          if (typeof this.#onoptionclick === 'function') {
            this.#onoptionclick(e, opt);
          }
          const customEvent = new CustomEvent('optclick', {
            detail: {
              option: opt,
              eventOri: e,
              group: this.group,
            },
            bubbles: true,
            cancelable: true,
          });
          this.dispatchEvent(customEvent);
        });

        ul.appendChild(li);
      });

      fragment.appendChild(ul);
    });

    return fragment;
  }
  set onoptionclick(callback) {
    this.#onoptionclick = 'function' == typeof callback ? callback : null;
  }
  get onoptionclick() {
    return this.#onoptionclick;
  }
}
class CustomDropdown extends Dropdown {
  constructor(container, handle) {
    super(),
      (this.handle = handle),
      (this.container = container),
      (this.dropDown = document.createElement('div')),
      (this.dropDown.className = 'dropdown'),
      (this.borderOverlay = document.createElement('div')),
      (this.borderOverlay.className = 'ix-drop-border'),
      (this.scrollManager = new ixScrollManager(this.dropDown, 'mobile'));
  }
  #render(render = !1) {
    !0 === render || 1 === render
      ? ((this.container.innerHTML = ''),
        (this.dropDown.innerHTML = ''),
        this.dropDown.appendChild(super.fragmentRender(!0)),
        DropdownPosition(this.container, this.handle, !0),
        this.container.appendChild(this.dropDown))
      : (DropdownPosition(this.container, this.handle, !1),
        (this.container.innerHTML = ''));
  }

  open(state = false) {
    if (state) {
      if (!this.dropDown.isConnected && this.container) {
        this.#render(true);
      }
      this.#icodexPlaceDropdown();
      this.scrollManager.lock();
      this.container.classList.add('open');

      // 🔁 Tambahkan auto-translate
      if (typeof i18n?.translateAll === 'function') {
        i18n.translateAll();
      }
    } else {
      this.scrollManager.lock();
      this.container.classList.remove('open');
      this.#render(false);
    }
    return this;
  }

  #icodexPlaceDropdown() {
    const rect = this.dropDown.getBoundingClientRect(),
      windowHeight = window.innerHeight;
    rect.y < windowHeight - rect.height
      ? (this.dropdown.style.top = rect.top + 'px')
      : (this.dropDown.style.top = `-${rect.height}px`);
  }
}

const DROPDOWN_CONTAINERS = document.createElement('div');
(DROPDOWN_CONTAINERS.className = 'dropdown-container'),
  document.body.insertAdjacentElement('afterbegin', DROPDOWN_CONTAINERS);
Icodex.settingsPage ??= new (class {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'settings-page';

    this.settings = {
      language: 'en',
      theme: 'github_dark',
      background: 'System',
      textSize: '16px',
      nightMode: false,
      autocomplete: false,
      showHints: false,
      cursorStyle: 'ace',
      editorFontSize: '14px',
      editorFontWeight: 'normal',
    };

    window.Icodex = window.Icodex || {};
    Icodex.settings = this.settings;

    this.init();
  }

  async init() {
    this.loadSettings();
    this.render();
    i18n.setLang(this.settings.language); // Set awal bahasa
    i18n.translateAll(); // Translate semua elemen dengan data-lang
  }

  loadSettings() {
    const saved = localStorage.getItem('user_settings');
    if (saved) Object.assign(this.settings, JSON.parse(saved));
    window.IcodexEditor = window.IcodexEditor || {};
    window.IcodexEditor.settings = this.settings;
  }

  saveSettings() {
    localStorage.setItem('user_settings', JSON.stringify(this.settings));
    window.IcodexEditor = window.IcodexEditor || {};
    window.IcodexEditor.settings = this.settings;

    window.dispatchEvent(
      new CustomEvent('update-settings', {
        detail: this.settings,
      })
    );
  }

  createSelect(id, options, settingKey, optgroup = false) {
    const select = document.createElement('select');
    select.className = 'form-select';
    select.name = id;
    select.id = id;

    if (optgroup) {
      for (const [groupKey, opts] of Object.entries(options)) {
        const group = document.createElement('optgroup');
        group.label = i18n.t(groupKey); // translate group label
        opts.forEach(([val, label]) => {
          const opt = new Option(
            label,
            val,
            false,
            this.settings[settingKey] === val
          );
          group.appendChild(opt);
        });
        select.appendChild(group);
      }
    } else {
      options.forEach(([val, label]) => {
        const opt = new Option(
          label,
          val,
          false,
          this.settings[settingKey] === val
        );
        select.appendChild(opt);
      });
    }

    select.addEventListener('change', () => {
      this.settings[settingKey] = select.value;
      if (settingKey === 'language') {
        i18n.setLang(select.value); // Set ulang bahasa
        i18n.translateAll(); // Translate ulang semua elemen
      }
      this.saveSettings();
    });

    return select;
  }

  createSwitch(settingKey) {
    const label = document.createElement('label');
    label.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!this.settings[settingKey];

    const slider = document.createElement('span');
    slider.className = 'slider';

    input.addEventListener('change', () => {
      this.settings[settingKey] = input.checked;
      this.saveSettings();
    });

    label.appendChild(input);
    label.appendChild(slider);
    return label;
  }

  createSetting(labelKey, inputElement) {
    const item = document.createElement('div');
    item.className = 'settings-item';

    const label = document.createElement('span');
    label.className = 'settings-name';
    label.dataset.lang = labelKey;
    label.textContent = i18n.t(labelKey); // translate teks awal

    const info = document.createElement('span');
    info.className = 'settings-info';
    info.setAttribute('tabindex', '0');
    info.setAttribute('role', 'button');
    info.innerHTML = '<i class="bi bi-info-circle"></i>';
    label.appendChild(info);

    const handle = document.createElement('span');
    handle.className = 'settings-handle';
    handle.appendChild(inputElement);

    item.appendChild(label);
    item.appendChild(handle);
    return item;
  }

  renderSection(titleKey, items) {
    const section = document.createElement('section');
    section.dataset.translate = true;

    const header = document.createElement('div');
    header.id = 'settings-label';
    header.dataset.lang = titleKey;
    header.textContent = i18n.t(titleKey);

    section.appendChild(header);
    items.forEach(el => section.appendChild(el));
    return section;
  }

  render() {
    const displayItems = [
      this.createSetting(
        'language',
        this.createSelect(
          'language',
          [
            ['en', 'English'],
            ['id', 'Indonesia'],
            ['es', 'Español'],
            ['fr', 'Français'],
            ['de', 'Deutsch'],
            ['zh', '中文'],
            ['ja', '日本語'],
            ['ko', '한국어'],
            ['ru', 'Русский'],
            ['pt', 'Português'],
            ['hi', 'हिन्दी (Hindi)'],
          ],
          'language'
        )
      ),

      this.createSetting(
        'theme',
        this.createSelect(
          'theme-select',
          {
            'light-themes': [
              ['light', 'Light'],
              ['one_light', 'One Light'],
              ['chrome', 'Chrome'],
              ['xcode', 'XCode'],
            ],
            'dark-themes': [
              ['dark', 'Dark'],
              ['dracula', 'Dracula'],
              ['dracula_x', 'Dracula-X'],
              ['mirage', 'Mirage'],
              ['monokai', 'Monokai'],
              ['one_dark', 'One Dark'],
              ['github_dark', 'Github Dark'],
            ],
          },
          'theme',
          true
        )
      ),

      this.createSetting(
        'background',
        this.createSelect(
          'background',
          [
            ['Dark', 'Dark'],
            ['Light', 'Light'],
            ['System', 'System'],
          ],
          'background'
        )
      ),

      this.createSetting(
        'textSize',
        this.createSelect(
          'text-size',
          [
            ['12px', '12px'],
            ['14px', '14px'],
            ['16px', '16px'],
            ['18px', '18px'],
          ],
          'textSize'
        )
      ),

      this.createSetting('nightMode', this.createSwitch('nightMode')),
    ];

    const editorItems = [
      this.createSetting('autocomplete', this.createSwitch('autocomplete')),
      this.createSetting('showHints', this.createSwitch('showHints')),
      this.createSetting(
        'cursorStyle',
        this.createSelect(
          'cursor-style',
          [
            ['ace', 'Default'],
            ['smooth', 'No Blink'],
            ['slim', 'Slim'],
          ],
          'cursorStyle'
        )
      ),
      this.createSetting(
        'editorFontSize',
        this.createSelect(
          'editor-font-size',
          [
            ['12px', '12px'],
            ['14px', '14px'],
            ['16px', '16px'],
            ['18px', '18px'],
          ],
          'editorFontSize'
        )
      ),
      this.createSetting(
        'editorFontWeight',
        this.createSelect(
          'editor-font-weight',
          [
            ['400', 'Thin'],
            ['normal', 'Normal'],
            ['bold', 'Bold'],
          ],
          'editorFontWeight'
        )
      ),
    ];

    const settingsTree = [
      this.createSetting('showtreeindent', this.createSwitch('showtreeindent')),
    ];

    this.el.appendChild(this.renderSection('appearance', displayItems));
    this.el.appendChild(this.renderSection('editor', editorItems));
    this.el.appendChild(this.renderSection('tree-view', settingsTree));
  }

  getElement() {
    return this.el;
  }

  getSettings() {
    return this.settings;
  }
})();

const selectedMarker = document.createElement('div');
selectedMarker.className = '--selected';

class SearchBox {
  constructor() {
    this.wrapper = createElement('div', {
      className: 'search-box-wrapper hidden',
    });
    this.root = document.createElement('div');
    this.root.className = 'search-box sb-sm';
    this.root.tabIndex = 0;

    this.icon = document.createElement('span');
    this.icon.className = 'search-ic';
    this.icon.tabIndex = 0;
    this.icon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>';
    this.close = createElement('button', {
      type: 'button',
      className: 'btn',
    });
    this.close.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>`;

    this.input = document.createElement('input');
    this.input.className = 'form-search';
    this.input.type = 'text';
    this.input.placeholder = 'Cari nama file';
    this.input.autocomplete = 'off';
    this.input.autocorrect = 'off';
    this.input.autocapitalize = 'none';
    this.input.spellcheck = false;

    this.root.appendChild(this.icon);
    this.root.appendChild(this.input);
    this.wrapper.appendChild(this.root);
    this.root.appendChild(this.close);
  }

  get element() {
    return this.wrapper;
  }

  onInput(callback) {
    // Daftarkan callback input (contoh: pencarian file tree)
    this.input.addEventListener('input', () => {
      const keyword = this.input.value.trim();
      callback(keyword);
    });
  }

  focus() {
    this.input.focus();
  }

  clear() {
    this.input.value = '';
  }
}

function positionDropdownRelative(dropdown, anchor, container) {
  const anchorRect = anchor.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Hitung posisi anchor relatif terhadap container
  const top = anchorRect.top - containerRect.top;
  const left = anchorRect.right - containerRect.left - dropdown.offsetWidth;

  dropdown.style.position = 'absolute';
  dropdown.style.top = `${top}px`;
  dropdown.style.left = `${left}px`;
}

class DropdownManager {
  constructor({ wrapper, drawer, items = [] }) {
    if (!(wrapper instanceof HTMLElement)) {
      throw new Error('DropdownManager: wrapper harus elemen DOM.');
    }
    if (!(drawer instanceof HTMLElement)) {
      throw new Error('DropdownManager: drawer harus elemen DOM.');
    }

    this.wrapper = wrapper;
    this.drawer = drawer;
    this.items = items;
    this.anchor = null;
    this.visible = false;

    // untuk click di luar
    this._onOutsideClick = e => {
      if (
        this.wrapper.contains(e.target) ||
        (this.anchor && this.anchor.contains(e.target))
      )
        return;
      this.hide();
    };
  }

  show(anchor) {
    if (!(anchor instanceof HTMLElement)) return;

    this.anchor = anchor;
    const anchorRect = anchor.getBoundingClientRect();
    const drawerRect = this.drawer.getBoundingClientRect();

    // Posisi wrapper: full width drawer, top sejajar anchor, height = tinggi anchor
    Object.assign(this.wrapper.style, {
      position: 'absolute',
      top: `${anchorRect.top - drawerRect.top}px`,
      left: `0px`,
      right: `0px`,
      height: `${anchorRect.height}px`,
      pointerEvents: 'none', // biar hanya dropdown-medium yang bisa diklik
    });

    this.wrapper.innerHTML = ''; // kosongkan isi lama

    // Buat dropdown-medium
    const frag = document.createDocumentFragment();
    const ul = document.createElement('ul');
    ul.className = 'dropdown-medium';

    // Posisi horizontal dropdown-medium
    const anchorMid = anchorRect.left + anchorRect.width / 2;
    const drawerMid = drawerRect.left + drawerRect.width / 2;

    if (anchorMid < drawerMid) {
      // tombol di kiri → tempel kiri
      ul.style.left = `${anchorRect.left - drawerRect.left}px`;
    } else {
      // tombol di kanan → tempel kanan
      ul.style.right = `${drawerRect.right - anchorRect.right}px`;
    }

    // Posisi vertikal (muncul sedikit di bawah anchor)
    ul.style.top = `${anchorRect.height}px`;

    // Transisi animasi muncul
    ul.style.opacity = '0';
    ul.style.transform = 'translateY(-8px)';
    ul.style.transition = 'opacity 250ms ease, transform 300ms ease';

    // Isi item dropdown
    for (const item of this.items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';

      const iconSpan = document.createElement('span');
      iconSpan.innerHTML = item.icon;

      const textSpan = document.createElement('span');
      textSpan.className = 'text';
      textSpan.textContent = item.label;

      a.appendChild(iconSpan);
      a.appendChild(textSpan);
      a.addEventListener('click', () => {
        item.onClick?.();
        this.hide();
      });

      li.appendChild(a);
      ul.appendChild(li);
    }

    frag.appendChild(ul);
    this.wrapper.appendChild(frag);

    // trigger animasi masuk
    requestAnimationFrame(() => {
      ul.style.opacity = '1';
      ul.style.transform = 'translateY(0)';
    });

    this.visible = true;
    document.addEventListener('click', this._onOutsideClick);
  }

  hide() {
    this.wrapper.innerHTML = '';
    this.visible = false;
    this.anchor = null;
    document.removeEventListener('click', this._onOutsideClick);
  }

  toggle(anchor) {
    if (this.visible && this.anchor === anchor) {
      this.hide();
    } else {
      this.show(anchor);
    }
  }

  updateItems(newItems = []) {
    this.items = newItems;
    if (this.visible && this.anchor) {
      this.show(this.anchor); // re-render dropdown saat terbuka
    }
  }
}

// atau append ke tempat lain

class TreeView {
  static currentOpenDropdown = null;
  mainParentTree;
  containerLoading;
  static version = Object.freeze({
    major: 1,
    minor: 0,
    patch: 0,
  });
  static getVersion() {
    const v = TreeView.version;
    return `${v.major}.${v.minor}.${v.patch}`;
  }
  constructor(data) {
    if (Array.isArray(data)) {
      const valid = data.every(
        item =>
          typeof item === 'object' && item !== null && !Array.isArray(item)
      );
      if (!valid)
        throw new Error('TreeView error: array harus berisi object saja');
      this.data = data;
    } else if (typeof data === 'object' && data !== null) {
      this.data = [data];
    } else {
      throw new Error('TreeView error: data harus object atau array of object');
    }
  }
}

TreeView.prototype.getNodeByPath = function getNodeByPath(path) {
  const parts = path.split('/').filter(Boolean);
  let currentNodes = this.data,
    currentNode = null;
  for (const part of parts) {
    if (((currentNode = currentNodes.find(n => n.name === part)), !currentNode))
      return null;
    currentNodes = currentNode.children || [];
  }
  return currentNode;
};

TreeView.prototype.searchTree = function searchTree(keyword) {
  const normalized = keyword.trim().toLowerCase();
  const isEmpty = normalized === '';

  const folderItems = this.mainParentTree.querySelectorAll('.folder-item');
  const fileItems = this.mainParentTree.querySelectorAll('.file-item');
  const allLabels = this.mainParentTree.querySelectorAll(
    '.folder-name, .file-name'
  );

  // Reset semua tampilan dan hapus highlight
  folderItems.forEach(el => (el.style.display = ''));
  fileItems.forEach(el => (el.style.display = ''));
  const directoryContents =
    this.mainParentTree.querySelectorAll('.directory-content');
  directoryContents.forEach(dc => {
    dc.style.display = '';
    dc.classList.remove('open');
  });

  allLabels.forEach(label => {
    const text = label.textContent;
    label.innerHTML = text; // reset isi label ke semula (tanpa span.highlight)
  });

  // Kalau kosong, berhenti di sini
  if (isEmpty) return;

  // Pencarian aktif
  const matchedItems = new Set();

  allLabels.forEach(label => {
    const text = label.textContent.toLowerCase();
    if (text.includes(normalized)) {
      // Tambah highlight
      const rawText = label.textContent;
      const regex = new RegExp(`(${keyword})`, 'ig');
      label.innerHTML = rawText.replace(
        regex,
        `<span class="highlight">$1</span>`
      );

      const item = label.closest('.folder-item, .file-item');
      matchedItems.add(item);

      // Buka semua parent .directory-content agar terlihat
      let parent = item.parentElement;
      while (parent && parent.classList.contains('directory-content')) {
        parent.style.display = '';
        parent.classList.add('open');
        parent = parent.parentElement.closest('.directory-content');
      }
    }
  });

  // Sembunyikan yang tidak cocok, kecuali root (project name)
  folderItems.forEach(item => {
    if (!matchedItems.has(item)) {
      const isProjectRoot = item.id === 'line-0'; // Atur sesuai id project kamu
      if (!isProjectRoot) item.style.display = 'none';
    }
  });

  fileItems.forEach(item => {
    if (!matchedItems.has(item)) {
      item.style.display = 'none';
    }
  });

  // Sembunyikan folder kosong (yang tidak punya visible isi)
  directoryContents.forEach(dir => {
    const hasVisibleChild = dir.querySelector(
      ".folder-item:not([style*='display: none']), .file-item:not([style*='display: none'])"
    );
    if (!hasVisibleChild) {
      dir.style.display = 'none';
    }
  });
};

TreeView.prototype.createErrorMessageElement =
  function createErrorMessageElement(text) {
    const p = document.createElement('p');
    p.className = 'error-messages-text';
    p.innerText = text;
    return p;
  };

TreeView.prototype.renderTree = function renderTree() {
  // Buat elemen utama tree
  this.mainParentTree = document.createElement('div');
  this.headerTools();

  this.mainParentTree.className = 'tree-view';

  // Buat dan tambahkan elemen loading di atas
  this.containerLoading = document.createElement('div');
  this.mainParentTree.insertAdjacentElement(
    'afterbegin',
    this.containerLoading
  );
  // Render setiap item dari data
  this.data.forEach(item => {
    const el = this.createNode(item);
    if (el) this.mainParentTree.appendChild(el);
  });

  return this.mainParentTree;
};

TreeView.prototype.createNode = function createNode(node, level = 0) {
  return node
    ? 'directory' === node.type
      ? this.createDirectoryNode(node, level)
      : 'file' === node.type
      ? this.createFileNode(node, level)
      : null
    : null;
};

TreeView.prototype.headerTools = function headerTools() {
  const self = this;

  const root = self.data[0];
  const $header = document.createElement('nav');
  $header.className = 'treeHeader';
  const $iconGroup = document.createElement('a');
  $iconGroup.className = 'tree-icon-group';

  const dialogAddFolder = new CustomDialog(dialogWrap);
  const $inputFolder = dialogAddFolder.input.input;
  const dialogNewFile = new CustomDialog(dialogWrap);
  const inputNewFile = dialogNewFile.input.input;
  const confirmBtn = dialogNewFile.buttonPositive.button;
  const cancelBtn = dialogNewFile.buttonNegative.button;

  const $errorFolder = this.createErrorMessageElement('Path cannot be empty.');
  const tagErrorFile = this.createErrorMessageElement('Path cannot be empty');
  const fileType = document.createElement('span');
  (fileType.className = 'validation-icon-type'),
    fileType.setAttribute('data-validation-type', 'unknown'),
    inputNewFile.parentNode.appendChild(fileType);
  dialogAddFolder._dialogBody.append($errorFolder);

  const iconsActions = [
    'Explorer',
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>',
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M3.5 2a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V4.707L9.293 2zM2 2.5A1.5 1.5 0 0 1 3.5 1h6a.5.5 0 0 1 .354.146l2.926 2.927c.141.14.22.332.22.53V12.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 2 12.5zm2.75 5a.5.5 0 0 1 .5-.5H7V5.25a.5.5 0 0 1 1 0V7h1.75a.5.5 0 0 1 0 1H8v1.75a.5.5 0 0 1-1 0V8H5.25a.5.5 0 0 1-.5-.5" clip-rule="evenodd" stroke-width="0.5" stroke="currentColor"/></svg>',
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="ic-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg>',
    },
  ];

  const dropdown = new DropdownManager({
    wrapper: document.querySelector('.dropdown-wrapper'),
    drawer: document.querySelector('#explorer') || document.body,
    items: [
      {
        label: 'Mengimport Berkas',
        icon: `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M28 22v8H4v-8M16 4v20m-8-8l8 8l8-8" /></svg>`,
        onClick: () =>
          importFiles({
            node: root,
            self: this,
            loadingContainer: this.containerLoading,
            findRootProject: this.findRootProject.bind(this),
            refreshAndSave: this.refreshAndSave.bind(this),
          }),
      },
      {
        label: 'Tambahkan Perpustakaan',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24"><path fill="currentColor" d="M9.126.64a1.75 1.75 0 0 1 1.75 0l8.25 4.762q.155.09.286.206a.75.75 0 0 1 .554.96q.035.17.035.35v3.332a.75.75 0 0 1-1.5 0V7.64l-7.75 4.474V22.36a.75.75 0 0 1-1.125.65l-8.75-5.052a1.75 1.75 0 0 1-.875-1.515V6.917q0-.179.035-.35a.75.75 0 0 1 .554-.96q.133-.117.286-.205zm.875 10.173l7.75-4.474l-7.625-4.402a.25.25 0 0 0-.25 0L2.251 6.34Zm-8.5-3.175v8.803c0 .09.048.172.125.216l7.625 4.402v-8.947Z" stroke-width="0.5" stroke="currentColor" /><path fill="currentColor" d="m16.617 17.5l2.895-2.702a.75.75 0 0 0-1.024-1.096l-4.285 4a.75.75 0 0 0 0 1.096l4.285 4a.75.75 0 1 0 1.024-1.096L16.617 19h6.633a.75.75 0 0 0 0-1.5z" stroke-width="0.5" stroke="currentColor" /></svg>`,
        onClick: () => alert('Add library'),
      },
      {
        label: 'Segarkan Berkas',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 1024 1024"><path fill="currentColor" d="M771.776 794.88A384 384 0 0 1 128 512h64a320 320 0 0 0 555.712 216.448H654.72a32 32 0 1 1 0-64h149.056a32 32 0 0 1 32 32v148.928a32 32 0 1 1-64 0v-50.56zM276.288 295.616h92.992a32 32 0 0 1 0 64H220.16a32 32 0 0 1-32-32V178.56a32 32 0 0 1 64 0v50.56A384 384 0 0 1 896.128 512h-64a320 320 0 0 0-555.776-216.384z" stroke-width="25.5" stroke="currentColor" /></svg>`,
        onClick: () => alert('Refresh'),
      },
    ],
  }); 

  iconsActions.forEach((item, i) => {
    if (typeof item === 'string') {
      const $title = document.createElement('span');
      $title.textContent = item;
      $title.className = 'tree-title';
      $header.appendChild($title);
      return;
    }

    const $btn = document.createElement('span');
    $btn.className = 'tree-icon-btn';
    $btn.id = `tree-tools-btn-${i}`;
    $btn.tabIndex = 0;
    $btn.role = 'button';

    const $tpl = document.createElement('template');
    $tpl.innerHTML = item.icon.trim();
    const $svg = $tpl.content.firstElementChild;
    if ($svg) $btn.appendChild($svg);

    if (i === 1) {
      const searchBox = new SearchBox();

      $header.appendChild(searchBox.element);
      this.searchBox = searchBox; // simpan referensi kalau butuh di luar
      const searchBoxEl = searchBox.element;
      $btn.addEventListener('click', () => {
        searchBoxEl.classList.remove('hidden');
        searchBox.focus();
        searchBox.onInput(keyword => this.searchTree(keyword));
        searchBox.close.addEventListener(
          'click',
          () => {
            searchBoxEl.classList.add('hidden');
          },
          { once: true }
        );
      });
    } else if (i === 2) {
    } else if (i === 3) {
      $btn.addEventListener('click', () => {
        dialogNewFile.title = 'new_file';
        dialogNewFile.placeholder = 'placeholder1';
        dialogNewFile.updateLanguage();
        dialogNewFile.show(true);

        const extTypeMap = {
          html: 'html',
          js: 'js',
          css: 'css',
          md: 'md',
          json: 'json',
          txt: 'txt',
        }; // lanjutkan sesuai aslinya

        const validateFileName = value => {
          const trimmed = value.trim();
          const ext = trimmed.split('.').pop().toLowerCase();
          const type = extTypeMap[ext] || 'unknown';

          fileType.setAttribute('data-validation-type', type);

          if (!trimmed) {
            tagErrorFile.textContent = 'Path cannot be empty';
            tagErrorFile.classList.add('show');
            inputNewFile.classList.add('form-error');
            return false;
          }

          if (!/^[a-zA-Z0-9_\-./ ]+$/.test(trimmed)) {
            tagErrorFile.textContent = '!Invalid path name';
            tagErrorFile.classList.add('show');
            inputNewFile.classList.add('form-error');
            return false;
          }

          const fileName = trimmed.split('/').pop();
          const isDuplicate = (root.children || []).some(
            child => child.type === 'file' && child.name === fileName
          );

          if (isDuplicate) {
            tagErrorFile.textContent = 'Path already exists';
            tagErrorFile.classList.add('show');
            inputNewFile.classList.add('form-error');
            return false;
          }

          tagErrorFile.classList.remove('show');
          inputNewFile.classList.remove('form-error');
          return true;
        };

        const onConfirm = () => {
          const value = inputNewFile.value;
          if (!validateFileName(value)) return;

          self.handleAddItem('file', value.trim(), root);
          dialogNewFile.show(false);
          inputNewFile.value = '';
          inputNewFile.classList.remove('form-error');
          tagErrorFile.classList.remove('show');
          confirmBtn.removeEventListener('click', onConfirm);
        };

        inputNewFile.addEventListener('input', () =>
          validateFileName(inputNewFile.value)
        );
        inputNewFile.addEventListener('keydown', e => {
          if (e.key === 'Enter') onConfirm();
        });

        confirmBtn.removeEventListener('click', onConfirm);
        confirmBtn.addEventListener('click', onConfirm);

        cancelBtn.addEventListener('click', () => {
          dialogNewFile.show(false);
          tagErrorFile.classList.remove('show');
          inputNewFile.classList.remove('form-error');
          confirmBtn.removeEventListener('click', onConfirm);
        });
      });
    } else if (i === 4) {
      $btn.addEventListener('click', () => {
        dialogAddFolder.title = 'new_folder';
        dialogAddFolder.placeholder = 'placeholder1';
        dialogAddFolder.updateLanguage();
        dialogAddFolder.show(true);

        const $ok = dialogAddFolder.buttonPositive.button;
        const $cancel = dialogAddFolder.buttonNegative.button;

        const validate = val => {
          const name = val.trim();
          if (!name) {
            $errorFolder.textContent = 'Path Cannot Be Empty';
            $errorFolder.classList.add('show');
            $inputFolder.classList.add('form-error');
            return false;
          }

          if (!/^[a-zA-Z0-9_\-./ ]+$/.test(name)) {
            $errorFolder.textContent = 'Invalid Path Name';
            $errorFolder.classList.add('show');
            $inputFolder.classList.add('form-error');
            return false;
          }

          const parts = name.split('/');
          let cur = root;
          let dup = false;
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!cur.children) break;
            const found = cur.children.find(
              c => c.name === part && c.type === 'directory'
            );
            if (!found) break;
            cur = found;
            if (i === parts.length - 1) dup = true;
          }

          if (dup) {
            $errorFolder.textContent = 'Folder sudah ada.';
            $errorFolder.classList.add('show');
            $inputFolder.classList.add('form-error');
            return false;
          }

          $errorFolder.classList.remove('show');
          $inputFolder.classList.remove('form-error');
          return true;
        };

        const confirm = () => {
          const val = $inputFolder.value;
          if (validate(val)) {
            self.handleAddItem('directory', val.trim(), root);
            dialogAddFolder.show(false);
            $inputFolder.value = '';
            $errorFolder.classList.remove('show');
            $inputFolder.classList.remove('form-error');
            $ok.removeEventListener('click', confirm);
          }
        };

        $inputFolder.addEventListener('input', () =>
          validate($inputFolder.value)
        );
        $inputFolder.addEventListener('keydown', e => {
          if (e.key === 'Enter') confirm();
        });

        $ok.removeEventListener('click', confirm);
        $ok.addEventListener('click', confirm);

        $cancel.addEventListener('click', () => {
          dialogAddFolder.show(false);
          $errorFolder.classList.remove('show');
          $inputFolder.classList.remove('form-error');
          $ok.removeEventListener('click', confirm);
        });
      });
    } else {
      $btn.addEventListener('click', event => {
        const anchor = event.currentTarget;
        dropdown.toggle($btn);
      });
    }

    $iconGroup.appendChild($btn);
  });

  $header.appendChild($iconGroup);
  if (!$header.isConnected) {
    this.mainParentTree.insertAdjacentElement('afterbegin', $header);
  }
};

TreeView.prototype.createDirectoryNode = function createDirectoryNode(
  node,
  level = 0
) {
  if (arguments.length > 2 || arguments.length < 2) {
    console.error('TreeView.prototype.createDirectoryNode');
    return false;
  }
  // Elemen utama direktori (pembungkus)
  const directory = document.createElement('div');
  directory.className = 'directory';

  // Wrapper folder sebagai item clickable
  const wrapper = document.createElement('a');
  wrapper.className = 'folder-item';
  wrapper.tabIndex = 0;
  wrapper.id = `line-${level}`;
  // Pasang event pointerenter agar jalan di HP dan desktop

  // Jika showIndent true, tambahkan indentasi sesuai level

  for (let i = 0; i < level; i++) {
    const indent = document.createElement('span');
    indent.className = 'indent';
    wrapper.appendChild(indent);
  }

  // Chevron SVG (ikon panah)
  const chevron = document.createElement('span');
  chevron.className = 'codicon codicon-chevron-right';

  // Nama folder
  const folderName = document.createElement('span');
  folderName.className = 'folder-name';
  folderName.textContent = node.name;

  // Tambahkan chevron dan nama folder ke wrapper
  wrapper.appendChild(chevron);
  wrapper.appendChild(folderName);

  // Tombol tiga titik (dropdown toggle)
  const _toggle_three_dots = document.createElement('span');
  _toggle_three_dots.className = '_toggle_three_dots-horizontal';
  _toggle_three_dots.tabIndex = 0;
  _toggle_three_dots.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="ic-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg>';
  wrapper.addEventListener('pointerenter', () => {
    // Hapus dari parent sebelumnya (jika ada)
    if (selectedMarker.parentElement) {
      selectedMarker.parentElement.removeChild(selectedMarker);
    }

    // Reset state animasi
    selectedMarker.classList.remove('enter');

    // Tambahkan ke wrapper
    wrapper.insertAdjacentElement('afterbegin', selectedMarker);

    // Trigger animasi dengan delay 1 frame (biar CSS transition aktif)
    requestAnimationFrame(() => {
      selectedMarker.classList.add('enter');
    });
  });

  wrapper.appendChild(_toggle_three_dots);

  // Kontainer konten anak dari direktori
  const content = document.createElement('div');
  content.className = 'directory-content';

  // Inisialisasi dropdown
  const renderDropdown = new CustomDropdown(DROPDOWN_CONTAINERS, wrapper);

  // Setup dropdown folder dari TreeView

  this.setupDirectoryDropdown(node, renderDropdown);

  // Tambahkan opsi "Import Files" ke grup pertama
  renderDropdown._group[0].option.push({
    value: 'Import Files',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 1h12.414L21 6.586V23h-9v-2h7V9h-6V3H5v10H3zm12 2.414V7h3.586zM7.05 14.088l4.858 4.914l-4.858 4.914l-1.422-1.406l2.48-2.508H.997v-2h7.11l-2.48-2.508z" stroke-width="0.1" stroke="currentColor"/></svg>',
    id: 'import-files',
  });

  // Tambahkan dua grup dropdown tambahan
  renderDropdown._group.push(
    {
      label: 'group-2',
      option: [
        {
          value: 'Copy',
          valueLangKey: 'copy',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>',
          id: 'copy-folder',
        },
        {
          value: 'Cut',
          valueLangKey: 'cut',
          icon: 'bi bi-scissors',
          id: 'cut-folder',
        },
        {
          value: 'Rename',
          valueLangKey: 'rename',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>',
          id: 'rename-folder',
        },
        {
          value: 'Copy Path',
          valueLangKey: 'copy_path',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>',
          id: 'copy-path-folder',
        },
      ],
    },
    {
      label: 'group-3',
      option: [
        {
          value: 'Download',
          valueLangKey: 'download',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M216 112v96a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16v-96a16 16 0 0 1 16-16h24a8 8 0 0 1 0 16H56v96h144v-96h-24a8 8 0 0 1 0-16h24a16 16 0 0 1 16 16M93.66 69.66L120 43.31V136a8 8 0 0 0 16 0V43.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32" stroke-width="6.5" stroke="currentColor"/></svg>',
          id: 'export-folder',
        },
        {
          value: 'Delete',
          valueLangKey: 'delete',
          icon: 'codicon codicon-trash',
          id: 'delete-this-folder',
        },
      ],
    }
  );

  // Event: klik pada wrapper (toggle buka/tutup konten)
  /*wrapper.addEventListener("click", () => {
    const isOpen = content.classList.contains("open");

    if (isOpen) {
        // Step 1: set height saat ini untuk trigger transition
        content.style.height = `${content.scrollHeight}px`;

        // Step 2: biarkan layout settle dulu, lalu set ke 0 untuk animasi
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                content.style.height = "0px";
                content.classList.remove("open");
                wrapper.classList.remove("open");
            });
        });

    } else {
        // Step 1: pastikan tingginya 0 dulu
        content.style.height = "0px";
        content.classList.add("open");
        wrapper.classList.add("open");

        // Step 2: biarkan layout update, lalu set height target
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                content.style.height = `${content.scrollHeight}px`;
            });
        });

        // Step 3: reset ke auto setelah transisi selesai
        const onTransitionEnd = () => {
            if (content.classList.contains("open")) {
                content.style.height = "auto";
            }
            content.removeEventListener("transitionend", onTransitionEnd);
        };
        content.addEventListener("transitionend", onTransitionEnd);
    }

    // Tutup dropdown aktif
    if (TreeView.currentOpenDropdown) {
        TreeView.currentOpenDropdown.open(false);
        TreeView.currentOpenDropdown = null;
    }
  

});
*/
  wrapper.addEventListener('click', () => {
    content.classList.toggle('open');
    content.classList.contains('open')
      ? (chevron.style.rotate = '90deg')
      : (chevron.style.rotate = '0deg');
  });

  // Event: klik pada tiga titik (tampilkan dropdown)
  _toggle_three_dots.addEventListener('click', event => {
    event.stopPropagation();
    event.preventDefault();

    // Tutup dropdown lain jika berbeda
    if (
      TreeView.currentOpenDropdown &&
      TreeView.currentOpenDropdown !== renderDropdown
    ) {
      TreeView.currentOpenDropdown.open(false);
    }

    // Toggle dropdown
    const isOpen = DROPDOWN_CONTAINERS.classList.toggle('open');
    renderDropdown.open(isOpen);
    TreeView.currentOpenDropdown = isOpen ? renderDropdown : null;

    // Siapkan listener untuk klik luar dropdown
    const hideDropdown = () => {
      if (TreeView.currentOpenDropdown) {
        TreeView.currentOpenDropdown.open(false);
        TreeView.currentOpenDropdown = null;
      }
    };
    document.removeEventListener('click', hideDropdown);
    document.addEventListener('click', hideDropdown);
  });

  // Event: klik area dropdown supaya tidak menutup TreeView
  /* DROPDOWN_CONTAINERS.addEventListener("click", e => {
        e.stopPropagation()
        if (TreeView.currentOpenDropdown) {
            TreeView.currentOpenDropdown.open(false)
            TreeView.currentOpenDropdown = null
        }
    })
*/
  // Jika ada children, render secara rekursif
  if (Array.isArray(node.children)) {
    node.children.forEach(child => {
      const childNode = this.createNode(child, level + 1);
      if (childNode) content.appendChild(childNode);
    });
  }

  // Tambahkan wrapper dan konten ke elemen utama direktori
  directory.appendChild(wrapper);
  directory.appendChild(content);

  return directory;
};

TreeView.prototype.setupDirectoryDropdown = function setupDirectoryDropdown(
  node,
  dropdownInstance
) {
  let self = this;

  const newFile = new CustomDialog(dialogWrap);
  const newFolder = new CustomDialog(dialogWrap);
  const renameFolder = new CustomDialog(dialogWrap);

  var tagErrorFile = this.createErrorMessageElement('Path tidak boleh kosong');
  var tagErrorFolder = this.createErrorMessageElement(
    'path tidak boleh kosong'
  );
  var tagErrorRenameFolder = this.createErrorMessageElement(
    'path tidak boleh kosong'
  );

  const inputFileEl = newFile.input.input;
  const inputFolderEl = newFolder.input.input;
  const renameFolderInputEl = renameFolder.input.input;

  inputFileEl.parentNode.appendChild(tagErrorFile);
  inputFolderEl.parentNode.appendChild(tagErrorFolder);
  renameFolderInputEl.parentNode.appendChild(tagErrorRenameFolder);

  const fileType = document.createElement('span');
  fileType.className = 'validation-icon-type';
  fileType.setAttribute('data-validation-type', 'unknown');
  inputFileEl.parentNode.appendChild(fileType);

  dropdownInstance.addEventListener('optclick', e => {
    const clicked = e.detail.option;
    if (clicked.id === 'new-file') {
      newFile.title = 'new_file';
      newFile.placeholder = 'placeholder1';
      newFile.updateLanguage();
      newFile.show(true);

      const extTypeMap = {
        html: 'html',
        htm: 'htm',
        css: 'css',
        js: 'js',
        jsx: 'jsx',
        ts: 'ts',
        tsx: 'tsx',
        json: 'json',
        xml: 'xml',
        yml: 'yml',
        yaml: 'yaml',
        md: 'md',
        txt: 'txt',
        ini: 'ini',
        env: 'env',
        cfg: 'cfg',
        conf: 'conf',
        log: 'log',
        gitignore: 'gitignore',
        gitattributes: 'gitattributes',
        editorconfig: 'editorconfig',
        py: 'py',
        rb: 'rb',
        php: 'php',
        java: 'java',
        c: 'c',
        h: 'h',
        cpp: 'cpp',
        hpp: 'hpp',
        cs: 'cs',
        go: 'go',
        rs: 'rs',
        swift: 'swift',
        sh: 'sh',
        bash: 'bash',
        zsh: 'zsh',
        pl: 'pl',
        lua: 'lua',
        csv: 'csv',
        tsv: 'tsv',
        xls: 'xls',
        xlsx: 'xlsx',
        doc: 'doc',
        docx: 'docx',
        pdf: 'pdf',
        rtf: 'rtf',
        jar: 'jar',
        png: 'png',
        jpg: 'jpg',
        jpeg: 'jpeg',
        gif: 'gif',
        svg: 'svg',
        webp: 'webp',
        ico: 'ico',
        bmp: 'bmp',
        mp3: 'mp3',
        wav: 'wav',
        mp4: 'mp4',
        webm: 'webm',
        ogg: 'ogg',
        mov: 'mov',
        ttf: 'ttf',
        otf: 'otf',
        woff: 'woff',
        woff2: 'woff2',
        zip: 'zip',
        rar: 'rar',
        tar: 'tar',
        gz: 'gz',
        tgz: 'tgz',
        '7z': '7z',
        sql: 'sql',
        db: 'db',
        lock: 'lock',
        bak: 'bak',
        map: 'map',
        license: 'license',
        vue: 'vue',
        svelte: 'svelte',
        astro: 'astro',
        dockerfile: 'dockerfile',
        toml: 'toml',
        makefile: 'makefile',
        gradle: 'gradle',
        babelrc: 'babelrc',
        eslintrc: 'eslintrc',
      };

      const validateFileName = value => {
        const trimmed = value.trim();
        const ext = value.split('.').pop().toLowerCase();
        const type = extTypeMap[ext] || 'unknown';

        fileType.setAttribute('data-validation-type', type);

        if (!trimmed) {
          tagErrorFile.textContent = 'Path cannot be empty';
          tagErrorFile.classList.add('show');
          tagErrorFile.id = '';
          inputFileEl.classList.add('form-error');
          return false;
        }

        if (!/^[a-zA-Z0-9_\-./ ]+$/.test(trimmed)) {
          tagErrorFile.textContent = '!Invalid path name';
          tagErrorFile.classList.add('show');
          tagErrorFile.id = 'infalid';
          return false;
        }

        const fileNameOnly = trimmed.split('/').pop();
        const isDuplicate = (node.children || []).some(
          child => child.type === 'file' && child.name === fileNameOnly
        );

        if (isDuplicate) {
          tagErrorFile.textContent = 'Path Already Exists';
          tagErrorFile.classList.add('show');
          inputFileEl.classList.add('form-error');
          tagErrorFile.id = '';
          return false;
        }

        // clear error
        tagErrorFile.classList.remove('show');
        tagErrorFile.id = '';
        inputFileEl.classList.remove('form-error');
        return true;
      };

      const onPositiveClick = () => {
        const inputValue = inputFileEl.value;
        if (!validateFileName(inputValue)) return;

        self.handleAddItem('file', inputValue.trim(), node);
        inputFileEl.value = '';
        newFile.show(false);
        inputFileEl.classList.remove('form-error');
        tagErrorFile.classList.remove('show');

        newFile.buttonPositive.button.removeEventListener(
          'click',
          onPositiveClick
        );
      };

      inputFileEl.addEventListener('input', () =>
        validateFileName(inputFileEl.value)
      );

      inputFileEl.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.keyCode === 13) onPositiveClick();
      });

      newFile.buttonPositive.button.removeEventListener(
        'click',
        onPositiveClick
      );
      newFile.buttonPositive.button.addEventListener('click', onPositiveClick);

      newFile.buttonNegative.button.addEventListener('click', () => {
        newFile.show(false);
        tagErrorFile.classList.remove('show');
        inputFileEl.classList.remove('form-error');
        newFile.buttonPositive.button.removeEventListener(
          'click',
          onPositiveClick
        );
      });
    } else if (clicked.id === 'new-folder') {
      newFolder.title = 'new_folder';
      newFolder.updateLanguage();
      newFolder.show(true);

      const confirmBtn = newFolder.buttonPositive.button;
      const cancelBtn = newFolder.buttonNegative.button;

      const validateFolderName = value => {
        const trimmed = value.trim();
        if (!trimmed) {
          tagErrorFolder.textContent = 'Path Cannot Be Empty';
          tagErrorFolder.classList.add('show');
          inputFolderEl.classList.add('form-error');
          return false;
        }

        if (!/^[a-zA-Z0-9_\-./ ]+$/.test(trimmed)) {
          tagErrorFolder.textContent = 'Infalid Path Name';
          tagErrorFolder.classList.add('show');
          inputFolderEl.classList.add('form-error');
          return false;
        }

        const pathParts = trimmed.split('/');
        let current = node;
        let isDuplicate = false;

        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          if (!current.children) break;

          const found = current.children.find(
            child => child.name === part && child.type === 'directory'
          );
          if (!found) break;

          current = found;
          if (i === pathParts.length - 1) isDuplicate = true;
        }

        if (isDuplicate) {
          tagErrorFolder.textContent = 'Folder sudah ada.';
          tagErrorFolder.classList.add('show');
          inputFolderEl.classList.add('form-error');
          return false;
        }

        tagErrorFolder.classList.remove('show');
        inputFolderEl.classList.remove('form-error');
        return true;
      };

      inputFolderEl.addEventListener('input', () => {
        validateFolderName(inputFolderEl.value);
      });

      inputFolderEl.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          onConfirm();
        }
      });

      const onConfirm = () => {
        const inputValue = inputFolderEl.value;
        if (validateFolderName(inputValue)) {
          self.handleAddItem('directory', inputValue.trim(), node);
          newFolder.show(false);
          inputFolderEl.value = '';
          tagErrorFolder.classList.remove('show');
          inputFolderEl.classList.remove('form-error');
          confirmBtn.removeEventListener('click', onConfirm);
        }
      };

      confirmBtn.removeEventListener('click', onConfirm);
      confirmBtn.addEventListener('click', onConfirm);

      cancelBtn.addEventListener('click', () => {
        newFolder.show(false);
        tagErrorFolder.classList.remove('show');
        inputFolderEl.classList.remove('form-error');
        confirmBtn.removeEventListener('click', onConfirm);
      });
    } else if (clicked.id === 'rename-folder') {
      renameFolder.show(true);

      const confirmBtn = renameFolder.buttonPositive.button;
      const cancelBtn = renameFolder.buttonNegative.button;

      renameFolder.value = node.name;
      renameFolder.input.select();

      const validateFolderName = value => {
        const trimmed = value.trim();
        if (!trimmed) {
          tagErrorRenameFolder.textContent = 'Nama folder tidak boleh kosong.';
          tagErrorRenameFolder.classList.add('show');
          renameFolderInputEl.classList.add('form-error');
          return false;
        }

        if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
          tagErrorRenameFolder.textContent = 'Nama folder tidak valid.';
          tagErrorRenameFolder.classList.add('show');
          renameFolderInputEl.classList.add('form-error');
          return false;
        }

        const rootProject = self.findRootProject(self.data, node);
        const parentNode = self.findParentNode(rootProject, node);

        const isDuplicate = (parentNode?.children || []).some(
          child =>
            child.type === 'directory' &&
            child !== node &&
            child.name === trimmed
        );

        if (isDuplicate) {
          tagErrorRenameFolder.textContent = `Folder "${trimmed}" sudah ada.`;
          tagErrorRenameFolder.classList.add('show');
          renameFolderInputEl.classList.add('form-error');
          return false;
        }

        tagErrorRenameFolder.classList.remove('show');
        renameFolderInputEl.classList.remove('form-error');
        return true;
      };

      renameFolderInputEl.addEventListener('input', () => {
        validateFolderName(renameFolderInputEl.value);
      });

      const onConfirm = () => {
        const newName = renameFolder.value.trim();
        if (!validateFolderName(newName)) return;

        const oldPath = node.path;
        const oldName = node.name;

        node.name = newName;

        const rootProject = self.findRootProject(self.data, node);
        if (!rootProject) {
          console.error('Root project tidak ditemukan saat rename.');
          return;
        }

        const isRoot = node === rootProject;
        let newPath = '/';

        if (!isRoot) {
          const parentNode = self.findParentNode(rootProject, node);
          newPath = `${parentNode?.path || '/'}/${newName}`.replace(
            /\/+/g,
            '/'
          );
          node.path = newPath;
        } else {
          node.path = '/';
        }

        const updateChildPaths = folderNode => {
          if (folderNode.children) {
            for (const child of folderNode.children) {
              child.path = `${folderNode.path}/${child.name}`.replace(
                /\/+/g,
                '/'
              );
              if (child.type === 'directory') {
                updateChildPaths(child);
              }
            }
          }
        };

        if (!isRoot) {
          updateChildPaths(node);
        }

        console.log(
          `[TreeView] Folder di-rename dari "${oldName}" menjadi "${newName}", path baru: ${node.path}`
        );

        document.dispatchEvent(
          new CustomEvent('folder-renamed', {
            detail: {
              oldPath: oldPath,
              newPath: node.path,
              renamedNode: node,
            },
          })
        );

        self.refreshAndSave(rootProject);

        renameFolder.show(false);
        tagErrorRenameFolder.classList.remove('show');
        renameFolderInputEl.classList.remove('form-error');
        confirmBtn.removeEventListener('click', onConfirm);
      };

      confirmBtn.removeEventListener('click', onConfirm);
      confirmBtn.addEventListener('click', onConfirm);

      const closeDialog = () => {
        renameFolder.show(false);
        tagErrorRenameFolder.classList.remove('show');
        renameFolderInputEl.classList.remove('form-error');
        confirmBtn.removeEventListener('click', onConfirm);
      };

      cancelBtn.addEventListener('click', closeDialog);
      renameFolder.buttonNegative.button.addEventListener('click', closeDialog);
    } else if (clicked.id === 'import-files') {
      importFiles({
        node,
        self: this,
        loadingContainer: this.containerLoading,
        findRootProject: this.findRootProject.bind(this),
        refreshAndSave: this.refreshAndSave.bind(this),
      });
    } else if ('copy-folder' === clicked.id);
    else if ('cut-folder' === clicked.id);
    else if ('copy-path-folder' === clicked.id) {
      IcodexEditor.plugins.clipboard.copy(node.path);
    } else if (clicked.id === 'delete-this-folder') {
      const rootProject = self.findRootProject(self.data, node);
      if (!rootProject) return void alert('Root project tidak ditemukan.');

      const parentNode = self.findParentNode(rootProject, node);
      if (!parentNode)
        return void console.error('Parent folder tidak ditemukan.');

      if (
        !window.confirm(
          `Yakin ingin menghapus folder "${node.name}" beserta semua isinya?`
        )
      )
        return;

      const index = parentNode.children.findIndex(child => child === node);
      if (index !== -1) {
        parentNode.children.splice(index, 1);
        document.dispatchEvent(
          new CustomEvent('folder-removed', {
            detail: {
              removedPath: node.path,
            },
          })
        );
        self.refreshAndSave(rootProject);
        console.warn(`Folder "${node.path}" telah dihapus.`);
      } else {
        console.error(`Folder "${node.name}" tidak ditemukan di parent.`);
      }
    } else if ('export-folder' === clicked.id) {
      const rootNode = node;
      window.IcodexEditor.plugins.ZipPlugin.exportTreeToZip(
        rootNode,
        `${rootNode.name}.zip`
      );
    }
  });
};

TreeView.prototype.createFileNode = function createFileNode(node, level = 0) {
  const fileWrapper = document.createElement('a');
  fileWrapper.className = 'file-item';
  fileWrapper.tabIndex = 0;
  fileWrapper.dataset.path = node.path;
  fileWrapper.dataset.name = node.name;

  for (let i = 0; i < level; i++) {
    const indent = document.createElement('span');
    indent.className = 'indent';
    fileWrapper.appendChild(indent);
  }

  const fileName = document.createElement('span');
  fileName.className = 'file-name';
  fileName.id = `line-${level}`;

  const _language_icon = document.createElement('span');
  _language_icon.className = 'icodex-lang-icon';
  // Tentukan ekstensi file → tipe data
  const ext = node.name.split('.').pop().toLowerCase();
  const typeMap = {
    html: 'html',
    css: 'css',
    js: 'js',
    ts: 'ts',
    json: 'json',
    md: 'md',
    txt: 'txt',
    png: 'png',
    jpg: 'jpg',
    jsx: 'jsx',
    svg: 'svg',
    mp4: 'mp4',
    py: 'py',
    java: 'java',
    vue: 'vue',
    yml: 'yml',
    yaml: 'yaml',
    env: 'env',
    lock: 'lock',
    toml: 'toml',
    scss: 'scss',
    htm: 'html',
  };
  _language_icon.setAttribute('data-file-type', typeMap[ext] || 'unknown');
  fileWrapper.appendChild(_language_icon);

  fileName.textContent = node.name;
  fileWrapper.appendChild(fileName);

  this.setupFileDropdown(node, fileWrapper);

  fileWrapper.addEventListener('pointerenter', () => {
    // Hapus dari parent sebelumnya (jika ada)
    if (selectedMarker.parentElement) {
      selectedMarker.parentElement.removeChild(selectedMarker);
    }

    // Reset state animasi
    selectedMarker.classList.remove('enter');

    // Tambahkan ke wrapper
    fileWrapper.insertAdjacentElement('afterbegin', selectedMarker);

    // Trigger animasi dengan delay 1 frame (biar CSS transition aktif)
    requestAnimationFrame(() => {
      selectedMarker.classList.add('enter');
    });
  });

  return fileWrapper;
};

TreeView.prototype.setupFileDropdown = function setupFileDropdown(
  node,
  anchor
) {
  const self = this,
    _toggle_three_dots = document.createElement('span');
  (_toggle_three_dots.className = '_toggle_three_dots-horizontal'),
    (_toggle_three_dots.tabIndex = 0),
    (_toggle_three_dots.role = 'button'),
    (_toggle_three_dots.ariaLabel = 'Open Dropdown'),
    (_toggle_three_dots.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="ic-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg>'),
    anchor.appendChild(_toggle_three_dots);

  const icodeXFileDropdown = new CustomDropdown(DROPDOWN_CONTAINERS, anchor);
  icodeXFileDropdown._group[0].option = [
    {
      valueLangKey: 'copy', // 🔑 key untuk translate
      value: 'Copy', // fallback English
      icon: 'bi bi-copy',
      id: 'copy-file',
    },
    {
      valueLangKey: 'cut',
      value: 'Cut',
      icon: 'bi bi-scissors',
      id: 'cut-file',
    },
    {
      valueLangKey: 'rename',
      value: 'Rename',
      icon: 'bi bi-pencil',
      id: 'rename-file',
    },
    {
      valueLangKey: 'copy_path',
      value: 'Copy Path',
      icon: 'bi bi-copy',
      id: 'copy-path-file',
    },
  ];

  icodeXFileDropdown._group.push({
    label: 'group-2',
    option: [
      {
        valueLangKey: 'delete',
        value: 'Delete',
        icon: 'codicon codicon-trash',
        id: 'delete-this-file',
      },
    ],
  });

  _toggle_three_dots.addEventListener('click', event => {
    event.stopPropagation();
    event.preventDefault();
    //indrajit
    if (
      TreeView.currentOpenDropdown &&
      TreeView.currentOpenDropdown !== icodeXFileDropdown
    ) {
      TreeView.currentOpenDropdown.open(false);
    }

    const isOpen = DROPDOWN_CONTAINERS.classList.toggle('open');
    icodeXFileDropdown.open(isOpen);
    TreeView.currentOpenDropdown = isOpen ? icodeXFileDropdown : null;
  });

  this.mainParentTree.addEventListener('scroll', e => {
    e.stopPropagation();
    if (TreeView.currentOpenDropdown) {
      TreeView.currentOpenDropdown.open(false);
      TreeView.currentOpenDropdown = null;
    }
  });

  const hideDropdown = () => {
    TreeView.currentOpenDropdown &&
      (TreeView.currentOpenDropdown.open(!1),
      (TreeView.currentOpenDropdown = null));
  };

  document.removeEventListener('click', hideDropdown);
  document.addEventListener('click', hideDropdown);

  icodeXFileDropdown.addEventListener('optclick', e => {
    const clicked = e.detail.option;
    if ('rename-file' === clicked.id) {
      const newName = prompt('Rename file:', node.name);
      if (!newName || !newName.trim()) return;
      const trimmedName = newName.trim();
      const rootProject = self.findRootProject(self.data, node);
      if (!rootProject)
        return void console.error(
          'Root project tidak ditemukan saat rename file.'
        );
      const parentNode = self.findParentNode(rootProject, node);
      if (
        (parentNode?.children || []).some(
          child =>
            child !== node &&
            'file' === child.type &&
            child.name === trimmedName
        )
      ) {
        return void alert(
          `File dengan nama "${trimmedName}" sudah ada di folder ini.`
        );
      }
      const oldPath = node.path;
      node.name = trimmedName;
      const newPath = `${parentNode?.path || '/'}/${trimmedName}`.replace(
        /\/+/g,
        '/'
      );
      node.path = newPath;
      self.refreshAndSave(rootProject);
      const renameEvent = new CustomEvent('file-renamed', {
        detail: {
          oldPath: oldPath,
          newPath: newPath,
          newName: trimmedName,
          type: node.type,
        },
      });
      document.dispatchEvent(renameEvent);
      console.log(`File berhasil di-rename dari ${oldPath} → ${newPath}`);
    } else if ('copy-path-file' === clicked.id) {
      IcodexEditor.plugins?.clipboard?.copy(node.path);
    } else if ('delete-this-file' === clicked.id) {
      const type = node.type;
      const name = node.name;
      if (!window.confirm(`Yakin ingin menghapus ${type} "${name}"?`)) return;
      const rootProject = self.findRootProject(self.data, node);
      if (!rootProject)
        return void console.error('Root project tidak ditemukan.');
      const parentNode = self.findParentNode(rootProject, node);
      if (!parentNode || !Array.isArray(parentNode.children)) {
        return void console.error(
          'Parent node tidak ditemukan atau tidak valid.'
        );
      }
      const index = parentNode.children.findIndex(child => child === node);
      if (-1 !== index) {
        parentNode.children.splice(index, 1);
        self.refreshAndSave(rootProject);
        console.log(`${type} "${name}" berhasil dihapus.`);
        const event = new CustomEvent('file-removed', {
          detail: {
            path: node.path,
          },
        });
        document.dispatchEvent(event);
      } else {
        console.error(`${type} "${name}" tidak ditemukan di parent.`);
      }
    }
  });
};

TreeView.prototype.findParentNode = function findParentNode(
  currentNode,
  targetNode
) {
  if (!currentNode || !currentNode.children) return null;
  for (const child of currentNode.children) {
    if (child === targetNode) return currentNode;
    if ('directory' === child.type) {
      const found = this.findParentNode(child, targetNode);
      if (found) return found;
    }
  }
  return null;
};

TreeView.prototype.getOpenFolderPaths = function getOpenFolderPaths() {
  const openFolders = [],
    nodes = document.querySelectorAll('.folder-item.open');
  for (const node of nodes) {
    const path = this.getFullPath(node);
    path && openFolders.push(path);
  }
  return openFolders;
};

TreeView.prototype.getFullPath = function getFullPath(el) {
  const path = [];
  let current = el;
  for (; current && !current.classList.contains('tree-view'); ) {
    if (current.classList.contains('directory')) {
      const nameEl = current.querySelector('.folder-item');
      nameEl && path.unshift(nameEl.textContent.trim());
    }
    current = current.parentElement;
  }
  return path.join('/');
};

TreeView.prototype.reopenFolders = function reopenFolders(paths) {
  document.querySelectorAll('.directory').forEach(dir => {
    const nameEl = dir.querySelector('.folder-item'),
      contentEl = dir.querySelector('.directory-content');
    if (!nameEl || !contentEl) return;
    const fullPath = this.getFullPath(nameEl);
    paths.includes(fullPath) &&
      (nameEl.classList.add('open'), contentEl.classList.add('open'));
  });
};

TreeView.prototype._replaceTree = function _replaceTree(newTreeElement) {
  const oldTree = document.querySelector('.tree-view');
  oldTree &&
    oldTree.parentNode &&
    oldTree.parentNode.replaceChild(newTreeElement, oldTree);
};

TreeView.prototype.handleAddItem = async function handleAddItem(
  type,
  name,
  node,
  content = ''
) {
  if (!name.trim()) return;

  const pathParts = name.trim().split('/').filter(Boolean);
  const isNested = pathParts.length > 1;

  if (type === 'directory' && isNested) {
    return void (await this.createNestedDirectory(name.trim(), node));
  }

  if (type === 'file' && isNested) {
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');

    if (!fileName.trim()) return void console.warn('Nama file tidak valid.');

    const parentFolder = await this.createNestedDirectory(folderPath, node);
    return void (await this.handleAddItem(
      'file',
      fileName,
      parentFolder,
      content
    ));
  }

  const rootProject = this.findRootProject(this.data, node);
  const fullPath = `${node.path || '/'}/${name.trim()}`.replace(/\/+/g, '/');

  console.log(
    `[TreeView] ${
      type === 'directory' ? 'Folder' : 'File'
    } dibuat dengan path: ${fullPath}`
  );

  const item = {
    type: type,
    name: name.trim(),
    path: fullPath,
  };

  if (type === 'directory') {
    item.children = [];
  } else {
    const uint8 =
      typeof content === 'string' ? new TextEncoder().encode(content) : content;
    if (typeof FileContentStorage === 'function') {
      await FileContentStorage.saveContent(fullPath, uint8);
    } else {
      console.warn('class FileContentStorage tidak di definisikan');
    }
  }

  node.children = node.children || [];

  const isDuplicate = node.children.some(
    child => child.name === item.name && child.type === item.type
  );

  if (isDuplicate) {
    console.warn(
      `${type === 'directory' ? 'Folder' : 'File'} "${item.name}" sudah ada.`
    );
  } else {
    node.children.push(item);
    this.sortNodeChildren(node);

    if (rootProject) {
      await updateProject(rootProject);
      this.refreshTree();
    } else {
      console.error('Root project tidak ditemukan!');
    }
  }
};

TreeView.prototype.refreshTree = function refreshTree() {
  const openPaths = this.getOpenFolderPaths();
  const refreshedTree = this.renderTree();

  this._replaceTree(refreshedTree);
  this.reopenFolders(openPaths);
};

TreeView.prototype.refreshAndSave = function refreshAndSave(rootProject) {
  const openPaths = this.getOpenFolderPaths();
  const refreshedTree = this.renderTree();

  this._replaceTree(refreshedTree);
  this.reopenFolders(openPaths);

  if (rootProject) updateProject(rootProject);
};

TreeView.prototype._findPathInProjectTree = function _findPathInProjectTree(
  root,
  targetNode,
  currentPath = []
) {
  if (root === targetNode)
    return currentPath.length ? [...currentPath, root.name].join('/') : '/';
  if (!root.children) return null;
  for (const child of root.children) {
    const result = this._findPathInProjectTree(child, targetNode, [
      ...currentPath,
      root.name,
    ]);
    if (result) return result;
  }
  return null;
};

TreeView.prototype.findRootProject = function findRootProject(
  projectList,
  targetNode
) {
  for (const project of projectList) {
    if (this.containsNode(project, targetNode)) return project;
  }
  return null;
};

TreeView.prototype.containsNode = function containsNode(current, target) {
  return (
    current === target ||
    (!!current.children &&
      current.children.some(child => this.containsNode(child, target)))
  );
};

TreeView.prototype.createNestedDirectory = async function createNestedDirectory(
  path,
  rootNode
) {
  const parts = path.split('/').filter(Boolean);
  let current = rootNode;
  for (const part of parts) {
    current.children || (current.children = []);
    let existing = current.children.find(
      child => child.name === part && 'directory' === child.type
    );
    if (!existing) {
      const fullPath = `${current.path || '/'}/${part}`.replace(/\/+/g, '/');
      (existing = {
        type: 'directory',
        name: part,
        path: fullPath,
        children: [],
      }),
        current.children.push(existing),
        this.sortNodeChildren(current),
        console.log(`[TreeView] Folder bertingkat dibuat: ${fullPath}`);
    }
    current = existing;
  }
  const rootProject = this.findRootProject(this.data, rootNode);
  return (
    rootProject && (await updateProject(rootProject), this.refreshTree()),
    current
  );
};

TreeView.prototype.sortNodeChildren = function sortNodeChildren(node) {
  node.children &&
    node.children.sort((a, b) =>
      a.type === b.type
        ? a.name.localeCompare(b.name)
        : 'directory' === a.type
        ? -1
        : 1
    );
};

TreeView.prototype.addItemFromOutside = function addItemFromOutside(
  type,
  name,
  node,
  content = ''
) {
  return this.handleAddItem(type, name, node, content);
};

TreeView.prototype.instanceMethodCount = function instanceMethodCount() {
  return Object.getOwnPropertyNames(TreeView.prototype).filter(
    key => typeof this[key] === 'function' && key !== 'constructor'
  ).length;
};

Icodex.dataTree ??= [];
Icodex.treeview ??= new TreeView(Icodex.dataTree);

(window.IcodexEditor = window.IcodexEditor || {}),
  (IcodexEditor.plugins = IcodexEditor.plugins || {});
const CRC32 = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = 1 & c ? 3988292384 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return {
    from: function (input) {
      let data =
          input instanceof Uint8Array
            ? input
            : new TextEncoder().encode(String(input)),
        crc = 4294967295;
      for (let i = 0; i < data.length; i++)
        crc = table[255 & (crc ^ data[i])] ^ (crc >>> 8);
      return ~crc >>> 0;
    },
  };
})();
class ZipEntry {
  constructor(name, data, offset) {
    (this.name = name),
      (this.data = data),
      (this.offset = offset),
      (this.size = data.length),
      (this.crc = CRC32.from(data)),
      (this.date = new Date());
  }
  toLocalHeader() {
    const nameBytes = new TextEncoder().encode(this.name),
      header = new Uint8Array(30 + nameBytes.length),
      view = new DataView(header.buffer),
      { dosTime: dosTime, dosDate: dosDate } = this.#getDosDateTime();
    return (
      view.setUint32(0, 67324752, !0),
      view.setUint16(4, 20, !0),
      view.setUint16(6, 0, !0),
      view.setUint16(8, 0, !0),
      view.setUint16(10, dosTime, !0),
      view.setUint16(12, dosDate, !0),
      view.setUint32(14, this.crc, !0),
      view.setUint32(18, this.size, !0),
      view.setUint32(22, this.size, !0),
      view.setUint16(26, nameBytes.length, !0),
      view.setUint16(28, 0, !0),
      header.set(nameBytes, 30),
      header
    );
  }
  toCentralDirectory() {
    const nameBytes = new TextEncoder().encode(this.name),
      header = new Uint8Array(46 + nameBytes.length),
      view = new DataView(header.buffer),
      { dosTime: dosTime, dosDate: dosDate } = this.#getDosDateTime();
    return (
      view.setUint32(0, 33639248, !0),
      view.setUint16(4, 20, !0),
      view.setUint16(6, 20, !0),
      view.setUint16(8, 0, !0),
      view.setUint16(10, 0, !0),
      view.setUint16(12, dosTime, !0),
      view.setUint16(14, dosDate, !0),
      view.setUint32(16, this.crc, !0),
      view.setUint32(20, this.size, !0),
      view.setUint32(24, this.size, !0),
      view.setUint16(28, nameBytes.length, !0),
      view.setUint16(30, 0, !0),
      view.setUint16(32, 0, !0),
      view.setUint16(34, 0, !0),
      view.setUint16(36, 0, !0),
      view.setUint32(38, 0, !0),
      view.setUint32(42, this.offset, !0),
      header.set(nameBytes, 46),
      header
    );
  }
  #getDosDateTime() {
    const d = this.date;
    return {
      dosTime:
        (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2),
      dosDate:
        ((d.getFullYear() - 1980) << 9) |
        ((d.getMonth() + 1) << 5) |
        d.getDate(),
    };
  }
}

class MiniZip {
  constructor() {
    (this.entries = []), (this.offset = 0);
  }
  file(path, content = '') {
    const data =
        content instanceof Uint8Array
          ? content
          : new TextEncoder().encode(String(content)),
      entry = new ZipEntry(path, data, this.offset),
      local = entry.toLocalHeader(),
      full = new Uint8Array(local.length + data.length);
    full.set(local, 0),
      full.set(data, local.length),
      this.entries.push({
        entry: entry,
        data: full,
      }),
      (this.offset += full.length);
  }
  folder(path) {
    const norm = path.endsWith('/') ? path : path + '/';
    return (
      this.file(norm),
      {
        file: (name, content) => this.file(norm + name, content),
        folder: name => this.folder(norm + name),
      }
    );
  }
  generateBlob() {
    const buffers = [],
      central = [];
    for (const { entry: entry, data: data } of this.entries)
      buffers.push(data), central.push(entry.toCentralDirectory());
    const centralStart = this.offset;
    for (const d of central) buffers.push(d), (this.offset += d.length);
    const eocd = new Uint8Array(22),
      view = new DataView(eocd.buffer);
    return (
      view.setUint32(0, 101010256, !0),
      view.setUint16(8, central.length, !0),
      view.setUint16(10, central.length, !0),
      view.setUint32(12, this.offset - centralStart, !0),
      view.setUint32(16, centralStart, !0),
      buffers.push(eocd),
      new Blob(buffers, {
        type: 'application/zip',
      })
    );
  }
}
IcodexEditor.plugins.ZipPlugin = {
  MiniZip: MiniZip,
  exportTreeToZip(rootNode, zipName = 'project.zip') {
    const zip = new MiniZip();
    !(function addToZip(node, zipFolder) {
      if ('file' === node.type) zipFolder.file(node.name, node.content || '');
      else if ('directory' === node.type && node.children) {
        const folder = zipFolder.folder(node.name);
        node.children.forEach(child => addToZip(child, folder));
      }
    })(rootNode, zip);
    const blob = zip.generateBlob(),
      a = document.createElement('a');
    (a.href = URL.createObjectURL(blob)),
      (a.download = zipName),
      a.click(),
      URL.revokeObjectURL(a.href);
  },
};

class TreeTabView {
  #container;
  #treeData = null;

  constructor() {
    this.#container = document.createElement('div');
    this.#container.className = 'tree-view-wrapper';
  }

  getElement() {
    return this.#container;
  }

  // Refresh TreeView berdasarkan project aktif
  async refresh() {
    this.#container.innerHTML = '';

    if (typeof getAllProjects !== 'function') {
      console.error('[TreeTabView] getAllProjects() tidak ditemukan!');
      return;
    }

    let currentId =
      Icodex.currentProjectId || localStorage.getItem('currentProjectId');
    if (!currentId) {
      this.#container.innerHTML =
        "<p style='padding:1rem;'>Pilih proyek terlebih dahulu.</p>";
      return;
    }

    const projects = await getAllProjects();

    const activeProject = projects.find(p => p.id === currentId);

    if (!activeProject) {
      Icodex.currentProjectId = null;
      localStorage.removeItem('currentProjectId');
      this.#container.innerHTML =
        "<p style='padding:1rem;'>Proyek tidak ditemukan.</p>";
      return;
    }

    // Kirim project ke worker
    const worker = new Worker('treeWorkers.js');
    worker.postMessage([activeProject]);

    worker.onmessage = e => {
      if (e.data.type === 'result') {
        this.#treeData = Icodex.treeview.data = e.data.data;
        const treeDom = Icodex.treeview.renderTree();

        this.#container.innerHTML = ''; // Pastikan kosong sebelum append
        this.#container.appendChild(treeDom);

        window.dispatchEvent(
          new CustomEvent('treeViewReady', {
            detail: { treeView: this.#treeData },
          })
        );

        worker.terminate();
      }
    };

    worker.onerror = err => {
      console.error('[TreeTabView] Worker error:', err);
      this.#treeData = Icodex.treeview.data = [activeProject];
      this.#container.innerHTML = '';
      this.#container.appendChild(Icodex.treeview.renderTree());
      worker.terminate();
    };
  }
}

class TabDrawer extends DocumentFragment {
  constructor() {
    super();
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'drawer-tool';
    this.data = [];
    this.#fragmentRender();
  }

  #fragmentRender() {
    const itemIcon = [
      // 0: Send Horizontal
      `<svg class="lucide lucide-send-horizontal" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/><path d="M6 12h16"/></svg>`,

      // 1: Folder
      `<svg class="lucide lucide-folder" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,

      // 2: Search Code
      `<svg class="lucide lucide-search-code" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m13 13.5 2-2.5-2-2.5"/><path d="m21 21-4.3-4.3"/><path d="M9 8.5 7 11l2 2.5"/><circle cx="11" cy="11" r="8"/></svg>`,

      // 3: Bell
      `<svg class="lucide lucide-bell" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>`,

      `<svg class="lucide lucide-settings" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    ];

    for (const i in itemIcon) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.id = 'tab-btn-' + i;
      btn.innerHTML = itemIcon[i];

      this.data.push({ tabbuttons: btn });
      this.wrapper.appendChild(btn);
    }
  }

  get getAllItems() {
    return this.data;
  }
}

class SearchCodePage {
  #container;
  #header;
  #body;

  constructor() {
    this.#container = createElement('div', { className: 'search-code-page' });
    this.#initLayout();
  }

  getElement() {
    return this.#container;
  }

  get isConnected() {
    return this.#container.isConnected;
  }

  #initLayout() {
    this.#header = createElement('nav', { className: 'search-page-tools' });
    this.#body = createElement('div', { className: 'search-page-body' });

    const searchInput = createElement('input', {
      type: 'search',
      className: 'form-input',
      placeholder: 'Cari kode...',
    });

    this.#container.appendChild(this.#header);
    this.#body.appendChild(searchInput);
    this.#container.appendChild(this.#body);
  }
}

class ProjectHome {
  #el = document.createElement('div');
  #searchInput;
  #btnClone;
  #btnAdd;
  #ulList;
  #projectDialog;

  constructor() {
    this.#el.dataset.pageType = 'homepage';

    const wrap = document.createElement('div');
    const toolbar = document.createElement('div');
    toolbar.className = 'project-toolbar';

    this.#searchInput = document.createElement('input');
    this.#searchInput.type = 'text';
    this.#searchInput.className = 'project-search-input';
    this.#searchInput.placeholder = 'Cari Nama Proyek';

    this.#btnClone = document.createElement('button');
    this.#btnClone.className = 'btn toolbar-cln-repo';
    this.#btnClone.innerHTML = `<i class="codicon codicon-repo-clone"></i>`;

    this.#btnAdd = document.createElement('button');
    this.#btnAdd.className = 'btn toolbar-add-project';
    this.#btnAdd.innerHTML = `<i class="codicon codicon-add"></i>`;
    this.#btnAdd.addEventListener('click', () =>
      this.#projectDialog.show(true)
    );

    toolbar.append(this.#searchInput, this.#btnClone, this.#btnAdd);
    wrap.appendChild(toolbar);
    this.#el.appendChild(wrap);

    const nav = document.createElement('nav');
    nav.className = 'project-list';
    this.#ulList = document.createElement('ul');
    this.#ulList.className = 'unstyle';
    nav.appendChild(this.#ulList);
    this.#el.appendChild(nav);

    this.#initDialog();
  }

  get el() {
    return this.#el;
  }

  #initDialog() {
    this.#projectDialog = new CustomDialog(dialogWrap);

    this.#projectDialog.buttonPositive.button.onclick = async () => {
      const name = this.#projectDialog.input.value.trim();
      if (!name) return;

      const newProject = {
        id: Math.random().toString(36).slice(2),
        type: 'directory',
        name: name,
        path: '/',
        children: [],
        createdAt: new Date().toISOString().split('T')[0],
      };

      await addProject(newProject);
      this.addItem(name, newProject.createdAt, newProject.id);
      this.#projectDialog.show(false);
    };

    this.#projectDialog.buttonNegative.setOnclickListener(() => {
      this.#projectDialog.show(false);
    });
  }

  addItem(name, date, id) {
    const li = document.createElement('li');
    li.className = 'project-list-item';
    li.dataset.projectId = id;

    const img = document.createElement('div');
    img.className = 'meta-img';
    img.innerHTML = `<svg
  class="lucide lucide-folder"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
</svg>
`;
    const info = document.createElement('div');
    info.className = 'project-info';

    const title = document.createElement('div');
    title.className = 'project-name';
    title.textContent = name;

    const meta = document.createElement('div');
    meta.className = 'project-meta-desc';
    meta.innerHTML = `<span class="timestamp"><span class="timestamp-label">Dibuat pada: <time datetime="${date}" pubdate="${date}">${date}</time></span></span>`;

    info.append(title, meta);
    li.append(img, info);
    this.#ulList.appendChild(li);

    // Klik item → buka project
    li.addEventListener('click', async () => {
      Icodex.currentProjectId = id;
      localStorage.setItem('currentProjectId', id);

      // Reset tree agar bisa refresh ulang
      const drawer = Icodex.drawerInstance;
      if (drawer) drawer.isTreeRendered = false;

      const treeView = drawer?.getTreeViewInstance();
      if (treeView) await treeView.refresh();

      const folderBtn = document.getElementById('tab-btn-1');
      if (folderBtn) folderBtn.click();
    });
  }

  async loadAllProjectsFromDB() {
    this.#ulList.innerHTML = '';

    const projects = await getAllProjects();
    for (const proj of projects) {
      const exists = this.#ulList.querySelector(
        `[data-project-id="${proj.id}"]`
      );
      if (!exists) this.addItem(proj.name, proj.createdAt, proj.id);
    }

    const savedId = localStorage.getItem('currentProjectId');
    if (savedId) {
      Icodex.currentProjectId = savedId;
      const treeView = Icodex.drawerInstance?.getTreeViewInstance();
      if (treeView) await treeView.refresh();
    }
  }
}

const pageModules = {
  workplace: new ProjectHome(),
};

function renderPageToContent(pageName) {
  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = '';

  const el = pageModules[pageName];
  if (!el) {
    console.warn(`[renderPageToContent] Modul "${pageName}" tidak ditemukan.`);
    return;
  }

  const elDom = el.el;
  if (elDom && !elDom.isConnected) {
    content.appendChild(elDom);

    if (
      pageName === 'workplace' &&
      typeof el.loadAllProjectsFromDB === 'function'
    ) {
      el.loadAllProjectsFromDB();
    }
  }
}

class Drawer {
  isTreeRendered = false;
  #drawerClass = 'file_exploler-drawer';
  #drawerContainer;
  #drawerBody;
  #tabButtons = new TabDrawer();
  #treeViewTab = new TreeTabView();
  #searchPage = new SearchCodePage();
  #settingsPage = Icodex.settingsPage;

  constructor() {
    this.#drawerContainer = document.createElement('aside');
    this.#drawerContainer.className = this.#drawerClass;
    this.#drawerContainer.id = 'explorer';

    this.#setupDrawerLayout();
    const dropdownGWrapper = createElement('div', {
      className: 'dropdown-wrapper',
    });
    this.#drawerContainer.appendChild(dropdownGWrapper);
  }
  resetTreeView() {
    this.isTreeRendered = false;
  }

  #setActiveTab(tabId) {
    const buttons = this.#tabButtons.getAllItems;
    buttons.forEach(item => {
      if (item.tabbuttons) {
        item.tabbuttons.classList.toggle(
          'active',
          item.tabbuttons.id === tabId
        );
      }
    });
  }

  getTreeViewInstance() {
    return this.#treeViewTab;
  }

  #setupDrawerLayout() {
    const header = createElement('div', { className: 'drawer-header' });
    this.#drawerBody = createElement('div', { id: 'drawer-body' });

    // Handle tombol navigasi tab
    this.#tabButtons.getAllItems.forEach(({ tabbuttons: button }) => {
      if (!button) return;

      button.onclick = () => {
        this.#setActiveTab(button.id); // ✅ tandai tombol aktif

        switch (button.id) {
          case 'tab-btn-0':
            this.#showHomePage();
            break;

          case 'tab-btn-1':
            this.#showTreeView();
            break;

          case 'tab-btn-2':
            this.#showSearchPage();
            break;

          case 'tab-btn-4':
            this.#toggleSettingsPage();
            break;
        }
      };
    });

    header.appendChild(this.#tabButtons.wrapper);
    this.#drawerContainer.appendChild(header);
    this.#drawerContainer.appendChild(this.#drawerBody);
  }

  #showHomePage() {
    this.#drawerBody.innerHTML = '';
    history.pushState({ page: '' }, '', '?page=workplace');
    renderPageToContent('workplace');
  }
  // === Ganti isi drawer ke TreeView ===

  async #showTreeView() {
    this.#drawerBody.innerHTML = '';

    if (!this.isTreeRendered) {
      await this.#treeViewTab.refresh(); // ⛏ hanya refresh sekali
      this.isTreeRendered = true;
    }

    const treeElement = this.#treeViewTab.getElement();
    if (!treeElement.isConnected) {
      this.#drawerBody.appendChild(treeElement);
    }
  }

  // === Ganti isi drawer ke halaman pencarian ===
  #showSearchPage() {
    this.#drawerBody.innerHTML = '';

    const searchEl = this.#searchPage.getElement();
    if (!searchEl.isConnected) {
      this.#drawerBody.appendChild(searchEl);
    }
  }

  // Tampilkan / sembunyikan settings page (di luar drawer)
  #toggleSettingsPage() {
    const app = document.getElementById('app');
    const settingsElement = this.#settingsPage.getElement();

    if (settingsElement.isConnected) {
      settingsElement.remove();
    } else {
      app.appendChild(settingsElement);
    }
  }

  getElement() {
    return this.#drawerContainer;
  }

  get isConnected() {
    return this.#drawerContainer.isConnected;
  }
}

const OVERLAY_DRAWER = document.createElement('div');
(OVERLAY_DRAWER.id = 'overlay-drawer'),
  document.body.insertAdjacentElement('afterbegin', OVERLAY_DRAWER);
class ActionBar extends DocumentFragment {
  constructor() {
    super();
    this.#render();
  }

  #render() {
    const container = document.createElement('div');
    container.className = 'actionBar';

    const item = document.createElement('div');
    item.className = 'action-bar-item';

    const toggleButton = document.createElement('span');
    toggleButton.role = 'button';
    toggleButton.className = 'toggler';

    const urlParams = new URLSearchParams(window.location.search);

    toggleButton.addEventListener('click', () => {
      const drawer = document.getElementById('explorer');
      const overlay = document.getElementById('overlay-drawer');

      drawer.classList.add('show');
      overlay.classList.add('show');

      overlay.addEventListener(
        'click',
        function () {
          this.classList.remove('show');
          drawer.classList.remove('show');
        },
        { once: true }
      );
    });

    const icon = document.createElement('i');
    icon.className = 'bi bi-list';

    toggleButton.appendChild(icon);
    item.appendChild(toggleButton);
    container.appendChild(item);
    this.appendChild(container);
  }
}

Icodex.loadPlugins ??= async function (list = [], basePath = '/plugin') {
  for (const file of list) {
    const script = document.createElement('script');
    (script.src = `${basePath}/${file}`),
      (script.type = 'text/javascript'),
      (script.onload = () => {
        console.log(`[PluginLoader] Berhasil load: ${file}`);
      }),
      (script.onerror = () => {
        console.error(`[PluginLoader] Gagal load: ${file}`);
      }),
      document.head.appendChild(script);
  }
};

function openDrawer() {
  const drawer = document.querySelector('#explorer');
  const drawerOv = document.querySelector('#overlay-drawer');

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();

      drawer.classList.toggle('show');
      drawerOv.classList.toggle('show');
    }
  });
}

// Pastikan ini dieksekusi setelah DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  // Ambil ID proyek aktif
  const savedId = localStorage.getItem('currentProjectId');
  if (savedId) Icodex.currentProjectId = savedId;

  const appRoot = document.getElementById('app');

  // Inisialisasi ActionBar
  const actionBar = new ActionBar();
  document.body.insertBefore(actionBar, dialogWrap);

  // Inisialisasi Drawer
  const drawer = new Drawer();
  document.body.insertAdjacentElement('afterbegin', drawer.getElement());
  Icodex.drawerInstance = drawer;
  openDrawer();
  // Panggil tab default (TreeView)
  const tabBtn1 = document.getElementById('tab-btn-1');
  if (tabBtn1) tabBtn1.click();

  // Cek parameter ?page=
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  if (page && typeof renderPageToContent === 'function') {
    renderPageToContent(page); // ← menampilkan halaman workplace jika ?page=workplace
  }

  // Load semua proyek
  await pageModules.workplace.loadAllProjectsFromDB();

  // Refresh TreeView jika ada proyek aktif
  if (Icodex.currentProjectId) {
    const treeView = drawer.getTreeViewInstance();
    if (treeView) await treeView.refresh();
  }

  // Load plugin tambahan
  Icodex.loadPlugins(['Clipboard.js']);

  // Atur ulang unit viewport (vh)
  const updateViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);
  updateViewportHeight();
});
const project = [
  {
    id: 'z6mleomrl5h',
    type: 'directory',
    name: 'MyProject',
    path: '/',
    children: [
      {
        type: 'directory',
        name: 'assets',
        path: '/assets',
        children: [
          {
            type: 'directory',
            name: 'dist',
            path: '/assets/dist',
            children: [
              {
                type: 'directory',
                name: 'css',
                path: '/assets/dist/css',
                children: [
                  {
                    type: 'file',
                    name: 'style.css',
                    path: '/assets/dist/css/style.css',
                  },
                ],
              },
              {
                type: 'directory',
                name: 'js',
                path: '/assets/dist/js',
                children: [
                  {
                    type: 'file',
                    name: 'main.js',
                    path: '/assets/dist/js/main.js',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
