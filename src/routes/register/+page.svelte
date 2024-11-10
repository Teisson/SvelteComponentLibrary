<script lang="ts">
    export let data;
    import { JsonView } from "@zerodevx/svelte-json-view";
    import { walletStore } from "$lib/wallet";
    const json = { ...data };
    const redirectTwitterUrl = json.twitterRedirectURL;
    let twitter = json?.twitter;
    let discordUsername = json.discord?.username;
    let stage = json.stage;
</script>

<h1>register</h1>

{#if discordUsername}
    <p>Discord Authenticated - {discordUsername}</p>
{/if}
{#if !discordUsername}
    <a
        href="https://discord.com/oauth2/authorize?client_id=1199361192364343397&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fregister%2FdiscordResponse&scope=identify"
        >discord authentication</a
    >
{/if}

{#if twitter}
    <p>
        Twitter Authenticated -
        {twitter?.user?.userData?.data.username}
    </p>
{/if}

{#if !twitter}
    <a href={redirectTwitterUrl}>X authentication</a>
{/if}

{#if stage === "authenticated"}
    {#if $walletStore.isConnected}
        <p>Connected</p>
        <div>
            <p>Address: {$walletStore.address}</p>
            <p>Connected on: {$walletStore.chain?.name}</p>
        </div>
    {:else}
        <button on:click={walletStore.connect}> Connect wallet </button>
    {/if}
{/if}

{#if json}
    <JsonView {json}></JsonView>
{/if}
