export type ScanResultVerdict = 'safe' | 'caution' | 'danger';

// TODO: 검사 결과 화면 UI 확인을 위한 임시 mock 데이터입니다.
// 백엔드에서 판정 이유(reason)를 내려주면 이 mock 상수와 getMockScanResultReason 호출을 제거합니다.
const MOCK_SCAN_RESULT_REASONS: Record<ScanResultVerdict, string> = {
  safe: '위험 신호와 차단 이력이 발견되지 않아 안전합니다. 도메인 형식과 URL 패턴이 일반적이며, 알려진 피싱 키워드나 의심 리다이렉트가 없어 접속 전 주소만 한번 더 확인하면 됩니다.',
  caution: '일부 의심 신호가 있어 주의가 필요합니다. 도메인 신뢰도나 URL 패턴에서 확인이 필요한 요소가 있어, 로그인이나 결제처럼 민감한 행동 전에는 공식 주소인지 다시 확인하세요.',
  danger: '피싱 의심 신호가 강해 위험합니다. 악성 페이지와 비슷한 URL 패턴이나 의심스러운 접근 흐름이 감지되어, 저장하거나 접속하지 말고 공식 주소를 통해 다시 확인하세요.',
};

export function getMockScanResultReason(verdict: ScanResultVerdict) {
  return MOCK_SCAN_RESULT_REASONS[verdict];
}
