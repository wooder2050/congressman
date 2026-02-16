/**
 * 국회 API의 POLY_NM (정당명) → DB Party.id 매핑
 */
const PARTY_NAME_TO_ID: Record<string, string> = {
  더불어민주당: 'democratic',
  국민의힘: 'ppp',
  조국혁신당: 'rebuilding',
  개혁신당: 'reform',
  무소속: 'independent',
  새로운미래: 'new-future',
  진보당: 'progressive',
  기본소득당: 'basic-income',
  사회민주당: 'social-democratic',
};

const PARTY_COLORS: Record<string, string> = {
  democratic: '#1B56DB',
  ppp: '#E61E2B',
  rebuilding: '#003DA5',
  reform: '#F37924',
  progressive: '#D6001C',
  'basic-income': '#00D2C3',
  'social-democratic': '#F58400',
  'new-future': '#45BABD',
  independent: '#999999',
};

export function getPartyId(partyName: string): string {
  return PARTY_NAME_TO_ID[partyName] ?? 'unknown-' + partyName.replace(/\s/g, '-');
}

export function getPartyColor(partyId: string): string {
  return PARTY_COLORS[partyId] ?? '#888888';
}
