<script lang="ts">
    export let data;
</script>

<h3>hello TwitterResponse</h3>

{#if data}
    {JSON.stringify(data)}
{/if}
