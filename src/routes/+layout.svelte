<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
    :global(body) {
        margin: 8px;
        background-color: #f5f5f5;
    }

    :global(body.dark) {
        background-color: #1a1a1a;
    }

    :global(html) {
        background-color: #f5f5f5;
    }

    :global(html.dark) {
        background-color: #1a1a1a;
    }
</style>