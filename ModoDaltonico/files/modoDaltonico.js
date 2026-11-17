(function() {
	'use strict';

	var config = window.ModoDaltonicoConfig || {};
	var STORAGE_KEY_ACTIVE = 'md_active';
	var STORAGE_KEY_TYPE = 'md_contrast_type';

	var isActive = false;
	var contrastType = config.contrastType || 'protanopia';

	function readLocalStorage(key) {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			return null;
		}
	}

	function writeLocalStorage(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			// Storage not available
		}
	}

	function initState() {
		var storedActive = readLocalStorage(STORAGE_KEY_ACTIVE);
		var storedType = readLocalStorage(STORAGE_KEY_TYPE);

		if (storedActive !== null) {
			isActive = storedActive === 'true';
		} else {
			isActive = !!config.initialActive;
			writeLocalStorage(STORAGE_KEY_ACTIVE, String(isActive));
		}

		if (storedType !== null) {
			contrastType = storedType;
		} else {
			writeLocalStorage(STORAGE_KEY_TYPE, contrastType);
		}
	}

	function createSvgFilters() {
		var svgNS = 'http://www.w3.org/2000/svg';
		var svg = document.createElementNS(svgNS, 'svg');
		svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
		svg.setAttribute('aria-hidden', 'true');

		var defs = document.createElementNS(svgNS, 'defs');

		// Protanopia correction: shift reds toward blue channel
		var filterP = document.createElementNS(svgNS, 'filter');
		filterP.setAttribute('id', 'md-filter-protanopia');
		filterP.setAttribute('color-interpolation-filters', 'linearRGB');
		var matP = document.createElementNS(svgNS, 'feColorMatrix');
		matP.setAttribute('type', 'matrix');
		matP.setAttribute('values',
			'0.567, 0.433, 0,     0, 0 ' +
			'0.558, 0.442, 0,     0, 0 ' +
			'0,     0.242, 0.758, 0, 0 ' +
			'0,     0,     0,     1, 0'
		);
		filterP.appendChild(matP);
		defs.appendChild(filterP);

		// Deuteranopia correction: shift greens toward blue channel
		var filterD = document.createElementNS(svgNS, 'filter');
		filterD.setAttribute('id', 'md-filter-deuteranopia');
		filterD.setAttribute('color-interpolation-filters', 'linearRGB');
		var matD = document.createElementNS(svgNS, 'feColorMatrix');
		matD.setAttribute('type', 'matrix');
		matD.setAttribute('values',
			'0.625, 0.375, 0,   0, 0 ' +
			'0.7,   0.3,   0,   0, 0 ' +
			'0,     0.3,   0.7, 0, 0 ' +
			'0,     0,     0,   1, 0'
		);
		filterD.appendChild(matD);
		defs.appendChild(filterD);

		// Tritanopia correction: shift blues toward red channel
		var filterT = document.createElementNS(svgNS, 'filter');
		filterT.setAttribute('id', 'md-filter-tritanopia');
		filterT.setAttribute('color-interpolation-filters', 'linearRGB');
		var matT = document.createElementNS(svgNS, 'feColorMatrix');
		matT.setAttribute('type', 'matrix');
		matT.setAttribute('values',
			'0.95, 0.05,  0,     0, 0 ' +
			'0,    0.433, 0.567, 0, 0 ' +
			'0,    0.475, 0.525, 0, 0 ' +
			'0,    0,     0,     1, 0'
		);
		filterT.appendChild(matT);
		defs.appendChild(filterT);

		svg.appendChild(defs);
		document.body.appendChild(svg);
	}

	function applyFilter() {
		var body = document.body;
		body.classList.remove('md-active-protanopia', 'md-active-deuteranopia', 'md-active-tritanopia');
		if (isActive) {
			body.classList.add('md-active-' + contrastType);
		}
	}

	function updateUI() {
		var btn = document.getElementById('md-toggle-btn');
		var badge = document.getElementById('md-badge');
		var selector = document.getElementById('md-selector');

		if (btn) {
			btn.setAttribute('aria-pressed', String(isActive));
			btn.title = isActive ? (config.activeLabel || 'Active') : (config.inactiveLabel || 'Inactive');
		}

		if (badge) {
			if (isActive) {
				badge.classList.add('md-badge-visible');
				badge.textContent = (config.strings && config.strings.indicador_activo)
					? config.strings.indicador_activo
					: 'Active';
			} else {
				badge.classList.remove('md-badge-visible');
			}
		}

		if (selector) {
			if (isActive) {
				selector.classList.add('md-selector-visible');
			} else {
				selector.classList.remove('md-selector-visible');
			}
		}

		applyFilter();
	}

	function toggleActive() {
		isActive = !isActive;
		writeLocalStorage(STORAGE_KEY_ACTIVE, String(isActive));
		updateUI();
	}

	function changeContrastType(newType) {
		var validTypes = ['protanopia', 'deuteranopia', 'tritanopia'];
		if (validTypes.indexOf(newType) === -1) {
			return;
		}
		contrastType = newType;
		writeLocalStorage(STORAGE_KEY_TYPE, newType);
		applyFilter();
	}

	function createWidget() {
		var strings = config.strings || {};

		// Badge indicator
		var badge = document.createElement('div');
		badge.id = 'md-badge';
		badge.className = 'md-badge';
		badge.setAttribute('aria-live', 'polite');
		document.body.appendChild(badge);

		// Container
		var container = document.createElement('div');
		container.className = 'md-toggle';
		container.setAttribute('role', 'region');
		container.setAttribute('aria-label', strings.name || 'Colorblind Mode');

		// Contrast type selector
		var selector = document.createElement('div');
		selector.id = 'md-selector';
		selector.className = 'md-selector';

		var types = [
			{ value: 'protanopia', label: strings.protanopia || 'Protanopia' },
			{ value: 'deuteranopia', label: strings.deuteranopia || 'Deuteranopia' },
			{ value: 'tritanopia', label: strings.tritanopia || 'Tritanopia' }
		];

		types.forEach(function(type) {
			var label = document.createElement('label');
			var radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = 'md_contrast';
			radio.value = type.value;
			if (type.value === contrastType) {
				radio.checked = true;
			}
			radio.addEventListener('change', function() {
				changeContrastType(this.value);
			});
			label.appendChild(radio);
			label.appendChild(document.createTextNode(' ' + type.label));
			selector.appendChild(label);
		});

		container.appendChild(selector);

		// Toggle button
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.id = 'md-toggle-btn';
		btn.className = 'md-toggle-btn';
		btn.setAttribute('aria-pressed', 'false');
		btn.title = config.inactiveLabel || 'Inactive';
		btn.innerHTML = '&#128065;'; // Eye icon
		btn.addEventListener('click', toggleActive);
		container.appendChild(btn);

		document.body.appendChild(container);
	}

	function init() {
		initState();
		createSvgFilters();
		createWidget();
		updateUI();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
