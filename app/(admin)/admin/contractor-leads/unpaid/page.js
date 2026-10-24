import ContractorsByPayment from "@/components/admin/contractorLeads/ContractorsByPayment";

export default function AdminUnpaidContractorsPage() {
  return <ContractorsByPayment paid={false} />;
}
