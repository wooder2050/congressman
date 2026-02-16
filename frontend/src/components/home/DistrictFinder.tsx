"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getMembers } from "@/lib/api";
import { SIDO_LIST } from "@/lib/geo/district-mapping";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MemberAvatar from "@/components/members/MemberAvatar";

interface DistrictFinderProps {
  termId: number;
}

export default function DistrictFinder({ termId }: DistrictFinderProps) {
  const { data: members } = useCongressSuspenseQuery(getMembers, termId);
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const localMembers = useMemo(
    () => members.filter((m) => !m.term.proportional),
    [members],
  );

  const districtsBySido = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const m of localMembers) {
      const parts = m.term.district.split(" ");
      const sido = parts[0];
      const district = parts.slice(1).join(" ");
      if (!sido || !district) continue;
      if (!map.has(sido)) map.set(sido, []);
      const list = map.get(sido)!;
      if (!list.includes(district)) list.push(district);
    }
    for (const [, list] of map) list.sort();
    return map;
  }, [localMembers]);

  const districts = selectedSido ? districtsBySido.get(selectedSido) ?? [] : [];

  const matchedMembers = useMemo(() => {
    if (!selectedSido || !selectedDistrict) return [];
    const fullDistrict = `${selectedSido} ${selectedDistrict}`;
    return localMembers.filter((m) => m.term.district === fullDistrict);
  }, [localMembers, selectedSido, selectedDistrict]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select
          value={selectedSido}
          onValueChange={(value) => {
            setSelectedSido(value);
            setSelectedDistrict("");
          }}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
            <SelectValue placeholder="시/도 선택" />
          </SelectTrigger>
          <SelectContent>
            {SIDO_LIST.map((sido) => (
              <SelectItem key={sido} value={sido}>
                {sido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDistrict}
          onValueChange={setSelectedDistrict}
          disabled={!selectedSido}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) px-3 text-sm">
            <SelectValue placeholder="지역구 선택" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {matchedMembers.length > 0 && (
        <div className="space-y-2">
          {matchedMembers.map((m) => (
            <Link
              key={m.id}
              href={`/members/${m.id}?term=${termId}`}
              className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              <MemberAvatar
                name={m.name}
                photoUrl={m.photoUrl}
                size={48}
                bgColor={m.term.party.color}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-(--color-text-primary)">{m.name}</span>
                  <span className="text-sm text-(--color-text-tertiary)">{m.term.party.name}</span>
                </div>
                <p className="text-sm text-(--color-text-tertiary)">{m.term.district}</p>
              </div>
              <span className="text-sm font-semibold text-(--color-primary)">상세 →</span>
            </Link>
          ))}
        </div>
      )}

      {selectedSido && selectedDistrict && matchedMembers.length === 0 && (
        <p className="py-4 text-center text-sm text-(--color-text-tertiary)">
          해당 지역구 의원 정보가 없습니다.
        </p>
      )}
    </div>
  );
}
