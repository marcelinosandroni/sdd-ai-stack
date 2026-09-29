import { exampleRepository } from "@/features/example/container";
import { ExampleList } from "@/features/example/ui/example-list";
import { getSession } from "@/shared/server/auth";

export async function ExampleBoard() {
  const user = await getSession();
  const examples = user ? await exampleRepository.listByOwner(user.id) : [];

  return <ExampleList examples={examples} signedIn={Boolean(user)} />;
}
