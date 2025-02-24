import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  return {
    collectionCid: params.collectionCid
  };
};
