import { MdVerified, MdTrendingUp, MdSupportAgent } from "react-icons/md";
import { FiUser } from "react-icons/fi";

const VALUES = [
  {
    title: "Verified Properties",
    description: "Discover genuine property listings.",
    Icon: MdVerified,
  },
  {
    title: "Trusted Sellers",
    description: "Connect with verified owners and professionals.",
    Icon: FiUser,
  },
  {
    title: "Smart Investment",
    description: "Find opportunities suited to your budget.",
    Icon: MdTrendingUp,
  },
  {
    title: "End-to-End Support",
    description: "Get support throughout your property journey.",
    Icon: MdSupportAgent,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
        What Sets Us <span className="text-gold-400">Apart</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ title, description, Icon }) => (
          <div key={title} className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/50 text-gold-400">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-base text-cream">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
