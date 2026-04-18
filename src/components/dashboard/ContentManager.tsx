import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, BookOpen, Award, GraduationCap, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listMyContent, deleteContent } from "@/lib/profileApi";
import { ContentDialog, type ContentKind } from "./ContentDialog";

const META: Record<ContentKind, { icon: any; titleAr: string; emptyAr: string }> = {
  publications: { icon: BookOpen, titleAr: "الإنتاج العلمي", emptyAr: "لا توجد أبحاث بعد" },
  awards: { icon: Award, titleAr: "الجوائز والتكريم", emptyAr: "لا توجد جوائز بعد" },
  certificates: { icon: GraduationCap, titleAr: "الشهادات", emptyAr: "لا توجد شهادات بعد" },
  events: { icon: Calendar, titleAr: "الفعاليات", emptyAr: "لا توجد فعاليات بعد" },
};

export const ContentManager = ({ userId, kind }: { userId: string; kind: ContentKind }) => {
  const Icon = META[kind].icon;
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: [kind, userId],
    queryFn: () => listMyContent<any>(kind, userId),
  });

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await deleteContent(kind, id);
      qc.invalidateQueries({ queryKey: [kind, userId] });
      toast.success("تم الحذف");
    } catch (err: any) {
      toast.error("فشل الحذف", { description: err.message });
    }
  };

  const handleAdd = () => { setEditing(null); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditing(item); setDialogOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">{META[kind].titleAr}</h3>
          <Badge variant="secondary">{items.length}</Badge>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> إضافة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      ) : items.length === 0 ? (
        <div className="card-elegant p-10 text-center text-muted-foreground text-sm">{META[kind].emptyAr}</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="card-elegant p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-muted-foreground">
                    {kind === "events" ? new Date(item.event_date).getFullYear() : (item.year ?? item.publication_year)}
                  </span>
                </div>
                <p className="font-medium truncate">{item.title_ar}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {kind === "publications" && (item.journal_name || item.publisher)}
                  {kind === "awards" && item.granting_body}
                  {kind === "certificates" && item.issuer}
                  {kind === "events" && item.location}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button onClick={() => handleEdit(item)} size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                <Button onClick={() => handleDelete(item.id)} size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kind={kind}
        userId={userId}
        editing={editing}
        onSaved={() => { qc.invalidateQueries({ queryKey: [kind, userId] }); }}
      />
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "approved") return <Badge className="bg-success text-success-foreground gap-1 border-0"><CheckCircle2 className="h-3 w-3" /> معتمد</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> مرفوض</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> قيد المراجعة</Badge>;
};
