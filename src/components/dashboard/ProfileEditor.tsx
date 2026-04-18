import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchMyProfile, updateMyProfile, uploadAvatar, fetchAllDepartments } from "@/lib/profileApi";

export const ProfileEditor = ({ userId }: { userId: string }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", userId],
    queryFn: () => fetchMyProfile(userId),
  });
  const { data: departments = [] } = useQuery({ queryKey: ["all-departments"], queryFn: fetchAllDepartments });

  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name_ar: profile.name_ar || "",
        name_en: profile.name_en || "",
        specialty_ar: profile.specialty_ar || "",
        specialty_en: profile.specialty_en || "",
        bio_ar: profile.bio_ar || "",
        bio_en: profile.bio_en || "",
        phone: profile.phone || "",
        website_url: profile.website_url || "",
        scholar_url: profile.scholar_url || "",
        orcid: profile.orcid || "",
        office_location: profile.office_location || "",
        years_exp: profile.years_exp ?? 0,
        rank: profile.rank || "",
        department_id: profile.department_id || "",
        avatar_url: profile.avatar_url || "",
        initials: profile.initials || "",
      });
    }
  }, [profile]);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!profile) return <p className="text-sm text-muted-foreground">لم يتم العثور على الملف الشخصي.</p>;

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("الحد الأقصى 3 ميجا"); return; }
    setUploading(true);
    try {
      const url = await uploadAvatar(userId, file);
      set("avatar_url", url);
      await updateMyProfile(userId, { avatar_url: url });
      qc.invalidateQueries({ queryKey: ["my-profile", userId] });
      toast.success("تم تحديث الصورة الشخصية");
    } catch (err: any) {
      toast.error("فشل رفع الصورة", { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name_ar?.trim()) { toast.error("الاسم بالعربية مطلوب"); return; }
    setSaving(true);
    try {
      await updateMyProfile(userId, {
        ...form,
        years_exp: Number(form.years_exp) || 0,
        rank: form.rank || null,
        department_id: form.department_id || null,
      });
      qc.invalidateQueries({ queryKey: ["my-profile", userId] });
      toast.success("تم حفظ التعديلات");
    } catch (err: any) {
      toast.error("فشل الحفظ", { description: err.message });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="card-elegant p-6 flex items-center gap-6">
        <Avatar className="h-24 w-24 ring-4 ring-background shadow-elegant">
          {form.avatar_url && <AvatarImage src={form.avatar_url} />}
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
            {form.initials || form.name_ar?.[0] || "؟"}
          </AvatarFallback>
        </Avatar>
        <div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} variant="outline" className="gap-2">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            تغيير الصورة
          </Button>
          <p className="text-xs text-muted-foreground mt-2">PNG / JPG حتى 3 ميجا</p>
        </div>
      </div>

      {/* Basic */}
      <div className="card-elegant p-6 space-y-4">
        <h3 className="font-bold text-lg">المعلومات الأساسية</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="الاسم (عربي)*"><Input value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} /></Field>
          <Field label="Name (English)"><Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} dir="ltr" /></Field>
          <Field label="التخصص (عربي)"><Input value={form.specialty_ar} onChange={(e) => set("specialty_ar", e.target.value)} /></Field>
          <Field label="Specialty (English)"><Input value={form.specialty_en} onChange={(e) => set("specialty_en", e.target.value)} dir="ltr" /></Field>
          <Field label="الدرجة العلمية">
            <Select value={form.rank || ""} onValueChange={(v) => set("rank", v)}>
              <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professor">{t("ranks.professor")}</SelectItem>
                <SelectItem value="associate">{t("ranks.associate")}</SelectItem>
                <SelectItem value="lecturer">{t("ranks.lecturer")}</SelectItem>
                <SelectItem value="assistant">{t("ranks.assistant")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="القسم">
            <Select value={form.department_id || ""} onValueChange={(v) => set("department_id", v)}>
              <SelectTrigger><SelectValue placeholder="اختر القسم..." /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{isAr ? d.name_ar : d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="سنوات الخبرة"><Input type="number" min={0} value={form.years_exp} onChange={(e) => set("years_exp", e.target.value)} /></Field>
          <Field label="الأحرف الأولى (للأفاتار)"><Input value={form.initials} onChange={(e) => set("initials", e.target.value)} maxLength={3} /></Field>
        </div>
      </div>

      {/* Bio */}
      <div className="card-elegant p-6 space-y-4">
        <h3 className="font-bold text-lg">النبذة الشخصية</h3>
        <Field label="نبذة (عربي)"><Textarea rows={4} value={form.bio_ar} onChange={(e) => set("bio_ar", e.target.value)} /></Field>
        <Field label="Biography (English)"><Textarea rows={4} value={form.bio_en} onChange={(e) => set("bio_en", e.target.value)} dir="ltr" /></Field>
      </div>

      {/* Contact */}
      <div className="card-elegant p-6 space-y-4">
        <h3 className="font-bold text-lg">معلومات التواصل</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="رقم الهاتف"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" /></Field>
          <Field label="المكتب"><Input value={form.office_location} onChange={(e) => set("office_location", e.target.value)} /></Field>
          <Field label="الموقع الشخصي"><Input value={form.website_url} onChange={(e) => set("website_url", e.target.value)} dir="ltr" placeholder="https://..." /></Field>
          <Field label="Google Scholar"><Input value={form.scholar_url} onChange={(e) => set("scholar_url", e.target.value)} dir="ltr" placeholder="https://scholar.google.com/..." /></Field>
          <Field label="ORCID"><Input value={form.orcid} onChange={(e) => set("orcid", e.target.value)} dir="ltr" placeholder="0000-0000-0000-0000" /></Field>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التعديلات
        </Button>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm">{label}</Label>
    {children}
  </div>
);
