const COL_TYPES = ['text', 'number', 'date', 'boolean'];

const state = {
	columns: [
		{ id: 'col-1', name: 'Task', type: 'text' },
		{ id: 'col-2', name: 'Start', type: 'date' },
		{ id: 'col-3', name: 'End', type: 'date' },
	],
	rows: [
		{ id: 'row-1', values: { 'col-1': 'Example', 'col-2': '', 'col-3': '' } },
	],
	gantt: { startColId: 'col-2', endColId: 'col-3', nextColId: null },
};

const gridEl = document.getElementById('grid');
const addRowBtn = document.getElementById('add-row');
const addColBtn = document.getElementById('add-col');
const ganttStartSel = document.getElementById('gantt-start');
const ganttEndSel = document.getElementById('gantt-end');
const ganttNextSel = document.getElementById('gantt-next');
const ganttCanvas = document.getElementById('gantt');
const ctx = ganttCanvas.getContext('2d');
const powerOffBtn = document.getElementById('power-off');

function persist() {
	localStorage.setItem('mono-grid-state', JSON.stringify(state));
}

function load() {
	const raw = localStorage.getItem('mono-grid-state');
	if (!raw) return;
	try {
		const parsed = JSON.parse(raw);
		Object.assign(state, parsed);
	} catch {}
}

function createEl(tag, props = {}, children = []) {
	const el = document.createElement(tag);
	Object.assign(el, props);
	for (const child of children) el.append(child);
	return el;
}

function renderHeader() {
	const thead = document.createElement('thead');
	const row = document.createElement('tr');
	for (const col of state.columns) {
		const th = document.createElement('th');
		const nameInput = createEl('input', { value: col.name });
		nameInput.addEventListener('input', () => { col.name = nameInput.value; syncGanttSelectors(); persist(); });
		const typeSel = createEl('select', { className: 'add-col-type' });
		for (const t of COL_TYPES) {
			const opt = createEl('option', { value: t, textContent: t });
			if (t === col.type) opt.selected = true;
			typeSel.append(opt);
		}
		typeSel.addEventListener('change', () => { col.type = typeSel.value; renderGrid(); drawGantt(); persist(); });
		th.append(nameInput, typeSel);
		row.append(th);
	}
	thead.append(row);
	return thead;
}

function coerceValueForType(value, type) {
	if (type === 'number') return value === '' ? '' : Number(value);
	if (type === 'boolean') return Boolean(value);
	return value;
}

function renderBody() {
	const tbody = document.createElement('tbody');
	for (const row of state.rows) {
		const tr = document.createElement('tr');
		for (const col of state.columns) {
			const td = document.createElement('td');
			let inputEl;
			if (col.type === 'boolean') {
				inputEl = createEl('input', { type: 'checkbox' });
				inputEl.checked = Boolean(row.values[col.id]);
				inputEl.addEventListener('change', () => { row.values[col.id] = inputEl.checked; drawGantt(); persist(); });
			} else {
				inputEl = createEl('input', { type: col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text' });
				const current = row.values[col.id] ?? '';
				inputEl.value = current;
				inputEl.addEventListener('input', () => { row.values[col.id] = coerceValueForType(inputEl.value, col.type); drawGantt(); persist(); });
			}
			td.append(inputEl);
			tr.append(td);
		}
		tbody.append(tr);
	}
	return tbody;
}

function renderGrid() {
	gridEl.innerHTML = '';
	gridEl.append(renderHeader(), renderBody());
}

function addRow() {
	const id = `row-${crypto.randomUUID()}`;
	const values = {};
	for (const col of state.columns) values[col.id] = '';
	state.rows.push({ id, values });
	persist();
	renderGrid();
	drawGantt();
}

function addCol() {
	const id = `col-${crypto.randomUUID()}`;
	state.columns.push({ id, name: `Column ${state.columns.length + 1}`, type: 'text' });
	for (const row of state.rows) row.values[id] = '';
	syncGanttSelectors();
	persist();
	renderGrid();
}

function syncGanttSelectors() {
	for (const sel of [ganttStartSel, ganttEndSel, ganttNextSel]) {
		sel.innerHTML = '';
		const emptyOpt = createEl('option', { value: '', textContent: sel === ganttNextSel ? '(none)' : '(select)' });
		if (sel === ganttNextSel) emptyOpt.selected = state.gantt.nextColId == null;
		sel.append(emptyOpt);
		for (const col of state.columns.filter(c => c.type === 'date')) {
			const opt = createEl('option', { value: col.id, textContent: col.name });
			if (sel === ganttStartSel && col.id === state.gantt.startColId) opt.selected = true;
			if (sel === ganttEndSel && col.id === state.gantt.endColId) opt.selected = true;
			if (sel === ganttNextSel && col.id === state.gantt.nextColId) opt.selected = true;
			sel.append(opt);
		}
	}
}

function dateFromCell(val) {
	if (!val) return null;
	const d = new Date(val);
	return isNaN(d.getTime()) ? null : d;
}

function drawGantt() {
	const startCol = state.columns.find(c => c.id === state.gantt.startColId);
	const endCol = state.columns.find(c => c.id === state.gantt.endColId);
	const nextCol = state.columns.find(c => c.id === state.gantt.nextColId);
	const rows = state.rows;

	const dates = [];
	for (const r of rows) {
		const s = startCol ? dateFromCell(r.values[startCol.id]) : null;
		const e = endCol ? dateFromCell(r.values[endCol.id]) : null;
		const n = nextCol ? dateFromCell(r.values[nextCol.id]) : null;
		if (s) dates.push(s);
		if (e) dates.push(e);
		if (n) dates.push(n);
	}
	const width = ganttCanvas.clientWidth;
	const height = ganttCanvas.height;
	ganttCanvas.width = width;
	ctx.clearRect(0, 0, width, height);
	ctx.strokeStyle = '#e5e7eb';
	ctx.fillStyle = '#111111';

	if (dates.length === 0) return;
	const min = new Date(Math.min(...dates.map(d => d.getTime())));
	const max = new Date(Math.max(...dates.map(d => d.getTime())));
	if (min.getTime() === max.getTime()) max.setDate(max.getDate() + 1);

	function xFor(date) {
		const t = date.getTime();
		return ((t - min.getTime()) / (max.getTime() - min.getTime())) * (width - 40) + 20;
	}

	const rowHeight = 30;
	rows.forEach((r, idx) => {
		const y = 20 + idx * rowHeight;
		ctx.strokeStyle = '#e5e7eb';
		ctx.beginPath();
		ctx.moveTo(0, y + 10);
		ctx.lineTo(width, y + 10);
		ctx.stroke();

		if (startCol && endCol) {
			const s = dateFromCell(r.values[startCol.id]);
			const e = dateFromCell(r.values[endCol.id]);
			if (s && e) {
				const x1 = xFor(s);
				const x2 = xFor(e);
				ctx.fillStyle = '#111111';
				ctx.fillRect(Math.min(x1, x2), y, Math.abs(x2 - x1), 12);
			}
		}
		if (endCol && nextCol) {
			const e = dateFromCell(r.values[endCol.id]);
			const n = dateFromCell(r.values[nextCol.id]);
			if (e && n) {
				const x1 = xFor(e);
				const x2 = xFor(n);
				ctx.fillStyle = '#6b7280';
				ctx.fillRect(Math.min(x1, x2), y + 14, Math.abs(x2 - x1), 8);
			}
		}
	});
}

addRowBtn.addEventListener('click', addRow);
addColBtn.addEventListener('click', addCol);
[ganttStartSel, ganttEndSel, ganttNextSel].forEach(sel => sel.addEventListener('change', () => {
	state.gantt.startColId = ganttStartSel.value || null;
	state.gantt.endColId = ganttEndSel.value || null;
	state.gantt.nextColId = ganttNextSel.value || null;
	persist();
	drawGantt();
}));

window.addEventListener('resize', drawGantt);

powerOffBtn.addEventListener('click', async () => {
	powerOffBtn.disabled = true;
	try {
		await fetch('/api/power-off', { method: 'POST' });
	} catch {}
	// Give server a moment to close
	setTimeout(() => {
		window.close();
	}, 300);
});

load();
renderGrid();
syncGanttSelectors();
drawGantt();
