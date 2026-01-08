class Framework {
    getPermanentModal(opts = {}) {
        const modal = document.createElement('div');
        modal.className = 'fw-modal';
        modal.style.position = 'fixed';
        modal.style.right = '10px';
        modal.style.top = '60px';
        modal.style.zIndex = 9999;
        modal.style.background = opts.theme === 'light' ? '#fff' : '#222';
        modal.style.color = opts.theme === 'light' ? '#000' : '#fff';
        modal.style.border = '1px solid #ccc';
        modal.style.padding = '8px';
        modal.style.width = opts.width || '250px';
        modal.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

        if (opts.title) {
            const h = document.createElement('div');
            h.textContent = opts.title;
            h.style.fontWeight = '600';
            h.style.marginBottom = '6px';
            modal.appendChild(h);
        }

        document.body.appendChild(modal);

        return {
            ClearFormModal: () => {
                // Keep title if present
                const title = opts.title ? opts.title : '';
                modal.innerHTML = title ? `<div style="font-weight:600;margin-bottom:6px">${title}</div>` : '';
            },
            AddSliderToModal: (label, min, max, value, cb) => {
                const container = document.createElement('div');
                container.style.marginBottom = '8px';

                const lbl = document.createElement('div');
                lbl.textContent = label;
                lbl.style.fontSize = '12px';
                lbl.style.marginBottom = '4px';

                const input = document.createElement('input');
                input.type = 'range';
                input.min = min;
                input.max = max;
                input.value = value;
                input.style.width = '100%';

                const valueSpan = document.createElement('div');
                valueSpan.textContent = input.value;
                valueSpan.style.fontSize = '12px';
                valueSpan.style.textAlign = 'right';

                input.addEventListener('input', () => {
                    valueSpan.textContent = input.value;
                    try { cb(Number(input.value)); } catch (e) { /* swallow */ }
                });

                container.appendChild(lbl);
                container.appendChild(input);
                container.appendChild(valueSpan);
                modal.appendChild(container);
            }
        };
    }
}

window.Framework = Framework;
export { Framework };
