import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { insertContent, updateContent } from "@/lib/profileApi";

export type ContentKind = "publications" | "awards" | "certificates" | "events";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: ContentKind;
  userId: string;
  editing: any | null;
  onSaved: () => void;
}

const TITLES: Record<ContentKind, string> = {
  publications: "بحث / منشور",
  awards: "جائزة / تكريم",
  certificates: "شهادة",
  events: "فعالية",
};

export const ContentDialog = ({ open, onOpenChange, kind, userId, editing, onSaved }: Props) => {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editing ? { ...editing } : defaults(kind));
  }, [open, editing, kind]);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title_ar?.trim()) { toast.error("العنوان بالعربية مطلوب"); return; }
    setSaving(true);
    try {
      const payload: any = { ...form, profile_id: userId };
      // Numeric coercion
      if ("year" in payload) payload.year = Number(payload.year);
      if ("publication_year" in payload) payload.publication_year = Number(payload.publication_year);
      if ("citations_count" in payload) payload.citations_count = Number(payload.citations_count) || 0;

      if (editing?.id) {
        delete payload.id; delete payload.created_at; delete payload.updated_at;
        delete payload.reviewed_at; delete payload.reviewed_by;
        // resubmit for review on edit
        payload.status = "pending";
        await updateContent(kind, editing.id, payload);
      } else {
        await insertContent(kind, payload);
      }
      toast.success("تم الحفظ — في انتظار مراجعة الإدارة");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("فشل الحفظ", { description: err.message });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل" : "إضافة"} {TITLES[kind]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="العنوان (عربي)*"><Input value={form.title_ar || ""} onChange={(e) => set("title_ar", e.target.value)} /></Field>
          <Field label="Title (English)"><Input value={form.title_en || ""} onChange={(e) => set("title_en", e.target.value)} dir="ltr" /></Field>

          {kind === "publications" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="السنة*"><Input type="number" value={form.publication_year || ""} onChange={(e) => set("publication_year", e.target.value)} /></Field>
                <Field label="النوع">
                  <Select value={form.type || "journal"} onValueChange={(v) => set("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journal">دورية محكّمة</SelectItem>
                      <SelectItem value="conference">مؤتمر</SelectItem>
                      <SelectItem value="book">كتاب</SelectItem>
                      <SelectItem value="chapter">فصل في كتاب</SelectItem>
                      <SelectItem value="thesis">رسالة</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="الدورية / الناشر"><Input value={form.journal_name || ""} onChange={(e) => set("journal_name", e.target.value)} /></Field>
              <Field label="المؤلفون"><Input value={form.authors || ""} onChange={(e) => set("authors", e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="DOI"><Input value={form.doi || ""} onChange={(e) => set("doi", e.target.value)} dir="ltr" /></Field>
                <Field label="الرابط"><Input value={form.url || ""} onChange={(e) => set("url", e.target.value)} dir="ltr" /></Field>
              </div>
              <Field label="الملخص"><Textarea rows={3} value={form.abstract || ""} onChange={(e) => set("abstract", e.target.value)} /></Field>
            </>
          )}

          {kind === "awards" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="السنة*"><Input type="number" value={form.year || ""} onChange={(e) => set("year", e.target.value)} /></Field>
                <Field label="الجهة المانحة*"><Input value={form.granting_body || ""} onChange={(e) => set("granting_body", e.target.value)} /></Field>
              </div>
              <Field label="وصف"><Textarea rows={3} value={form.description_ar || ""} onChange={(e) => set("description_ar", e.target.value)} /></Field>
            </>
          )}

          {kind === "certificates" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="السنة*"><Input type="number" value={form.year || ""} onChange={(e) => set("year", e.target.value)} /></Field>
                <Field label="جهة الإصدار*"><Input value={form.issuer || ""} onChange={(e) => set("issuer", e.target.value)} /></Field>
              </div>
              <Field label="رابط التحقق"><Input value={form.url || ""} onChange={(e) => set("url", e.target.value)} dir="ltr" /></Field>
              <Field label="وصف"><Textarea rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
            </>
          )}

          {kind === "events" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="التاريخ*"><Input type="date" value={form.event_date || ""} onChange={(e) => set("event_date", e.target.value)} /></Field>
                <Field label="النوع">
                  <Select value={form.type || "conference"} onValueChange={(v) => set("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">مؤتمر</SelectItem>
                      <SelectItem value="workshop">ورشة</SelectItem>
                      <SelectItem value="seminar">ندوة</SelectItem>
                      <SelectItem value="training">تدريب</SelectItem>
                      <SelectItem value="community">خدمة مجتمع</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="المكان"><Input value={form.location || ""} onChange={(e) => set("location", e.target.value)} /></Field>
              <Field label="الوصف"><Textarea rows={3} value={form.description_ar || ""} onChange={(e) => set("description_ar", e.target.value)} /></Field>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    {children}
  </div>
);

const defaults = (kind: ContentKind): any => {
  const y = new Date().getFullYear();
  switch (kind) {
    case "publications": return { type: "journal", publication_year: y };
    case "awards": return { year: y };
    case "certificates": return { year: y };
    case "events": return { type: "conference", event_date: new Date().toISOString().slice(0, 10) };
  }
};
