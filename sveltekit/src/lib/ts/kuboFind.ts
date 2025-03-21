/**
 * Fonctions pour interagir avec l'API IPFS (Kubo) pour trouver les pairs qui possèdent un CID
 */
import { IPFS_API } from "./kubo";

/**
 * Vérifie si l'API IPFS est disponible
 * @param apiUrl - L'URL de l'API IPFS à vérifier
 * @returns true si l'API est disponible, false sinon
 */
export async function checkIpfsApiAvailable(apiUrl: string = IPFS_API): Promise<boolean> {
  try {
    const versionUrl = new URL("/api/v0/version", apiUrl);

    console.log(`Vérification de l'API IPFS à l'adresse: ${versionUrl}`);

    const response = await fetch(versionUrl, {
      method: "POST", // L'API IPFS n'accepte que les requêtes POST
      headers: {
        Accept: "application/json"
      },
      mode: "cors"
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Version IPFS détectée:", data.Version);
      return true;
    } else {
      console.error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'API IPFS:", error);
    return false;
  }
}

/**
 * Compte le nombre de pairs qui possèdent un CID spécifique
 * @param cid - Le CID à rechercher
 * @param apiUrl - L'URL de l'API IPFS (par défaut: http://localhost:5001)
 * @param maxProviders - Nombre maximum de pairs à récupérer (par défaut: 100)
 * @returns Le nombre de pairs pour ce CID
 */
export async function countCid(
  cid: string,
  apiUrl: string = IPFS_API,
  maxProviders: number = 100
): Promise<number> {
  try {
    // Ajouter le paramètre arg directement dans l'URL pour éviter les problèmes de formatage
    const requestUrl = new URL(
      `/api/v0/routing/findprovs?arg=${encodeURIComponent(cid)}&num-providers=${maxProviders}`,
      apiUrl
    );

    console.log(`Comptage des fournisseurs pour le CID: ${cid}`);

    // Faire la requête HTTP avec les options CORS
    const response = await fetch(requestUrl, {
      method: "POST", // L'API IPFS n'accepte que les requêtes POST
      headers: {
        Accept: "application/json"
      },
      mode: "cors"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    // Utiliser un ReadableStream pour traiter la réponse ligne par ligne sans charger tout en mémoire
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Impossible de lire la réponse");
    }

    // Ensemble pour stocker les IDs uniques de fournisseurs
    const uniqueProviderIds = new Set<string>();
    let buffer = "";

    // Traiter le flux de données
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convertir le chunk en texte et l'ajouter au buffer
      buffer += new TextDecoder().decode(value, { stream: true });

      // Traiter les lignes complètes dans le buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Le dernier élément peut être incomplet

      for (const line of lines) {
        if (line.trim() === "") continue;

        try {
          const data = JSON.parse(line);
          if (data.ID) {
            uniqueProviderIds.add(data.ID);
          }
        } catch (e) {
          console.warn("Erreur lors de l'analyse d'une ligne JSON:", e);
        }
      }
    }

    // Traiter la dernière ligne si nécessaire
    if (buffer.trim() !== "") {
      try {
        const data = JSON.parse(buffer);
        if (data.ID) {
          uniqueProviderIds.add(data.ID);
        }
      } catch (e) {
        console.warn("Erreur lors de l'analyse de la dernière ligne JSON:", e);
      }
    }

    return uniqueProviderIds.size;
  } catch (error) {
    console.error(`Erreur lors de la recherche des fournisseurs pour ${cid}:`, error);
    throw error;
  }
}

/**
 * Récupère la liste complète des pairs qui possèdent un CID spécifique
 * @param cid - Le CID à rechercher
 * @param apiUrl - L'URL de l'API IPFS (par défaut: http://localhost:5001)
 * @param maxProviders - Nombre maximum de pairs à récupérer (par défaut: 100)
 * @returns Un tableau d'IDs de pairs qui possèdent le CID
 */
export async function findCid(
  cid: string,
  apiUrl: string = IPFS_API,
  maxProviders: number = 100
): Promise<string[]> {
  try {
    const count = await countCid(cid, apiUrl, maxProviders);

    // Si nous n'avons besoin que du nombre, nous pouvons éviter de récupérer la liste complète
    if (count === 0) {
      return [];
    }

    // Construire l'URL pour l'API routing/findprovs
    const requestUrl = new URL(
      `/api/v0/routing/findprovs?arg=${encodeURIComponent(cid)}&num-providers=${maxProviders}`,
      apiUrl
    );

    // Faire la requête HTTP avec les options CORS
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      mode: "cors"
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    // Analyser la réponse ligne par ligne (format ndjson)
    const text = await response.text();
    const lines = text.trim().split("\n");

    // Extraire les fournisseurs
    const uniqueProviderIds = new Set<string>();

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.ID) {
          uniqueProviderIds.add(data.ID);
        }
      } catch (e) {
        console.error("Erreur lors de l'analyse de la réponse JSON:", e);
      }
    }

    return Array.from(uniqueProviderIds);
  } catch (error) {
    console.error(`Erreur lors de la recherche des fournisseurs pour ${cid}:`, error);
    throw error;
  }
}
