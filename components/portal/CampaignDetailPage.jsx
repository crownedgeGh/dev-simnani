"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiCheck,
  FiX,
  FiDownload,
  FiLoader,
  FiArrowLeft,
  FiVideo,
  FiAlertTriangle,
  FiStar,
  FiFileText,
  FiPlay,
} from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import { toast } from "sonner";
import { downloadFile, downloadFiles } from "@/lib/downloadFile";

const VIDEO_DOS = [
  {
    icon: FiStar,
    title: "Showcase Amenities",
    desc: "Highlight key amenities like clubhouse, pool, gym, parks — what makes this project stand out.",
  },
  {
    icon: FiPlay,
    title: "Natural Lighting Shots",
    desc: "Film in golden hour or bright daylight to make spaces look warm and inviting.",
  },
  {
    icon: FiCheck,
    title: "Include a Clear CTA",
    desc: "End every video with a call-to-action: your referral link, WhatsApp number, or contact info.",
  },
  {
    icon: FiCheck,
    title: "Mention Price Range",
    desc: "Buyers respond to transparency — state the starting price clearly and confidently.",
  },
  {
    icon: FiCheck,
    title: "Show Location Advantages",
    desc: "Mention nearby landmarks, IT hubs, schools, or highways that add to the property's appeal.",
  },
  {
    icon: FiCheck,
    title: "Add Subtitles / Captions",
    desc: "Most reels are watched on mute — add captions so your message lands even without sound.",
  },
];

const VIDEO_DONTS = [
  {
    icon: FiX,
    title: "No Misleading Claims",
    desc: "Do not exaggerate prices, timelines, or RERA approval status. Stick to verified information.",
  },
  {
    icon: FiX,
    title: "Avoid Competitor Mentions",
    desc: "Never name or compare other developers or projects — keep the focus on Simnani.",
  },
  {
    icon: FiX,
    title: "No Off-Brand Music",
    desc: "Avoid copyrighted tracks that could get your video muted or taken down. Use royalty-free music.",
  },
  {
    icon: FiX,
    title: "No Unverified Promises",
    desc: "Do not promise guaranteed returns, specific ROI percentages, or developer commitments you can't back.",
  },
  {
    icon: FiX,
    title: "Avoid Shaky / Dark Footage",
    desc: "Poor quality footage reflects badly on the project. Use a gimbal or stabilise before publishing.",
  },
  {
    icon: FiX,
    title: "Don't Skip the Disclaimer",
    desc: `Always add: "This is a promotional video by an authorised channel partner of Simnani Estates."`,
  },
];

const CONTENT_TIPS = [
  {
    label: "Ideal Length",
    value: "30–60 seconds for Reels / Shorts · 2–5 minutes for YouTube walkthroughs",
  },
  {
    label: "Tone",
    value: "Professional yet approachable. Avoid over-salesy language — let the property speak.",
  },
  {
    label: "Hook (First 3 sec)",
    value: "Start with the most visually stunning shot or a bold statement. Don't bury the lede.",
  },
  {
    label: "Caption Formula",
    value: `Project name · Highlight · Price · CTA (e.g., "Link in bio to book a free site visit")`,
  },
  {
    label: "Hashtags",
    value: "#SimnaniEstates #[CityName]RealEstate #[ProjectName] #PropertyInvestment",
  },
  {
    label: "Posting Frequency",
    value: "At least 1 post / reel per week per project you've joined for maximum lead flow.",
  },
];

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CampaignDetailPage({ project, assets, backHref }) {
  const [joined, setJoined] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [downloadingVideos, setDownloadingVideos] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState(null);

  const hasImages = (assets?.images?.length ?? 0) > 0;
  const hasVideos = (assets?.videos?.length ?? 0) > 0;

  async function handleDownloadImages() {
    if (downloadingImages) return;
    setDownloadingImages(true);
    await downloadFiles(assets.images, `${slugify(project.name)}-image`);
    setDownloadingImages(false);
    toast.success(`${assets.images.length} image${assets.images.length > 1 ? "s" : ""} downloaded`);
  }

  async function handleDownloadVideos() {
    if (downloadingVideos) return;
    setDownloadingVideos(true);
    const videoUrls = assets.videos.map((name) => `https://cdn.simnaniestates.com/campaign-videos/${slugify(name)}`);
    await downloadFiles(videoUrls, `${slugify(project.name)}-video`);
    setDownloadingVideos(false);
    toast.success(`${assets.videos.length} video${assets.videos.length > 1 ? "s" : ""} downloaded`);
  }

  async function handleDownloadSingle(key, url, filename, message) {
    if (downloadingKey) return;
    setDownloadingKey(key);
    await downloadFile(url, filename);
    setDownloadingKey(null);
    toast.success(message);
  }

  if (!project) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg text-cream">Campaign not found.</p>
        <Link
          href={backHref || "/portal/digital-cp"}
          className="tracked-label flex items-center gap-2 text-xs text-gold-400 hover:text-gold-300"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Back Link */}
      <Link
        href={backHref || "/portal/digital-cp"}
        className="tracked-label inline-flex w-fit items-center gap-2 text-xs text-muted transition hover:text-gold-400"
      >
        <FiArrowLeft className="h-3.5 w-3.5" />
        Back to Portal
      </Link>

      {/* ── Hero Card ──────────────────────────────────────────── */}
      <div className="overflow-hidden border border-navy-700/60 bg-navy-900">
        <div className="relative h-56 w-full sm:h-72 lg:h-96">
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
          {/* Campaign badge */}
          <div className="absolute left-4 top-4 flex items-center gap-2 border border-gold-500/70 bg-navy-950/80 px-3 py-1.5 backdrop-blur-sm">
            <MdCampaign className="h-4 w-4 text-gold-400" />
            <span className="tracked-label text-[10px] text-gold-400">Active Campaign</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl text-cream sm:text-3xl">{project.name}</h1>
              <p className="mt-1 text-sm text-muted">{project.location}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="tracked-label rounded-full border border-navy-700/60 px-3 py-1 text-[10px] text-muted">
                  {project.startingPrice}
                </span>
                <span className="tracked-label rounded-full border border-navy-700/60 px-3 py-1 text-[10px] text-muted">
                  {project.status}
                </span>
                <span className="tracked-label rounded-full border border-navy-700/60 px-3 py-1 text-[10px] text-muted">
                  {project.developer}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setJoined((v) => !v)}
                className={`tracked-label flex w-fit items-center gap-2 px-6 py-3 text-xs transition ${
                  joined
                    ? "border border-gold-500/70 text-gold-400 hover:bg-gold-500/10"
                    : "bg-gold-400 text-navy-950 hover:bg-gold-300"
                }`}
              >
                {joined ? (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Joined Campaign
                  </>
                ) : (
                  <>
                    <MdCampaign className="h-4 w-4" />
                    Join Campaign
                  </>
                )}
              </button>

              {hasImages && (
                <button
                  type="button"
                  onClick={handleDownloadImages}
                  disabled={downloadingImages}
                  className="tracked-label flex w-fit items-center gap-2 border border-gold-500/70 px-6 py-3 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {downloadingImages ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiDownload className="h-4 w-4" />
                  )}
                  {downloadingImages ? "Downloading…" : "Download Images"}
                </button>
              )}

              {hasVideos && (
                <button
                  type="button"
                  onClick={handleDownloadVideos}
                  disabled={downloadingVideos}
                  className="tracked-label flex w-fit items-center gap-2 border border-gold-500/70 px-6 py-3 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {downloadingVideos ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiDownload className="h-4 w-4" />
                  )}
                  {downloadingVideos ? "Downloading…" : "Download Videos"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-Column: Dos & Don'ts ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dos */}
        <div className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
              <FiCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="font-display text-lg text-cream">What to Add in Your Videos</h2>
          </div>
          <div className="flex flex-col gap-3">
            {VIDEO_DOS.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 border-l-2 border-emerald-500/40 pl-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cream">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Don'ts */}
        <div className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
              <FiX className="h-4 w-4 text-red-400" />
            </div>
            <h2 className="font-display text-lg text-cream">What NOT to Add in Videos</h2>
          </div>
          <div className="flex flex-col gap-3">
            {VIDEO_DONTS.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 border-l-2 border-red-500/40 pl-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cream">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Video Content Guide ───────────────────────────────── */}
      <div className="border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/15">
            <FiVideo className="h-4 w-4 text-gold-400" />
          </div>
          <h2 className="font-display text-lg text-cream">Video Content Guide</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TIPS.map((tip) => (
            <div
              key={tip.label}
              className="flex flex-col gap-1 border border-navy-700/60 bg-navy-950 p-4"
            >
              <p className="tracked-label text-[10px] text-gold-400">{tip.label}</p>
              <p className="text-xs leading-relaxed text-muted">{tip.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Campaign Videos & Brochure ────────────────────────── */}
      {assets && (
        <div className="flex flex-col gap-5">
          {/* Campaign Images */}
          {assets.images && assets.images.length > 0 && (
            <div className="border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
              <p className="tracked-label mb-4 text-xs text-gold-400">Campaign Images</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {assets.images.map((src, i) => (
                  <div key={src} className="group relative aspect-square overflow-hidden border border-navy-700/60 bg-navy-950">
                    <Image
                      src={src}
                      alt={`${project.name} image ${i + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadSingle(
                          `image-${i}`,
                          src,
                          `${slugify(project.name)}-image-${i + 1}`,
                          "Image downloaded"
                        )
                      }
                      disabled={downloadingKey === `image-${i}`}
                      className="absolute inset-0 flex items-center justify-center bg-navy-950/0 opacity-0 transition group-hover:bg-navy-950/60 group-hover:opacity-100 disabled:cursor-wait disabled:opacity-100"
                      aria-label={`Download image ${i + 1}`}
                    >
                      {downloadingKey === `image-${i}` ? (
                        <FiLoader className="h-5 w-5 animate-spin text-gold-400" />
                      ) : (
                        <FiDownload className="h-5 w-5 text-gold-400 transition active:scale-90" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Videos */}
          {assets.videos && assets.videos.length > 0 && (
            <div className="border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
              <p className="tracked-label mb-4 text-xs text-gold-400">Campaign Videos</p>
              <div className="flex flex-col gap-3">
                {assets.videos.map((name) => {
                  const videoLink = `https://cdn.simnaniestates.com/campaign-videos/${slugify(name)}`;
                  return (
                    <div
                      key={name}
                      className="flex flex-col gap-3 border border-navy-700/60 bg-navy-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/10">
                          <FiPlay className="h-4 w-4 text-gold-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-cream">{name}</p>
                          <a
                            href={videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 block truncate text-xs text-gold-400 hover:text-gold-300"
                          >
                            {videoLink}
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(`video-${name}`, videoLink, slugify(name), "Video downloaded")}
                        disabled={downloadingKey === `video-${name}`}
                        className="tracked-label flex shrink-0 items-center justify-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                      >
                        {downloadingKey === `video-${name}` ? (
                          <FiLoader className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FiDownload className="h-3.5 w-3.5" />
                        )}
                        {downloadingKey === `video-${name}` ? "Downloading…" : "Download Video"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brochure */}
          {assets.brochureUrl && (
            <div className="border border-navy-700/60 bg-navy-900 p-5 sm:p-6">
              <p className="tracked-label mb-4 text-xs text-gold-400">Project Brochure</p>
              <div className="flex flex-col gap-3 border border-navy-700/60 bg-navy-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/10">
                    <FiFileText className="h-4 w-4 text-gold-400" />
                  </div>
                  <p className="text-sm text-cream">{assets.brochureUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadSingle(
                      "brochure",
                      `https://cdn.simnaniestates.com/brochures/${assets.brochureUrl}`,
                      assets.brochureUrl,
                      "Brochure downloaded"
                    )
                  }
                  disabled={downloadingKey === "brochure"}
                  className="tracked-label flex shrink-0 items-center justify-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {downloadingKey === "brochure" ? (
                    <FiLoader className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FiDownload className="h-3.5 w-3.5" />
                  )}
                  {downloadingKey === "brochure" ? "Downloading…" : "Download Brochure"}
                </button>
              </div>
            </div>
          )}

          {/* Warning note */}
          <div className="flex items-start gap-3 border border-amber-500/30 bg-amber-500/5 p-4">
            <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-muted">
              <span className="font-medium text-amber-400">Important:</span> All campaign assets are for
              promotional use only. Do not redistribute or repurpose without written approval from Simnani
              Estates. Any content posted must include the authorised channel partner disclaimer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
