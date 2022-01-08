//Based on track-focus: https://github.com/ten1seven/track-focus
// track-focus v 1.0.0 | Author: Jeremy Fields [jeremy.fields@vget.com], 2015 | License: MIT
// inspired by: http://irama.org/pkg/keyboard-focus-0.3/jquery.keyboard-focus.js

const body = document.body;
let usingMouse = true;

function preFocus(event) {
	if(event.type === 'keydown' && event.which === 18) {
		return;//ignore alt-tabbing out of the wondow
	}

	usingMouse = (event.type === 'mousedown');
};

function addFocus(event) {
	body.classList.add(usingMouse ? 'focus_mouse' : 'focus_keyboard');
};

function removeFocus(event) {
	body.classList.remove('focus_mouse');
	body.classList.remove('focus_keyboard');
};

body.addEventListener('keydown', preFocus);
body.addEventListener('mousedown', preFocus);
body.addEventListener('focusin', addFocus);
body.addEventListener('focusout', removeFocus);
