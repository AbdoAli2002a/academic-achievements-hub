import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Plus, Trash2, Pencil, Trophy, Newspaper, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  fetchDeanProfile, upsertDeanProfile,
  fetchCollegeAchievements, upsertCollegeAchievement, deleteCollegeAchievement,
  fetchCollegeNews, upsertCollegeNews, deleteCollegeNews,
  type DeanProfile, type CollegeAchievement, type CollegeNews,
} from "@/lib/deanApi";

export const DeanPanel = () => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-auto p-1">
        <TabsTrigger value="profile" className="gap-1.5 py-2 text-xs md:text-sm"><UserIcon className="h-4 w-4" /> بيانات العميد</TabsTrigger>
        <TabsTrigger value="achievements" className="gap-1.5 py-2 text-xs md:text-sm"><Trophy className="h-4 w-4" /> إنجازات الكلية</TabsTrigger>
        <TabsTrigger value="news" className="gap-1.5 py-2 text-xs md:text-sm"><Newspaper className="h-4 w-4" /> الأخبار</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6"><DeanProfileForm /></TabsContent>
      <TabsContent value="achievements" className="mt-6"><AchievementsManager /></TabsContent>
      <TabsContent value="news" className="mt-6"><NewsManager /></TabsContent>
    </Tabs>
  );
};

const DeanProfileForm = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["dean-profile"], queryFn: fetchDeanProfile });
  const [form, setForm] = useState<Partial<DeanProfile>>({});

  useEffect(() => { if (data) setForm(data); }, [data]);

  const mut = useMutation({
    mutationFn: () => upsertDeanProfile(form),
    onSuccess: () => { toast.success("تم الحفظ"); qc.invalidateQueries({ queryKey: ["dean-profile"] }); },
    onError: (e: any) => toast.error(e.message ?? "فشل الحفظ"),
  });

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  const set = (k: keyof DeanProfile, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="card-elegant p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="الاسم بالعربية *"><Input value={form.name_ar ?? ""} onChange={(e) => set("name_ar", e.target.value)} /></Field>
        <Field label="الاسم بالإنجليزية"><Input value={form.name_en ?? ""} onChange={(e) => set("name_en", e.target.value)} dir="ltr" /></Field>
        <Field label="اللقب بالعربية"><Input value={form.title_ar ?? ""} onChange={(e) => set("title_ar", e.target.value)} placeholder="أ.د. عميد الكلية" /></Field>
        <Field label="اللقب بالإنجليزية"><Input value={form.title_en ?? ""} onChange={(e) => set("title_en", e.target.value)} dir="ltr" /></Field>
        <Field label="البريد الإلكتروني"><Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} type="email" dir="ltr" /></Field>
        <Field label="رقم الهاتف"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} dir="ltr" /></Field>
        <Field label="رابط الصورة الشخصية" full><Input value={form.avatar_url ?? ""} onChange={(e) => set("avatar_url", e.target.value)} dir="ltr" placeholder="https://..." /></Field>
      </div>
      <Field label="السيرة الذاتية المختصرة (عربي)"><Textarea rows={3} value={form.bio_ar ?? ""} onChange={(e) => set("bio_ar", e.target.value)} /></Field>
      <Field label="Bio (English)"><Textarea rows={3} value={form.bio_en ?? ""} onChange={(e) => set("bio_en", e.target.value)} dir="ltr" /></Field>
      <Field label="رسالة العميد (عربي)"><Textarea rows={5} value={form.message_ar ?? ""} onChange={(e) => set("message_ar", e.target.value)} /></Field>
      <Field label="Dean's Message (English)"><Textarea rows={5} value={form.message_en ?? ""} onChange={(e) => set("message_en", e.target.value)} dir="ltr" /></Field>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="رؤية الكلية (عربي)"><Textarea rows={4} value={form.vision_ar ?? ""} onChange={(e) => set("vision_ar", e.target.value)} /></Field>
        <Field label="Vision (English)"><Textarea rows={4} value={form.vision_en ?? ""} onChange={(e) => set("vision_en", e.target.value)} dir="ltr" /></Field>
        <Field label="رسالة الكلية (عربي)"><Textarea rows={4} value={form.mission_ar ?? ""} onChange={(e) => set("mission_ar", e.target.value)} /></Field>
        <Field label="Mission (English)"><Textarea rows={4} value={form.mission_en ?? ""} onChange={(e) => set("mission_en", e.target.value)} dir="ltr" /></Field>
      </div>
      <Button onClick={() => mut.mutate()} disabled={mut.isPending || !form.name_ar} className="gap-2">
        {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        حفظ التغييرات
      </Button>
    </div>
  );
};

const AchievementsManager = () => {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["college-achievements"], queryFn: fetchCollegeAchievements });
  const [editing, setEditing] = useState<Partial<CollegeAchievement> | null>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: () => upsertCollegeAchievement(editing!),
    onSuccess: () => { toast.success("تم الحفظ"); qc.invalidateQueries({ queryKey: ["college-achievements"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message ?? "فشل الحفظ"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteCollegeAchievement(id),
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["college-achievements"] }); },
  });

  const newItem = () => { setEditing({ title_ar: "", year: new Date().getFullYear(), display_order: 0 }); setOpen(true); };

  return (
    <div className="card-elegant p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">إنجازات الكلية ({items.length})</h3>
        <Button onClick={newItem} size="sm" className="gap-2"><Plus className="h-4 w-4" /> إضافة إنجاز</Button>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">لا توجد إنجازات بعد. أضف أول إنجاز للكلية.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <div key={a.id} className="flex justify-between items-start gap-3 p-3 rounded-lg border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {a.year && <span className="text-xs font-bold text-accent">{a.year}</span>}
                  <h4 className="font-semibold truncate">{a.title_ar}</h4>
                </div>
                {a.description_ar && <p className="text-xs text-muted-foreground line-clamp-2">{a.description_ar}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "تعديل إنجاز" : "إضافة إنجاز"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="العنوان (عربي) *"><Input value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></Field>
              <Field label="Title (English)"><Input value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="السنة"><Input type="number" value={editing.year ?? ""} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} /></Field>
                <Field label="ترتيب العرض"><Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></Field>
              </div>
              <Field label="رابط الصورة"><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" placeholder="https://..." /></Field>
              <Field label="الوصف (عربي)"><Textarea rows={3} value={editing.description_ar ?? ""} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} /></Field>
              <Field label="Description (English)"><Textarea rows={3} value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} dir="ltr" /></Field>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !editing?.title_ar} className="gap-2">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NewsManager = () => {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["college-news"], queryFn: fetchCollegeNews });
  const [editing, setEditing] = useState<Partial<CollegeNews> | null>(null);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: () => upsertCollegeNews(editing!),
    onSuccess: () => { toast.success("تم الحفظ"); qc.invalidateQueries({ queryKey: ["college-news"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message ?? "فشل الحفظ"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteCollegeNews(id),
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["college-news"] }); },
  });

  const newItem = () => { setEditing({ title_ar: "", published_at: new Date().toISOString() }); setOpen(true); };

  return (
    <div className="card-elegant p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">أخبار الكلية ({items.length})</h3>
        <Button onClick={newItem} size="sm" className="gap-2"><Plus className="h-4 w-4" /> إضافة خبر</Button>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">لا توجد أخبار بعد.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((n) => (
            <div key={n.id} className="flex justify-between items-start gap-3 p-3 rounded-lg border">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">{new Date(n.published_at).toLocaleDateString("ar-EG")}</span>
                <h4 className="font-semibold mt-0.5 truncate">{n.title_ar}</h4>
                {n.content_ar && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.content_ar}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(n); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del.mutate(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "تعديل خبر" : "إضافة خبر"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="العنوان (عربي) *"><Input value={editing.title_ar ?? ""} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></Field>
              <Field label="Title (English)"><Input value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" /></Field>
              <Field label="تاريخ النشر">
                <Input type="datetime-local" value={editing.published_at ? new Date(editing.published_at).toISOString().slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, published_at: new Date(e.target.value).toISOString() })} />
              </Field>
              <Field label="رابط الصورة"><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" /></Field>
              <Field label="المحتوى (عربي)"><Textarea rows={5} value={editing.content_ar ?? ""} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} /></Field>
              <Field label="Content (English)"><Textarea rows={5} value={editing.content_en ?? ""} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} dir="ltr" /></Field>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !editing?.title_ar} className="gap-2">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <Label className="text-xs font-semibold mb-1.5 block">{label}</Label>
    {children}
  </div>
);
