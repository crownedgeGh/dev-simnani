"use client";

import AdminDialog from "@/components/admin/ui/AdminDialog";
import { MdPhoto, MdVideoLibrary, MdPictureAsPdf } from "react-icons/md";

export default function ProjectAssetsDialog({ isOpen, onClose, project, assets }) {
  const projectAssets = (assets || []).find((a) => a.projectId === project?.id);

  return (
    <AdminDialog isOpen={isOpen} onClose={onClose} title={`Assets — ${project?.name || ""}`} size="md">
      {!projectAssets ? (
        <p className="text-sm text-[#9ca3af] text-center py-6">No promotion assets found for this project.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Photos */}
          {projectAssets.photos?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MdPhoto size={16} className="text-[#f0b429]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#374151]">Photos ({projectAssets.photos.length})</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {projectAssets.photos.map((url, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-[#e8e0d5] aspect-video">
                    <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {projectAssets.videos?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MdVideoLibrary size={16} className="text-[#f0b429]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#374151]">Videos</p>
              </div>
              {projectAssets.videos.map((v, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-[#e8e0d5] px-3 py-2.5">
                  <MdVideoLibrary size={16} className="text-[#9ca3af]" />
                  <span className="text-sm text-[#374151]">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Brochure */}
          {projectAssets.brochureUrl && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MdPictureAsPdf size={16} className="text-[#f0b429]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#374151]">Brochure</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d5] px-3 py-2.5">
                <MdPictureAsPdf size={16} className="text-red-400" />
                <span className="text-sm text-[#374151]">{projectAssets.brochureUrl}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminDialog>
  );
}
