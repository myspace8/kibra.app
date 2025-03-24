import { getCollections } from "./actions"
import CollectionsClient from "./collections-client"

export default async function CollectionsPage() {
  const { success, data: collections, error } = await getCollections()

  return <CollectionsClient collections={collections ?? null} success={success} error={error ?? null} />
}