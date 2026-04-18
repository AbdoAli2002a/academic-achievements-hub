import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, BookOpen, Award, FileCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContentTable, fetchPendingContent, reviewContent } from "@/lib/adminApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const tableMeta: Record<ContentTable, { label: string; icon: any }> = {
  publications: { label: "الأبحاث", icon: BookOpen },
  awards: { label: "الجوائز", icon: Award },
  certificates: { label: "الشهادات", icon: FileCheck },
  events: { label: "الفعاليات", icon: Calendar },
};

const PendingList = ({ table }: { table: ContentTable }) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["pending", table],
    queryFn: () => fetchPendingContent(table),
  });

  const mut = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: "approved" | "rejected"; reason?: string }) =>
      reviewContent(table, id, status, user!.id, reason),
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      qc.invalidateQueries({ queryKey: ["pending", table] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: any) => toast.error(e.message ?? "فشل"),
  });

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-elegant p-10 text-center text-muted-foreground">
        لا يوجد محتوى بانتظار المراجعة 🎉
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item: any) => (
        <div key={item.id} className="card-elegant p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={item.profile?.avatar_url ?? undefined} />
                  <AvatarFallback>{item.profile?.name_ar?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{item.profile?.name_ar}</span>
              </div>
              <h4 className="font-bold mb-1">{item.title_ar}</h4>
              {item.title_en && <p className="text-sm text-muted-foreground" dir="ltr">{item.title_en}</p>}
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                {item.publication_year && <span>📅 {item.publication_year}</span>}
                {item.year && <span>📅 {item.year}</span>}
                {item.event_date && <span>📅 {new Date(item.event_date).toLocaleDateString("ar-EG")}</span>}
                {item.journal_name && <span>📖 {item.journal_name}</span>}
                {item.granting_body && <span>🏛️ {item.granting_body}</span>}
                {item.issuer && <span>🏛️ {item.issuer}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => mut.mutate({ id: item.id, status: "approved" })}
                disabled={mut.isPending}
              >
                <Check className="h-4 w-4" /> اعتماد
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  const reason = prompt("سبب الرفض (اختياري)") ?? undefined;
                  mut.mutate({ id: item.id, status: "rejected", reason });
                }}
                disabled={mut.isPending}
              >
                <X className="h-4 w-4" /> رفض
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ApprovalManager = () => {
  const [tab, setTab] = useState<ContentTable>("publications");
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as ContentTable)}>
      <TabsList className="grid grid-cols-4 w-full md:w-auto">
        {(Object.keys(tableMeta) as ContentTable[]).map((k) => {
          const { label, icon: Icon } = tableMeta[k];
          return (
            <TabsTrigger key={k} value={k} className="gap-1.5">
              <Icon className="h-4 w-4" /> {label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {(Object.keys(tableMeta) as ContentTable[]).map((k) => (
        <TabsContent key={k} value={k} className="mt-5">
          <PendingList table={k} />
        </TabsContent>
      ))}
    </Tabs>
  );
};
