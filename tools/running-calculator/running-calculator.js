document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('pace-form');
    if (!form) return;

    const distanceSelect = document.getElementById('distance');
    const customFields = document.getElementById('custom-distance-fields');
    const customDistance = document.getElementById('customDistance');
    const customUnit = document.getElementById('customUnit');
    const modeButtons = document.querySelectorAll('.tool-toggle-button');
    const goalTimeField = document.getElementById('goal-time-field');
    const goalPaceField = document.getElementById('goal-pace-field');

    const timeHours = document.getElementById('timeHours');
    const timeMinutes = document.getElementById('timeMinutes');
    const timeSeconds = document.getElementById('timeSeconds');
    const paceMinutes = document.getElementById('paceMinutes');
    const paceSeconds = document.getElementById('paceSeconds');
    const paceUnit = document.getElementById('paceUnit');

    const errorEl = document.getElementById('pace-error');
    const resultsEl = document.getElementById('pace-results');

    const targetPaceEl = document.getElementById('target-pace');
    const equivPaceEl = document.getElementById('equiv-pace');
    const raceTimeEl = document.getElementById('race-time');
    const easyPaceEl = document.getElementById('easy-pace');
    const longPaceEl = document.getElementById('long-pace');
    const mpPaceEl = document.getElementById('mp-pace');
    const tempoPaceEl = document.getElementById('tempo-pace');
    const intervalPaceEl = document.getElementById('interval-pace');

    const resetBtn = document.getElementById('pace-reset');

    function setHidden(el, hidden) {
        if (!el) return;
        el.classList.toggle('tool-field--hidden', hidden);
        el.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }

    function clearError() {
        if (errorEl) errorEl.textContent = '';
    }

    function showError(msg) {
        if (errorEl) errorEl.textContent = msg;
        setHidden(resultsEl, true);
    }

    function sanitizeInt(value) {
        const n = parseInt(String(value || '').trim(), 10);
        return Number.isFinite(n) ? n : 0;
    }

    function sanitizeFloat(value) {
        const n = parseFloat(String(value || '').trim());
        return Number.isFinite(n) ? n : NaN;
    }

    function getDistanceKm() {
        const preset = distanceSelect.value;
        if (preset === 'marathon') return 42.195;
        if (preset === 'half_marathon') return 21.0975;
        if (preset === '10k') return 10;
        if (preset === '5k') return 5;
        if (preset === 'custom') {
            const d = sanitizeFloat(customDistance.value);
            if (!Number.isFinite(d) || d <= 0) return NaN;
            const unit = customUnit.value;
            return unit === 'mi' ? d * 1.609344 : d;
        }
        return NaN;
    }

    function getTotalSeconds() {
        const h = sanitizeInt(timeHours.value);
        const m = sanitizeInt(timeMinutes.value);
        const s = sanitizeInt(timeSeconds.value);
        return h * 3600 + m * 60 + s;
    }

    function getPaceSecondsPerKm() {
        const m = sanitizeInt(paceMinutes.value);
        const s = sanitizeInt(paceSeconds.value);
        const totalPaceSeconds = m * 60 + s;
        if (!Number.isFinite(totalPaceSeconds) || totalPaceSeconds <= 0) return NaN;
        if (paceUnit.value === 'min_per_km') return totalPaceSeconds;
        return totalPaceSeconds / 1.609344;
    }

    function formatPace(secondsPerUnit) {
        if (!Number.isFinite(secondsPerUnit) || secondsPerUnit <= 0) return '—';
        const total = Math.round(secondsPerUnit);
        const min = Math.floor(total / 60);
        const sec = total % 60;
        return `${min}:${String(sec).padStart(2, '0')}`;
    }

    function paceLabel(unit) {
        return unit === 'min_per_km' ? 'min/km' : 'min/mi';
    }

    function formatDuration(totalSeconds) {
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '—';
        const rounded = Math.round(totalSeconds);
        const h = Math.floor(rounded / 3600);
        const m = Math.floor((rounded % 3600) / 60);
        const s = rounded % 60;
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function renderResults(baseSecondsPerKm, totalRaceSeconds) {
        const desiredUnit = paceUnit.value;
        const secondsPerMile = baseSecondsPerKm * 1.609344;

        const target = desiredUnit === 'min_per_km' ? baseSecondsPerKm : secondsPerMile;
        const equiv = desiredUnit === 'min_per_km' ? secondsPerMile : baseSecondsPerKm;

        targetPaceEl.textContent = `${formatPace(target)} ${paceLabel(desiredUnit)}`;
        equivPaceEl.textContent = `${formatPace(equiv)} ${paceLabel(desiredUnit === 'min_per_km' ? 'min_per_mile' : 'min_per_km')}`;
        raceTimeEl.textContent = formatDuration(totalRaceSeconds);

        const secPerMi = secondsPerMile;
        const easyMi = [secPerMi + 60, secPerMi + 120];
        const longMi = [secPerMi + 30, secPerMi + 90];
        const tempoMi = [secPerMi - 30, secPerMi - 15];
        const intervalMi = [secPerMi - 75, secPerMi - 45];

        function rangeForDesiredUnit(miRange) {
            if (desiredUnit === 'min_per_mile') {
                return miRange;
            }
            return [miRange[0] / 1.609344, miRange[1] / 1.609344];
        }

        function fmtRange(rangeSec) {
            const lo = Math.min(rangeSec[0], rangeSec[1]);
            const hi = Math.max(rangeSec[0], rangeSec[1]);
            return `${formatPace(lo)}–${formatPace(hi)} ${paceLabel(desiredUnit)}`;
        }

        easyPaceEl.textContent = fmtRange(rangeForDesiredUnit(easyMi));
        longPaceEl.textContent = fmtRange(rangeForDesiredUnit(longMi));
        mpPaceEl.textContent = `${formatPace(target)} ${paceLabel(desiredUnit)}`;
        tempoPaceEl.textContent = fmtRange(rangeForDesiredUnit(tempoMi));
        intervalPaceEl.textContent = fmtRange(rangeForDesiredUnit(intervalMi));

        setHidden(resultsEl, false);
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function onDistanceChange() {
        const isCustom = distanceSelect.value === 'custom';
        setHidden(customFields, !isCustom);
    }

    function getCalcMode() {
        const selected = document.querySelector('.tool-toggle-button.active');
        return selected ? selected.dataset.mode : 'by_time';
    }

    function onModeChange() {
        const mode = getCalcMode();
        setHidden(goalTimeField, mode !== 'by_time');
        setHidden(goalPaceField, mode !== 'by_pace');
    }

    distanceSelect.addEventListener('change', onDistanceChange);
    modeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            modeButtons.forEach(function (otherButton) {
                const isActive = otherButton === button;
                otherButton.classList.toggle('active', isActive);
                otherButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
            onModeChange();
        });
    });
    onDistanceChange();
    onModeChange();

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearError();

        const distanceKm = getDistanceKm();
        if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
            showError('Please enter a valid distance.');
            return;
        }

        const mode = getCalcMode();
        let totalSeconds;
        let secondsPerKm;
        if (mode === 'by_pace') {
            secondsPerKm = getPaceSecondsPerKm();
            if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
                showError('Please enter a valid goal pace.');
                return;
            }
            totalSeconds = secondsPerKm * distanceKm;
        } else {
            totalSeconds = getTotalSeconds();
            if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
                showError('Please enter a valid goal time (at least 1 second).');
                return;
            }
            secondsPerKm = totalSeconds / distanceKm;
        }

        if (totalSeconds > 7 * 24 * 3600) {
            showError('That result looks too large. Please double-check your inputs.');
            return;
        }

        if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
            showError('Unable to calculate pace. Please double-check your inputs.');
            return;
        }

        renderResults(secondsPerKm, totalSeconds);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.reset();
            clearError();
            setHidden(resultsEl, true);
            onDistanceChange();
            onModeChange();
        });
    }
});
