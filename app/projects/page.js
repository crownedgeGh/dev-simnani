import PurposeTabs, { PurposeTabSwitcher } from "@/components/property/PurposeTabs";
import PostOnCategoryButton from "@/components/property/PostOnCategoryButton";
import { getProjectsAsProperties } from "@/lib/projects";
import BackButton from "@/components/layout/BackButton";

export const metadata = {
  title: "Company Projects | Simnani Estate",
  description:
    "Discover an exclusive portfolio of off-plan and newly completed luxury projects.",
};

export default function ProjectsPage() {
  const properties = getProjectsAsProperties();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="font-display text-3xl text-cream sm:text-4xl">Company Projects</h1>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <PurposeTabSwitcher />
          <PostOnCategoryButton section="invest" category="company-project" />
        </div>
      </div>

      <div className="mt-6">
        <PurposeTabs properties={properties} emptyLabel="developments" />
      </div>
    </div>
  );
}
