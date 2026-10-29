import { getFeaturedBrokers } from "@/lib/brokersServer";
import FeaturedBrokersClient from "@/components/home/FeaturedBrokersClient";

const MAX_VISIBLE_BROKERS = 10;

export default async function FeaturedBrokers() {
  const brokers = await getFeaturedBrokers();

  if (!brokers.length) return null;

  const visibleBrokers = brokers.slice(0, MAX_VISIBLE_BROKERS);

  return <FeaturedBrokersClient brokers={visibleBrokers} />;
}
