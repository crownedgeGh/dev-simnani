"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import Pagination from "@/components/layout/Pagination";

const PAGE_SIZE = 15;

export default function ProjectGrid({ projects, emptyMessage }) {
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the (filtered) project list changes. Adjusted
  // during render (React's recommended pattern) rather than in an effect.
  const [lastProjects, setLastProjects] = useState(projects);
  if (projects !== lastProjects) {
    setLastProjects(projects);
    setPage(1);
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">{emptyMessage || "No projects match this selection right now."}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(projects.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleProjects = projects.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
