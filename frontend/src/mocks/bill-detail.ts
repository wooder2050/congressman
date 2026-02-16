import type { BillDetail } from "@/types";

export const mockBillDetail: BillDetail = {
  id: "PRC_B1",
  title: "국민건강보험법 일부개정법률안",
  proposerName: "강민수",
  coProposerCount: 2,
  status: "passed",
  proposedDate: "2024-09-15",
  termId: 22,
  committee: "보건복지위원회",
  proposers: [
    {
      memberId: "M001",
      memberName: "강민수",
      photoUrl: "",
      partyId: "democratic",
      partyName: "더불어민주당",
      partyColor: "#1B56DB",
      district: "서울 강남구갑",
    },
    {
      memberId: "M002",
      memberName: "김지혜",
      photoUrl: "",
      partyId: "democratic",
      partyName: "더불어민주당",
      partyColor: "#1B56DB",
      district: "서울 강남구을",
    },
    {
      memberId: "M003",
      memberName: "박승우",
      photoUrl: "",
      partyId: "ppp",
      partyName: "국민의힘",
      partyColor: "#E61E2B",
      district: "서울 서초구갑",
    },
  ],
};
