<script lang="ts">
    export let data;

    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    // if (!data.discordUser) {
    //     if (browser) {
    //         setTimeout(() => {
    //             goto("/login");
    //         }, 4000);
    //     }
    // }
    const json = { foo: "bar" };
</script>

{#if data?.discordUser}
    <p>User has authenticated discord</p>
{:else}
    <p>No authentication present, you will be redirected in 4 seconds.</p>
    {JSON.stringify(data)}
    <a
        href="https://discord.com/oauth2/authorize?client_id=1199361192364343397&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fregister%2FdiscordResponse&scope=identify"
        >authenticate discord</a
    >
{/if}

{#if data.error}
    <p>Error: {data.error}</p>
    <p>Status: {data.status}</p>
    <p>Detail: {data.detail}</p>
{/if}
