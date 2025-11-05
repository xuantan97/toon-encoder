<script lang="ts">
    import { encode, decode } from '$lib';
    import { onMount } from 'svelte';

    // primary editor state
    let jsonInput = '';
    let toonOutput = '';
    let error = '';
    let notice = '';
    let isDarkMode = false;

    // font sizes (px)
    let jsonFontSize = 14;
    let toonFontSize = 14;

    // derived stats
    $: jsonStats = getTextStats(jsonInput);
    $: toonStats = getTextStats(toonOutput);
    $: reduction = calculateReduction(jsonStats, toonStats);

    function calculateReduction(json: ReturnType<typeof getTextStats> | null, toon: ReturnType<typeof getTextStats> | null) {
        if (!json || !toon || json.chars === 0 || toon.chars === 0) return { chars: 0, tokens: 0 };
        return {
            chars: Math.round((1 - toon.chars / json.chars) * 100),
            tokens: Math.round((1 - toon.tokens / json.tokens) * 100)
        };
    }

    function getTextStats(text: string) {
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text === '' ? 0 : text.split('\n').length;
        // rough token estimate (approximate)
        const tokens = Math.max(0, Math.ceil(chars / 4));
        return { chars, words, lines, tokens };
    }

    // --- persistence: load / save to localStorage ---
    const LS_PREFIX = 'toon.encode.';

    onMount(() => {
        try {
            const j = localStorage.getItem(LS_PREFIX + 'jsonInput');
            const t = localStorage.getItem(LS_PREFIX + 'toonOutput');
            const theme = localStorage.getItem(LS_PREFIX + 'isDarkMode');
            const jf = localStorage.getItem(LS_PREFIX + 'jsonFontSize');
            const tf = localStorage.getItem(LS_PREFIX + 'toonFontSize');
            if (j != null) jsonInput = j;
            if (t != null) toonOutput = t;
            if (theme != null) {
                isDarkMode = theme === '1';
            } else {
                isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            if (jf) jsonFontSize = Number(jf) || jsonFontSize;
            if (tf) toonFontSize = Number(tf) || toonFontSize;
        } catch (e) {
            console.warn('failed to load saved state', e);
        }
        applyTheme();
        // mark hydrated so reactive saves will persist but not overwrite during init
        hydrated = true;
    });

    // only persist after the component has mounted and initial load finished
    let hydrated = false;
    $: if (hydrated && typeof window !== 'undefined') {
        try {
            localStorage.setItem(LS_PREFIX + 'jsonInput', jsonInput);
            localStorage.setItem(LS_PREFIX + 'toonOutput', toonOutput);
            localStorage.setItem(LS_PREFIX + 'isDarkMode', isDarkMode ? '1' : '0');
            localStorage.setItem(LS_PREFIX + 'jsonFontSize', String(jsonFontSize));
            localStorage.setItem(LS_PREFIX + 'toonFontSize', String(toonFontSize));
        } catch (e) {
            // ignore quota / disabled storage errors
        }
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
    }

    function applyTheme() {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }

    function jsonToToon() {
        try {
            const data = JSON.parse(jsonInput);
            toonOutput = encode(data);
            error = '';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Invalid JSON';
        }
    }

    function toonToJson() {
        try {
            const data = decode(toonOutput);
            jsonInput = JSON.stringify(data, null, 2);
            error = '';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Invalid TOON format';
        }
    }

    // --- additional UI helpers ---
    function copyText(text: string) {
        if (!navigator.clipboard) {
            error = 'Clipboard not available';
            setTimeout(() => (error = ''), 2000);
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            notice = 'Copied to clipboard';
            setTimeout(() => (notice = ''), 1500);
        }, () => {
            error = 'Copy failed';
            setTimeout(() => (error = ''), 2000);
        });
    }

    function increaseFont(panel: 'json' | 'toon') {
        if (panel === 'json') jsonFontSize = Math.min(30, jsonFontSize + 1);
        else toonFontSize = Math.min(30, toonFontSize + 1);
    }

    function decreaseFont(panel: 'json' | 'toon') {
        if (panel === 'json') jsonFontSize = Math.max(10, jsonFontSize - 1);
        else toonFontSize = Math.max(10, toonFontSize - 1);
    }

    function compactJson() {
        try {
            const v = JSON.parse(jsonInput);
            jsonInput = JSON.stringify(v);
            error = '';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Invalid JSON';
        }
    }

    function expandJson() {
        try {
            const v = JSON.parse(jsonInput);
            jsonInput = JSON.stringify(v, null, 2);
            error = '';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Invalid JSON';
        }
    }

    function clearJson() {
        jsonInput = '';
        error = '';
    }

    function clearToon() {
        toonOutput = '';
        error = '';
    }
</script>

<div class="app" class:dark={isDarkMode}>
    <header>
        <h1>JSON to TOON Converter</h1>
        {#if notice}
            <div class="notice">{notice}</div>
        {/if}
    <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme" title="Toggle light / dark theme">
            {#if isDarkMode}
                🌞
            {:else}
                🌙
            {/if}
        </button>
        <a title="Github" href="https://github.com/xuantan97/toon-encoder" class="github-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
            </svg>
        </a>
    </header>

    {#if error}
        <div class="error">
            {error}
        </div>
    {/if}

    <main class="converter">
        <div class="panel">
            <div class="panel-header">
                <h2>JSON</h2>
                <div class="panel-actions">
                    <button class="small-btn" on:click={() => copyText(jsonInput)} aria-label="Copy JSON" title="Copy JSON to clipboard">Copy</button>
                    <button class="small-btn" on:click={clearJson} aria-label="Clear JSON" title="Clear JSON input">Clear</button>
                    <button class="small-btn" on:click={() => increaseFont('json')} aria-label="Increase JSON text" title="Increase JSON text size">A+</button>
                    <button class="small-btn" on:click={() => decreaseFont('json')} aria-label="Decrease JSON text" title="Decrease JSON text size">A-</button>
                    <button class="small-btn" on:click={compactJson} aria-label="Compact JSON" title="Minify/compact JSON">Compact</button>
                    <button class="small-btn" on:click={expandJson} aria-label="Expand JSON" title="Pretty-print/expand JSON">Expand</button>
                </div>
            </div>
            <div class="editor">
                <textarea
                    bind:value={jsonInput}
                    placeholder="Enter JSON here..."
                    spellcheck="false"
                    style="font-size: {jsonFontSize}px"
                ></textarea>
                <div class="stats">
                    <span>{jsonStats.chars} chars</span>
                    <span>{jsonStats.words} words</span>
                    <span>{jsonStats.lines} lines</span>
                    <span>~{jsonStats.tokens} tokens</span>
                </div>
            </div>
        </div>

        <div class="controls">
            <button class="convert-btn" on:click={jsonToToon}>
                JSON → TOON
            </button>
            <button class="convert-btn" on:click={toonToJson}>
                TOON → JSON
            </button>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h2>TOON</h2>
                <div class="panel-actions">
                    <button class="small-btn" on:click={() => copyText(toonOutput)} aria-label="Copy TOON" title="Copy TOON text to clipboard">Copy</button>
                    <button class="small-btn" on:click={clearToon} aria-label="Clear TOON" title="Clear TOON output">Clear</button>
                    <button class="small-btn" on:click={() => increaseFont('toon')} aria-label="Increase TOON text" title="Increase TOON text size">A+</button>
                    <button class="small-btn" on:click={() => decreaseFont('toon')} aria-label="Decrease TOON text" title="Decrease TOON text size">A-</button>
                </div>
            </div>
            <div class="editor">
                <textarea
                    bind:value={toonOutput}
                    placeholder="TOON format will appear here..."
                    spellcheck="false"
                    style="font-size: {toonFontSize}px"
                ></textarea>
                <div class="stats">
                    <span>{toonStats.chars} chars {reduction.chars > 0 ? `(${reduction.chars}% less)` : ''}</span>
                    <span>{toonStats.words} words</span>
                    <span>{toonStats.lines} lines</span>
                    <span>~{toonStats.tokens} tokens {reduction.tokens > 0 ? `(${reduction.tokens}% less)` : ''}</span>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <a href="https://github.com/toon-format/toon/blob/main/README.md" target="_blank" rel="noopener noreferrer">About</a>
        <span>•</span>
        <a href="mailto:contact@xuantan97.com">Contact</a>
    </footer>
</div>

<style>
    :global(:root) {
        --bg-color: #f5f5f5;
        --text-color: #333;
        --editor-bg: #fff;
        --editor-border: #e0e0e0;
        --button-bg: #333;
        --button-text: #fff;
        --button-hover: #555;
    }

    :global(.dark) {
        --bg-color: #1a1a1a;
        --text-color: #fff;
        --editor-bg: #2a2a2a;
        --editor-border: #404040;
        --button-bg: #404040;
        --button-text: #fff;
        --button-hover: #505050;
    }

    .app {
        min-height: 100vh;
        background: var(--bg-color);
        color: var(--text-color);
        display: flex;
        flex-direction: column;
        transition: background-color 0.3s, color 0.3s;
    }

    header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        position: relative;
        min-height: 60px;
    }

    h1 {
        font-size: clamp(1.2rem, 4vw, 2rem);
        font-weight: 600;
        margin: 0;
        text-align: center;
    }

    .theme-toggle {
        position: absolute;
        right: 3.5rem;
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.3s;
        z-index: 10;
    }

    .theme-toggle:hover {
        background: var(--button-hover);
    }

    .github-link {
        position: absolute;
        right: 1rem;
        color: var(--text-color);
        z-index: 10;
    }

    .converter {
        display: flex;
        gap: 0.5rem;
        max-width: 100%;
        margin: 0;
        width: 100%;
        flex: 1;
        overflow: hidden;
        flex-direction: row;
    }

    @media (max-width: 768px) {
        .converter {
            flex-direction: column;
            gap: 0.5rem;
        }

        header {
            padding: 0.75rem;
        }

        .theme-toggle {
            right: 3rem;
        }

        .github-link {
            right: 0.75rem;
        }
    }

    .panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-height: 200px;
    }

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
    }

    .panel-actions {
        display: flex;
        gap: 0.25rem;
        align-items: center;
    }

    .small-btn {
        padding: 0.25rem 0.5rem;
        font-size: 0.85rem;
        border-radius: 4px;
        border: none;
        background: var(--button-bg);
        color: var(--button-text);
        cursor: pointer;
    }

    .small-btn:hover { background: var(--button-hover); }

    h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
        padding: 0 0.5rem;
    }

    .editor {
        flex: 1;
        background: var(--editor-bg);
        overflow: hidden;
        border: 1px solid var(--editor-border);
        display: flex;
        flex-direction: column;
    }

    .stats {
        padding: 0.25rem 0.75rem;
        font-size: 0.8rem;
        color: var(--text-color);
        opacity: 0.7;
        border-top: 1px solid var(--editor-border);
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
    }

    .notice {
        position: absolute;
        left: 1rem;
        top: 1rem;
        background: rgba(0,0,0,0.05);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
        color: var(--text-color);
    }

    textarea {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        color: var(--text-color);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
        font-size: 14px;
        line-height: 1.5;
        padding: 0.75rem;
        resize: none;
        overflow-y: auto;
    }

    textarea:focus {
        outline: none;
    }

    .controls {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    @media (max-width: 768px) {
        .controls {
            flex-direction: row;
            padding: 0.25rem;
        }

        .convert-btn {
            flex: 1;
        }
    }

    .convert-btn {
        padding: 0.5rem 1rem;
        background: var(--button-bg);
        color: var(--button-text);
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s;
        white-space: nowrap;
        font-size: 0.9rem;
    }

    .convert-btn:hover {
        background: var(--button-hover);
    }

    .error {
        background: #ffebee;
        color: #c62828;
        padding: 0.75rem;
        margin: 0 0.5rem 0.5rem;
        text-align: center;
        font-size: 0.9rem;
    }

    footer {
        text-align: center;
        padding: 1rem;
        color: var(--text-color);
        font-size: 0.9rem;
    }

    footer a {
        color: var(--text-color);
        text-decoration: none;
        padding: 0 0.5rem;
    }

    footer a:hover {
        text-decoration: underline;
    }
</style>
