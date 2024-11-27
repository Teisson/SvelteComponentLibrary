<script lang="ts">
    export let data;
    import { JsonView } from "@zerodevx/svelte-json-view";
    import { walletStore, signMessage } from "$lib/wallet";

    const json = { ...data };
    const redirectTwitterUrl = json.twitterRedirectURL;
    let twitter = json?.twitter;
    let discordUsername = json.discord?.username;
    let stage = json.stage;
    let error = false;
    let errormsg = "";

    let message = "";

    async function validate() {
        let valid = await fetch("api/validate?message=" + message);
        if (valid.status === 200) {
            // sign();
            console.log("valid");
        } else {
            error = true;
            console.log("session error-data incorrect");
            errormsg = await valid.json();
        }
    }

    async function sign() {
        const signature = await signMessage(walletStore.config, { message });

        let response = await fetch("/api/sign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                signature,
                message,
            }),
        });
        let data = await response.json();
        if (data.success) {
            window.location.href = "/";
        }
    }

    $: message =
        discordUsername +
        ":" +
        twitter?.userData?.data.username +
        ";" +
        $walletStore.address;
</script>

<h1>register</h1>

{#if error}
    <p class="error">Invalid Registration attempt</p>
    <p class="error">{errormsg.message}</p>{/if}

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
        {twitter?.userData?.data.username}
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
            <button on:click={validate}>Sign to register</button>
        </div>
    {:else}
        <button on:click={walletStore.connect}> Connect wallet </button>
    {/if}
{/if}

{#if json}
    <JsonView {json}></JsonView>
{/if}

<style>
    .error {
        color: red;
        font-size: 15px;
    }
</style>
