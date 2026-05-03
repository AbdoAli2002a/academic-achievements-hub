import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Phone, Trophy, Newspaper, Quote, Target, Eye, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { fetchDeanProfile, fetchCollegeAchievements, fetchCollegeNews } from "@/lib/deanApi";

const Dean = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const { data: dean, isLoading } = useQuery({ queryKey: ["dean-profile"], queryFn: fetchDeanProfile });
  const { data: achievements = [] } = useQuery({ queryKey: ["college-achievements"], queryFn: fetchCollegeAchievements });
  const { data: news = [] } = useQuery({ queryKey: ["college-news"], queryFn: fetchCollegeNews });

  if (isLoading) {
    return <div className="container-academic py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  if (!dean) {
    return (
      <div className="container-academic py-20 text-center">
        <p className="text-muted-foreground">{isAr ? "لم يتم إعداد بيانات العميد بعد." : "Dean profile not configured yet."}</p>
      </div>
    );
  }

  const name = isAr ? dean.name_ar : (dean.name_en || dean.name_ar);
  const title = isAr ? dean.title_ar : (dean.title_en || dean.title_ar);
  const bio = isAr ? dean.bio_ar : (dean.bio_en || dean.bio_ar);
  const message = isAr ? dean.message_ar : (dean.message_en || dean.message_ar);
  const vision = isAr ? dean.vision_ar : (dean.vision_en || dean.vision_ar);
  const mission = isAr ? dean.mission_ar : (dean.mission_en || dean.mission_ar);

  return (
    <div className="animate-fade-in">
      <section className="relative bg-gradient-hero pt-12 pb-24 md:pt-16 md:pb-32">
        <div className="container-academic">
          <Badge variant="secondary" className="bg-white/15 text-primary-foreground border-0 mb-3">
            <GraduationCap className="h-3.5 w-3.5 me-1" />
            {isAr ? "عميد الكلية" : "Faculty Dean"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">{isAr ? "كلمة العميد" : "Dean's Office"}</h1>
        </div>
      </section>

      <div className="container-academic -mt-20 md:-mt-24 relative z-10 pb-16 space-y-6">
        {/* Dean card */}
        <div className="card-elegant p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-28 w-28 md:h-36 md:w-36 ring-4 ring-background shadow-elegant shrink-0 -mt-16 md:mt-0">
              {dean.avatar_url && <AvatarImage src={dean.avatar_url} alt={name} />}
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                {name?.[0] ?? "د"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-1">{name}</h2>
              {title && <p className="text-accent font-medium mb-3">{title}</p>}
              {bio && <p className="text-muted-foreground leading-relaxed mb-4">{bio}</p>}
              <div className="flex flex-wrap gap-4 text-sm">
                {dean.email && (
                  <a href={`mailto:${dean.email}`} className="inline-flex items-center gap-2 hover:text-accent">
                    <Mail className="h-4 w-4 text-accent" />{dean.email}
                  </a>
                )}
                {dean.phone && (
                  <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /><span dir="ltr">{dean.phone}</span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="card-elegant p-6 md:p-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Quote className="h-5 w-5 text-accent" />
              {isAr ? "رسالة العميد" : "Dean's Message"}
            </h3>
            <p className="text-muted-foreground leading-loose whitespace-pre-line">{message}</p>
          </div>
        )}

        {(vision || mission) && (
          <div className="grid md:grid-cols-2 gap-6">
            {vision && (
              <div className="card-elegant p-6">
                <h3 className="font-bold flex items-center gap-2 mb-3"><Eye className="h-5 w-5 text-accent" />{isAr ? "الرؤية" : "Vision"}</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{vision}</p>
              </div>
            )}
            {mission && (
              <div className="card-elegant p-6">
                <h3 className="font-bold flex items-center gap-2 mb-3"><Target className="h-5 w-5 text-accent" />{isAr ? "الرسالة" : "Mission"}</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{mission}</p>
              </div>
            )}
          </div>
        )}

        {achievements.length > 0 && (
          <div className="card-elegant p-6 md:p-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-5"><Trophy className="h-5 w-5 text-accent" />{isAr ? "إنجازات الكلية" : "College Achievements"}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((a) => (
                <div key={a.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-elegant transition-shadow">
                  {a.image_url && <img src={a.image_url} alt={a.title_ar} className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    {a.year && <span className="text-xs font-bold text-accent">{a.year}</span>}
                    <h4 className="font-bold mt-1 mb-1">{isAr ? a.title_ar : (a.title_en || a.title_ar)}</h4>
                    {(a.description_ar || a.description_en) && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{isAr ? a.description_ar : (a.description_en || a.description_ar)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {news.length > 0 && (
          <div className="card-elegant p-6 md:p-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-5"><Newspaper className="h-5 w-5 text-accent" />{isAr ? "أخبار وإعلانات الكلية" : "College News"}</h3>
            <div className="space-y-4">
              {news.map((n) => (
                <article key={n.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-card">
                  {n.image_url && <img src={n.image_url} alt={n.title_ar} className="w-full sm:w-44 h-32 object-cover rounded-lg" />}
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{new Date(n.published_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}</span>
                    <h4 className="font-bold mt-1 mb-2">{isAr ? n.title_ar : (n.title_en || n.title_ar)}</h4>
                    {(n.content_ar || n.content_en) && (
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">{isAr ? n.content_ar : (n.content_en || n.content_ar)}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dean;
