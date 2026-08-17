import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Heart } from "lucide-react";

export default async function DashboardSelectorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userWeddings } = await supabase
    .from("weddings")
    .select("*")
    .eq("created_by", user.id);

  if (userWeddings && userWeddings.length === 1) {
    redirect(`/dashboard/${userWeddings[0].id}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <Heart className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Pilih Workspace Pernikahan
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola perencanaan pernikahan Anda atau buat ruang kerja baru.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {userWeddings && userWeddings.length > 0 ? (
            userWeddings.map((w) => (
              <Card
                key={w.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-lg">
                    {w.groom_name} & {w.bride_name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Slug: {w.wedding_slug}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" size="sm">
                    <Link href={`/dashboard/${w.id}`}>Buka Workspace</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-2 border-dashed p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Anda belum memiliki ruang kerja pernikahan.
              </p>
              <Button asChild>
                <Link href="/dashboard/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Workspace Baru
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
