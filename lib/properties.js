import indianCities from "@/lib/data/indianCities.json";

export const PROPERTIES = [
  {
    id: "buy-1",
    title: "Luxury 3 BHK Apartment",
    type: "buy",
    price: "₹1.25 Cr",
    location: "Indiranagar, Bangalore",
    beds: 3,
    baths: 3,
    area: "1,850 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
    featured: true,
  },
  {
    id: "buy-2",
    title: "3 BHK Villa in Devanahalli",
    type: "buy",
    price: "₹2.49 Cr",
    location: "Devanahalli, Bangalore",
    beds: 3,
    baths: 3,
    area: "2,410 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
    featured: true,
  },
  {
    id: "buy-3",
    title: "2 BHK Sea View Apartment",
    type: "buy",
    price: "₹3.10 Cr",
    location: "Bandra, Mumbai",
    beds: 2,
    baths: 2,
    area: "1,400 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
    featured: true,
  },
  {
    id: "buy-4",
    title: "4 BHK Independent House",
    type: "buy",
    price: "₹4.20 Cr",
    location: "Jubilee Hills, Hyderabad",
    beds: 4,
    baths: 4,
    area: "3,100 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "buy-5",
    title: "2 BHK Garden Apartment",
    type: "buy",
    price: "₹85 Lakh",
    location: "Wakad, Pune",
    beds: 2,
    baths: 2,
    area: "1,150 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "sell-1",
    title: "3 BHK Penthouse with Terrace",
    type: "sell",
    price: "₹2.85 Cr",
    location: "Indiranagar, Bangalore",
    beds: 3,
    baths: 3,
    area: "2,050 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80&auto=format&fit=crop",
    badge: "Owner Listed",
  },
  {
    id: "sell-2",
    title: "1 BHK Compact Apartment",
    type: "sell",
    price: "₹52 Lakh",
    location: "Andheri West, Mumbai",
    beds: 1,
    baths: 1,
    area: "620 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "sell-3",
    title: "Independent Duplex Villa",
    type: "sell",
    price: "₹1.95 Cr",
    location: "Gachibowli, Hyderabad",
    beds: 4,
    baths: 3,
    area: "2,800 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "rent-1",
    title: "2 BHK Fully Furnished Flat",
    type: "rent",
    price: "₹45,000 / month",
    location: "Koramangala, Bangalore",
    beds: 2,
    baths: 2,
    area: "1,200 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "rent-2",
    title: "3 BHK Sea-Facing Rental",
    type: "rent",
    price: "₹1,10,000 / month",
    location: "Worli, Mumbai",
    beds: 3,
    baths: 3,
    area: "1,750 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "rent-3",
    title: "Studio Apartment Near IT Park",
    type: "rent",
    price: "₹22,000 / month",
    location: "Hinjewadi, Pune",
    beds: 1,
    baths: 1,
    area: "540 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "invest-1",
    title: "Commercial Office Space",
    type: "invest",
    category: "offices",
    price: "₹1.80 Cr",
    location: "BKC, Mumbai",
    area: "2,200 sq.ft.",
    roi: "9.2% Rental Yield",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop",
    badge: "High Growth",
  },
  {
    id: "invest-2",
    title: "Pre-Launch Residential Plot",
    type: "invest",
    category: "land",
    price: "₹38 Lakh",
    location: "Shadnagar, Hyderabad",
    area: "2,400 sq.ft.",
    roi: "18% Projected 3-yr Growth",
    image:
      "https://images.unsplash.com/photo-1621293954908-907159247fc8?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "invest-4",
    title: "High Street Retail Shop",
    type: "invest",
    category: "shops",
    price: "₹72 Lakh",
    location: "FC Road, Pune",
    area: "650 sq.ft.",
    roi: "10.5% Rental Yield",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop",
    badge: "High Footfall",
  },
  {
    id: "invest-5",
    title: "Weekend Farmhouse Investment",
    type: "invest",
    category: "farmhouse",
    price: "₹1.10 Cr",
    location: "Lonavala, Maharashtra",
    area: "1 Acre",
    roi: "15% Projected 3-yr Growth",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "invest-3",
    title: "Managed Rental Apartment",
    type: "invest",
    category: "apartments",
    price: "₹95 Lakh",
    location: "Whitefield, Bangalore",
    area: "1,300 sq.ft.",
    roi: "7.8% Rental Yield",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "lease-1",
    title: "Retail Showroom on Main Road",
    type: "lease",
    price: "₹2,50,000 / month",
    location: "Connaught Place, Delhi",
    area: "1,800 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop",
    badge: "Long Term",
  },
  {
    id: "lease-2",
    title: "Grade A Office Floor",
    type: "lease",
    price: "₹4,80,000 / month",
    location: "Cyber City, Gurugram",
    area: "5,200 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "lease-3",
    title: "Warehouse Cum Cold Storage",
    type: "lease",
    price: "₹3,20,000 / month",
    location: "Bhiwandi, Thane",
    area: "9,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop",
  },
  // ---- Seized Property category demos ----
  {
    id: "seized-flat-1",
    title: "Bank Auctioned 3 BHK Flat",
    type: "seized-property",
    category: "residential-flats-apartments",
    price: "₹68 Lakh",
    location: "Vashi, Navi Mumbai",
    beds: 3,
    baths: 2,
    area: "1,450 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-flat-2",
    title: "SARFAESI Seized 2 BHK Apartment",
    type: "seized-property",
    category: "residential-flats-apartments",
    price: "₹45 Lakh",
    location: "Andheri East, Mumbai",
    beds: 2,
    baths: 2,
    area: "1,050 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-house-1",
    title: "Repossessed Independent House",
    type: "seized-property",
    category: "independent-houses-villas",
    price: "₹52 Lakh",
    location: "Kalyan, Mumbai",
    beds: 3,
    baths: 2,
    area: "1,650 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-house-2",
    title: "NPA Auctioned Independent Villa",
    type: "seized-property",
    category: "independent-houses-villas",
    price: "₹1.35 Cr",
    location: "Whitefield, Bangalore",
    beds: 4,
    baths: 3,
    area: "2,600 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
    badge: "NPA Auction",
  },
  {
    id: "seized-plot-1",
    title: "Bank Auctioned Residential Plot",
    type: "seized-property",
    category: "plots-land",
    price: "₹28 Lakh",
    location: "Shadnagar, Hyderabad",
    area: "2,400 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1621293954908-907159247fc8?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-plot-2",
    title: "SARFAESI Seized Open Plot",
    type: "seized-property",
    category: "plots-land",
    price: "₹41 Lakh",
    location: "Sohna Road, Gurugram",
    area: "3,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-agri-1",
    title: "Bank Auctioned Agricultural Land",
    type: "seized-property",
    category: "agricultural-land",
    price: "₹32 Lakh",
    location: "Chakan, Pune",
    area: "3 Acres",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-agri-2",
    title: "NPA Seized Farm Land",
    type: "seized-property",
    category: "agricultural-land",
    price: "₹22 Lakh",
    location: "Nashik, Maharashtra",
    area: "2.5 Acres",
    image:
      "https://images.unsplash.com/photo-1500382017468-4c7f5f0a4b8c?w=1200&q=80&auto=format&fit=crop",
    badge: "NPA Auction",
  },
  {
    id: "seized-shop-1",
    title: "SARFAESI Seized Commercial Unit",
    type: "seized-property",
    category: "commercial-shops-showrooms",
    price: "₹1.10 Cr",
    location: "MG Road, Pune",
    area: "2,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-shop-2",
    title: "Bank Auctioned Retail Showroom",
    type: "seized-property",
    category: "commercial-shops-showrooms",
    price: "₹78 Lakh",
    location: "Sector 18, Noida",
    area: "900 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-office-1",
    title: "Repossessed Corporate Office Floor",
    type: "seized-property",
    category: "office-spaces",
    price: "₹1.55 Cr",
    location: "Cyber City, Gurugram",
    area: "2,100 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-office-2",
    title: "NPA Auctioned Office Space",
    type: "seized-property",
    category: "office-spaces",
    price: "₹95 Lakh",
    location: "Hinjewadi, Pune",
    area: "1,400 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&auto=format&fit=crop",
    badge: "NPA Auction",
  },
  {
    id: "seized-industrial-1",
    title: "Bank Auctioned Warehouse",
    type: "seized-property",
    category: "industrial-warehouses",
    price: "₹2.40 Cr",
    location: "Bhiwandi, Thane",
    area: "16,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-industrial-2",
    title: "SARFAESI Seized Factory Shed",
    type: "seized-property",
    category: "industrial-warehouses",
    price: "₹1.65 Cr",
    location: "Peenya, Bangalore",
    area: "10,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80&auto=format&fit=crop",
    badge: "Bank Auction",
  },
  {
    id: "seized-auction-1",
    title: "E-Auction Bank Property Under SARFAESI",
    type: "seized-property",
    category: "commercial-shops-showrooms",
    price: "₹85 Lakh",
    location: "Baner, Pune",
    area: "1,600 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&auto=format&fit=crop",
    badge: "E-Auction",
  },
  {
    id: "seized-auction-2",
    title: "NPA E-Auction Listed Office",
    type: "seized-property",
    category: "office-spaces",
    price: "₹58 Lakh",
    location: "Sector 62, Noida",
    area: "1,200 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
    badge: "E-Auction",
  },
  {
    id: "industrial-1",
    title: "Warehouse with Loading Dock",
    type: "industrial",
    category: "warehouse",
    price: "₹3.20 Cr",
    location: "Bhiwandi, Thane",
    area: "18,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80&auto=format&fit=crop",
    badge: "Ready to Move",
  },
  {
    id: "industrial-2",
    title: "Manufacturing Shed with Power Backup",
    type: "industrial",
    category: "factory-manufacturing",
    price: "₹2.05 Cr",
    location: "Peenya, Bangalore",
    area: "12,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "industrial-3",
    title: "Industrial Plot Near Highway",
    type: "industrial",
    category: "industrial-land-plots",
    price: "₹1.45 Cr",
    location: "Chakan, Pune",
    area: "22,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1565793298595-9b1e17e35e21?w=1200&q=80&auto=format&fit=crop",
    badge: "Ready to Move",
  },

  // ---- Agriculture / Farm Land demos ----
  {
    id: "farmhouse-1",
    title: "4 BHK Farmhouse with Orchard",
    type: "farming",
    category: "farm-house",
    price: "₹1.85 Cr",
    location: "Lonavala, Maharashtra",
    beds: 4,
    baths: 4,
    area: "1.2 Acres",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },
  {
    id: "farmhouse-2",
    title: "Weekend Farmhouse with Pool",
    type: "farming",
    category: "farm-house",
    price: "₹2.40 Cr",
    location: "Karjat, Maharashtra",
    beds: 3,
    baths: 3,
    area: "1 Acre",
    image:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "farmhouse-3",
    title: "Farmhouse with Borewell & Mango Grove",
    type: "farming",
    category: "farm-house",
    price: "₹95 Lakh",
    location: "Mysore Road, Bangalore",
    beds: 2,
    baths: 2,
    area: "2.5 Acres",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "agri-land-1",
    title: "Fertile Agricultural Land",
    type: "farming",
    category: "agricultural-land",
    price: "₹42 Lakh",
    location: "Shadnagar, Hyderabad",
    area: "3 Acres",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "agri-land-2",
    title: "Irrigated Farm Land Near Highway",
    type: "farming",
    category: "agricultural-land",
    price: "₹68 Lakh",
    location: "Chakan, Pune",
    area: "5 Acres",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },
  {
    id: "orchard-1",
    title: "Mango Orchard Plantation",
    type: "farming",
    category: "orchard-plantation",
    price: "₹1.15 Cr",
    location: "Ratnagiri, Maharashtra",
    area: "4 Acres",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "orchard-2",
    title: "Coconut & Areca Nut Plantation",
    type: "farming",
    category: "orchard-plantation",
    price: "₹85 Lakh",
    location: "Sirsi, Karnataka",
    area: "3.5 Acres",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "farm-well-1",
    title: "Farm Land with Borewell",
    type: "farming",
    category: "farm-land-with-well",
    price: "₹35 Lakh",
    location: "Mysore Road, Bangalore",
    area: "2.5 Acres",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "farm-well-2",
    title: "Farm Land with Open Well & Canal Access",
    type: "farming",
    category: "farm-land-with-well",
    price: "₹58 Lakh",
    location: "Nashik, Maharashtra",
    area: "4 Acres",
    image:
      "https://images.unsplash.com/photo-1500382017468-4c7f5f0a4b8c?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },

  // ---- Commercial category demos ----
  {
    id: "commercial-office-ready-1",
    title: "Ready to Move Office Suite",
    type: "commercial",
    category: "ready-to-move-offices",
    price: "₹1.65 Cr",
    location: "BKC, Mumbai",
    area: "1,800 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop",
    badge: "Ready to Move",
  },
  {
    id: "commercial-office-ready-2",
    title: "Furnished Corporate Office",
    type: "commercial",
    category: "ready-to-move-offices",
    price: "₹2.10 Cr",
    location: "Cyber City, Gurugram",
    area: "2,200 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-office-ready-3",
    title: "IT Park Office Floor",
    type: "commercial",
    category: "ready-to-move-offices",
    price: "₹95 Lakh",
    location: "Hinjewadi, Pune",
    area: "1,400 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },

  {
    id: "commercial-bareshell-1",
    title: "Bare Shell Office Floor",
    type: "commercial",
    category: "bare-shell-offices",
    price: "₹1.20 Cr",
    location: "Whitefield, Bangalore",
    area: "2,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-bareshell-2",
    title: "Bare Shell Commercial Unit",
    type: "commercial",
    category: "bare-shell-offices",
    price: "₹78 Lakh",
    location: "Baner, Pune",
    area: "1,600 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "commercial-bareshell-3",
    title: "Bare Shell Office in Business Park",
    type: "commercial",
    category: "bare-shell-offices",
    price: "₹2.35 Cr",
    location: "Nanakramguda, Hyderabad",
    area: "3,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
  },

  {
    id: "commercial-retail-1",
    title: "High Street Retail Showroom",
    type: "commercial",
    category: "shops-retail",
    price: "₹3,20,000 / month",
    location: "Linking Road, Mumbai",
    area: "1,200 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop",
    badge: "High Footfall",
  },
  {
    id: "commercial-retail-2",
    title: "Mall Retail Unit",
    type: "commercial",
    category: "shops-retail",
    price: "₹1.10 Cr",
    location: "Indiranagar, Bangalore",
    area: "850 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1555529771-7888783a18d3?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-retail-3",
    title: "Corner Shop on Main Road",
    type: "commercial",
    category: "shops-retail",
    price: "₹65 Lakh",
    location: "Sector 18, Noida",
    area: "600 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },

  {
    id: "commercial-inst-land-1",
    title: "Commercial Institutional Land Parcel",
    type: "commercial",
    category: "commercial-institutional-land",
    price: "₹4.50 Cr",
    location: "Shadnagar, Hyderabad",
    area: "1.5 Acres",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-inst-land-2",
    title: "Institutional Plot Near Ring Road",
    type: "commercial",
    category: "commercial-institutional-land",
    price: "₹2.80 Cr",
    location: "Devanahalli, Bangalore",
    area: "0.9 Acres",
    image:
      "https://images.unsplash.com/photo-1500382017468-4c7f5f0a4b8c?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "commercial-inst-land-3",
    title: "Commercial Land for School/College",
    type: "commercial",
    category: "commercial-institutional-land",
    price: "₹6.20 Cr",
    location: "Sohna Road, Gurugram",
    area: "2 Acres",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80&auto=format&fit=crop",
  },

  {
    id: "commercial-farmland-1",
    title: "Agricultural Farm Land",
    type: "commercial",
    category: "agricultural-farm-land",
    price: "₹42 Lakh",
    location: "Shadnagar, Hyderabad",
    area: "3 Acres",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-farmland-2",
    title: "Irrigated Farm Land Near Highway",
    type: "commercial",
    category: "agricultural-farm-land",
    price: "₹68 Lakh",
    location: "Chakan, Pune",
    area: "5 Acres",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },
  {
    id: "commercial-farmland-3",
    title: "Farm Land with Borewell",
    type: "commercial",
    category: "agricultural-farm-land",
    price: "₹35 Lakh",
    location: "Mysore Road, Bangalore",
    area: "2.5 Acres",
    image:
      "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&q=80&auto=format&fit=crop",
  },

  {
    id: "commercial-industrial-land-1",
    title: "Industrial Land Near Highway",
    type: "commercial",
    category: "industrial-land-plots",
    price: "₹1.45 Cr",
    location: "Chakan, Pune",
    area: "22,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1565793298595-9b1e17e35e21?w=1200&q=80&auto=format&fit=crop",
    badge: "Ready to Move",
  },
  {
    id: "commercial-industrial-land-2",
    title: "Industrial Plot in SEZ",
    type: "commercial",
    category: "industrial-land-plots",
    price: "₹3.10 Cr",
    location: "Bhiwandi, Thane",
    area: "35,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-industrial-land-3",
    title: "Industrial Plot with Road Frontage",
    type: "commercial",
    category: "industrial-land-plots",
    price: "₹2.05 Cr",
    location: "Peenya, Bangalore",
    area: "18,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },

  {
    id: "commercial-warehouse-1",
    title: "Warehouse with Loading Dock",
    type: "commercial",
    category: "warehouse",
    price: "₹3.20 Cr",
    location: "Bhiwandi, Thane",
    area: "18,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80&auto=format&fit=crop",
    badge: "Ready to Move",
  },
  {
    id: "commercial-warehouse-2",
    title: "Grade A Logistics Warehouse",
    type: "commercial",
    category: "warehouse",
    price: "₹4,80,000 / month",
    location: "Bhiwandi, Thane",
    area: "40,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1601599963565-b7f49deb2437?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },
  {
    id: "commercial-warehouse-3",
    title: "Warehouse Near Expressway",
    type: "commercial",
    category: "warehouse",
    price: "₹2.60 Cr",
    location: "Chakan, Pune",
    area: "25,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1553413077-1234567890ab?w=1200&q=80&auto=format&fit=crop",
  },

  {
    id: "commercial-coldstorage-1",
    title: "Cold Storage Facility",
    type: "commercial",
    category: "cold-storage",
    price: "₹5.40 Cr",
    location: "Bhiwandi, Thane",
    area: "30,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1601598851547-4137b04b0d5f?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-coldstorage-2",
    title: "Multi-Chamber Cold Storage Unit",
    type: "commercial",
    category: "cold-storage",
    price: "₹6,50,000 / month",
    location: "Azadpur, Delhi",
    area: "20,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1621955964441-c173e01c135b?w=1200&q=80&auto=format&fit=crop",
    badge: "High Demand",
  },
  {
    id: "commercial-coldstorage-3",
    title: "Cold Storage with Refrigeration Plant",
    type: "commercial",
    category: "cold-storage",
    price: "₹3.75 Cr",
    location: "Nashik, Maharashtra",
    area: "16,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1601598852636-eddd6b0e8b0f?w=1200&q=80&auto=format&fit=crop",
  },

  {
    id: "commercial-factory-1",
    title: "Manufacturing Shed with Power Backup",
    type: "commercial",
    category: "factory-manufacturing",
    price: "₹2.05 Cr",
    location: "Peenya, Bangalore",
    area: "12,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-factory-2",
    title: "Factory Building with Crane Facility",
    type: "commercial",
    category: "factory-manufacturing",
    price: "₹4.10 Cr",
    location: "Chakan, Pune",
    area: "28,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1590959651373-a3db0f38c3f6?w=1200&q=80&auto=format&fit=crop",
    badge: "Ready to Move",
  },
  {
    id: "commercial-factory-3",
    title: "Compact Manufacturing Unit",
    type: "commercial",
    category: "factory-manufacturing",
    price: "₹1.35 Cr",
    location: "Rabale MIDC, Navi Mumbai",
    area: "9,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1200&q=80&auto=format&fit=crop",
  },

  {
    id: "commercial-hotel-1",
    title: "Boutique Hotel Property",
    type: "commercial",
    category: "hotel-resorts",
    price: "₹8.50 Cr",
    location: "Lonavala, Maharashtra",
    area: "12,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80&auto=format&fit=crop",
    badge: "Premium",
  },
  {
    id: "commercial-hotel-2",
    title: "Hillside Resort with 20 Rooms",
    type: "commercial",
    category: "hotel-resorts",
    price: "₹12.75 Cr",
    location: "Coorg, Karnataka",
    area: "3 Acres",
    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-hotel-3",
    title: "City Business Hotel",
    type: "commercial",
    category: "hotel-resorts",
    price: "₹6.90 Cr",
    location: "Andheri East, Mumbai",
    area: "9,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80&auto=format&fit=crop",
    badge: "Featured",
  },

  {
    id: "commercial-others-1",
    title: "Mixed-Use Commercial Building",
    type: "commercial",
    category: "others",
    price: "₹5.60 Cr",
    location: "Sector 62, Noida",
    area: "10,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "commercial-others-2",
    title: "Banquet Hall & Event Space",
    type: "commercial",
    category: "others",
    price: "₹3.15 Cr",
    location: "Kondapur, Hyderabad",
    area: "8,000 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: "commercial-others-3",
    title: "Multi-Purpose Commercial Plot",
    type: "commercial",
    category: "others",
    price: "₹2.40 Cr",
    location: "Wagholi, Pune",
    area: "6,500 sq.ft.",
    image:
      "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=1200&q=80&auto=format&fit=crop",
  },
];

export const COMMERCIAL_CATEGORIES = [
  { key: "ready-to-move-offices", label: "Ready to Move Offices", icon: "MdApartment" },
  { key: "bare-shell-offices", label: "Bare Shell Offices", icon: "MdMeetingRoom" },
  { key: "shops-retail", label: "Shops & Retail", icon: "MdStorefront" },
  { key: "commercial-institutional-land", label: "Commercial/Inst. Land", icon: "MdLocationCity" },
  { key: "warehouse", label: "Warehouse", icon: "MdWarehouse" },
  { key: "cold-storage", label: "Cold Storage", icon: "MdAcUnit" },
  { key: "factory-manufacturing", label: "Factory & Manufacturing", icon: "MdFactory" },
  { key: "hotel-resorts", label: "Hotel/Resorts", icon: "MdHotel" },
  { key: "others", label: "Others", icon: "MdCategory" },
];

export const INVEST_CATEGORIES = [
  { key: "shops", label: "Shops", icon: "MdStorefront" },
  { key: "land", label: "Land", icon: "MdTerrain" },
  { key: "farmhouse", label: "Farmhouse", icon: "MdAgriculture" },
  { key: "offices", label: "Offices", icon: "MdApartment" },
  { key: "apartments", label: "Apartments", icon: "MdHome" },
];

export const AGRICULTURE_CATEGORIES = [
  { key: "farm-house", label: "Farm House", icon: "MdAgriculture" },
  { key: "agricultural-land", label: "Agricultural Land", icon: "MdTerrain" },
  { key: "orchard-plantation", label: "Orchard & Plantation", icon: "MdPark" },
  { key: "farm-land-with-well", label: "Farm Land with Water Source", icon: "MdWaterDrop" },
  { key: "organic-farming", label: "Organic Farming", icon: "MdEco" },
  { key: "horticulture", label: "Horticulture", icon: "MdLocalFlorist" },
  { key: "plantation-farming", label: "Plantation Farming", icon: "MdForest" },
  { key: "dairy-farming", label: "Dairy Farming", icon: "MdPets" },
  { key: "fish-farming", label: "Fish Farming", icon: "MdWaves" },
  { key: "poultry-farming", label: "Poultry Farming", icon: "MdEgg" },
  { key: "greenhouse-polyhouse-farming", label: "Greenhouse / Polyhouse Farming", icon: "MdGrass" },
];

export const BIG_LAND_CATEGORIES = [
  "agricultural-land",
  "organic-farming",
  "horticulture",
  "plantation-farming",
  "dairy-farming",
  "fish-farming",
  "poultry-farming",
  "greenhouse-polyhouse-farming",
].map((key) => AGRICULTURE_CATEGORIES.find((category) => category.key === key));

export const INDUSTRIAL_CATEGORIES = [
  { key: "warehouse", label: "Warehouse", icon: "MdWarehouse" },
  { key: "factory-manufacturing", label: "Factory & Manufacturing", icon: "MdFactory" },
  { key: "cold-storage", label: "Cold Storage", icon: "MdAcUnit" },
  { key: "industrial-land-plots", label: "Industrial Land/Plots", icon: "MdTerrain" },
  { key: "industrial-sheds", label: "Industrial Sheds", icon: "MdConstruction" },
  { key: "logistics-distribution", label: "Logistics & Distribution", icon: "MdLocalShipping" },
];

export const SEIZED_PROPERTY_CATEGORIES = [
  { key: "residential-flats-apartments", label: "Flats & Apartments", icon: "MdApartment" },
  { key: "independent-houses-villas", label: "Independent Houses & Villas", icon: "MdHome" },
  { key: "plots-land", label: "Plots & Land", icon: "MdTerrain" },
  { key: "agricultural-land", label: "Agricultural Land", icon: "MdAgriculture" },
  { key: "commercial-shops-showrooms", label: "Shops & Showrooms", icon: "MdStorefront" },
  { key: "office-spaces", label: "Office Spaces", icon: "MdMeetingRoom" },
  { key: "industrial-warehouses", label: "Industrial & Warehouses", icon: "MdWarehouse" },
];

// Single source of truth mapping each platform type to its browsable
// sub-categories. Used by PostPropertyForm and the admin add/edit forms so
// the "Category" dropdown always matches what /commercial, /farming,
// /industrial, /invest and /seized-property actually render.
export const CATEGORIES_BY_TYPE = {
  commercial: COMMERCIAL_CATEGORIES,
  farming: AGRICULTURE_CATEGORIES,
  industrial: INDUSTRIAL_CATEGORIES,
  invest: INVEST_CATEGORIES,
  "seized-property": SEIZED_PROPERTY_CATEGORIES,
};

// Land-only categories under Commercial / Farming / Industrial / Invest —
// bare land or plots with no built structure, so bedrooms, bathrooms,
// halls, floors, furnishing and parking questions don't apply to them.
export const LAND_CATEGORY_KEYS = new Set([
  "commercial-institutional-land", // commercial
  "land", // invest
  "industrial-land-plots", // industrial
  "agricultural-land",
  "orchard-plantation",
  "farm-land-with-well",
  "organic-farming",
  "horticulture",
  "plantation-farming",
  "dairy-farming",
  "fish-farming",
  "poultry-farming",
  "greenhouse-polyhouse-farming",
  "plots-land", // seized-property
]);

// Non-residential categories that still have a residential-style structure
// (so Bedrooms/Halls fields are relevant) even though listed outside the
// Residential section.
export const CATEGORIES_WITH_BEDROOMS = new Set([
  "farm-house",
  "farmhouse",
  "apartments",
  "residential-flats-apartments",
  "independent-houses-villas",
]);

// True when a listing represents a built structure rather than bare land —
// decides whether to show bedrooms/bathrooms/halls/floors/furnishing/parking
// fields in PostPropertyForm and the admin add/edit forms. Residential
// types (buy/sell/rent/lease) are never in CATEGORIES_BY_TYPE and always
// represent a structure.
export function isStructureCategory(type, category) {
  if (!CATEGORIES_BY_TYPE[type]) return true;
  if (!category) return false;
  return !LAND_CATEGORY_KEYS.has(category);
}

// PG and Hostel are residential "Property Type" sub-categories that have no
// BHK concept — occupants share rooms, so bedrooms/halls/BHK questions don't
// apply to them (they use Gender Preference instead, see below).
const PG_HOSTEL_PROPERTY_TYPES = new Set(["PG", "Hostel"]);

export function isPgOrHostel(propertyType) {
  return PG_HOSTEL_PROPERTY_TYPES.has(propertyType);
}

// Gender preference options shown only when propertyType is PG or Hostel —
// replaces the BHK/bedrooms questions for these listings.
export const GENDER_PREFERENCE_OPTIONS = [
  { value: "boys", label: "For Boys Only" },
  { value: "girls", label: "For Girls Only" },
  { value: "anyone", label: "Anyone" },
];

export function getGenderPreferenceLabel(value) {
  return GENDER_PREFERENCE_OPTIONS.find((opt) => opt.value === value)?.label || "";
}

// Bathroom options shown only when propertyType is PG or Hostel
export const PG_HOSTEL_BATHROOM_OPTIONS = [
  { value: "Common / General Bathroom", label: "Common / General Bathroom" },
  { value: "Attach in Room", label: "Attach in Room" },
];

export function getBathroomTypeLabel(value) {
  if (!value) return "";
  const found = PG_HOSTEL_BATHROOM_OPTIONS.find((opt) => opt.value === value);
  if (found) return found.label;
  if (typeof value === "string") {
    if (value.toLowerCase().includes("common") || value.toLowerCase().includes("general")) {
      return "Common / General Bathroom";
    }
    if (value.toLowerCase().includes("attach")) {
      return "Attach in Room";
    }
  }
  return value;
}

// True when bedrooms/halls fields are relevant for this type + category.
// propertyType is only meaningful for residential listings (Flat, House, PG,
// Hostel, …) — PG/Hostel never ask for bedrooms/BHK.
export function categoryHasBedrooms(type, category, propertyType) {
  if (isPgOrHostel(propertyType)) return false;
  if (!CATEGORIES_BY_TYPE[type]) return true;
  return CATEGORIES_WITH_BEDROOMS.has(category);
}

// ---------------------------------------------------------------------------
// Field profiles — real-world spec sheets differ a lot by property kind. A
// warehouse has no bedrooms/bathrooms/furnishing; a bare plot has none of
// bedrooms/bathrooms/floors/furnishing/parking either; a PG has no BHK/baths
// but does have furnishing (rooms are usually furnished). This maps every
// section/category/propertyType combination in the app to a named profile so
// PostPropertyForm (and any other form) can show only the fields that make
// sense for what the user actually selected, instead of one fixed field set.
// ---------------------------------------------------------------------------
export const FIELD_PROFILES = {
  // Flats, houses, farmhouses, apartments, villas — the full residential set.
  residential: {
    bhk: true,
    beds: true,
    halls: true,
    baths: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: true,
    preferredFor: true,
  },
  // Shops, showrooms, offices — no bedrooms/halls, but washrooms, furnishing
  // (bare-shell vs fitted-out), floor and parking all matter.
  "office-retail": {
    bhk: false,
    beds: false,
    halls: false,
    baths: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: true,
    preferredFor: false,
  },
  // Hotels/resorts — same practical spec sheet as office-retail in this app's
  // field set (rooms/baths, furnishing, floors, parking, facing all apply).
  hospitality: {
    bhk: false,
    beds: false,
    halls: false,
    baths: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: true,
    preferredFor: false,
  },
  // Warehouses, factories, cold storage, industrial sheds/logistics — no
  // bedrooms/bathrooms/furnishing concept; only floor, parking (loading/
  // vehicle access) and facing are relevant.
  industrial: {
    bhk: false,
    beds: false,
    halls: false,
    baths: false,
    floors: true,
    furnishing: false,
    parking: true,
    facing: true,
    preferredFor: false,
  },
  // Bare land/plots — no built structure at all, so nothing but facing
  // (plot orientation) applies.
  land: {
    bhk: false,
    beds: false,
    halls: false,
    baths: false,
    floors: false,
    furnishing: false,
    parking: false,
    facing: true,
    preferredFor: false,
  },
  // PG/Hostel — shared rooms, so no BHK/bedrooms/baths/facing/preferred-for;
  // floor, furnishing (rooms are usually furnished) and parking still apply.
  // Gender Preference is asked separately in place of BHK.
  "pg-hostel": {
    bhk: false,
    beds: false,
    halls: false,
    baths: false,
    bathroomType: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: false,
    preferredFor: false,
  },
};

// Residential "Property Type" (Flat/House/Shop/Plot/Office/Warehouse/PG/
// Hostel) -> field profile. This is the dropdown shown for the Residential
// listing section.
export const RESIDENTIAL_PROPERTY_TYPE_PROFILE = {
  Flat: "residential",
  House: "residential",
  Shop: "office-retail",
  Office: "office-retail",
  Warehouse: "industrial",
  Plot: "land",
  PG: "pg-hostel",
  Hostel: "pg-hostel",
};

// Category -> field profile, per non-residential section. Mirrors the real
// category lists in CATEGORIES_BY_TYPE above.
export const CATEGORY_FIELD_PROFILE = {
  commercial: {
    "ready-to-move-offices": "office-retail",
    "bare-shell-offices": "office-retail",
    "shops-retail": "office-retail",
    "commercial-institutional-land": "land",
    warehouse: "industrial",
    "cold-storage": "industrial",
    "factory-manufacturing": "industrial",
    "hotel-resorts": "hospitality",
    others: "office-retail",
  },
  farming: {
    "farm-house": "residential",
    "agricultural-land": "land",
    "orchard-plantation": "land",
    "farm-land-with-well": "land",
    "organic-farming": "land",
    horticulture: "land",
    "plantation-farming": "land",
    "dairy-farming": "land",
    "fish-farming": "land",
    "poultry-farming": "land",
    "greenhouse-polyhouse-farming": "land",
  },
  industrial: {
    warehouse: "industrial",
    "factory-manufacturing": "industrial",
    "cold-storage": "industrial",
    "industrial-land-plots": "land",
    "industrial-sheds": "industrial",
    "logistics-distribution": "industrial",
  },
  invest: {
    shops: "office-retail",
    land: "land",
    farmhouse: "residential",
    offices: "office-retail",
    apartments: "residential",
  },
  "seized-property": {
    "residential-flats-apartments": "residential",
    "independent-houses-villas": "residential",
    "plots-land": "land",
    "agricultural-land": "land",
    "commercial-shops-showrooms": "office-retail",
    "office-spaces": "office-retail",
    "industrial-warehouses": "industrial",
  },
};

// Resolves the field profile (which spec fields to show) for any section +
// category + propertyType combination used across the app's listing forms.
// - Residential section (buy/sell/rent/lease): keyed by propertyType.
// - Every other section: keyed by category.
// Falls back to the full "residential" profile so an unmapped/empty
// selection never silently hides required fields.
export function getFieldProfile(section, category, propertyType) {
  const isResidentialSection = !CATEGORIES_BY_TYPE[section];
  const profileKey = isResidentialSection
    ? RESIDENTIAL_PROPERTY_TYPE_PROFILE[propertyType]
    : CATEGORY_FIELD_PROFILE[section]?.[category];
  return FIELD_PROFILES[profileKey] || FIELD_PROFILES.residential;
}

export const TYPE_LABELS = {
  buy: "Buy",
  sell: "Sell",
  rent: "Rent",
  lease: "Lease",
  invest: "Invest",
  commercial: "Commercial",
  industrial: "Industrial",
  farming: "Farming",
  "seized-property": "Seized Property",
};

// Keyword -> label lookup used to infer a residential listing's property
// type from its title when no explicit propertyType/category is stored
// (covers the static demo PROPERTIES, which predate the propertyType field).
// Ordered most-specific first so "Farmhouse" wins over a generic "House" match.
const RESIDENTIAL_TITLE_KEYWORDS = [
  ["penthouse", "Penthouse"],
  ["duplex", "Duplex"],
  ["studio", "Studio"],
  ["farmhouse", "Farmhouse"],
  ["warehouse", "Warehouse"],
  ["villa", "Villa"],
  ["apartment", "Apartment"],
  ["flat", "Flat"],
  ["house", "House"],
  ["plot", "Plot"],
  ["showroom", "Shop"],
  ["retail", "Shop"],
  ["shop", "Shop"],
  ["office", "Office"],
];

function deriveResidentialCategory(property) {
  if (property?.propertyType) return property.propertyType;

  const title = (property?.title || "").toLowerCase();
  const found = RESIDENTIAL_TITLE_KEYWORDS.find(([keyword]) => title.includes(keyword));
  return found?.[1] || "";
}

// Resolves a property's type + category into readable labels, e.g.
// { typeLabel: "Commercial", categoryLabel: "Shops & Retail" } for
// { type: "commercial", category: "shops-retail" }, or
// { typeLabel: "Buy", categoryLabel: "Villa" } for a residential listing
// titled "Independent Duplex Villa".
export function getPropertyCategoryLabels(property) {
  const typeLabel = TYPE_LABELS[property?.type] || capitalize(property?.type);

  if (property?.category) {
    const categories = CATEGORIES_BY_TYPE[property.type];
    const match = categories?.find((c) => c.key === property.category);
    const categoryLabel = match?.label || capitalize(property.category.replace(/-/g, " "));
    return { typeLabel, categoryLabel };
  }

  if (["buy", "sell", "rent", "lease"].includes(property?.type)) {
    return { typeLabel, categoryLabel: deriveResidentialCategory(property) };
  }

  return { typeLabel, categoryLabel: "" };
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getCommercialProperties() {
  return PROPERTIES.filter((property) => property.type === "commercial");
}

export function getPropertiesByType(type) {
  return PROPERTIES.filter((property) => property.type === type);
}

export function getFeaturedProperties() {
  return PROPERTIES.filter((property) => property.featured);
}

export function getPropertyById(id) {
  return PROPERTIES.find((property) => property.id === id);
}

// Turns a property's createdAt/addedDate into "Posted today" / "N days ago"
// for the first 3 days, then falls back to a plain "4 Sep 2026" style date.
export function formatPostedDate(property) {
  const raw = property?.createdAt || property?.addedDate;
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);

  if (diffDays <= 0) return "Posted today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays === 2) return "2 days ago";
  if (diffDays === 3) return "3 days ago";

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Converts a display price like "₹1.25 Cr", "₹85 Lakh" or "₹45,000 / month"
// into a plain rupee number so it can be compared against budget filters.
export function parsePriceToNumber(priceStr) {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/₹/g, "").replace(/,/g, "").trim();
  const match = cleaned.match(/[\d.]+/);
  if (!match) return null;

  let value = parseFloat(match[0]);
  if (/cr/i.test(cleaned)) value *= 1e7;
  else if (/lakh|lac/i.test(cleaned)) value *= 1e5;

  return value;
}

const INDIAN_STATES = new Set([
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]);

// Returns the city/area token to filter and display by — the last
// comma-separated segment of a "Area, City" style location string.
export function getLocationCity(location) {
  if (!location) return "";
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length >= 2 && INDIAN_STATES.has(parts[parts.length - 1])) {
    return parts[parts.length - 2];
  }
  return parts[parts.length - 1];
}

const cityToState = new Map();
for (const { city, state } of indianCities) {
  const key = city.toLowerCase();
  if (!cityToState.has(key)) cityToState.set(key, state);
}

// Returns "City, State" for a bare city name (e.g. "Raipur" -> "Raipur,
// Chhattisgarh") by looking the city up in the Indian cities dataset. Falls
// back to the bare city name when the city isn't found in the dataset.
export function getCityStateLabel(city) {
  if (!city) return "";
  const state = cityToState.get(city.toLowerCase());
  return state ? `${city}, ${state}` : city;
}

// Returns "City, State" for a location's city (e.g. "Raipur" -> "Raipur,
// Chhattisgarh") by looking the city up in the Indian cities dataset. Falls
// back to the bare city name when the city isn't found in the dataset.
export function getLocationCityState(location) {
  return getCityStateLabel(getLocationCity(location));
}

export const SALE_BUDGET_RANGES = [
  { label: "Under ₹50 Lac", max: 5000000 },
  { label: "₹50 Lac - ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr - ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "₹2 Cr - ₹5 Cr", min: 20000000, max: 50000000 },
  { label: "Above ₹5 Cr", min: 50000000 },
];

export const RENT_BUDGET_RANGES = [
  { label: "Under ₹3,000", max: 3000 },
  { label: "₹3,000 - ₹6,000", min: 3000, max: 6000 },
  { label: "₹6,000 - ₹10,000", min: 6000, max: 10000 },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
  { label: "Above ₹15,000", min: 15000 },
];

// Canonical residential property types, shared by the homepage search bar
// and the /buy and /rent filter dropdowns so both always list the exact
// same options, regardless of which types have live listings right now.
export const RESIDENTIAL_TYPE_OPTIONS = [
  "Flat",
  "House",
  "Shop",
  "Plot",
  "Office",
  "Warehouse",
  "Apartment",
  "PG",
  "Villa",
];

export const BHK_OPTIONS = [1, 2, 3, 4, 5];

export function formatBhkLabel(beds, bedsPlus) {
  if (!beds) return "";
  return bedsPlus ? `${beds} BHK+` : `${beds} BHK`;
}
