<script lang="ts">
  import { createKuboClient } from "$lib/ts/kubo";
  import { checkIpfsApiAvailable, countCid } from "$lib/ts/kuboFind";
  import { onMount } from "svelte";

  let cid = "";
  let providerCount = 0;
  let isLoading = false;
  let error = "";
  let testCid = "";
  let apiAvailable = false;

  async function checkPeers() {
    if (!cid) {
      error = "Veuillez entrer un CID valide";
      return;
    }

    // Vérifier d'abord si l'API IPFS est disponible
    if (!apiAvailable) {
      apiAvailable = await checkIpfsApiAvailable();
      if (!apiAvailable) {
        error = "L'API IPFS n'est pas disponible. Vérifiez que votre nœud IPFS est en cours d'exécution.";
        return;
      }
    }

    error = "";
    isLoading = true;
    providerCount = 0;

    try {
      // Utiliser la fonction countCid qui retourne directement le nombre
      providerCount = await countCid(cid);
    } catch (err: Error | unknown) {
      const error_obj = err as Error;
      console.error("Erreur complète:", err);

      // Gérer spécifiquement l'erreur "Failed to fetch"
      if (error_obj.message === "Failed to fetch") {
        error = `Erreur: Impossible de se connecter à l'API IPFS. Vérifiez que votre nœud IPFS est en cours d'exécution.`;
      } else {
        error = `Erreur: ${error_obj.message || "Impossible de trouver les pairs"}`;
      }

      providerCount = 0;
    } finally {
      isLoading = false;
    }
  }

  // Initialiser la page au chargement
  onMount(async () => {
    // Vérifier si l'API IPFS est disponible
    apiAvailable = await checkIpfsApiAvailable();

    if (!apiAvailable) {
      error = "L'API IPFS n'est pas disponible. Vérifiez que votre nœud IPFS est en cours d'exécution.";
      console.error(error);
      return;
    }

    // Utiliser un CID connu pour le test
    testCid = "QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A";
    console.log("CID de test:", testCid);

    // Essayer de créer un nouveau CID en arrière-plan (optionnel)
    try {
      const response = await fetch("http://localhost:5001/api/v0/add", {
        method: "POST",
        body: new Blob(["Test content for provider search"]),
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.Hash) {
          testCid = data.Hash;
          console.log("Nouveau CID de test créé:", testCid);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la création du CID de test:", err);
    }
  });
</script>

<div class="container mx-auto p-4">
  <h1 class="mb-4 text-2xl font-bold">Trouver les pairs qui possèdent un CID</h1>

  <div class="mb-4">
    <p class="mb-2">Cette page vous permet de vérifier combien de pairs dans le réseau IPFS possèdent un CID spécifique.</p>

    <div class="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
      <p class="font-bold">Prérequis :</p>
      <p>Pour utiliser cette fonctionnalité, vous devez avoir un nœud IPFS en cours d'exécution localement.</p>
      <ol class="ml-6 mt-2 list-decimal">
        <li>Assurez-vous que IPFS est installé sur votre machine</li>
        <li>Démarrez le démon IPFS avec la commande <code>ipfs daemon</code></li>
        <li>Vérifiez que l'API est accessible à l'adresse <code>http://localhost:5001</code></li>
      </ol>
    </div>

    {#if testCid}
      <div class="mb-4 rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700">
        <p>CID de test créé: <button class="underline" on:click={() => (cid = testCid)}>{testCid}</button> (cliquez pour l'utiliser)</p>
      </div>
    {/if}
  </div>

  <div class="mb-4">
    <label for="cid" class="mb-2 block">CID à vérifier:</label>
    <div class="flex gap-2">
      <input id="cid" type="text" bind:value={cid} class="flex-1 rounded border p-2" placeholder="Entrez un CID (ex: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco)" />
      <button on:click={checkPeers} class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" disabled={isLoading}>
        {isLoading ? "Recherche..." : "Vérifier"}
      </button>
    </div>
  </div>

  {#if error}
    <div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
      <p class="font-bold">Erreur :</p>
      <p>{error}</p>

      {#if error.includes("n'est pas disponible") || error.includes("Failed to fetch")}
        <div class="mt-2">
          <p class="font-bold">Solutions possibles :</p>
          <ol class="ml-6 list-decimal">
            <li>Vérifiez que le démon IPFS est en cours d'exécution avec <code>ipfs daemon</code></li>
            <li>
              Assurez-vous que l'API CORS est configurée correctement :
              <pre class="mt-1 overflow-x-auto bg-gray-100 p-2 text-sm">ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'</pre>
            </li>
            <li>Redémarrez le démon IPFS après avoir modifié la configuration</li>
          </ol>
        </div>
      {/if}
    </div>
  {/if}

  {#if providerCount > 0}
    <div class="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
      <p>Ce CID est fourni par <strong>{providerCount}</strong> pairs dans le réseau IPFS.</p>
    </div>
  {:else if providerCount === 0 && !error && !isLoading}
    <div class="rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
      <p>Aucun pair ne fournit actuellement ce CID dans le réseau IPFS.</p>
    </div>
  {/if}
</div>

<style>
  input,
  button {
    font-size: 1rem;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
