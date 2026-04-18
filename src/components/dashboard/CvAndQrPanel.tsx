import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, QrCode, Loader2, Image as ImageIcon } from "lucide-react";
import QRCode from "qrcode";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { fetchMemberFullProfile } from "@/lib/api";
import { generateCV } from "@/lib/cvGenerator";
import { downloadQrPng, downloadQrCardPdf, generateQrPng } from "@/lib/qrGenerator";
import { toast } from "sonner";

export const CvAndQrPanel = ({ userId }: { userId: string }) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["member", userId],
    queryFn: () => fetchMemberFullProfile(userId),
  });

  const [qrPreview, setQrPreview] = useState<string>("");
  const profileUrl = `${window.location.origin}/member/${userId}`;

  useEffect(() => {
    generateQrPng(profileUrl, 320).then(setQrPreview);
  }, [profileUrl]);

  const [genCv, setGenCv] = useState(false);
  const handleCv = async (lang: "ar" | "en") => {
    if (!profile) return;
    setGenCv(true);
    try {
      await generateCV(profile, lang);
      toast.success("تم توليد السيرة الذاتية");
    } catch (err: any) {
      toast.error("فشل توليد السيرة", { description: err.message });
    } finally { setGenCv(false); }
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!profile) return <p className="text-sm text-muted-foreground">لم يتم العثور على البيانات.</p>;

  const fileName = (profile.name_en || profile.name_ar || "member").replace(/\s+/g, "_");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* CV */}
      <div className="card-elegant p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold">السيرة الذاتية</h3>
            <p className="text-xs text-muted-foreground">PDF احترافي ثنائي اللغة</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          يتم سحب البيانات تلقائياً من ملفك الشخصي والإنتاج العلمي المعتمد فقط.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleCv("ar")} disabled={genCv} className="gap-2">
            {genCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            تحميل CV (عربي)
          </Button>
          <Button onClick={() => handleCv("en")} disabled={genCv} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> CV (English)
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>✓ {profile.publications.length} بحث معتمد</p>
          <p>✓ {profile.awards.length} جائزة معتمدة</p>
          <p>✓ {profile.certificates.length} شهادة معتمدة</p>
        </div>
      </div>

      {/* QR */}
      <div className="card-elegant p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-accent flex items-center justify-center">
            <QrCode className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold">رمز QR الشخصي</h3>
            <p className="text-xs text-muted-foreground">قابل للطباعة بدقة عالية</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 py-2">
          {qrPreview && <img src={qrPreview} alt="QR" className="h-40 w-40 rounded-lg border-2 border-border bg-white p-2" />}
          <p className="text-xs text-muted-foreground break-all text-center" dir="ltr">{profileUrl}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button onClick={() => downloadQrPng(profileUrl, fileName)} className="gap-2">
            <ImageIcon className="h-4 w-4" /> تحميل PNG
          </Button>
          <Button
            onClick={() => downloadQrCardPdf({
              name: profile.name_ar,
              specialty: profile.specialty_ar,
              url: profileUrl,
              facultyLine: "كلية التربية النوعية",
            }, fileName)}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" /> بطاقة PDF للطباعة
          </Button>
        </div>
      </div>
    </div>
  );
};
