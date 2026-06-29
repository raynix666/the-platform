import { redirect } from "next/navigation";

export default function MemberRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return searchParams.then((params) => {
    const id = params.id?.trim().toUpperCase();
    if (id) {
      redirect(`/member/${id}`);
    }
    redirect("/");
  });
}
